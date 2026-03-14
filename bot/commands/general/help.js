const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const CATEGORIES = {
  'عام 🌐': { emoji: '🌐', commands: [
    { name: '/help', desc: 'قائمة الأوامر' },
    { name: '/ping', desc: 'فحص اتصال البوت' },
    { name: '/botinfo', desc: 'معلومات البوت' },
    { name: '/userinfo', desc: 'معلومات عضو' },
    { name: '/serverinfo', desc: 'معلومات السيرفر' },
    { name: '/avatar', desc: 'صورة العضو' },
    { name: '/decoration', desc: 'زخرفة النصوص ✨' },
    { name: '/afk', desc: 'وضع الغياب 💤' },
    { name: '/weather', desc: 'الطقس 🌤️' },
    { name: '/translate', desc: 'ترجمة النصوص 🌍' },
    { name: '/tax', desc: 'حاسبة الضريبة 💰' },
    { name: '/giveaway', desc: 'نظام الهبات 🎉' },
    { name: '/remindme', desc: 'تذكير ⏰' },
    { name: '/suggest', desc: 'اقتراح 📝' },
    { name: '/poll', desc: 'استطلاع 📊' },
    { name: '/say', desc: 'إرسال رسالة' },
    { name: '/roleinfo', desc: 'معلومات الرتبة' },
  ]},
  'إدارة 🛡️': { emoji: '🛡️', commands: [
    { name: '/ban', desc: 'حظر عضو' },
    { name: '/kick', desc: 'طرد عضو' },
    { name: '/mute', desc: 'كتم عضو' },
    { name: '/unmute', desc: 'رفع الكتم' },
    { name: '/warn', desc: 'تحذير عضو' },
    { name: '/warnings', desc: 'عرض التحذيرات' },
    { name: '/clearwarnings', desc: 'مسح التحذيرات' },
    { name: '/purge', desc: 'حذف رسائل' },
    { name: '/lock', desc: 'قفل القناة' },
    { name: '/unlock', desc: 'فتح القناة' },
    { name: '/slowmode', desc: 'الوضع البطيء' },
    { name: '/addrole', desc: 'إضافة رتبة' },
    { name: '/removerole', desc: 'إزالة رتبة' },
    { name: '/nickname', desc: 'لقب مؤقت' },
    { name: '/rename', desc: 'تغيير اسم عضو 🆕' },
    { name: '/come', desc: 'نداء عضو 📢 🆕' },
    { name: '/unban', desc: 'رفع الحظر' },
    { name: '/logs', desc: 'سجل الإجراءات' },
  ]},
  'تذاكر 🎫': { emoji: '🎫', commands: [
    { name: '/ticket setup', desc: 'إعداد التذاكر' },
    { name: '/ticket panel', desc: 'إرسال لوحة التذاكر' },
    { name: '/ticket close', desc: 'إغلاق تذكرة' },
    { name: '/ticket claim', desc: 'استلام تذكرة' },
    { name: '/ticket add', desc: 'إضافة عضو' },
    { name: '/ticket remove', desc: 'إزالة عضو' },
    { name: '/ticket rename', desc: 'تغيير اسم التذكرة 🆕' },
    { name: '/ticket list', desc: 'قائمة التذاكر 🆕' },
  ]},
  'مستويات 📊': { emoji: '📊', commands: [
    { name: '/rank', desc: 'رتبتك الحالية' },
    { name: '/leaderboard', desc: 'لوحة المتصدرين' },
    { name: '/setxp', desc: 'تغيير XP عضو' },
  ]},
  'ألعاب 🎮': { emoji: '🎮', commands: [
    { name: '/roulette', desc: 'روليت 🎰' },
    { name: '/xo', desc: 'لعبة XO ❌⭕' },
    { name: '/dice', desc: 'رمي النرد 🎲' },
    { name: '/coinflip', desc: 'رمي عملة 🪙' },
    { name: '/rps', desc: 'حجرة ورقة مقص ✊' },
    { name: '/guess', desc: 'خمّن الرقم 🔢' },
    { name: '/trivia', desc: 'اختبار معلومات 🧠' },
  ]},
  'حماية 🔐': { emoji: '🔐', commands: [
    { name: '/protection', desc: 'إعدادات الحماية' },
    { name: '/whitelist', desc: 'قائمة الاستثناءات 🆕' },
  ]},
  'بريميوم 💎': { emoji: '💎', commands: [
    { name: '/premiuminfo', desc: 'معلومات البريميوم' },
    { name: '/tokencheck', desc: 'فحص التوكن' },
  ]},
};

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('📋 قائمة جميع الأوامر'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('⚡ Xtra Bot — قائمة الأوامر')
      .setDescription([
        '> **أقوى بوت ديسكورد عربي** — 99+ أمر!',
        '',
        Object.entries(CATEGORIES).map(([cat, data]) =>
          `**${cat}** — ${data.commands.length} أمر`
        ).join('\n'),
        '',
        '> اختر فئة من القائمة أدناه لرؤية تفاصيل الأوامر 👇'
      ].join('\n'))
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: `Xtra Bot v2.0 • ${Object.values(CATEGORIES).reduce((a,c)=>a+c.commands.length,0)} أمر` })
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('📂 اختر فئة...')
      .addOptions(Object.entries(CATEGORIES).map(([name, data]) => ({
        label: name, value: name, emoji: data.emoji
      })));

    await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
  }
};

module.exports.CATEGORIES = CATEGORIES;
