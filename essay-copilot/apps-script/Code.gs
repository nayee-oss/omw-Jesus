const MAX_DOCUMENT_CHARS = 24000;
const MAX_SELECTED_CHARS = 12000;

function onOpen() {
  DocumentApp.getUi()
    .createMenu('A+ Essay Copilot')
    .addItem('Open Copilot', 'showSidebar')
    .addItem('Set bridge configuration', 'showSetup')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('A+ Essay Copilot');
  DocumentApp.getUi().showSidebar(html);
}

function showSetup() {
  const html = HtmlService.createHtmlOutputFromFile('Setup')
    .setWidth(420)
    .setHeight(340);
  DocumentApp.getUi().showModalDialog(html, 'A+ Essay Copilot setup');
}

function saveBridgeConfig(bridgeUrl, bridgeToken) {
  bridgeUrl = String(bridgeUrl || '').trim().replace(/\/$/, '');
  bridgeToken = String(bridgeToken || '').trim();
  if (!/^https:\/\//i.test(bridgeUrl)) throw new Error('Bridge URL must use HTTPS.');
  if (!bridgeToken) throw new Error('Bridge token is required.');
  PropertiesService.getUserProperties().setProperties({
    ESSAY_COPILOT_BRIDGE_URL: bridgeUrl,
    ESSAY_COPILOT_BRIDGE_TOKEN: bridgeToken,
  });
  return 'Saved. Reopen the Copilot sidebar.';
}

function getBridgeConfigStatus() {
  const props = PropertiesService.getUserProperties();
  const url = props.getProperty('ESSAY_COPILOT_BRIDGE_URL');
  return { configured: Boolean(url && props.getProperty('ESSAY_COPILOT_BRIDGE_TOKEN')), url: url || '' };
}

function getDocumentContext() {
  const document = DocumentApp.getActiveDocument();
  const body = document.getBody().getText();
  const selected = getSelectedText();
  return {
    title: document.getName(),
    question: detectQuestion(body),
    selectedText: selected,
    currentSection: selected ? findNearbyHeading(body, selected) : findCurrentHeading(body),
    documentContext: trimForRequest(body, MAX_DOCUMENT_CHARS),
    selectionPresent: Boolean(selected),
  };
}

function analyze(action, instruction) {
  const config = getRequiredConfig();
  const context = getDocumentContext();
  const payload = {
    action: action,
    instruction: String(instruction || '').trim(),
    question: context.question,
    selectedText: trimForRequest(context.selectedText, MAX_SELECTED_CHARS),
    currentSection: trimForRequest(context.currentSection, 8000),
    documentContext: context.documentContext,
  };
  const response = UrlFetchApp.fetch(config.url + '/v1/analyze', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + config.token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  const status = response.getResponseCode();
  const body = response.getContentText();
  let data;
  try { data = JSON.parse(body); } catch (error) { data = { error: body.slice(0, 500) }; }
  if (status < 200 || status >= 300) throw new Error(data.error || 'Bridge returned HTTP ' + status);
  return { ...data, context: context, action: action };
}

function insertAtCursor(value) {
  const text = String(value || '').trim();
  if (!text) throw new Error('There is no response to insert.');
  const cursor = DocumentApp.getActiveDocument().getCursor();
  if (!cursor) throw new Error('Place the cursor in the document first.');
  cursor.insertText(text + '\n');
  return 'Inserted at cursor.';
}

function replaceSelection(value) {
  const text = String(value || '').trim();
  if (!text) throw new Error('There is no response to insert.');
  const selection = DocumentApp.getActiveDocument().getSelection();
  if (!selection) throw new Error('Select text in the document first.');
  const ranges = selection.getRangeElements();
  if (!ranges.length) throw new Error('Select text in the document first.');
  const first = ranges[0];
  const element = first.getElement().asText();
  const start = first.isPartial() ? first.getStartOffset() : 0;
  const end = first.isPartial() ? first.getEndOffsetInclusive() : element.getText().length - 1;
  element.deleteText(start, end);
  element.insertText(start, text);
  return 'Replaced the selected text.';
}

function getRequiredConfig() {
  const props = PropertiesService.getUserProperties();
  const url = props.getProperty('ESSAY_COPILOT_BRIDGE_URL');
  const token = props.getProperty('ESSAY_COPILOT_BRIDGE_TOKEN');
  if (!url || !token) throw new Error('Copilot is not configured. Use A+ Essay Copilot → Set bridge configuration.');
  return { url: url.replace(/\/$/, ''), token: token };
}

function getSelectedText() {
  const selection = DocumentApp.getActiveDocument().getSelection();
  if (!selection) return '';
  return selection.getRangeElements().map(function(range) {
    return range.getElement().getText();
  }).join('\n').trim();
}

function detectQuestion(body) {
  const head = String(body || '').slice(0, 5000);
  const labeled = head.match(/(?:^|\n)\s*(?:essay\s+)?question\s*:\s*(.+(?:\n(?!\s*\n).+)*)/i);
  if (labeled) return labeled[1].trim().split('\n').slice(0, 4).join(' ');
  const questionLine = head.split('\n').map(function(line) { return line.trim(); })
    .find(function(line) { return line.length > 25 && line.endsWith('?'); });
  return questionLine || '';
}

function findCurrentHeading(body) {
  const lines = String(body || '').split('\n').map(function(line) { return line.trim(); }).filter(Boolean);
  return lines.slice(0, 8).join('\n');
}

function findNearbyHeading(body, selected) {
  const lines = String(body || '').split('\n');
  const index = lines.findIndex(function(line) { return line.indexOf(selected.slice(0, 60)) !== -1; });
  return lines.slice(Math.max(0, index - 3), Math.min(lines.length, index + 4)).join('\n');
}

function trimForRequest(value, max) {
  const text = String(value || '').trim();
  if (text.length <= max) return text;
  return text.slice(0, Math.floor(max * 0.72)) + '\n\n[...middle omitted to stay within context... ]\n\n' + text.slice(-Math.floor(max * 0.25));
}
