const $ = (id) => document.getElementById(id);
let questions = [];
let answers = []; // answers[i] = chosen option number for question i
let current = 0;

// Text goes in via textContent, never innerHTML, so question text can never be parsed as markup.
function render() {
  const q = questions[current];
  const last = current === questions.length - 1;
  $('step').textContent = `Question ${current + 1} of ${questions.length}`;
  $('bar').style.width = `${(current / questions.length) * 100}%`;
  $('next').textContent = last ? 'Submit' : 'Next';
  $('next').disabled = answers[current] === undefined;

  const card = $('card');
  card.replaceChildren();
  const h = document.createElement('h2');
  h.className = 'mb-4 text-xl font-semibold';
  h.textContent = q.text;
  card.append(h);

  q.options.forEach((text, i) => {
    const label = document.createElement('label');
    label.className = 'mb-2 flex cursor-pointer items-center gap-3 rounded-lg border border-slate-300 p-3 hover:bg-slate-50';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'option';
    input.checked = answers[current] === i;
    input.addEventListener('change', () => {
      answers[current] = i;
      $('next').disabled = false;
    });
    const span = document.createElement('span');
    span.textContent = text;
    label.append(input, span);
    card.append(label);
  });
}

async function submit() {
  $('next').disabled = true; // stops a double-click from inserting two documents
  try {
    const res = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error(`Server said ${res.status}`);
    $('bar').style.width = '100%';
    $('step').textContent = '';
    $('next').remove();
    $('card').replaceChildren(Object.assign(document.createElement('h2'), {
      className: 'text-xl font-semibold',
      textContent: 'Thanks! Your answers were saved.',
    }));
  } catch (err) {
    $('error').textContent = `Could not submit: ${err.message}. Please try again.`;
    $('error').classList.remove('hidden');
    $('next').disabled = false;
  }
}

$('next').addEventListener('click', () => {
  $('error').classList.add('hidden');
  if (current === questions.length - 1) return submit();
  current++;
  render();
});

fetch('/api/questions')
  .then((r) => r.json())
  .then((data) => {
    questions = data;
    render();
  })
  .catch(() => {
    $('card').textContent = 'Could not load the questions. Please refresh.';
  });
