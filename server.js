import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));

// Rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_MAX || '10', 10),
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Serve static site
app.use(express.static(__dirname));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Validation helper
function sanitize(str = '') {
  return String(str).trim().replace(/[\r\n]+/g, ' ').slice(0, 2000);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Email transporter
let transporter;
async function createTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) throw new Error('SMTP_HOST not set');
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
    secure: SMTP_SECURE === 'true',
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
  await transporter.verify();
  return transporter;
}

app.post('/api/quote', async (req, res) => {
  try {
    const { name, email, phone, message, honeypot } = req.body || {};

    if (honeypot) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    const clean = {
      name: sanitize(name),
      email: sanitize(email),
      phone: sanitize(phone),
      message: sanitize(message)
    };

    if (!clean.name || !clean.email || !clean.message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields.' });
    }
    if (!validateEmail(clean.email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email address.' });
    }

    const dest = process.env.QUOTE_DEST;
    if (!dest) {
      return res.status(500).json({ ok: false, error: 'Server not configured for email (QUOTE_DEST missing).' });
    }

    const from = process.env.FROM_EMAIL || dest;

    const mail = {
      from,
      to: dest,
      subject: `Quote Request from ${clean.name}`,
      replyTo: clean.email,
      text: `Name: ${clean.name}\nEmail: ${clean.email}\nPhone: ${clean.phone || 'N/A'}\n\nMessage:\n${clean.message}`,
      html: `<p><strong>Name:</strong> ${clean.name}</p>
             <p><strong>Email:</strong> ${clean.email}</p>
             <p><strong>Phone:</strong> ${clean.phone || 'N/A'}</p>
             <p><strong>Message:</strong><br/>${clean.message.replace(/</g,'&lt;')}</p>`
    };

    const tx = await createTransporter();
    await tx.sendMail(mail);

    res.json({ ok: true });
  } catch (err) {
    console.error('Email send failed', err);
    res.status(500).json({ ok: false, error: 'Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
