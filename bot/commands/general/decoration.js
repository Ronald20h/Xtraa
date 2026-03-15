const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const STYLES = [
  // ── أشكال إطارات عربية ──
  { name: '꧁꧂ نجوم',      fn: t => `꧁༺ ${t} ༻꧂` },
  { name: '✦ نقاط',        fn: t => `✦ ${[...t].join(' ✦ ')} ✦` },
  { name: '🌸 وردة',        fn: t => `🌸 ${t} 🌸` },
  { name: '▓▒░ متدرج',      fn: t => `▓▒░ ${t} ░▒▓` },
  { name: '「」 قوسي',      fn: t => `「 ${t} 」` },
  { name: '◤◢ مثلث',        fn: t => `◤◢ ${t} ◤◢` },
  { name: '☆彡 ياباني',     fn: t => `☆彡 ${t} ミ☆` },
  { name: 'ꕥ دائرة',        fn: t => `ꕥ ${t} ꕥ` },
  { name: '✧ بريق',         fn: t => `✧*。${t}。*✧` },
  { name: '🔱 ترايدنت',      fn: t => `🔱 ${t} 🔱` },
  { name: '👑 تاج',          fn: t => `👑 ${t} 👑` },
  { name: '🔥 نار',          fn: t => `🔥 ${t} 🔥` },
  { name: '💎 ألماس',        fn: t => `💎 ${t} 💎` },
  { name: '═══ خط',          fn: t => `══ ${t} ══` },
  { name: '• فاصل',          fn: t => [...t].join(' • ') },
  { name: '↯ معكوس',        fn: t => [...t].reverse().join('') },
  // ── حروف Unicode فاخرة ──
  { name: '𝐁𝐨𝐥𝐝 ثخيل',
    fn: t => [...t].map(c => {
      const i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c);
      return i >= 0 ? '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳'[i] : c;
    }).join('')
  },
  { name: '𝘐𝘵𝘢𝘭𝘪𝘤 مائل',
    fn: t => [...t].map(c => {
      const i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c);
      return i >= 0 ? '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻'[i] : c;
    }).join('')
  },
  { name: '𝒮𝒸𝓇𝒾𝓅𝓉 خط',
    fn: t => [...t].map(c => {
      const i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c);
      return i >= 0 ? '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏'[i] : c;
    }).join('')
  },
  { name: '𝔊𝔬𝔱𝔥 قوطي',
    fn: t => [...t].map(c => {
      const i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c);
      return i >= 0 ? '𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟'[i] : c;
    }).join('')
  },
  { name: 'ⓐ فقاعات',
    fn: t => [...t].map(c => {
      const i = 'abcdefghijklmnopqrstuvwxyz'.indexOf(c.toLowerCase());
      return i >= 0 ? String.fromCodePoint(0x24D0 + i) : c;
    }).join('')
  },
  { name: '🅐 مربعات',
    fn: t => [...t].map(c => {
      const i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c.toUpperCase());
      return i >= 0 ? String.fromCodePoint(0x1F170 + i) : c;
    }).join('')
  },
  { name: 'ᴀ صغير',
    fn: t => [...t].map(c => (
      { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ' }
      [c.toLowerCase()] || c
    )).join('')
  },
  { name: '𝕯𝖔𝖚𝖇𝖑𝖊 مزدوج',
    fn: t => [...t].map(c => {
      const i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.indexOf(c);
      return i >= 0 ? '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡'[i] : c;
    }).join('')
  },
];

const PER_PAGE = 5;
const TOTAL = Math.ceil(STYLES.length / PER_PAGE);

function applyStyle(s, text) {
  try { return s.fn(text); } catch { return text; }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('decoration')
    .setDescription('✨ زخرفة الكلام — 25 شكل فاخر مع أزرار نسخ فورية')
    .addStringOption(o => o.setName('text').setDescription('الكلام المراد زخرفته').setRequired(true).setMaxLength(80)),

  async execute(interaction) {
    const text = interaction.options.getString('text');
    await sendPage(interaction, text, 0, true);
  }
};

async function sendPage(ctx, text, page, isFirst = false) {
  const start   = page * PER_PAGE;
  const slice   = STYLES.slice(start, start + PER_PAGE);

  const embed = new EmbedBuilder()
    .setColor(0xb44fe8)
    .setTitle('✨ زخرفة الكلام')
    .setDescription(`**النص:** \`${text}\`\n> اضغط 📋 لإرسال الشكل في الشات!\n\u200b`)
    .setFooter({ text: `صفحة ${page+1} من ${TOTAL} • ${STYLES.length} شكل` });

  slice.forEach((s, i) => {
    embed.addFields({
      name: `${start+i+1}. ${s.name}`,
      value: `\`\`\`${applyStyle(s, text)}\`\`\``,
      inline: false
    });
  });

  // أزرار نسخ
  const copyRow = new ActionRowBuilder().addComponents(
    slice.map((s, i) =>
      new ButtonBuilder()
        .setCustomId(`deco_c_${start+i}_${Buffer.from(text).toString('base64').slice(0,40)}`)
        .setLabel(`📋 ${start+i+1} — ${s.name}`)
        .setStyle(ButtonStyle.Secondary)
    )
  );

  // تنقل
  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`deco_p_${page}_${Buffer.from(text).toString('base64').slice(0,40)}`)
      .setLabel('◀ السابق').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`deco_n_${page}_${Buffer.from(text).toString('base64').slice(0,40)}`)
      .setLabel('التالي ▶').setStyle(ButtonStyle.Primary).setDisabled(page >= TOTAL - 1),
    new ButtonBuilder()
      .setCustomId(`deco_all_${Buffer.from(text).toString('base64').slice(0,40)}`)
      .setLabel('📜 كل الأشكال').setStyle(ButtonStyle.Success)
  );

  const payload = { embeds: [embed], components: [copyRow, navRow] };
  const msg = isFirst ? await ctx.reply(payload) : await ctx.update(payload);

  const uid = isFirst ? ctx.user.id : ctx.user.id;
  const col = msg.createMessageComponentCollector({ filter: i => i.user.id === uid, time: 60000 });

  col.on('collect', async i => {
    const [, act, ...rest] = i.customId.split('_');
    const b64 = rest.slice(1).join('_');
    const origText = Buffer.from(b64.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8') || text;

    if (act === 'c') {
      const idx = parseInt(rest[0]);
      const result = applyStyle(STYLES[idx], origText);
      await i.reply({ content: result });

    } else if (act === 'p') {
      const cur = parseInt(rest[0]);
      col.stop();
      await sendPage(i, origText, cur - 1);

    } else if (act === 'n') {
      const cur = parseInt(rest[0]);
      col.stop();
      await sendPage(i, origText, cur + 1);

    } else if (act === 'all') {
      const all = STYLES.map((s, idx) => `${idx+1}. ${s.name}\n${applyStyle(s, origText)}`).join('\n\n');
      const chunks = [];
      for (let ci = 0; ci < all.length; ci += 1900) chunks.push(all.slice(ci, ci+1900));
      await i.reply({ content: `**✨ كل أشكال زخرفة:** \`${origText}\`\n\`\`\`\n${chunks[0]}\n\`\`\``, ephemeral: true });
    }
  });

  col.on('end', () => msg.edit({ components: [] }).catch(() => {}));
}
