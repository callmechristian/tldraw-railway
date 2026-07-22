# Deploy and Host tldraw-railway on Railway

**tldraw-railway** is a production-ready, self-hosted multiplayer backend for the [tldraw](https://tldraw.dev) infinite canvas. It packages a Fastify sync server, WebSocket rooms, SQLite persistence, and a Vite-built React client into a single Railway-deployable service.

## About Hosting tldraw-railway

Deploying tldraw-railway on Railway gives you a private, persistent whiteboard server in minutes. The template builds the service from a Dockerfile, mounts a Railway volume at `/data` so rooms and uploaded assets survive redeploys, and exposes a public HTTPS endpoint with an auto-generated domain. You only need to provide a free tldraw SDK license key to unlock the editor in production.

## Common Use Cases

- **Team whiteboards** — Host a private, multiplayer canvas for your company or community without relying on tldraw.com.
- **Embedded diagrams** — Power a custom app or dashboard with a self-controlled tldraw backend and persistent rooms.
- **Collaborative prototyping** — Run workshop or design sessions where room data and assets stay on your own infrastructure.

## Dependencies for tldraw-railway Hosting

- **tldraw SDK license key** — Required for production rendering. Get a free trial at [tldraw.dev/pricing](https://tldraw.dev/pricing).
- **Railway volume** — Automatically attached at `/data` for SQLite room storage and asset persistence.

### Deployment Dependencies

- [tldraw SDK documentation](https://tldraw.dev)
- [tldraw pricing and licenses](https://tldraw.dev/pricing)
- [tldraw-railway GitHub repository](https://github.com/callmechristian/tldraw-railway)

## Why Deploy tldraw-railway on Railway?

<!-- Recommended: Keep this section as shown below -->
Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying tldraw-railway on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
<!-- End recommended section -->
