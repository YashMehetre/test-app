const $ = (id) => document.getElementById(id);
let adminKey = ''; // kept in memory only, so closing the tab forgets it
let timer = null;

function el(tag, className, text) {
  const e = document.createElement(tag);
  e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function draw(data) {
  $('msg').textContent = `${data.total} response${data.total === 1 ? '' : 's'}`;
  const cards = data.questions.map((q) => {
    const card = el('section', 'rounded-xl bg-white p-5 shadow');
    card.append(el('h2', 'mb-3 font-semibold', q.text));
    const max = Math.max(1, ...q.options.map((o) => o.count)); // bars scale to the leader; avoids dividing by zero
    for (const o of q.options) {
      const row = el('div', 'mb-2');
      row.append(el('div', 'flex justify-between text-sm', ''));
      row.firstChild.append(el('span', '', o.text), el('span', 'text-slate-500', String(o.count)));
      const track = el('div', 'h-3 rounded bg-slate-200');
      const fill = el('div', 'h-3 rounded bg-indigo-600');
      fill.style.width = `${(o.count / max) * 100}%`;
      track.append(fill);
      row.append(track);
      card.append(row);
    }
    return card;
  });
  $('cards').replaceChildren(...cards);
}

async function refresh() {
  try {
    const res = await fetch('/api/results', { headers: { 'x-admin-key': adminKey } });
    if (res.status === 401 || res.status === 503) {
      clearInterval(timer); // stop hammering the server with a key that will never work
      $('cards').replaceChildren();
      $('msg').textContent = res.status === 401 ? 'Wrong admin key.' : 'Results are disabled: ADMIN_KEY is not set on the server.';
      return;
    }
    if (!res.ok) throw new Error(`status ${res.status}`);
    draw(await res.json());
  } catch (err) {
    $('msg').textContent = `Could not load results (${err.message}). Retrying...`; // the interval keeps running
  }
}

$('login').addEventListener('submit', (e) => {
  e.preventDefault();
  adminKey = $('key').value;
  clearInterval(timer);
  refresh();
  timer = setInterval(refresh, 3000);
});
