import { existsSync, statSync } from 'fs'
import { readFile } from 'fs/promises'
import { extname, join } from 'path'
import cors from '@fastify/cors'
import websocketPlugin from '@fastify/websocket'
import fastify from 'fastify'
import type { RawData } from 'ws'
import { loadAsset, storeAsset } from './assets'
import { makeOrLoadRoom } from './rooms'
import { unfurl } from './unfurl'

const PORT = Number(process.env.PORT) || 5858
const HOST = process.env.HOST || '0.0.0.0'
const CLIENT_DIST = process.env.CLIENT_DIST || join(process.cwd(), 'dist/client')

const STATIC_MAX_AGE = 60 * 60 * 24

const MIME: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.mjs': 'application/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.otf': 'font/otf',
	'.wasm': 'application/wasm',
}

// For this example we use a simple fastify server with the official websocket plugin
// To keep things simple we're skipping normal production concerns like rate limiting and input validation.
const app = fastify()
app.register(websocketPlugin)
app.register(cors, { origin: '*' })

app.get('/health', async () => ({ ok: true, ts: Date.now() }))

app.register(async (app) => {
	// This is the main entrypoint for the multiplayer sync
	app.get('/connect/:roomId', { websocket: true }, async (socket, req) => {
		// The roomId comes from the URL pathname
		const roomId = (req.params as any).roomId as string
		// The sessionId is passed from the client as a query param,
		// you need to extract it and pass it to the room.
		const sessionId = (req.query as any)?.['sessionId'] as string

		// At least one message handler needs to
		// be attached before doing any kind of async work
		// https://github.com/fastify/fastify-websocket?tab=readme-ov-file#attaching-event-handlers
		// We collect messages that came in before the room was loaded, and re-emit them
		// after the room is loaded.
		const caughtMessages: RawData[] = []

		const collectMessagesListener = (message: RawData) => {
			caughtMessages.push(message)
		}

		socket.on('message', collectMessagesListener)

		// Here we make or get an existing instance of TLSocketRoom for the given roomId
		const room = makeOrLoadRoom(roomId)
		// and finally connect the socket to the room
		room.handleSocketConnect({ sessionId, socket })

		socket.off('message', collectMessagesListener)

		// Finally, we replay any caught messages so the room can process them
		for (const message of caughtMessages) {
			socket.emit('message', message)
		}
	})

	// To enable blob storage for assets, we add a simple endpoint supporting PUT and GET requests
	// But first we need to allow all content types with no parsing, so we can handle raw data
	app.addContentTypeParser('*', (_, __, done) => done(null))
	app.put('/uploads/:id', {}, async (req, res) => {
		const id = (req.params as any).id as string
		await storeAsset(id, req.raw)
		res.send({ ok: true })
	})
	app.get('/uploads/:id', async (req, res) => {
		const id = (req.params as any).id as string
		const data = await loadAsset(id)
		// Prevent XSS from user-uploaded SVGs
		res.header('Content-Security-Policy', "default-src 'none'")
		res.header('X-Content-Type-Options', 'nosniff')
		res.send(data)
	})

	// To enable unfurling of bookmarks, we add a simple endpoint that takes a URL query param
	app.get('/unfurl', async (req, res) => {
		const url = (req.query as any).url as string
		res.send(await unfurl(url))
	})
})

// Serve the built Vite client (production). Falls back to index.html for SPA routes.
app.setNotFoundHandler(async (req, res) => {
	if (req.method !== 'GET' && req.method !== 'HEAD') {
		return res.code(404).send({ error: 'Not found' })
	}

	const urlPath = req.url.split('?')[0]
	const filePath = join(CLIENT_DIST, urlPath)

	if (filePath.startsWith(CLIENT_DIST) && existsSync(filePath) && statSync(filePath).isFile()) {
		const data = await readFile(filePath)
		res
			.type(MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream')
			.header('Cache-Control', `public, max-age=${STATIC_MAX_AGE}`)
		return res.send(data)
	}

	const indexPath = join(CLIENT_DIST, 'index.html')
	if (existsSync(indexPath)) {
		const html = await readFile(indexPath)
		return res.type('text/html; charset=utf-8').send(html)
	}

	return res.code(404).send({ error: 'Not found' })
})

app.listen({ port: PORT, host: HOST }, (err) => {
	if (err) {
		console.error(err)
		process.exit(1)
	}

	console.log(`Server listening on ${HOST}:${PORT}`)
	if (existsSync(CLIENT_DIST)) {
		console.log(`Serving client from ${CLIENT_DIST}`)
	} else {
		console.warn(`No client build found at ${CLIENT_DIST}. Run 'yarn build:client'.`)
	}
})
