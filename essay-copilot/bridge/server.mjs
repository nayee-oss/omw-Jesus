import http from 'node:http'
import crypto from 'node:crypto'
import fs from 'node:fs'

const CONFIG_PATH = process.env.OPENCLAW_CONFIG || '/root/.openclaw/openclaw.json'
const PORT = Number(process.env.ESSAY_COPILOT_PORT || 8789)
const HOST = process.env.ESSAY_COPILOT_HOST || '127.0.0.1'
const ACCESS_TOKEN = process.env.ESSAY_COPILOT_TOKEN
const MAX_BODY = 90_000

if (!ACCESS_TOKEN) {
  console.error('Missing ESSAY_COPILOT_TOKEN. Refusing to start without an access token.')
  process.exit(1)
}

function loadProvider() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
  const agent = config.agents?.list?.find((item) => item.id === (process.env.OPENCLAW_AGENT_ID || 'business2'))
  const modelName = process.env.ESSAY_COPILOT_MODEL || agent?.model?.primary || config.agents?.defaults?.model?.primary
  const [providerName, modelId] = String(modelName).split('/')
  const provider = config.models?.providers?.[providerName]
  if (!provider?.baseUrl || !provider?.apiKey || !modelId) {
    throw new Error(`Could not resolve OpenClaw provider for ${modelName}`)
  }
  return { baseUrl: provider.baseUrl.replace(/\/$/, ''), apiKey: provider.apiKey, model: modelId, provider: providerName }
}

const SYSTEM_PROMPT = `You are A+ Essay Copilot, a demanding but helpful university philosophy and political theory tutor.
You are a thinking and planning assistant, not a general AI writer. Preserve the student's authorship. Do not write a complete essay or silently rewrite the whole plan.

Always prioritize these three golden rules, in this order:
1. Answer the question directly.
2. Structure the answer as an argument.
3. Use philosophical literature as part of the reasoning, not as name-dropping.

Evaluate the student's material using this framework:
- Direct YES/NO, sound/unsound, agree/disagree answer; flag "it depends" and topic-only theses.
- Thesis = answer + because + central reason, ideally using the question's wording.
- Clarity and explicit logical connections over sophistication.
- No generic historical introductions.
- Argument movement: thesis -> argument -> strongest objection -> response -> further problem/implication -> next argument -> conclusion.
- Every philosopher/concept must do argumentative work. Flag topic lists and summary without relevance.
- Find the strongest objection, not an easy objection.
- A response must explain why the objection fails; "X is more convincing" is insufficient.
- Prefer 2-3 deep arguments over many shallow references.
- Define concepts only when their role in the argument requires it.
- Make missing conceptual links explicit: premise -> inference -> conclusion.
- Ask why every paragraph exists and what it proves.
- Look for second-order problems created by a response.
- Conclusion should be short and introduce nothing new.
- Respect a two-page double-spaced plan; do not produce a full essay.

Distinguish known philosophical positions, interpretation, possible argument, and your own suggestion. Never invent quotations, page numbers, article titles, or citations. If the provided materials are insufficient, say what is uncertain. Use course readings supplied by the student over generic references.

Be concise and useful. Prefer headings such as PROBLEM, WHY IT MATTERS, HOW TO FIX IT, POSSIBLE OBJECTION, POSSIBLE RESPONSE, MISSING LINK, and QUESTIONS FOR YOU. Challenge the student's reasoning rather than merely agreeing.`

