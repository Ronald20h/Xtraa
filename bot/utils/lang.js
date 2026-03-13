const ar = {
  // General
  no_permission: '❌ ليس لديك صلاحية لاستخدام هذا الأمر.',
  bot_no_permission: '❌ البوت لا يملك الصلاحيات الكافية.',
  user_not_found: '❌ المستخدم غير موجود.',
  invalid_args: '❌ الأرقام/المعطيات غير صحيحة.',
  success: '✅ تم بنجاح!',
  error: '❌ حدث خطأ ما.',
  
  // Tickets
  ticket_opened: '🎫 تم فتح تذكرتك في {channel}',
  ticket_closed: '🔒 تم إغلاق التذكرة.',
  ticket_max: '❌ لقد وصلت للحد الأقصى من التذاكر المفتوحة ({max} تذاكر).',
  ticket_not_found: '❌ لا توجد تذكرة في هذه القناة.',
  ticket_claim: '✅ تم استلام التذكرة من قبل {user}',
  
  // Levels
  level_up: '🎉 مبروك {user}! لقد وصلت للمستوى **{level}**!',
  rank_card: 'بطاقة الرتبة',
  
  // Moderation
  banned: '🔨 تم حظر {user} بسبب: {reason}',
  kicked: '👢 تم طرد {user} بسبب: {reason}',
  muted: '🔇 تم كتم {user} لمدة {duration} بسبب: {reason}',
  unmuted: '🔊 تم إلغاء كتم {user}',
  warned: '⚠️ تم تحذير {user} بسبب: {reason}',
  
  // Welcome
  welcome_title: 'مرحباً في {server}!',
  welcome_desc: 'أهلاً وسهلاً {user}، نتمنى لك وقتاً ممتعاً!',
  
  // Protection
  spam_detected: '🛡️ تم اكتشاف سبام من {user}',
  link_blocked: '🔗 تم حذف رابط من {user}',
};

const en = {
  no_permission: '❌ You do not have permission to use this command.',
  bot_no_permission: '❌ Bot does not have sufficient permissions.',
  user_not_found: '❌ User not found.',
  invalid_args: '❌ Invalid arguments.',
  success: '✅ Done successfully!',
  error: '❌ An error occurred.',
  
  ticket_opened: '🎫 Your ticket has been opened in {channel}',
  ticket_closed: '🔒 Ticket has been closed.',
  ticket_max: '❌ You have reached the maximum number of open tickets ({max} tickets).',
  ticket_not_found: '❌ No ticket found in this channel.',
  ticket_claim: '✅ Ticket claimed by {user}',
  
  level_up: '🎉 Congrats {user}! You reached level **{level}**!',
  rank_card: 'Rank Card',
  
  banned: '🔨 {user} has been banned. Reason: {reason}',
  kicked: '👢 {user} has been kicked. Reason: {reason}',
  muted: '🔇 {user} has been muted for {duration}. Reason: {reason}',
  unmuted: '🔊 {user} has been unmuted',
  warned: '⚠️ {user} has been warned. Reason: {reason}',
  
  welcome_title: 'Welcome to {server}!',
  welcome_desc: 'Welcome {user}, enjoy your stay!',
  
  spam_detected: '🛡️ Spam detected from {user}',
  link_blocked: '🔗 Link removed from {user}',
};

function getLang(guildLang = 'ar') {
  return guildLang === 'en' ? en : ar;
}

function t(guildLang, key, vars = {}) {
  const lang = getLang(guildLang);
  let str = lang[key] || key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(new RegExp(`{${k}}`, 'g'), v);
  }
  return str;
}

module.exports = { t, getLang };
