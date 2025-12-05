export async function get(url, options = {}) {
  const { headers = {}, timeout } = options;
  const controller = timeout ? new AbortController() : null;
  if (controller) setTimeout(() => controller.abort(), timeout);
  const res = await fetch(url, { method: 'GET', headers, signal: controller?.signal });
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function post(url, body, options = {}) {
  const { headers = { 'Content-Type': 'application/json' }, timeout } = options;
  const controller = timeout ? new AbortController() : null;
  if (controller) setTimeout(() => controller.abort(), timeout);
  const payload = headers['Content-Type']?.includes('application/json') ? JSON.stringify(body) : body;
  const res = await fetch(url, { method: 'POST', headers, body: payload, signal: controller?.signal });
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}