const ACTION_INSTRUCTIONS = {
  develop: 'Develop the selected/current idea into a compact argument. Return: Claim -> Reason -> Philosophical basis -> Why it supports the thesis -> Strongest possible objection -> A response that explains why it succeeds or fails -> One question for the student. Do not write an essay.',
  challenge: 'Act as the strongest opponent. Identify hidden assumptions, weak premises, ambiguity, logical gaps, counterexamples, and the strongest objection. Explain why this is stronger than an obvious objection. End with questions the student must answer.',
  explain: 'Explain the requested concept only in relation to the current question and plan. Show its argumentative role, what it can and cannot establish, and the missing link if the student is using it too quickly. Do not give an unrelated textbook summary.',
  connect: 'Map the logical relationships among the philosophers and concepts in the context. Identify the chain of premises and inferences, missing links, forced connections, and which thinker should support, object to, or refine the thesis.',
  improve: 'Evaluate the plan against the complete A+ checklist. Return exactly: 1. Strong points 2. Biggest weakness 3. Missing argument 4. Weakest objection 5. Weakest response 6. Missing philosophical connection 7. Suggested restructuring 8. Does the thesis directly answer the question? 9. Two questions for the student. Do not rewrite the full plan.',
  professor: 'Act as the professor grading this plan. Assess thesis quality, argument quality, objection quality, response quality, use of literature, logical structure, clarity, depth, biggest risk, and the specific changes that would move it toward A+. Do not give a numerical grade unless asked. Be candid and constructive.',
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, authorization', 'access-control-allow-methods': 'POST, OPTIONS' })
  res.end(JSON.stringify(body))
}

function authorized(req) {
  const header = req.headers.authorization || ''
  const received = header.startsWith('Bearer ') ? header.slice(7) : ''
  return received.length === ACCESS_TOKEN.length && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(ACCESS_TOKEN))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > MAX_BODY) {
        reject(new Error('Request too large'))
        req.destroy()
      }
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function trim(value, max) {
  return String(value || '').replace(/\s+\n/g, '\n').trim().slice(0, max)
}

function buildPrompt(input) {
  const action = ACTION_INSTRUCTIONS[input.action]
  if (!action) throw new Error(`Unknown action: ${input.action}`)
  const question = trim(input.question, 1200) || '[Question not detected: ask the student to state it explicitly.]'
  const selected = trim(input.selectedText, 12_000)
  const currentSection = trim(input.currentSection, 8_000)
  const plan = trim(input.documentContext, 24_000)
  const instruction = trim(input.instruction, 2_000)
  return `${action}\n\nESSAY QUESTION (the answer must stay focused on this):\n${question}\n\nSELECTED TEXT (prioritize this when present):\n${selected || '[Nothing selected]'}\n\nCURRENT SECTION:\n${currentSection || '[Not identified]'}\n\nRELEVANT ESSAY PLAN / NOTES:\n${plan || '[No plan supplied]'}\n\nSTUDENT'S EXTRA INSTRUCTION:\n${instruction || '[None]'}\n\nNow respond as the tutor. Do not produce a complete essay. Make the reasoning and missing links visible.`
}

async function complete(input) {
  const provider = loadProvider()
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${provider.apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.25,
      max_tokens: 1800,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: buildPrompt(input) }],
    }),
    signal: AbortSignal.timeout(90_000),
  })
  const raw = await response.text()
  let payload
  try { payload = JSON.parse(raw) } catch { payload = { error: raw.slice(0, 500) } }
  if (!response.ok) throw new Error(payload.error?.message || payload.error || `Provider returned ${response.status}`)
  const content = payload.choices?.[0]?.message?.content
  if (!content) throw new Error('Provider returned no response text')
  return { response: content, model: `${provider.provider}/${provider.model}` }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  if (req.url === '/health' && req.method === 'GET') return json(res, 200, { ok: true, service: 'essay-copilot-bridge' })
  if (req.url !== '/v1/analyze' || req.method !== 'POST') return json(res, 404, { error: 'Not found' })
  if (!authorized(req)) return json(res, 401, { error: 'Unauthorized' })
  try {
    const input = JSON.parse(await readBody(req))
    if (!input || typeof input !== 'object') throw new Error('Invalid JSON body')
    const result = await complete(input)
    return json(res, 200, result)
  } catch (error) {
    console.error(error)
    return json(res, error.message === 'Request too large' ? 413 : 502, { error: error.message || 'Analysis failed' })
  }
})

server.listen(PORT, HOST, () => console.log(`Essay Copilot bridge listening on http://${HOST}:${PORT}`))
