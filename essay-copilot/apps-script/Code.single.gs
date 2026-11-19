const MAX_DOC = 24000;
const MAX_SEL = 12000;

function onOpen() {
  DocumentApp.getUi().createMenu('A+ Essay Copilot')
    .addItem('Open Copilot', 'showSidebar')
    .addItem('Set bridge configuration', 'showSetup')
    .addToUi();
}

function showSidebar() {
  DocumentApp.getUi().showSidebar(HtmlService.createHtmlOutput(SIDEBAR_HTML).setTitle('A+ Essay Copilot'));
}

function showSetup() {
  DocumentApp.getUi().showModalDialog(HtmlService.createHtmlOutput(SETUP_HTML).setWidth(420).setHeight(330), 'A+ Essay Copilot setup');
}

function saveBridgeConfig(url, token) {
  url = String(url || '').trim().replace(/\/$/, '');
  token = String(token || '').trim();
  if (!/^https:\/\//i.test(url)) throw new Error('Bridge URL must use HTTPS.');
  if (!token) throw new Error('Bridge token is required.');
  PropertiesService.getUserProperties().setProperties({ ESSAY_COPILOT_BRIDGE_URL: url, ESSAY_COPILOT_BRIDGE_TOKEN: token });
  return 'Saved. Reload the document, then open A+ Essay Copilot.';
}

function getContext() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody().getText();
  const selected = getSelected();
  return {
    title: doc.getName(),
    question: detectQuestion(body),
    selectedText: selected,
    currentSection: selected ? nearby(body, selected) : body.split('\n').slice(0, 8).join('\n'),
    documentContext: trim(body, MAX_DOC),
    selectionPresent: Boolean(selected)
  };
}

function analyze(action, instruction, questionOverride) {
  const p = PropertiesService.getUserProperties();
  const url = p.getProperty('ESSAY_COPILOT_BRIDGE_URL');
  const token = p.getProperty('ESSAY_COPILOT_BRIDGE_TOKEN');
  if (!url || !token) throw new Error('Use A+ Essay Copilot → Set bridge configuration first.');
  const c = getContext();
  const response = UrlFetchApp.fetch(url.replace(/\/$/, '') + '/v1/analyze', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ action: action, instruction: String(instruction || ''), question: String(questionOverride || c.question), selectedText: trim(c.selectedText, MAX_SEL), currentSection: trim(c.currentSection, 8000), documentContext: c.documentContext })
  });
  const status = response.getResponseCode();
  let data; try { data = JSON.parse(response.getContentText()); } catch (e) { data = {}; }
  if (status < 200 || status > 299) throw new Error(data.error || 'Bridge error HTTP ' + status);
  return { response: data.response || '', context: c };
}

function insertAtCursor(value) {
  const cursor = DocumentApp.getActiveDocument().getCursor();
  if (!cursor) throw new Error('Place the cursor in the document first.');
  cursor.insertText(String(value || '').trim() + '\n');
  return 'Inserted at cursor.';
}

function replaceSelection(value) {
  const selection = DocumentApp.getActiveDocument().getSelection();
  if (!selection) throw new Error('Select text in the document first.');
  const r = selection.getRangeElements()[0];
  const t = r.getElement().asText();
  const start = r.isPartial() ? r.getStartOffset() : 0;
  const end = r.isPartial() ? r.getEndOffsetInclusive() : t.getText().length - 1;
  t.deleteText(start, end);
  t.insertText(start, String(value || '').trim());
  return 'Replaced the selected text.';
}

function getSelected() {
  const s = DocumentApp.getActiveDocument().getSelection();
  if (!s) return '';
  return s.getRangeElements().map(function(r) { return r.getElement().getText(); }).join('\n').trim();
}

function detectQuestion(body) {
  const head = String(body || '').slice(0, 5000);
  const labeled = head.match(/(?:^|\n)\s*(?:essay\s+)?question\s*:\s*(.+(?:\n(?!\s*\n).+)*)/i);
  if (labeled) return labeled[1].trim().split('\n').slice(0, 4).join(' ');
  return head.split('\n').map(function(x) { return x.trim(); }).find(function(x) { return x.length > 25 && x.endsWith('?'); }) || '';
}

function nearby(body, selected) {
  const lines = String(body || '').split('\n');
  const i = lines.findIndex(function(x) { return x.indexOf(selected.slice(0, 60)) !== -1; });
  return lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 4)).join('\n');
}

function trim(value, max) {
  const x = String(value || '').trim();
  return x.length <= max ? x : x.slice(0, Math.floor(max * .72)) + '\n[...middle omitted...]\n' + x.slice(-Math.floor(max * .25));
}

