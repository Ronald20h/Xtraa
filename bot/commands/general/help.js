const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { prefixDB } = require('../../db-manager');
const config = require('../../config');

const CATS = {
  general:    { emoji:'🌟', label:'عام',           color:0x7c3aed, cmds:[{n:'ping',d:'سرعة البوت'},{n:'help',d:'قائمة الأوامر'},{n:'server',d:'معلومات السيرفر'},{n:'user',d:'معلومات عضو'},{n:'avatar',d:'صورة عضو'},{n:'banner',d:'بانر عضو'},{n:'decoration',d:'زخرفة الكلام (25 شكل)'},{n:'decorate',d:'زخرفة (نسخة بريفكس)'},{n:'tax',d:'حساب الضريبة'},{n:'embed',d:'إرسال embed'},{n:'dashboard',d:'رابط الداشبورد'}] },
  moderation: { emoji:'⚙️', label:'إشراف',        color:0xef4444, cmds:[{n:'ban',d:'باند عضو'},{n:'kick',d:'طرد عضو'},{n:'mute',d:'تايم أوت'},{n:'unmute',d:'رفع التايم أوت'},{n:'timeout',d:'تايم أوت بمدة مخصصة'},{n:'unban',d:'رفع الباند'},{n:'warn',d:'تحذير عضو'},{n:'warns',d:'تحذيرات عضو'},{n:'clearwarns',d:'مسح التحذيرات'},{n:'clear',d:'حذف رسائل'},{n:'lock',d:'قفل القناة'},{n:'unlock',d:'فتح القناة'},{n:'hide',d:'إخفاء القناة'},{n:'unhide',d:'إظهار القناة'},{n:'say',d:'إرسال رسالة'},{n:'come',d:'نداء عضو'},{n:'nickname',d:'تغيير اسم عضو'},{n:'role',d:'إعطاء/سحب رتبة'}] },
  protection: { emoji:'🛡️', label:'حماية',        color:0x10b981, cmds:[{n:'setup-protection',d:'تفعيل كل الحماية'},{n:'anti-server-edit',d:'حماية اسم/صورة السيرفر'},{n:'anti-channel-edit',d:'حماية الرومات'},{n:'anti-channel-create',d:'منع إنشاء رومات'},{n:'anti-role-create',d:'منع إنشاء رتب'},{n:'anti-role-edit',d:'حماية صلاحيات الرتب'},{n:'anti-ban',d:'منع الباند الجماعي'},{n:'anti-kick',d:'منع الكيك الجماعي'},{n:'anti-bots',d:'منع البوتات'},{n:'anti-webhook',d:'منع الويب هوكس'},{n:'logs-status',d:'حالة الحماية'},{n:'set-protect-logs',d:'روم لوج الحماية'}] },
  ticket:     { emoji:'🎫', label:'تذاكر',        color:0xb44fe8, cmds:[{n:'setup-ticket',d:'إعداد نظام التكت'},{n:'add-ticket-button',d:'إضافة زر تكت'},{n:'to-select',d:'تحويل لقائمة منسدلة'},{n:'add-user',d:'إضافة عضو للتكت'},{n:'remove-user',d:'إزالة عضو من التكت'},{n:'close',d:'إغلاق التكت'},{n:'rename',d:'تغيير اسم التكت'},{n:'delete',d:'حذف التكت'},{n:'set-ticket-log',d:'روم لوج التكت'}] },
  levels:     { emoji:'📊', label:'مستويات',      color:0xf59e0b, cmds:[{n:'rank',d:'مستواك وXP'},{n:'leaderboard',d:'قائمة المتصدرين'},{n:'setlevel',d:'تعيين مستوى عضو'}] },
  systems:    { emoji:'⚡', label:'الأنظمة',       color:0x06b6d4, cmds:[{n:'setup-welcome',d:'إعداد الترحيب'},{n:'setup-ai',d:'إعداد الذكاء الاصطناعي'},{n:'setup-log',d:'إعداد اللوجات'},{n:'autoreply-add',d:'إضافة رد تلقائي'},{n:'autoreply-remove',d:'حذف رد تلقائي'},{n:'autoreply-list',d:'قائمة الردود'},{n:'set-azkar-channel',d:'روم الأذكار'},{n:'azkar-mode',d:'تفعيل الأذكار'},{n:'azkar-time',d:'توقيت الأذكار'},{n:'set-suggestions-room',d:'روم الاقتراحات'},{n:'suggestion-mode',d:'تفعيل الاقتراحات'},{n:'set-feedback-room',d:'روم الآراء'},{n:'feedback-mode',d:'تفعيل الآراء'},{n:'set-tax-room',d:'روم الضريبة'},{n:'tax-mode',d:'تفعيل الضريبة'},{n:'setup-apply',d:'إعداد التقديمات'}] },
  fun:        { emoji:'🎮', label:'مرح وألعاب',   color:0xec4899, cmds:[{n:'decoration',d:'زخرفة 25 شكل مع نسخ'},{n:'azkar',d:'ذكر عشوائي'},{n:'giveaway',d:'إدارة الهبات'},{n:'suggest',d:'إرسال اقتراح'},{n:'poll',d:'إنشاء استطلاع'}] },
  owner:      { emoji:'👑', label:'أونر البوت',   color:0xf59e0b, cmds:[{n:'add-owner',d:'إضافة/إزالة أونر للبوت'},{n:'owners',d:'قائمة الأونرز'},{n:'bot-servers',d:'قائمة السيرفرات'},{n:'token-premium',d:'إدارة التوكن البريميوم'},{n:'bot-stats',d:'إحصائيات البوت'}] },
};

