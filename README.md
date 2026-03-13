# 🤖 Xtra Bot

بوت ديسكورد متكامل مع داشبورد ويب أنيق.

## 🚀 التثبيت

### 1. المتطلبات
- Node.js v18+
- حساب Discord Developer

### 2. إعداد البوت
```
git clone / قم بنسخ الملفات
cd xtra-bot
npm install
```

### 3. ملف `.env`
```
cp .env.example .env
```
ثم عدل الملف وضع:
- `DISCORD_TOKEN` — توكن البوت من Discord Developer Portal
- `CLIENT_ID` — 1481917947407765616 (موجود مسبقاً)
- `CLIENT_SECRET` — من Discord Developer Portal → OAuth2
- `SESSION_SECRET` — أي كلمة سرية طويلة
- `BASE_URL` — رابط موقعك (مثال: https://xtrabot.com)
- `OWNER_ID` — 1130392962581397535 (موجود مسبقاً)

### 4. تشغيل البوت
```
node index.js
```

## 📋 الأوامر (99+)

### 📋 عامة
`/ping` `/help` `/serverinfo` `/userinfo` `/avatar` `/botinfo` `/poll` `/say` `/roleinfo` `/invite` `/suggest` `/weather` `/remindme` `/translate` `/shortcut` `/setlang`

### 🛡️ إدارية
`/ban` `/kick` `/mute` `/unmute` `/warn` `/warnings` `/clearwarnings` `/purge` `/slowmode` `/lock` `/unlock` `/addrole` `/removerole` `/nickname` `/unban` `/setlog` `/setwelcome` `/logs`

### 🎫 تذاكر
`/ticket setup` `/ticket panel` `/ticket close` `/ticket claim` `/ticket add` `/ticket remove`

### 🎮 ألعاب
`/coinflip` `/rps` `/dice` `/trivia` `/number` `/gameimage`

### 🔒 حماية
`/protection status|antispam|antilinks|anticaps|antimention`

### 📊 مستويات
`/rank` `/leaderboard` `/setxp`

### 💬 إيمبيد
`/embed create|send|list|delete`

### 🤖 ردود تلقائية
`/autorespond add|remove|list|toggle`

### 💎 بريميوم
`/tokencheck` `/premiuminfo`

## 🌐 الداشبورد
- الرئيسية: `http://localhost:3000`
- الداشبورد: `http://localhost:3000/dashboard`
- لوحة الأونر: `http://localhost:3000/owner`

## 📱 الدعم
- واتساب: https://wa.me/201069181060
- ديسكورد: https://discord.gg/7UtgNs6xfK

## 👨‍💻 المطور
Developed by **STEVEN** ❤️
