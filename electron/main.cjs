'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL, fileURLToPath } = require('node:url');
const { app, BrowserWindow, ipcMain } = require('electron');
const dotenv = require('dotenv');

let mainWindow;
let trustedDevOrigin = '';
let sessionRouterKey = '';
const DEV_RENDERER_URL = 'http://127.0.0.1:5173';

function loadConfiguration() {
  const envPath = app.isPackaged
    ? path.join(app.getPath('userData'), '.env')
    : path.join(app.getAppPath(), '.env');
  if (!fs.existsSync(envPath)) {
    const templatePath = app.isPackaged
      ? path.join(process.resourcesPath, '.env.example')
      : path.join(app.getAppPath(), '.env.example');
    if (fs.existsSync(templatePath)) {
      fs.mkdirSync(path.dirname(envPath), { recursive: true });
      fs.copyFileSync(templatePath, envPath, fs.constants.COPYFILE_EXCL);
    }
  }
  dotenv.config({ path: envPath });
}

function configuration() {
  const value = (process.env.COGNOSCERE_BASE_URL || 'https://ateliotic-jann-paragonless.ngrok-free.dev/19195').trim();
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('COGNOSCERE_BASE_URL não contém uma URL válida.'); }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('COGNOSCERE_BASE_URL não pode conter credenciais, query ou fragmento.');
  }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) {
    throw new Error('Use HTTPS para Forge remoto. HTTP só é permitido em localhost.');
  }
  parsed.pathname = parsed.pathname.replace(/\/(v1)?\/?$/, '').replace(/\/$/, '');
  return {
    baseUrl: parsed.toString().replace(/\/$/, ''),
    slug: (process.env.COGNOSCERE_SLUG || 'lumira').trim(),
    unitId: (process.env.COGNOSCERE_UNIT_ID || 'lumira-cognoscere-monitor').trim(),
    isLocal: local,
  };
}

function requestHeaders(config, json = false) {
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (!config.isLocal && sessionRouterKey) headers['X-Port-Router-Key'] = sessionRouterKey;
  return headers;
}

function safeEndpoint(baseUrl) {
  const parsed = new URL(baseUrl);
  return parsed.origin + parsed.pathname;
}

function errorFromResponse(status) {
  if (status === 401 || status === 403) return 'O endpoint Cognoscere recusou a chave Router API.';
  return `Forge respondeu com HTTP ${status}.`;
}

