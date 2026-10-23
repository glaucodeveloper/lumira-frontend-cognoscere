import http from "node:http";
import net from "node:net";
import { randomBytes } from "node:crypto";
import { URL } from "node:url";

const HOST = process.env.PORT_ROUTER_HOST || "127.0.0.1";
const ROUTER_PORT = Number(process.env.PORT_ROUTER_PORT || "7777");
const KEY = process.env.PORT_ROUTER_KEY || "";
const FORGE_PORT = 19195;
const GITHUB_REPO = "glaucodeveloper/lumira-frontend-cognoscere";
const COGNOSCERE_API_TOKEN = process.env.COGNOSCERE_API_TOKEN || "";
const AUTH_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const authSessions = new Map();
const CORS_ORIGINS = new Set(
  String(
    process.env.PORT_ROUTER_ALLOWED_ORIGINS ||
      "https://glaucodeveloper.github.io,http://127.0.0.1:5173,http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

function applyCors(req, res) {
  const origin = String(req.headers.origin || "");
  if (!CORS_ORIGINS.has(origin)) return false;

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Port-Router-Key");
  res.setHeader("Access-Control-Max-Age", "600");
  res.setHeader("Vary", "Origin");
  return true;
}

const parsePorts = (s) =>
  new Set(
    String(s || "")
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isInteger(x) && x >= 1 && x <= 65535)
  );

const PRESERVE = parsePorts(process.env.PORT_ROUTER_PRESERVE_PORTS || "7681");
const DENY = parsePorts(process.env.PORT_ROUTER_DENY_PORTS || `${ROUTER_PORT},4040`);
const ALLOW = parsePorts(process.env.PORT_ROUTER_ALLOWED_PORTS || "7681");

if (!KEY || KEY.length < 24) {
  console.error("PORT_ROUTER_KEY ausente ou curto demais.");
  process.exit(1);
}

function cookieMap(header = "") {
  const out = {};
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function authInfo(req, u) {
  const header = req.headers["x-port-router-key"];
  const query = u.searchParams.get("key");
  const cookie = cookieMap(req.headers.cookie || "").port_router_key;
  const presented = header || query || cookie || "";
  return {
    ok: presented === KEY,
    fromQuery: query === KEY,
  };
}

function cleanRouterCookie(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => !x.startsWith("port_router_key="))
    .join("; ");
}

function parseRoute(pathname) {
  const m = pathname.match(/^\/([0-9]{1,5})(\/.*)?$/);
  if (!m) return null;

  const port = Number(m[1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
  if (!ALLOW.has(port)) return { denied: true, port };
  if (DENY.has(port)) return { denied: true, port };

  const prefix = `/${port}`;
  const rest = m[2] || "";
  return {
    denied: false,
    port,
    prefix,
    rest,
    preserve: PRESERVE.has(port),
  };
}

function targetPath(route, u) {
  let path;

  if (route.preserve) {
    path = u.pathname;
  } else {
    path = route.rest || "/";
  }

  // Router auth key must never be forwarded upstream.
  const params = new URLSearchParams(u.searchParams);
  params.delete("key");
  const qs = params.toString();

  return path + (qs ? `?${qs}` : "");
}

function filteredHeaders(req, route) {
  const headers = { ...req.headers };

  delete headers["x-port-router-key"];

  if (headers.cookie) {
    const c = cleanRouterCookie(headers.cookie);
    if (c) headers.cookie = c;
    else delete headers.cookie;
  }

  headers.host = `127.0.0.1:${route.port}`;
  headers["x-forwarded-host"] = req.headers.host || "";
  headers["x-forwarded-proto"] =
    String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  headers["x-forwarded-prefix"] = route.prefix;

  return headers;
}

function rewriteLocation(value, route) {
  if (!value || route.preserve) return value;

  // Root-relative redirects need the /<port> prefix externally.
  if (value.startsWith("/") && !value.startsWith("//")) {
    return `${route.prefix}${value}`;
  }

  try {
    const x = new URL(value);
    if (
      (x.hostname === "127.0.0.1" || x.hostname === "localhost") &&
      Number(x.port || 80) === route.port
    ) {
      return `${route.prefix}${x.pathname}${x.search}${x.hash}`;
    }
  } catch {}

  return value;
}

function rewriteSetCookie(value, route) {
  if (!value || route.preserve) return value;

  const one = (s) =>
    String(s).replace(/;\s*Path=\/(?=;|$)/i, `; Path=${route.prefix}/`);

  return Array.isArray(value) ? value.map(one) : one(value);
}

function setRouterCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `port_router_key=${encodeURIComponent(KEY)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
  );
}

function unauthorized(res) {
  res.writeHead(401, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(
    JSON.stringify(
      {
        error: "port-router authentication required",
        browser: "/<port>/?key=ROUTER_KEY",
        api_header: "X-Port-Router-Key",
      },
      null,
      2
    )
  );
}

function routerStatus(res) {
  res.writeHead(200, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(
    JSON.stringify(
      {
        ok: true,
        listen: `${HOST}:${ROUTER_PORT}`,
        route: "/<port>/<path>",
        preserve_ports: [...PRESERVE],
        allowed_ports: [...ALLOW],
        denied_ports: [...DENY],
        examples: {
          codex_terminal: "/7681/",
        },
      },
      null,
      2
    )
  );
}

function jsonResponse(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function bearerToken(header) {
  const match = /^Bearer\s+(.+)$/i.exec(String(header || ""));
  return match ? match[1].trim() : "";
}

function pruneAuthSessions() {
  const now = Date.now();
  for (const [token, session] of authSessions) {
    if (session.expiresAt <= now) authSessions.delete(token);
  }
}

async function validateRepositoryPat(req, res) {
  const repoMatch = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(GITHUB_REPO);
  if (!repoMatch) {
    jsonResponse(res, 503, { error: "GitHub repository authentication is not configured in Port Router." });
    req.resume();
    return;
  }
  if (!COGNOSCERE_API_TOKEN) {
    jsonResponse(res, 503, { error: "The local Forge credential is not available to Port Router." });
    req.resume();
    return;
  }

  const repositoryPat = bearerToken(req.headers.authorization);
  if (!repositoryPat || repositoryPat.length > 4096 || /[\r\n]/.test(repositoryPat)) {
    jsonResponse(res, 401, { error: "GitHub PAT is missing or malformed." });
    req.resume();
    return;
  }

  req.resume();
  const [owner, repo] = repoMatch.slice(1);
  let repository = null;
  let page = 1;
  let hasNextPage = true;
  while (hasNextPage && page <= 100) {
    const repositoriesUrl = new URL("https://api.github.com/user/repos");
    repositoriesUrl.searchParams.set("visibility", "all");
    repositoriesUrl.searchParams.set("affiliation", "owner,collaborator,organization_member");
    repositoriesUrl.searchParams.set("per_page", "100");
    repositoriesUrl.searchParams.set("page", String(page));
    let githubResponse;
    try {
      githubResponse = await fetch(repositoriesUrl, {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${repositoryPat}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "Lumira-Repository-Access",
        },
        signal: AbortSignal.timeout(12000),
      });
    } catch {
      jsonResponse(res, 503, { error: "GitHub could not validate repository access right now." });
      return;
    }

    if (githubResponse.status === 401) {
      jsonResponse(res, 401, { error: "GitHub PAT is invalid or expired." });
      return;
    }
    if (githubResponse.status === 403) {
      jsonResponse(res, 401, {
        error: `GitHub PAT cannot list repositories. A fine-grained PAT needs Metadata: read for ${GITHUB_REPO}.`,
      });
      return;
    }
    if (githubResponse.status === 429 || githubResponse.status >= 500) {
      jsonResponse(res, 503, { error: `GitHub repository validation returned HTTP ${githubResponse.status}. Retry shortly.` });
      return;
    }
    if (!githubResponse.ok) {
      jsonResponse(res, 502, { error: `GitHub repository validation returned HTTP ${githubResponse.status}.` });
      return;
    }

    let repositories;
    try {
      repositories = await githubResponse.json();
    } catch {
      jsonResponse(res, 502, { error: "GitHub returned unreadable repository metadata." });
      return;
    }
    if (!Array.isArray(repositories)) {
      jsonResponse(res, 502, { error: "GitHub returned an unexpected repository-list response." });
      return;
    }
    repository = repositories.find(
      (item) => String(item?.full_name || "").toLowerCase() === `${owner}/${repo}`.toLowerCase()
    ) || null;
    if (repository) break;
    hasNextPage = String(githubResponse.headers.get("link") || "").includes('rel="next"');
    page += 1;
  }

  if (!repository) {
    jsonResponse(res, 401, {
      error: `GitHub authenticated the PAT, but it does not list ${GITHUB_REPO} as an accessible repository. Select this repository for the fine-grained PAT and allow Metadata: read.`,
    });
    return;
  }

  pruneAuthSessions();
  if (authSessions.size >= 1000) {
    jsonResponse(res, 503, { error: "Port Router has reached its active-session limit. Retry later." });
    return;
  }
  const sessionToken = `lumira_session_${randomBytes(32).toString("base64url")}`;
  const expiresAt = Date.now() + AUTH_SESSION_TTL_MS;
  authSessions.set(sessionToken, { expiresAt });
  jsonResponse(res, 200, {
    ok: true,
    sessionToken,
    expiresAt: new Date(expiresAt).toISOString(),
    repository: GITHUB_REPO,
  });
}

const server = http.createServer((req, res) => {
  applyCors(req, res);
  const origin = `http://${req.headers.host || `${HOST}:${ROUTER_PORT}`}`;
  const u = new URL(req.url || "/", origin);
  const auth = authInfo(req, u);
  const route = parseRoute(u.pathname);
  const corsPreflight =
    req.method === "OPTIONS" &&
    Boolean(req.headers.origin) &&
    Boolean(req.headers["access-control-request-method"]) &&
    Boolean(route && !route.denied) &&
    String(req.headers["access-control-request-headers"] || "")
      .toLowerCase()
      .split(/,\s*/)
      .includes("x-port-router-key");

  if (!auth.ok && !corsPreflight) {
    unauthorized(res);
    return;
  }

  if (corsPreflight) {
    res.writeHead(204, { "cache-control": "no-store" });
    res.end();
    return;
  }

  // Browser bootstrap: ?key=... -> cookie, then remove key from URL.
  if (
    auth.fromQuery &&
    (req.method === "GET" || req.method === "HEAD")
  ) {
    const clean = new URL(u.toString());
    clean.searchParams.delete("key");

    setRouterCookie(res);
    res.writeHead(302, {
      Location: clean.pathname + clean.search,
      "Cache-Control": "no-store",
    });
    res.end();
    return;
  }

  if (u.pathname === "/__router/status") {
    routerStatus(res);
    return;
  }

  if (!route) {
    res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify(
        {
          error: "use /<port>/<path>",
          examples: ["/7681/"],
        },
        null,
        2
      )
    );
    return;
  }

  if (route.denied) {
    res.writeHead(403, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: `port ${route.port} denied` }));
    return;
  }

  if (route.port === FORGE_PORT && route.rest === "/auth/validate") {
    if (req.method !== "POST") {
      jsonResponse(res, 405, { error: "Use POST for GitHub repository authentication." });
      req.resume();
      return;
    }
    void validateRepositoryPat(req, res).catch(() => {
      if (!res.headersSent) jsonResponse(res, 502, { error: "GitHub repository validation failed." });
      else if (!res.writableEnded) res.end();
    });
    return;
  }

  const presentedBearer = bearerToken(req.headers.authorization);
  if (presentedBearer.startsWith("lumira_session_")) {
    pruneAuthSessions();
    const session = authSessions.get(presentedBearer);
    if (!session || session.expiresAt <= Date.now()) {
      authSessions.delete(presentedBearer);
      jsonResponse(res, 401, { error: "Lumira GitHub repository session expired. Authenticate again." });
      req.resume();
      return;
    }
    if (route.port !== FORGE_PORT) {
      jsonResponse(res, 403, { error: "Lumira session is only valid for the Cognoscere Forge route." });
      req.resume();
      return;
    }
  }

  // Exact /8080 -> /8080/ helps relative assets.
  if (!route.rest && (req.method === "GET" || req.method === "HEAD")) {
    res.writeHead(308, {
      Location: `${route.prefix}/${u.search}`,
      "Cache-Control": "no-store",
    });
    res.end();
    return;
  }

  const headers = filteredHeaders(req, route);
  if (presentedBearer.startsWith("lumira_session_")) {
    headers.authorization = `Bearer ${COGNOSCERE_API_TOKEN}`;
  }

  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port: route.port,
      method: req.method,
      path: targetPath(route, u),
      headers,
    },
    (up) => {
      const headers = { ...up.headers };

      if (headers.location) {
        headers.location = rewriteLocation(headers.location, route);
      }

      if (headers["set-cookie"]) {
        headers["set-cookie"] = rewriteSetCookie(headers["set-cookie"], route);
      }

      res.writeHead(up.statusCode || 502, headers);
      up.pipe(res);
    }
  );

  req.on("aborted", () => {
    upstream.destroy(new Error("client disconnected"));
  });
  res.on("close", () => {
    if (!res.writableEnded) upstream.destroy(new Error("downstream disconnected"));
  });

  upstream.setTimeout(30 * 60 * 1000);

  upstream.on("timeout", () => {
    upstream.destroy(new Error("upstream timeout"));
  });

  upstream.on("error", (err) => {
    if (res.destroyed || res.writableEnded) return;
    if (!res.headersSent) {
      res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
    }
    res.end(
      JSON.stringify({
        error: "upstream unavailable",
        port: route.port,
        detail: err.message,
      })
    );
  });

  req.pipe(upstream);
});

