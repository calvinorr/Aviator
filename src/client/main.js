async function getJSON(url) {
  const res = await fetch(url, { headers: { 'accept': 'application/json' } });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw Object.assign(new Error('Request failed'), { status: res.status, body: json });
  return json;
}

function onReady() {
  const input = document.getElementById('flight');
  const btn = document.getElementById('lookup');
  const status = document.getElementById('status');
  const result = document.getElementById('result');

  async function lookup() {
    const flight = (input.value || '').trim();
    if (!flight) return;
    status.textContent = `Fetching ${flight}…`;
    result.textContent = '';
    try {
      const data = await getJSON(`/api/flight?flight_iata=${encodeURIComponent(flight)}`);
      status.textContent = data.mock ? 'Showing mock data (no API key).' : 'Live data.';
      const first = Array.isArray(data.data) && data.data[0] || null;
      const summary = first ? {
        iata: first?.flight?.iata,
        airline: first?.airline?.name,
        from: first?.departure?.airport,
        to: first?.arrival?.airport
      } : null;
      result.textContent = JSON.stringify({ summary, raw: data }, null, 2);
    } catch (err) {
      status.textContent = `Error: ${err.status || ''}`.trim();
      result.textContent = JSON.stringify(err.body || { message: String(err) }, null, 2);
    }
  }

  btn.addEventListener('click', lookup);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') lookup(); });
  // initial demo fetch
  lookup();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
else onReady();

console.log('[client] Ready');