const TOTAL = Object.values(CATS).reduce((s,c) => s + c.cmds.length, 0);

module.exports = {
  ownersOnly: false,
  data: new SlashCommandBuilder().setName('help').setDescription('📋 قائمة أوامر البوت الكاملة'),
  CATEGORIES: CATS,
  async execute(interaction) {
    try {
      await interaction.deferReply();
      const prefix = prefixDB.get(`prefix_${interaction.guild.id}`) || config.prefix || '!';

      const mainEmbed = new EmbedBuilder().setColor(0x7c3aed)
        .setAuthor({ name: `${interaction.client.user.username} — قائمة الأوامر`, iconURL: interaction.client.user.displayAvatarURL() })
        .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
        .setDescription([
          `> 🚀 **الأوامر تشتغل بدون prefix مباشرة أو بـ \`/\`**`,
          `> ⚡ **إجمالي الأوامر:** \`${TOTAL}+\``,
          `> 🔗 [إضافة البوت](https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands) • [سيرفر الدعم](https://discord.gg/HC8V8cPF4)`,
          '',
          '**اختر قسماً من القائمة ↓**',
        ].join('\n'))
        .addFields(Object.values(CATS).map(c => ({ name: `${c.emoji} ${c.label}`, value: `\`${c.cmds.length}\` أمر`, inline: true })))
        .setFooter({ text: `${TOTAL}+ أمر • ${interaction.guild.name}` }).setTimestamp();

      const select = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('help_select').setPlaceholder('📂 اختر قسماً...')
          .addOptions([
            { label: '🏠 الرئيسية',     value: 'home',       emoji: '🏠' },
            { label: '🌟 عام',           value: 'general',    emoji: '🌟' },
            { label: '⚙️ إشراف',         value: 'moderation', emoji: '⚙️' },
            { label: '🛡️ حماية',         value: 'protection', emoji: '🛡️' },
            { label: '🎫 تذاكر',         value: 'ticket',     emoji: '🎫' },
            { label: '📊 مستويات',       value: 'levels',     emoji: '📊' },
            { label: '⚡ الأنظمة',        value: 'systems',    emoji: '⚡' },
            { label: '🎮 مرح وألعاب',   value: 'fun',        emoji: '🎮' },
            { label: '👑 أونر البوت',    value: 'owner',      emoji: '👑' },
          ])
      );

      const msg = await interaction.editReply({ embeds: [mainEmbed], components: [select] });
      const col = msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 120000 });
      col.on('collect', async i => {
        const val = i.values?.[0];
        if (!val) return;
        if (val === 'home') return i.update({ embeds: [mainEmbed], components: [select] });
        const cat = CATS[val];
        if (!cat) return;
        const e = new EmbedBuilder().setColor(cat.color)
          .setTitle(`${cat.emoji} ${cat.label} — ${cat.cmds.length} أمر`)
          .setDescription(cat.cmds.map(c => `> **\`/${c.n}\`** — ${c.d}`).join('\n'))
          .setFooter({ text: 'الأوامر تشتغل بدون prefix أو بـ /' }).setTimestamp();
        i.update({ embeds: [e], components: [select] });
      });
      col.on('end', () => msg.edit({ components: [] }).catch(() => {}));
    } catch (e) { console.error('help:', e); }
  }
};