server.on("upgrade", (req, socket, head) => {
  const origin = `http://${req.headers.host || `${HOST}:${ROUTER_PORT}`}`;
  const u = new URL(req.url || "/", origin);
  const auth = authInfo(req, u);

  if (!auth.ok) {
    socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }

  const route = parseRoute(u.pathname);
  if (!route || route.denied) {
    socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }

  const upstream = net.createConnection(
    { host: "127.0.0.1", port: route.port },
    () => {
      const headers = filteredHeaders(req, route);
      let raw = `GET ${targetPath(route, u)} HTTP/1.1\r\n`;

      for (const [k, v] of Object.entries(headers)) {
        if (v == null) continue;
        if (Array.isArray(v)) {
          for (const item of v) raw += `${k}: ${item}\r\n`;
        } else {
          raw += `${k}: ${v}\r\n`;
        }
      }

      raw += "\r\n";
      upstream.write(raw);

      if (head?.length) upstream.write(head);

      socket.pipe(upstream);
      upstream.pipe(socket);
    }
  );

  upstream.setTimeout(30 * 60 * 1000);

  upstream.on("error", () => socket.destroy());
  upstream.on("timeout", () => {
    upstream.destroy();
    socket.destroy();
  });
  socket.on("error", () => upstream.destroy());
});

server.listen(ROUTER_PORT, HOST, () => {
  console.log(`port-router listening http://${HOST}:${ROUTER_PORT}`);
  console.log(`route pattern: /<port>/<path>`);
  console.log(`preserve ports: ${[...PRESERVE].join(",")}`);
  console.log(`allowed ports: ${[...ALLOW].join(",")}`);
});
