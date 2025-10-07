export default {
  name: "ping", 
  aliases: ["pong"], 
  category: "info", 
  description: "Velocidad de respuesta del bot.",
  
  async execute(m, { args }) { 
    try {
    const start = Date.now()
      
    const { key } = await m.reply("*Pong 🏓*")
      
    const end = Date.now()
      
    await m.reply({ text: `*${end - start}ms 🚀*`, edit: key});
    } catch (e) {
    
    } 
  }
}
