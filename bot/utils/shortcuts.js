const BUILTIN_SHORTCUTS = {
  // ─── عام ───
  ping:        ['ping','بنق','بينق','p','اتصال'],
  avatar:      ['avatar','صورة','صوره','pfp','av'],
  userinfo:    ['userinfo','يوزر','معلومات','ui','who'],
  serverinfo:  ['serverinfo','سيرفر','si'],
  botinfo:     ['botinfo','بوت','bi'],
  membercount: ['membercount','اعضاء','عدد','mc'],
  channelinfo: ['channelinfo','قناة','ci'],
  roleinfo:    ['roleinfo','ri'],
  uptime:      ['uptime','وقت-التشغيل','ut'],
  guildicon:   ['guildicon','أيقونة','icon'],
  banner:      ['banner','بانر'],
  stickers:    ['stickers','ستيكرات','sticker'],
  snipe:       ['snipe','سناب','محذوفة'],
  enlarge:     ['enlarge','كبر','تكبير'],
  invite:      ['invite','دعوة','inv'],
  shortcut:    ['shortcut','اختصار','اختصارات'],
  say:         ['say','قل','ارسل','msg'],
  poll:        ['poll','استطلاع','تصويت','vote'],
  suggest:     ['suggest','اقتراح','فكرة','idea'],
  translate:   ['translate','ترجم'],
  weather:     ['weather','طقس','جو'],
  remindme:    ['remindme','ذكرني','تذكير','remind'],
  afk:         ['afk','غياب','مشغول','بعيد'],
  setlang:     ['setlang','لغة','lang'],
  help:        ['help','مساعدة','هيلب','اوامر','أوامر','h','?'],
  // ─── أدوات ───
  decoration:  ['decoration','زخرف','زخرفة','deco','جمل'],
  calculator:  ['calculator','حاسبة','calc','احسب'],
  math:        ['math','رياضيات','حسابات'],
  percentage:  ['percentage','نسبة','pct'],
  tax:         ['tax','ضريبة','ضريبه','حاسبة-ضريبة'],
  color:       ['color','لون','colour'],
  reverse:     ['reverse','اعكس','عكس','flip'],
  password:    ['password','باسورد','كلمة-مرور','pass'],
  age:         ['age','عمر','ميلاد'],
  timer:       ['timer','مؤقت','عداد'],
  choice:      ['choice','اختر','عشوائي','random'],
  // ─── مرح ───
  '8ball':     ['8ball','كرة','تنبأ','ball'],
  iq:          ['iq','ذكاء','عقل'],
  ship:        ['ship','شيب','توافق','حب'],
  rate:        ['rate','قيّم','تقييم'],
  pp:          ['pp','قوة','طاقة'],
  slap:        ['slap','صفع','صفعة'],
  hug:         ['hug','حضن','احضن'],
  joke:        ['joke','نكتة','نكت','اضحك'],
  fact:        ['fact','معلومة','هل-تعلم'],
  quote:       ['quote','اقتباس','حكمة'],
  // ─── إدارة ───
  ban:         ['ban','حظر','بان','block'],
  tempban:     ['tempban','حظر-مؤقت','تبان'],
  kick:        ['kick','طرد','اطرد','kk'],
  mute:        ['mute','كتم','اكتم','سكوت','صامت'],
  unmute:      ['unmute','فك','رفع-كتم','فك-كتم'],
  warn:        ['warn','تحذير','حذر','w'],
  warnings:    ['warnings','تحذيرات','ws'],
  clearwarnings:['clearwarnings','مسح-تحذيرات','cw'],
  note:        ['note','ملاحظة'],
  purge:       ['purge','clear','مسح','احذف','حذف','del','cls'],
  lock:        ['lock','قفل','اقفل','lk'],
  unlock:      ['unlock','فتح','افتح','ulk'],
  hide:        ['hide','اخفي','إخفاء'],
  show:        ['show','اظهر','إظهار'],
  slowmode:    ['slowmode','بطيء','slow','sm'],
  nuke:        ['nuke','نظف','bomb'],
  announce:    ['announce','اعلان','إعلان','ann'],
  massrole:    ['massrole','رتبة-للكل','mass'],
  addrole:     ['addrole','اضف-رتبة','ar','ار'],
  removerole:  ['removerole','ازل-رتبة','rr'],
  createrole:  ['createrole','انشئ-رتبة','cr'],
  deleterole:  ['deleterole','احذف-رتبة','dr'],
  rolename:    ['rolename','اسم-رتبة','rn'],
  rolecolor:   ['rolecolor','لون-رتبة','rc'],
  rename:      ['rename','اسم','غير-اسم'],
  nickname:    ['nickname','لقب','nick','nn'],
  come:        ['come','تعال','هنا','نداء','call'],
  move:        ['move','انقل','نقل'],
  voicekick:   ['voicekick','طرد-صوتي','vk'],
  deafen:      ['deafen','اصمم','صمم'],
  unban:       ['unban','رفع-حظر','فك-حظر','ub'],
  logs:        ['logs','سجل','لوق','log'],
  // ─── تذاكر ───
  ticket:      ['ticket','تذكرة','تكت','support','دعم'],
  // ─── مستويات ───
  rank:        ['rank','رتبة','رتبتي','xp','مستوى'],
  leaderboard: ['leaderboard','lb','متصدرين','top','اقوى','ترتيب'],
  setxp:       ['setxp','xp-عدل','عدل-xp'],
  // ─── ألعاب ───
  roulette:    ['roulette','روليت','عجلة','rl'],
  xo:          ['xo','اكس','إكس','ttt'],
  dice:        ['dice','نرد','زهر','roll'],
  coinflip:    ['coinflip','عملة','flip','cf'],
  rps:         ['rps','حجرة','ورقة-مقص'],
  guess:       ['guess','خمن','خمّن','رقم'],
  trivia:      ['trivia','اختبار','معلومة','tv'],
  // ─── هبات ───
  giveaway:    ['giveaway','هبة','هديه','gw','give'],
  // ─── حماية ───
  protection:  ['protection','حماية','protect','prot'],
  // ─── بريميوم ───
  premiuminfo: ['premiuminfo','بريميوم','premium','vip'],
  tokencheck:  ['tokencheck','توكن','token','tc'],
  // ─── أخرى ───
  embed:       ['embed','ايمبيد','em'],
  autorespond: ['autorespond','رد-تلقائي','auto'],
};

function buildShortcutMap() {
  const map = new Map();
  for (const [cmd, aliases] of Object.entries(BUILTIN_SHORTCUTS)) {
    for (const alias of aliases) map.set(alias.toLowerCase(), cmd);
  }
  return map;
}

const SHORTCUT_MAP = buildShortcutMap();
module.exports = { BUILTIN_SHORTCUTS, SHORTCUT_MAP };
