# Lumira authentication through Port Router

`router.mjs` is the local Port Router runtime used by the published Lumira app. The systemd user service reads the existing Port Router environment file and also loads the local Cognoscere environment file. The latter keeps `COGNOSCERE_API_TOKEN` on this machine; do not copy secret values into this repository.

The access gate asks for a GitHub PAT and the local Port Router key. Port Router validates the PAT with `GET /repos/{owner}/{repo}/actions/secrets/{secret_name}` using the values in `PORT_ROUTER_GITHUB_REPO` and `PORT_ROUTER_GITHUB_SECRET_NAME`. The current configuration targets `glaucodeveloper/remote-station-support-repo` and `ROUTER_KEY`. GitHub returns metadata only, never the secret value.

Use a fine-grained PAT scoped to that repository with **Secrets: read**. A classic PAT needs `repo` and collaborator access. `Contents: read/write` does not authorize secret metadata. Port Router verifies its separate `PORT_ROUTER_KEY` before the GitHub request.

Successful validation creates a random in-memory session token with an eight-hour lifetime. Lumira sends that session token with each Forge request. Port Router replaces it with the local `COGNOSCERE_API_TOKEN` before proxying to port `19195`. The GitHub PAT is not retained, logged, sent to Forge, or written to browser storage. Restarting Port Router clears its active sessions.

`local-port-router.service.d/lumira-forge-token.conf` is the host-specific systemd drop-in used here. It runs this tracked router source and loads the existing local Forge environment file. Install it under `~/.config/systemd/user/local-port-router.service.d/`, then run `systemctl --user daemon-reload` and restart `local-port-router.service`.

The gate controls access to the Lumira application session and local Forge route. GitHub Pages and the static files remain public.