async function verifyApplicationKey(candidate) {
  let config;
  try { config = configuration(); }
  catch (error) { return { configured: false, valid: false, message: error.message }; }
  const key = typeof candidate === 'string' ? candidate.trim() : '';
  if (!key) return { configured: true, valid: false, message: 'Digite a chave Router API.' };
  if (config.isLocal) {
    return { configured: true, valid: false, message: 'Configure no .env o endpoint HTTPS do túnel protegido para validar a chave Router API.' };
  }

  // Drop any prior authorization before checking the newly submitted key.
  sessionRouterKey = '';
  try {
    const headers = { 'X-Port-Router-Key': key };
    const response = await fetch(`${config.baseUrl}/health`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { configured: true, valid: false, message: errorFromResponse(response.status) };
    const health = await response.json();
    if (health?.ok !== true || (health?.service && health.service !== 'cognoscere-forge')) {
      return { configured: true, valid: false, message: 'O endpoint respondeu, mas não confirmou o serviço Cognoscere Forge.' };
    }
    sessionRouterKey = key;
    return { configured: true, valid: true };
  } catch (error) {
    return {
      configured: true,
      valid: false,
      message: error instanceof Error ? `Não foi possível validar a chave no endpoint Cognoscere: ${error.message}` : 'Não foi possível validar a chave no endpoint Cognoscere.',
    };
  }
}

async function cognoscereStatus() {
  let config;
  try { config = configuration(); }
  catch (error) {
    return { available: false, configured: false, systemModelConfigured: false, model: '', endpoint: '', message: error.message };
  }
  const endpoint = safeEndpoint(config.baseUrl);
  if (!config.isLocal && !sessionRouterKey) {
    return { available: false, configured: false, systemModelConfigured: false, model: '', endpoint, message: 'Digite a chave Router API para autenticar o app.' };
  }
  try {
    const response = await fetch(`${config.baseUrl}/health`, {
      headers: requestHeaders(config),
      signal: AbortSignal.timeout(3500),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(errorFromResponse(response.status));
    const health = JSON.parse(text);
    const configured = health.configured === true;
    const systemModelConfigured = health.system_model_configured === true;
    return {
      available: health.ok === true,
      configured,
      systemModelConfigured,
      model: typeof health.model === 'string' ? health.model : 'Cognoscere Forge',
      endpoint,
      message: configured
        ? 'Cognoscere Forge e modelos prontos.'
        : 'Forge respondeu; Metis ou MiniCPM ainda não estão prontos.',
    };
  } catch (error) {
    return {
      available: false,
      configured: false,
      systemModelConfigured: false,
      model: '',
      endpoint,
      message: error instanceof Error ? error.message : 'Não foi possível consultar o Cognoscere Forge.',
    };
  }
}

function validateProjectRequest(request) {
  if (!request || typeof request !== 'object') throw new Error('Pedido de conversa inválido.');
  if (!['teacher-projects', 'student-projects'].includes(request.partId)) throw new Error('Parte do projeto inválida.');
  if (typeof request.requestId !== 'string' || request.requestId.length > 100) throw new Error('Identificador da conversa inválido.');
  if (typeof request.prompt !== 'string' || !request.prompt.trim() || request.prompt.length > 500) {
    throw new Error('Escreva uma mensagem de até 500 caracteres.');
  }
  const context = request.context && typeof request.context === 'object' ? request.context : {};
  const conversation = Array.isArray(request.conversation) ? request.conversation.slice(-10) : [];
  const messages = conversation.map(message => {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      throw new Error('Histórico de conversa inválido.');
    }
    if (message.content.length > 4000) throw new Error('Uma mensagem anterior ultrapassa 4.000 caracteres.');
    return { role: message.role, content: message.content };
  });
  const projectContext = {
    title: String(context.title || '').slice(0, 80),
    goal: String(context.goal || '').slice(0, 300),
    summary: String(context.summary || '').slice(0, 600),
    audience: String(context.audience || '').slice(0, 100),
    competencies: Array.isArray(context.competencies) ? context.competencies.map(String).slice(0, 12) : [],
    milestones: Array.isArray(context.milestones) ? context.milestones.slice(0, 24).map(item => ({
      title: String(item?.title || '').slice(0, 100),
      date: String(item?.date || '').slice(0, 10),
    })) : [],
  };
  return { ...request, prompt: request.prompt.trim(), context: projectContext, conversation: messages };
}

async function converseAboutProject(rawRequest) {
  const request = validateProjectRequest(rawRequest);
  const config = configuration();
  if (!config.isLocal && !sessionRouterKey) throw new Error('Digite a chave Router API para autenticar o app.');

  const context = request.context;
  const instructions = [
    'Você é o assistente de planejamento colaborativo da plataforma educacional Lumira.',
    'Ajude a transformar ideias em projetos para a comunidade escolar e o Social.',
    'Responda em português natural e contextualizado. Sugira objetivo, etapas, competências relacionadas e marcos quando ajudarem.',
    'Use a ficha atual e o histórico como contexto. Faça perguntas quando faltarem decisões importantes.',
    'Não retorne JSON, comandos de sistema, operações de arquivo ou alegações de que salvou/publicou o projeto.',
    'O usuário revisa e altera a ficha manualmente; sua resposta é orientação conversacional.',
    `Papel: ${request.partId === 'student-projects' ? 'estudante' : 'professor'}.`,
    `Ficha atual: ${JSON.stringify(context)}.`,
  ].join('\n');
  const messages = [
    { role: 'system', content: instructions },
    ...request.conversation,
    { role: 'user', content: request.prompt },
  ];
  const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: requestHeaders(config, true),
    body: JSON.stringify({
      model: 'Metis-4B',
      slug: config.slug,
      unit_id: config.unitId,
      mode: 'document_update',
      messages,
      max_tokens: 1400,
    }),
    signal: AbortSignal.timeout(Number(process.env.COGNOSCERE_TIMEOUT_MS) || 240000),
  });
  const responseText = await response.text();
  if (!response.ok) throw new Error(errorFromResponse(response.status));
  let payload;
  try { payload = JSON.parse(responseText); }
  catch { throw new Error('O Forge retornou uma resposta que não é JSON válido.'); }
  const rawContent = payload?.choices?.[0]?.message?.content;
  if (typeof rawContent !== 'string' || !rawContent.trim()) throw new Error('O Forge retornou uma resposta vazia.');
  let reply = rawContent.trim();
  try {
    const structured = JSON.parse(reply);
    if (typeof structured.reply === 'string' && structured.reply.trim()) reply = structured.reply.trim();
    else if (typeof structured.summary === 'string' && structured.summary.trim()) reply = structured.summary.trim();
  } catch { /* Conteúdo textual simples também é uma resposta válida do Forge. */ }
  return { reply };
}

function rendererIsTrusted(event) {
  const frameUrl = event.senderFrame?.url;
  if (!frameUrl) return false;
  if (trustedDevOrigin) {
    try { if (new URL(frameUrl).origin === trustedDevOrigin) return true; } catch { /* URL não web. */ }
  }
  try {
    const filename = path.resolve(fileURLToPath(frameUrl));
    const appPath = path.resolve(app.getAppPath());
    return filename === appPath || filename.startsWith(appPath + path.sep);
  } catch { return false; }
}

function addIPCHandlers() {
  const handle = (channel, operation) => {
    ipcMain.handle(channel, async (event, ...args) => {
      if (!rendererIsTrusted(event)) throw new Error('Origem Electron não autorizada.');
      return operation(...args);
    });
  };
  handle('lumira:cognoscere-status', () => cognoscereStatus());
  handle('lumira:project-conversation', request => converseAboutProject(request));
  handle('lumira:verify-application-key', candidate => verifyApplicationKey(candidate));
  handle('lumira:application-authenticated', () => Boolean(sessionRouterKey));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: '#f6f7f5',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, target) => {
    if (trustedDevOrigin && new URL(target).origin === trustedDevOrigin) return;
    if (target.startsWith(pathToFileURL(app.getAppPath()).href)) return;
    event.preventDefault();
  });

  const rendererUrl = process.env.LUMIRA_RENDERER_URL;
  if (rendererUrl && !app.isPackaged) {
    const devUrl = new URL(rendererUrl);
    if (devUrl.origin !== DEV_RENDERER_URL || devUrl.pathname !== '/' || devUrl.username || devUrl.password || devUrl.hash) {
      throw new Error('LUMIRA_RENDERER_URL só aceita a raiz do Vite local de desenvolvimento.');
    }
    trustedDevOrigin = new URL(DEV_RENDERER_URL).origin;
    void mainWindow.loadURL(devUrl.toString());
  } else {
    void mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  loadConfiguration();
  addIPCHandlers();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
