import { jidNormalizedUser } from "baileys";
import serialize from "#lib/core/serialize.js";
import { getMessageContent, getGroupAdmins } from "#lib/utils.js";
import config from "../config.js";

export default async (sock, { messages, type }) => {
    if (type !== "notify") return;
    
    try {
        const msg = messages[0]; // para evitar perder mensajes deberíamos procesaron todos con un for
        
        if (!msg.message || msg.key.remoteJid === "status@broadcast") return;
        
        const m = await serialize(msg, sock)
        
        const content = getMessageContent(msg);
        if (!content) return;
        
        const prefix = config.prefix;
        if (!content.startsWith(prefix)) return;
     
        const args = content.slice(prefix.length).trim().replace(/\n+/g, ' ').split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const groupMetadata = m.isGroup ? await sock.groupMetadata(m.from) : [];
        const groupParticipants = m.isGroup ? groupMetadata.participants : [];
        const groupAdmins = m.isGroup ? getGroupAdmins(groupParticipants) : [];
        const isGroupAdmin = groupAdmins.includes(m.lid);
        const isBotAdmin = groupAdmins.includes(jidNormalizedUser(sock.user.lid));
        
        const command = sock.commands.get(commandName) || sock.commands.find(cmd => cmd.aliases?.includes(commandName));
        if (!command) return;
        
        if (command?.onlyDm && m.isGroup) return m.reply("Este comando no se puede usar en grupos");
        if (command?.onlyGroup && !m.isGroup) return m.reply("Este comando solo se puede usar en grupos");
        if (command?.onlyAdmin && !isGroupAdmin) return m.reply(m.from, {text: "Este comando solo lo pueden usar administradores"});
        if (command?.botAdmin && !isBotAdmin) return m.reply("Para ejecutar este coamndos el bot necesita ser admin");
        
        try {
            command.execute(m, {
                args,
                content,
                groupMetadata,
                groupParticipants,
                groupAdmins,
                prefix,
                sock
            })
        } catch(error) {
            console.error(`Error en el comando ${commandName}:`, error)
        }
        
    } catch(error) {
        console.error("Error procesando el mensaje", error)
    }
}