// ══════════════════════════════════════════════════
//  BUILT-IN SHORTCUTS — كل أمر مع اختصاراته الجاهزة
// ══════════════════════════════════════════════════

const BUILTIN_SHORTCUTS = {

  // ─── الأوامر العامة ───
  ping:       ['ping', 'بنق', 'بينق', 'اتصال', 'p'],
  avatar:     ['avatar', 'صورة', 'صوره', 'pfp', 'av'],
  userinfo:   ['userinfo', 'يوزر', 'معلومات', 'who', 'ui'],
  serverinfo: ['serverinfo', 'سيرفر', 'معلومات-السيرفر', 'si'],
  help:       ['help', 'مساعدة', 'هيلب', 'اوامر', 'أوامر', 'h', '?'],
  rank:       ['rank', 'رتبة', 'رتبتي', 'ترتيبي', 'xp', 'مستوى'],
  leaderboard:['leaderboard', 'lb', 'متصدرين', 'top', 'اقوى', 'ترتيب'],
  afk:        ['afk', 'غياب', 'مشغول', 'بعيد'],
  decoration: ['decoration', 'زخرف', 'زخرفة', 'deco', 'جمل'],
  tax:        ['tax', 'ضريبة', 'ضريبه', 'حاسبة', 'حساب'],
  say:        ['say', 'قل', 'ارسل', 'msg'],
  poll:       ['poll', 'استطلاع', 'تصويت', 'vote'],
  suggest:    ['suggest', 'اقتراح', 'فكرة', 'idea'],
  translate:  ['translate', 'ترجم', 'translate'],
  weather:    ['weather', 'طقس', 'جو'],
  botinfo:    ['botinfo', 'بوت', 'معلومات-البوت', 'bi'],
  roleinfo:   ['roleinfo', 'رتبة-معلومات', 'ri'],
  remindme:   ['remindme', 'ذكرني', 'تذكير', 'remind'],
  invite:     ['invite', 'دعوة', 'دعوه', 'inv'],
  shortcut:   ['shortcut', 'اختصار', 'اختصارات'],

  // ─── أوامر الإشراف ───
  ban:        ['ban', 'حظر', 'بان', 'block'],
  kick:       ['kick', 'طرد', 'اطرد', 'kk'],
  mute:       ['mute', 'كتم', 'اكتم', 'سكوت', 'صامت'],
  unmute:     ['unmute', 'فك-الكتم', 'فك', 'رفع-الكتم'],
  warn:       ['warn', 'تحذير', 'حذر', 'warning', 'w'],
  warnings:   ['warnings', 'تحذيرات', 'سجل-التحذيرات', 'ws'],
  clearwarnings: ['clearwarnings', 'مسح-تحذيرات', 'cw', 'clear-warns'],
  purge:      ['purge', 'clear', 'مسح', 'احذف', 'حذف', 'del', 'cls'],
  lock:       ['lock', 'قفل', 'اقفل', 'lk'],
  unlock:     ['unlock', 'فتح', 'افتح', 'ulk'],
  slowmode:   ['slowmode', 'بطيء', 'slow', 'sm'],
  addrole:    ['addrole', 'اضف-رتبة', 'ار', 'ar', 'رتبة-اضف'],
  removerole: ['removerole', 'ازل-رتبة', 'rr', 'رتبة-ازل'],
  nickname:   ['nickname', 'لقب', 'nick', 'nn'],
  rename:     ['rename', 'اسم', 'غير-الاسم', 'rn'],
  come:       ['come', 'تعال', 'هنا', 'نداء', 'call'],
  unban:      ['unban', 'رفع-الحظر', 'فك-الحظر', 'ub'],
  logs:       ['logs', 'سجل', 'لوق', 'log'],
  setlog:     ['setlog', 'قناة-اللوق', 'sl'],
  setwelcome: ['setwelcome', 'ترحيب', 'welcome', 'sw'],
  setlang:    ['setlang', 'لغة', 'lang', 'language'],

  // ─── التذاكر ───
  ticket:     ['ticket', 'تذكرة', 'تكت', 'support', 'دعم'],

  // ─── المستويات ───
  setxp:      ['setxp', 'xp', 'عدل-xp', 'xp-عدل'],

  // ─── الألعاب ───
  roulette:   ['roulette', 'روليت', 'عجلة', 'rl'],
  xo:         ['xo', 'اكس', 'إكس', 'tictactoe'],
  dice:       ['dice', 'نرد', 'زهر', 'roll'],
  coinflip:   ['coinflip', 'عملة', 'flip', 'cf'],
  rps:        ['rps', 'حجرة', 'ورقة-مقص', 'حجرة-ورقة'],
  guess:      ['guess', 'خمن', 'خمّن', 'رقم'],
  trivia:     ['trivia', 'اختبار', 'معلومة', 'tv'],
  number:     ['number', 'رقم-عشوائي', 'random'],

  // ─── الحماية ───
  protection: ['protection', 'حماية', 'protect', 'prot'],

  // ─── البريميوم ───
  premiuminfo: ['premiuminfo', 'بريميوم', 'premium', 'vip'],
  tokencheck:  ['tokencheck', 'توكن', 'token', 'tc'],

  // ─── الهبات والـ AFK وغيرها ───
  giveaway:   ['giveaway', 'هبة', 'هديه', 'gw', 'give'],
  embed:      ['embed', 'ايمبيد', 'رسالة-مضمنة', 'em'],
  autorespond:['autorespond', 'رد-تلقائي', 'auto', 'ar'],
};

// بناء reversed map: shortcut → command
function buildShortcutMap() {
  const map = new Map();
  for (const [cmd, aliases] of Object.entries(BUILTIN_SHORTCUTS)) {
    for (const alias of aliases) {
      map.set(alias.toLowerCase(), cmd);
    }
  }
  return map;
}

const SHORTCUT_MAP = buildShortcutMap();

module.exports = { BUILTIN_SHORTCUTS, SHORTCUT_MAP };
