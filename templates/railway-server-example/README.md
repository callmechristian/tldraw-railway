# tldraw sync, Railway server example

This is a tldraw sync backend designed for deployment on [Railway](https://railway.app). It includes a Dockerfile, Railway config, and production-ready server with SQLite persistence.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.com/template/FR4PfS)

## Quick start

### Local development

From the repository root:

```bash
yarn install
yarn dev
```

This starts both the server (port 5858) and Vite client (port 5757) with hot reload.

### Railway deployment

1. Click the deploy button above, or run `railway up` from `templates/railway-server-example`
2. Add a `VITE_TLDRAW_LICENSE_KEY` environment variable with your tldraw license key. The SDK requires a valid license key to render in production. You can get a free trial license at [tldraw.dev/pricing](https://tldraw.dev/pricing).
3. Attach a Railway volume to the service at `/data`. Rooms and uploaded assets are stored there, so they survive redeploys. Without a volume, the SQLite database and assets are lost when the container restarts.
4. Enable a public domain for the service. Railway automatically generates a unique URL (e.g. `https://railway-server-example-production.up.railway.app`) for each deployment, so every user gets their own address. In the dashboard, go to the service **Settings → Networking → Public Networking** and click **Generate Domain**, or run `railway domain` from the template directory.
5. Redeploy after adding the variable and volume.

Railway builds using the included `Dockerfile` and `railway.toml`.

**Environment variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_TLDRAW_LICENSE_KEY` | — | **Required for production.** Your tldraw SDK license key. |
| `PORT` | `8080` | Server port |
| `HOST` | `0.0.0.0` | Bind address |
| `CLIENT_DIST` | `/app/dist/client` | Path to built client files |
| `ROOMS_DIR` | `/data/rooms` | SQLite database storage |
| `ASSETS_DIR` | `/data/assets` | Uploaded asset storage |

## How it works

- **Server**: Fastify with WebSocket support for real-time sync
- **Storage**: SQLite via `better-sqlite3` for room data, filesystem for assets
- **Client**: React app with tldraw editor, built with Vite
- **Sync**: Uses `@tldraw/sync` for multiplayer collaboration

Room data is automatically persisted to SQLite databases in the `ROOMS_DIR` directory using `SQLiteSyncStorage`.

For a simpler local-only example, see /templates/simple-server-example. For a Cloudflare-specific example, see /templates/sync-cloudflare.

## License

This project is provided under the MIT license found [here](https://github.com/tldraw/tldraw/blob/main/LICENSE.md). The tldraw SDK is provided under the [tldraw license](https://github.com/tldraw/tldraw/blob/main/LICENSE.md).

## Trademarks

Copyright (c) 2024-present tldraw Inc. The tldraw name and logo are trademarks of tldraw. Please see our [trademark guidelines](https://github.com/tldraw/tldraw/blob/main/TRADEMARKS.md) for info on acceptable usage.

## Distributions

You can find tldraw on npm [here](https://www.npmjs.com/package/@tldraw/tldraw?activeTab=versions).

## Contribution

Found a bug? Please [submit an issue](https://github.com/callmechristian/tldraw-railway/issues/new).

## Community

Have questions, comments or feedback? [Join our discord](https://discord.tldraw.com/?utm_source=github&utm_medium=readme&utm_campaign=sociallink). For the latest news and release notes, visit [tldraw.dev](https://tldraw.dev).

## Contact

Find us on Twitter/X at [@tldraw](https://twitter.com/tldraw).
