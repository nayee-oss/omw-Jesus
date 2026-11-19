import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'

const providerPort = 18890
const bridgePort = 18891
const token = 'test-essay-copilot-token'
let seen

const provider = http.createServer((req, res) => {
  let body = ''
  req.on('data', (chunk) => { body += chunk })
  req.on('end', () => {
    seen = JSON.parse(body)
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ choices: [{ message: { content: 'PROBLEM\nYour thesis needs a direct answer.' } }] }))
  })
})
await new Promise((resolve) => provider.listen(providerPort, '127.0.0.1', resolve))

const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'essay-copilot-'))
const configPath = path.join(dir, 'openclaw.json')
await fs.writeFile(configPath, JSON.stringify({
  models: { providers: { test: { baseUrl: `http://127.0.0.1:${providerPort}/v1`, apiKey: 'fake-key' } } },
  agents: { list: [{ id: 'business2', model: { primary: 'test/test-model' } }] },
}))

const bridge = spawn(process.execPath, ['bridge/server.mjs'], {
  cwd: path.resolve(import.meta.dirname, '..'),
  env: { ...process.env, OPENCLAW_CONFIG: configPath, ESSAY_COPILOT_PORT: String(bridgePort), ESSAY_COPILOT_TOKEN: token },
  stdio: ['ignore', 'pipe', 'pipe'],
})
await new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('bridge did not start')), 5000)
  bridge.stdout.on('data', (chunk) => { if (String(chunk).includes('listening')) { clearTimeout(timer); resolve() } })
  bridge.on('error', reject)
})

const health = await fetch(`http://127.0.0.1:${bridgePort}/health`)
assert.equal(health.status, 200)
const unauthorized = await fetch(`http://127.0.0.1:${bridgePort}/v1/analyze`, { method: 'POST', body: '{}' })
assert.equal(unauthorized.status, 401)
const result = await fetch(`http://127.0.0.1:${bridgePort}/v1/analyze`, {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  body: JSON.stringify({ action: 'challenge', question: "Is Rawls's theory preferable to Nozick's?", selectedText: 'Rawls supports redistribution.', documentContext: 'Thesis: Rawls is preferable because fairness matters.' }),
})
assert.equal(result.status, 200)
const payload = await result.json()
assert.match(payload.response, /PROBLEM/)
assert.match(seen.messages[1].content, /Rawls/) 
assert.match(seen.messages[1].content, /strongest opponent/i)

bridge.kill('SIGTERM')
provider.close()
console.log('essay-copilot smoke test passed')
