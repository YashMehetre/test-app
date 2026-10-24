require('dotenv').config(); // must stay first so MONGODB_URI exists before anything reads it
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const questions = require('./questions');

// One document per submission. Counting happens later, in the database, so the
// server never has to hold every response in memory.
const Response = mongoose.model(
  'Response',
  new mongoose.Schema({ answers: { type: [Number], required: true } }, { timestamps: true })
);

const app = express();
app.use(express.json({ limit: '10kb' })); // a poll answer is tiny; refuse anything bigger

// Frontend and API share one origin, so the browser never makes a cross-origin call (no CORS needed).
app.use(express.static(path.join(__dirname, 'public')));
app.get('/results', (req, res) => res.sendFile(path.join(__dirname, 'public', 'results.html')));

// "Ready" means the database is usable, not merely that Node is running.
app.get('/api/health', (req, res) => {
  const up = mongoose.connection.readyState === 1;
  res.status(up ? 200 : 503).json({ status: up ? 'ready' : 'unavailable' });
});

app.get('/api/questions', (req, res) => res.json(questions));

// Validate on the server: the browser is user-controlled, so its checks are only for convenience.
function validAnswers(a) {
  return (
    Array.isArray(a) &&
    a.length === questions.length &&
    a.every((n, i) => Number.isInteger(n) && n >= 0 && n < questions[i].options.length)
  );
}

app.post('/api/responses', async (req, res, next) => {
  try {
    const answers = req.body && req.body.answers;
    if (!validAnswers(answers)) {
      return res.status(400).json({ error: `answers must be ${questions.length} valid option numbers` });
    }
    await Response.create({ answers }); // only the validated array is stored, never the raw body
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Compare hashes so the check takes the same time wherever the first wrong character is.
function keyMatches(given, expected) {
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
  return crypto.timingSafeEqual(h(given), h(expected));
}

app.get('/api/results', async (req, res, next) => {
  try {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey) return res.status(503).json({ error: 'ADMIN_KEY is not configured' }); // fail closed, never open
    if (!keyMatches(req.get('x-admin-key') || '', adminKey)) {
      return res.status(401).json({ error: 'wrong admin key' });
    }

    // Turn each answers array into (question index, chosen option) rows and count them in MongoDB.
    const [total, counts] = await Promise.all([
      Response.countDocuments(),
      Response.aggregate([
        { $unwind: { path: '$answers', includeArrayIndex: 'q' } },
        { $group: { _id: { q: '$q', a: '$answers' }, count: { $sum: 1 } } },
      ]),
    ]);

    const out = questions.map((q) => ({
      text: q.text,
      options: q.options.map((text) => ({ text, count: 0 })), // zero-fill so unchosen options still show
    }));
    for (const { _id, count } of counts) {
      const opt = out[_id.q] && out[_id.q].options[_id.a];
      if (opt) opt.count = count;
    }
    res.json({ total, questions: out });
  } catch (err) {
    next(err);
  }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'not found' }));

// Express 5 forwards rejected async handlers here too. Clients get a generic message; details stay in the log.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(400).json({ error: 'invalid request body' });
  }
  console.error(err);
  res.status(500).json({ error: 'server error' });
});

// Connect first, then listen: an app that is up but cannot save anything is worse than one that refuses to start.
async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  } catch (err) {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  }
  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => console.log(`test-app listening on port ${port}`));
}

start();