const SETUP_HTML = `<!doctype html><base target="_top"><style>body{font:13px Arial;padding:18px;color:#172033}label{display:block;margin:12px 0 5px;font-weight:bold;font-size:11px;color:#667085;text-transform:uppercase}input{width:100%;box-sizing:border-box;padding:9px;border:1px solid #d9dee8;border-radius:5px}button{margin-top:16px;padding:9px 14px;border:0;border-radius:5px;color:white;background:#315efb;font-weight:bold}p{color:#667085;font-size:11px;line-height:1.5}</style><h2>A+ Essay Copilot</h2><p>Enter the HTTPS bridge URL and bridge token. Never enter an AI provider key here.</p><label>Bridge HTTPS URL</label><input id="u" placeholder="https://copilot.example.com"><label>Bridge access token</label><input id="t" type="password"><button onclick="save()">Save</button><p id="s"></p><script>function save(){google.script.run.withSuccessHandler(function(x){s.textContent=x}).withFailureHandler(function(x){s.textContent=x.message}).saveBridgeConfig(u.value,t.value)}</script>`;

const SIDEBAR_HTML = `<!doctype html><base target="_top"><style>:root{--ink:#172033;--muted:#667085;--line:#d9dee8;--blue:#315efb}*{box-sizing:border-box}body{margin:0;padding:14px;color:var(--ink);font:13px/1.45 Arial;background:#fff}h1{margin:0;font-size:18px}.ey{margin:3px 0 14px;color:var(--muted);font-size:10px;font-weight:bold;letter-spacing:.8px;text-transform:uppercase}label{display:block;margin:12px 0 5px;color:var(--muted);font-size:11px;font-weight:bold;text-transform:uppercase}textarea{width:100%;border:1px solid var(--line);border-radius:6px;padding:8px;font:inherit;resize:vertical}#q{min-height:58px}#i{min-height:45px}.ctx{padding:8px;border:1px solid var(--line);border-radius:6px;background:#f5f7fb;color:#475467;font-size:11px}.acts{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0 8px}button{min-height:32px;cursor:pointer;border:1px solid #bdc7dc;border-radius:5px;background:#fff;font-weight:bold;font-size:11px;color:var(--ink)}button:hover,.active{border-color:var(--blue);background:#f2f5ff}.active{color:white;background:var(--blue)}.send{width:100%;margin-top:7px;border-color:var(--blue);color:white;background:var(--blue)}.status{min-height:18px;margin:8px 0;color:var(--muted);font-size:11px}.err{color:#b42318}.out{min-height:260px;white-space:pre-wrap;overflow-wrap:anywhere;padding:10px;border:1px solid var(--line);border-radius:6px;background:#fcfcfd;color:#172033}.empty{color:#98a2b3}.outs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px}.small{font-size:10px;color:var(--muted)}</style><h1>A+ Essay Copilot</h1><div class="ey">Think clearly. Defend the argument.</div><label>Essay question</label><textarea id="q" placeholder="Detected from the document. Edit if needed."></textarea><label>Context</label><div id="c" class="ctx">Loading…</div><label>Action</label><div class="acts">${['develop','challenge','explain','connect','improve','professor'].map(function(a){return '<button data-a="'+a+'">'+a.toUpperCase()+'</button>'}).join('')}</div><label>Your instruction <span class="small">optional</span></label><textarea id="i" placeholder="Focus on whether this really answers the question."></textarea><button id="send" class="send">SEND TO COPILOT</button><div id="st" class="status"></div><label>AI response</label><div id="o" class="out empty">Nothing is inserted automatically.</div><div class="outs"><button id="ins">INSERT</button><button id="rep">REPLACE</button><button id="cpy">COPY</button></div><script>var action='improve',latest='';function $(x){return document.getElementById(x)}function status(x,e){$('st').textContent=x;$('st').className=e?'status err':'status'}function esc(x){return String(x||'').replace(/[&<>]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]})}function draw(x){$('q').value=x.question||'';$('c').innerHTML='<b>'+(x.selectionPresent?'Selected text':'Document context')+'</b><br>'+esc((x.selectedText||x.currentSection||'No text found.').slice(0,900))}document.querySelectorAll('[data-a]').forEach(function(b){b.onclick=function(){action=b.dataset.a;document.querySelectorAll('[data-a]').forEach(function(x){x.classList.toggle('active',x===b)})}});document.querySelector('[data-a="improve"]').classList.add('active');google.script.run.withSuccessHandler(draw).withFailureHandler(function(e){status(e.message,true)}).getContext();$('send').onclick=function(){$('send').disabled=true;status('Reading the plan and challenging the reasoning…');google.script.run.withSuccessHandler(function(x){latest=x.response||'';$('o').textContent=latest;$('o').className='out';draw(x.context);status('Done. Nothing was inserted automatically.');$('send').disabled=false}).withFailureHandler(function(e){status(e.message,true);$('send').disabled=false}).analyze(action,$('i').value,$('q').value)};$('ins').onclick=function(){google.script.run.withSuccessHandler(status).withFailureHandler(function(e){status(e.message,true)}).insertAtCursor(latest)};$('rep').onclick=function(){google.script.run.withSuccessHandler(status).withFailureHandler(function(e){status(e.message,true)}).replaceSelection(latest)};$('cpy').onclick=function(){navigator.clipboard.writeText(latest).then(function(){status('Copied.')},function(){status('Copy failed; select and copy manually.',true)})}</script>`;
