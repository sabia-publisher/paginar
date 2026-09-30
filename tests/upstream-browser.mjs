// Run against two separate documents; never register both bundles in one page.
import { createServer } from 'node:http'
import { readFile, mkdtemp, writeFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'

const args = Object.fromEntries(process.argv.slice(2).map((value, index, all) => value.startsWith('--') ? [value.slice(2), all[index + 1]] : []).filter(pair => pair.length))
if (!args.reference || !args['host-vue'] || !args.browser)
	throw new Error('Use --reference <bundle.js> --host-vue <vue.esm-browser.prod.js> --browser <chromium>')
// fileURLToPath works on both Windows drive paths and POSIX.
const { fileURLToPath } = await import('node:url')
const workspace = fileURLToPath(new URL('../', import.meta.url))
const reference = await readFile(args.reference)
console.log('Reference SHA-256:', createHash('sha256').update(reference).digest('hex'))
const artifacts = await mkdtemp(resolve(tmpdir(), 'paginar-upstream-'))
const server = createServer(async (request, response) => {
	try {
		const pathname = new URL(request.url, 'http://localhost').pathname
		if (pathname === '/reference.js' || pathname === '/host-vue.js') {
			response.setHeader('Content-Type', 'text/javascript; charset=utf-8')
			response.end(pathname === '/reference.js' ? reference : await readFile(args['host-vue']))
			return
		}
		if (pathname === '/tests/destination.html' || pathname === '/tests/undefined') {
			response.setHeader('Content-Type', 'text/html; charset=utf-8')
			response.end('<!doctype html><title>Destino</title><p>Destino da navegação</p>')
			return
		}
		if (args.dist && pathname.startsWith('/dist/')) {
			const file = resolve(args.dist, pathname.slice('/dist/'.length))
			if (!file.startsWith(resolve(args.dist) + sep)) {
				response.writeHead(404).end()
				return
			}
			response.setHeader('Content-Type', extname(file) === '.css' ? 'text/css' : 'text/javascript')
			response.end(await readFile(file))
			return
		}
		const file = resolve(workspace, `.${pathname}`)
		if (!['tests', 'dist', 'demo'].some(directory => file.startsWith(resolve(workspace, directory) + sep))) {
			response.writeHead(404).end()
			return
		}
		response.setHeader('Content-Type', { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json' }[extname(file)] || 'text/plain')
		response.end(await readFile(file))
	} catch {
		response.writeHead(404).end()
	}
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
try {
	const url = `http://127.0.0.1:${server.address().port}${args.page || '/tests/upstream-browser.html'}`
	const child = spawn(args.browser, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
		`--user-data-dir=${resolve(artifacts, 'profile')}`, '--window-size=1280,1100',
		'--remote-debugging-port=0', 'about:blank'], { windowsHide: true })
	let stderr = ''
	child.stderr.on('data', data => { stderr += data })
	const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
	let socket
	try {
		let port
		for (let attempt = 0; attempt < 100 && !port; attempt++) {
			try { port = (await readFile(resolve(artifacts, 'profile/DevToolsActivePort'), 'utf8')).split('\n')[0] }
			catch { await wait(50) }
		}
		const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
		socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl)
		await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
		let nextId = 0
		const pending = new Map()
		socket.addEventListener('message', event => {
			const message = JSON.parse(event.data)
			if (pending.has(message.id)) {
				const { resolve, reject } = pending.get(message.id)
				pending.delete(message.id)
				if (message.error) reject(new Error(message.error.message))
				else resolve(message.result)
			}
		})
		const call = (method, params = {}) => new Promise((resolve, reject) => {
			const id = ++nextId
			pending.set(id, { resolve, reject })
			socket.send(JSON.stringify({ id, method, params }))
		})
		await call('Page.navigate', { url })
		let result
		for (let attempt = 0; attempt < 480; attempt++) {
			await wait(250)
			result = (await call('Runtime.evaluate', { expression: '({ title: document.title, html: document.documentElement.outerHTML })', returnByValue: true })).result.value
			if (/^(PASS|FAIL)/.test(result.title)) break
		}
		await writeFile(resolve(artifacts, 'page.html'), result.html)
		await writeFile(resolve(artifacts, 'browser.png'), Buffer.from((await call('Page.captureScreenshot')).data, 'base64'))
		const encoded = result.html.match(/data-result="([^"]+)"/)?.[1]
		if (encoded) await writeFile(resolve(artifacts, 'comparison.json'), Buffer.from(encoded, 'base64'))
		console.log(result.title || 'No result', '\nArtifacts:', artifacts)
		if (!result.title?.startsWith('PASS')) {
			console.log(result.html.match(/<pre[^>]*>[\s\S]*?<\/pre>/)?.[0]?.replace(/ data-result="[^"]*"/, '') || stderr.slice(-2000))
			process.exitCode = 1
		}
	} finally {
		socket?.close()
		child.kill()
		await writeFile(resolve(artifacts, 'browser.log'), stderr)
	}
} finally {
	server.close()
}
