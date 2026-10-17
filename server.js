const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_DEMO_SECRET_BEFORE_DEPLOYING';
const DB_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return { users: [], transactions: [] }; }
}
function saveDB(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch { res.status(401).json({ error: 'Ka sake shiga account dinka (login).' }); }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'Elite Data' }));

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password || password.length < 8)
    return res.status(400).json({ error: 'Cika suna, email, da password mai a kalla haruffa 8.' });
  const db = loadDB();
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(409).json({ error: 'An riga an yi rajista da wannan email.' });
  const user = { id: Date.now().toString(), name, email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10), balance: 0, createdAt: new Date().toISOString() };
  db.users.push(user); saveDB(db);
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { name: user.name, email: user.email, balance: user.balance } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  const db = loadDB();
  const user = db.users.find(u => u.email === String(email || '').toLowerCase());
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash)))
    return res.status(401).json({ error: 'Email ko password bai dace ba.' });
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { name: user.name, email: user.email, balance: user.balance } });
});

app.get('/api/me', auth, (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Ba a sami account ba.' });
  const transactions = db.transactions.filter(t => t.userId === user.id).slice(-20).reverse();
  res.json({ user: { name: user.name, email: user.email, balance: user.balance }, transactions });
});

// Demo only: this does not collect real money. Replace with a verified payment provider webhook.
app.post('/api/demo-fund-wallet', auth, (req, res) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount < 100 || amount > 100000)
    return res.status(400).json({ error: 'Adadin demo ya kasance tsakanin ₦100 da ₦100,000.' });
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Ba a sami account ba.' });
  user.balance += amount;
  db.transactions.push({ id: Date.now().toString(), userId: user.id, type: 'Demo wallet credit',
    amount, status: 'DEMO', createdAt: new Date().toISOString() });
  saveDB(db);
  res.json({ balance: user.balance, message: 'An kara demo balance. Ba a karbi kudi na gaske ba.' });
});

// Demo vending: records a simulated order only. Connect a legitimate VTU API before real sales.
app.post('/api/purchase', auth, (req, res) => {
  const { type, network, phone, plan, amount: rawAmount } = req.body || {};
  const amount = Number(rawAmount);
  if (!['Data', 'Airtime'].includes(type) ||
      !['MTN', 'Airtel', 'Glo', '9mobile'].includes(network) ||
      !/^0\d{10}$/.test(String(phone || '')) ||
      !Number.isFinite(amount) || amount <= 0 || amount > 50000)
    return res.status(400).json({ error: 'Duba network, lambar waya da adadin da ka shigar.' });
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Ba a sami account ba.' });
  if (user.balance < amount) return res.status(400).json({ error: 'Wallet balance bai isa ba. Yi demo funding tukuna.' });
  user.balance -= amount;
  const transaction = { id: Date.now().toString(), userId: user.id, type, network, phone,
    plan: String(plan || (type === 'Airtime' ? 'Airtime' : 'Data plan')), amount,
    status: 'DEMO — NOT SENT', createdAt: new Date().toISOString() };
  db.transactions.push(transaction); saveDB(db);
  res.json({ balance: user.balance, transaction,
    message: 'An gwada odar ne kawai. Ba a aika data ko airtime na gaske ba.' });
});

app.listen(PORT, () => console.log(`Elite Data yana aiki a http://localhost:${PORT}`));
