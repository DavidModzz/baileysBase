export default {
  name: "toimg",
  aliases: ["toimage"],
  category: "utilidades",
  description: "Convierte un sticker estático citado a imagen.",
  example: "/toimg",

  async execute(m, { sock }) {
    try {
        await m.react('⏳');
      if (!m.isQuoted) return m.reply("Debes citar un sticker.");

      const qType = m.quoted?.type || "";
      if (!/sticker/i.test(qType)) return m.reply("El mensaje citado no es un sticker.");

      if (m.quoted?.msg?.isAnimated) return m.reply("No puedo convertir stickers animados.");

      if (!m.quoted?.isMedia) return m.reply("El sticker no contiene datos descargables.");

      const buffer = await m.quoted.download();

      await m.reply({ image: buffer });
      await m.react("✅");
    } catch (err) {
      console.error("Error en toimg:", err);
      try { await m.react("❌"); } catch (e) {}
      await m.react("❌");
      return m.reply("Ocurrió un error al convertir el sticker.");
    }
  }
};
