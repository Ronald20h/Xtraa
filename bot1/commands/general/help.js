const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const CATEGORIES = {
  'عام 🌐': {
    emoji: '🌐', color: '#5865f2',
    commands: [
      {n:'help',a:['مساعدة','اوامر','h','?']},
      {n:'ping',a:['بنق','بينق','p']},
      {n:'avatar',a:['صورة','صوره','pfp','av']},
      {n:'userinfo',a:['يوزر','معلومات','ui','who']},
      {n:'serverinfo',a:['سيرفر','si']},
      {n:'botinfo',a:['بوت','bi']},
      {n:'membercount',a:['اعضاء','عدد','mc']},
      {n:'channelinfo',a:['قناة','ci']},
      {n:'roleinfo',a:['رتبة-معلومات','ri']},
      {n:'uptime',a:['وقت-التشغيل','ut']},
      {n:'guildicon',a:['أيقونة','icon']},
      {n:'banner',a:['بانر']},
      {n:'stickers',a:['ستيكرات','sticker']},
      {n:'snipe',a:['سناب','محذوفة']},
      {n:'enlarge',a:['كبر','تكبير']},
    ]
  },
  'أدوات 🔧': {
    emoji: '🔧', color: '#00d4ff',
    commands: [
      {n:'decoration',a:['زخرف','زخرفة','deco']},
      {n:'calculator',a:['حاسبة','calc','احسب']},
      {n:'math',a:['رياضيات','حسابات']},
      {n:'percentage',a:['نسبة','%']},
      {n:'tax',a:['ضريبة','ضريبه']},
      {n:'color',a:['لون','colour']},
      {n:'reverse',a:['اعكس','عكس','flip']},
      {n:'password',a:['باسورد','كلمة-مرور','pass']},
      {n:'age',a:['عمر','ميلاد']},
      {n:'timer',a:['مؤقت','عداد']},
      {n:'choice',a:['اختر','عشوائي','random']},
      {n:'translate',a:['ترجم']},
      {n:'weather',a:['طقس','جو']},
      {n:'poll',a:['استطلاع','تصويت','vote']},
      {n:'suggest',a:['اقتراح','فكرة']},
      {n:'remindme',a:['ذكرني','تذكير','remind']},
      {n:'afk',a:['غياب','مشغول','بعيد']},
    ]
  },
  'مرح 🎉': {
    emoji: '🎉', color: '#ff69b4',
    commands: [
      {n:'8ball',a:['كرة','تنبأ','ball']},
      {n:'iq',a:['ذكاء','عقل']},
      {n:'ship',a:['شيب','توافق','حب']},
      {n:'rate',a:['قيّم','تقييم']},
      {n:'pp',a:['قوة','طاقة']},
      {n:'slap',a:['صفع','صفعة']},
      {n:'hug',a:['حضن','احضن']},
      {n:'joke',a:['نكتة','نكت','اضحك']},
      {n:'fact',a:['معلومة','هل-تعلم','info']},
      {n:'quote',a:['اقتباس','حكمة']},
      {n:'say',a:['قل','ارسل','msg']},
    ]
  },
  'إدارة 🛡️': {
    emoji: '🛡️', color: '#e74c3c',
    commands: [
      {n:'ban',a:['حظر','بان']},
      {n:'tempban',a:['حظر-مؤقت','تبان']},
      {n:'kick',a:['طرد','اطرد','kk']},
      {n:'mute',a:['كتم','اكتم','سكوت']},
      {n:'unmute',a:['فك','رفع-كتم']},
      {n:'warn',a:['تحذير','حذر','w']},
      {n:'warnings',a:['تحذيرات','ws']},
      {n:'clearwarnings',a:['مسح-تحذيرات','cw']},
      {n:'note',a:['ملاحظة','note']},
      {n:'purge',a:['مسح','clear','احذف','del']},
      {n:'lock',a:['قفل','اقفل','lk']},
      {n:'unlock',a:['فتح','افتح','ulk']},
      {n:'hide',a:['اخفي','إخفاء','h']},
      {n:'show',a:['اظهر','إظهار']},
      {n:'slowmode',a:['بطيء','slow','sm']},
      {n:'nuke',a:['نظف','bomb']},
      {n:'announce',a:['اعلان','إعلان','ann']},
      {n:'massrole',a:['رتبة-للكل','mass']},
      {n:'addrole',a:['اضف-رتبة','ar']},
      {n:'removerole',a:['ازل-رتبة','rr']},
      {n:'createrole',a:['انشئ-رتبة','cr']},
      {n:'deleterole',a:['احذف-رتبة','dr']},
      {n:'rolename',a:['اسم-رتبة','rn']},
      {n:'rolecolor',a:['لون-رتبة','rc']},
      {n:'rename',a:['اسم','غير-اسم']},
      {n:'nickname',a:['لقب','nick']},
      {n:'come',a:['تعال','هنا','نداء','call']},
      {n:'move',a:['انقل','نقل']},
      {n:'voicekick',a:['طرد-صوتي','vk']},
      {n:'deafen',a:['اصمم','صمم']},
      {n:'unban',a:['رفع-حظر','ub']},
      {n:'logs',a:['سجل','لوق','log']},
    ]
  },
  'تذاكر 🎫': {
    emoji: '🎫', color: '#5865f2',
    commands: [
      {n:'ticket setup',a:['تذكرة-إعداد']},
      {n:'ticket panel',a:['تذكرة-لوحة']},
      {n:'ticket close',a:['اغلق-تذكرة','إغلاق']},
      {n:'ticket claim',a:['استلم-تذكرة']},
      {n:'ticket add',a:['اضف-للتذكرة']},
      {n:'ticket remove',a:['ازل-من-تذكرة']},
      {n:'ticket rename',a:['اسم-تذكرة']},
      {n:'ticket list',a:['قائمة-تذاكر']},
    ]
  },
  'مستويات 📊': {
    emoji: '📊', color: '#9b59b6',
    commands: [
      {n:'rank',a:['رتبة','رتبتي','xp','مستوى']},
      {n:'leaderboard',a:['lb','متصدرين','top']},
      {n:'setxp',a:['xp-عدل','عدل-xp']},
    ]
  },
  'ألعاب 🎮': {
    emoji: '🎮', color: '#e67e22',
    commands: [
      {n:'roulette',a:['روليت','عجلة','rl']},
      {n:'xo',a:['اكس','إكس','ttt']},
      {n:'dice',a:['نرد','زهر','roll']},
      {n:'coinflip',a:['عملة','flip','cf']},
      {n:'rps',a:['حجرة','ورقة-مقص']},
      {n:'guess',a:['خمن','خمّن','رقم']},
      {n:'trivia',a:['اختبار','معلومة','tv']},
    ]
  },
  'هبات 🎉': {
    emoji: '🎁', color: '#ffd700',
    commands: [
      {n:'giveaway start',a:['هبة','gw','give']},
      {n:'giveaway end',a:['انهاء-هبة']},
      {n:'giveaway reroll',a:['اعد-سحب']},
      {n:'giveaway list',a:['قائمة-هبات']},
    ]
  },
  'حماية 🔐': {
    emoji: '🔐', color: '#e74c3c',
    commands: [
      {n:'protection status',a:['حماية','prot']},
      {n:'protection enable-all',a:['فعل-حماية']},
      {n:'protection whitelist-add',a:['whitelist','ابيض']},
    ]
  },
};

