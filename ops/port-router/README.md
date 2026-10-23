# Lumira authentication through Port Router

`router.mjs` is the local Port Router runtime used by the published Lumira app. The systemd user service reads the existing Port Router environment file and also loads the local Cognoscere environment file. The latter keeps `COGNOSCERE_API_TOKEN` on this machine; do not copy secret values into this repository.

The access gate asks for a GitHub PAT that can list `glaucodeveloper/lumira-frontend-cognoscere`, the public repository hosting this page, plus the local Port Router key. Port Router validates it through `GET /user/repos` and checks that the exact Lumira repository is in the authenticated user's accessible repository list. This target is fixed in `router.mjs`. The gate does not read Actions secrets.

Use a fine-grained PAT that includes `glaucodeveloper/lumira-frontend-cognoscere` with **Metadata: read**. A classic PAT must authenticate the GitHub account that has access to the repository. No `Contents` or Actions Secrets permission is needed. Port Router verifies its separate `PORT_ROUTER_KEY` before the GitHub request.

Successful validation creates a random in-memory session token with an eight-hour lifetime. Lumira sends that session token with each Forge request. Port Router replaces it with the local `COGNOSCERE_API_TOKEN` before proxying to port `19195`. The GitHub PAT is not retained, logged, sent to Forge, or written to browser storage. Restarting Port Router clears its active sessions.

`local-port-router.service.d/lumira-forge-token.conf` is the host-specific systemd drop-in used here. It runs this tracked router source and loads the existing local Forge environment file. Install it under `~/.config/systemd/user/local-port-router.service.d/`, then run `systemctl --user daemon-reload` and restart `local-port-router.service`.

The gate controls access to the Lumira application session and local Forge route. GitHub Pages and the static files remain public.
