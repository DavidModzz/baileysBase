export default {
    name: "ayuda",
    aliases: ["help"],
    category: "general",
    usage: "< command >",
    example: "sticker",
    description: "Obtener ayuda de como usar un comando",
    
    async execute(m, {
        args,
        prefix,
        sock
    }) {
        if (!args[0]) return m.reply(`Escribe el comando del que necesitas ayuda seguido de este comando\nEjemplo: ${prefix}ayuda sticker`);
        
        const commandName = args[0].toLowerCase();
        const cmd = sock.commands.get(commandName) || sock.commands.find(cmd => cmd.aliases?.includes(commandName));
        if (!cmd) return m.reply(`El comando ${commandName} no existe, usa ${prefix}menu para ver los comandos`);
        
        let text = `información del comando *${commandName}*\n\n`
        text += `*Nombre:* ${cmd.name}\n`
        text += `*Descripción:* ${cmd.description}\n`
        text += `*Categoria:* ${cmd.category}\n`
        text += `*Alías:* ${cmd.aliases?.join(", ") || "sin alias"}\n`
        text += `*Uso:* ${prefix}${cmd.name} ${cmd.usage || ""}\n`
        text += `*Ejemplo:* ${cmd.example ? `${prefix}${cmd.name} ${cmd.example}` : "sin ejemplo"}\n`
        
        m.reply(text);
    }
}