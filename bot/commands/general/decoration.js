const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const styles = {
  'رياضية': t => t.split('').map(c => '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳'.split('')[('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c))] || c).join(''),
  'مائلة': t => t.split('').map(c => '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧'.split('')[('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c))] || c).join(''),
  'فقاعات': t => t.split('').map(c => 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ'.split('')[('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c))] || c).join(''),
  'مربعات': t => t.split('').map(c => '🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩'.split('')[('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c.toUpperCase()))] || c).join(''),
  'مزدوجة': t => t.split('').map(c => '𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟'.split('')[('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c))] || c).join(''),
  'صغيرة': t => t.split('').map(c => 'ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁᵛᵂˣʸᶻᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻ'.split('')[('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c))] || c).join(''),
  'مقلوبة': t => t.split('').map(c => {
    const map = {'a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ','i':'ᵻ','j':'ɾ','k':'ʞ','l':'l','m':'ɯ','n':'u','o':'o','p':'d','q':'b','r':'ɹ','s':'s','t':'ʇ','u':'n','v':'ʌ','w':'ʍ','x':'x','y':'ʎ','z':'z'};
    return map[c.toLowerCase()] || c;
  }).reverse().join(''),
  'نقطية': t => t.split('').join('̣'),
  'سطر فوق': t => t.split('').join('̄'),
  'نجوم ⭐': t => `⭐ ${t} ⭐`,
  'ألماس 💎': t => `💎 ${t} 💎`,
  'تاج 👑': t => `👑 ${t} 👑`,
  'نار 🔥': t => `🔥 ${t} 🔥`,
  'فاصل ꧁꧂': t => `꧁ ${t} ꧂`,
  'إطار ╔╗': t => `╔═══════╗\n║  ${t}  ║\n╚═══════╝`,
  'نقاط •': t => t.split('').join(' • '),
  'تباعد': t => t.split('').join(' '),
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('decoration')
    .setDescription('زخرفة النصوص بأشكال متعددة فخمة')
    .addStringOption(o => o.setName('text').setDescription('النص المراد زخرفته').setRequired(true)),

  async execute(interaction) {
    const text = interaction.options.getString('text');
    if (text.length > 50) return interaction.reply({ content: '❌ النص طويل جداً! الحد الأقصى 50 حرف', ephemeral: true });

    const results = Object.entries(styles).map(([name, fn]) => {
      try { return { name, result: fn(text) }; } catch { return { name, result: text }; }
    });

    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('✨ أشكال الزخرفة')
      .setDescription(`النص الأصلي: \`${text}\`\n\nاضغط على أي شكل لنسخه تلقائياً ⬇️`)
      .setFooter({ text: 'Xtra Bot • نظام الزخرفة الفخم' });

    const fields = results.map(r => ({ name: r.name, value: `\`\`\`${r.result}\`\`\``, inline: true }));
    // Discord limit: 25 fields
    embed.addFields(fields.slice(0, 25));

    // Buttons for first 5 styles (copy buttons)
    const rows = [];
    const firstFive = results.slice(0, 5);
    const row = new ActionRowBuilder().addComponents(
      ...firstFive.map((r, i) =>
        new ButtonBuilder()
          .setCustomId(`decor_${i}_${encodeURIComponent(r.result).slice(0, 80)}`)
          .setLabel(r.name)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📋')
      )
    );
    rows.push(row);

    await interaction.reply({ embeds: [embed], components: rows });
  }
};