module.exports = {
  data: new SlashCommandBuilder().setName('help').setDescription('📋 قائمة جميع الأوامر مع الاختصارات'),
  async execute(interaction) {
    const totalCmds = Object.values(CATEGORIES).reduce((a,c) => a + c.commands.length, 0);

    const embed = new EmbedBuilder()
      .setColor('#5865f2')
      .setTitle('⚡ Xtra Bot — قائمة الأوامر')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setDescription([
        '> استخدم الأوامر **بدون برفكس** أو بـ **/** — كل أمر له اختصارات جاهزة!',
        '',
        ...Object.entries(CATEGORIES).map(([name, data]) =>
          `**${name}** • \`${data.commands.length}\` أمر`
        ),
        '',
        `> **${totalCmds}+ أمر** متاح الآن!`
      ].join('\n'))
      .setFooter({ text: `Xtra Bot v2.0 • ${totalCmds}+ أمر • اختر فئة لرؤية التفاصيل` });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_select')
      .setPlaceholder('📂 اختر فئة لرؤية أوامرها واختصاراتها...')
      .addOptions(Object.entries(CATEGORIES).map(([name, data]) => ({
        label: name, value: name, emoji: data.emoji
      })));

    await interaction.reply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)]
    });
  },
  CATEGORIES
};
