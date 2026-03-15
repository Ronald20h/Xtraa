const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const passport = require('passport');
const { Strategy } = require('passport-discord');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

module.exports = function(client) {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https://cdn.discordapp.com", "https://i.imgur.com", "*"],
        connectSrc: ["'self'"],
      }
    }
  }));

  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

  passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/callback`,
    scope: ['identify', 'guilds']
  }, (accessToken, refreshToken, profile, done) => done(null, profile)));

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: process.env.SESSION_SECRET || 'xtra-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 }
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use((req, res, next) => { req.client = client; next(); });


  // Owner Premium API
  app.post('/api/owner/premium', (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'غير مسجل' });
    const ids = (process.env.OWNER_IDS || process.env.OWNER_ID || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.includes(req.user.id)) return res.status(403).json({ error: '❌ غير مصرح' });
    const { dbGet, dbRun, ensureGuild } = require('../bot/database');
    const { guildId, action, days } = req.body;
    if (!guildId) return res.json({ error: 'أدخل ID السيرفر' });
    try {
      ensureGuild(guildId);
      if (action === 'add') {
        const exp = days ? new Date(Date.now() + days * 86400000).toISOString() : null;
        dbRun('INSERT OR REPLACE INTO premium_servers (guild_id, granted_by, expires_at, plan) VALUES (?,?,?,?)', [guildId, req.user.id, exp, 'basic']);
        dbRun('UPDATE guilds SET premium = 1 WHERE id = ?', [guildId]);
        return res.json({ success: true, message: `✅ تم منح Premium لـ ${guildId}` });
      }
      if (action === 'remove') {
        dbRun('DELETE FROM premium_servers WHERE guild_id = ?', [guildId]);
        dbRun('UPDATE guilds SET premium = 0 WHERE id = ?', [guildId]);
        return res.json({ success: true, message: `✅ تم سحب Premium من ${guildId}` });
      }
      res.json({ error: 'action غير صحيح' });
    } catch(e) { res.json({ error: e.message }); }
  });

  app.use('/', require('./routes/index'));
  app.use('/auth', require('./routes/auth'));
  app.use('/dashboard', require('./routes/dashboard'));
  app.use('/api', require('./routes/api'));
  app.use('/owner', require('./routes/owner'));

  app.use((req, res) => res.status(404).render('404', { user: req.user || null }));
  app.use((err, req, res, next) => { console.error(err.stack); res.status(500).render('error', { error: err.message }); });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🌐 Dashboard: http://localhost:${PORT}`));

  return app;
};
