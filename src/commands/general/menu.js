export default {
    name: "menu",
    aliases: ["comandos"],
    category: "general",
    description: "Lista de comandos disponibles",
    
    async execute(m, {
        prefix,
        sock
    }) {
        let menu = `*Lista de comandos:*\n`
        
        menu += `\n*GENERAL*\n` +  commandsData(sock.commands.filter(c => c.category === "general"));
        
        menu += `\n\n*GRUPOS*\n` +  commandsData(sock.commands.filter(c => c.category === "groups"));
        
        menu += `\n\n*INFO*\n` +  commandsData(sock.commands.filter(c => c.category === "info"));
        
        menu += `\n\n> *Si necesitas ayuda con un comando puedes usar: ${prefix}ayuda < comando >*`
        
        m.reply(menu);
        
        function commandsData(commands) {
            const content = commands.map(i => `${prefix}${i.name}  ${i.usage ? i.usage : ""}`).join('\n');
            return content;
        }
    }
}