export default {
    name: 'everyone',
    aliases: ["hidetag"],
    category: 'groups',
    usage: '< mensaje >',
    example: 'Mensaje importante',
    description: "Menciona a todoa los miembros del grupo",
    onlyGroup: true,
    onlyAdmin: true,

    async execute(m, { args, groupParticipants, sock }) {
        const temCafe = args?.join(" ") || " ";
   
        m.reply({text: temCafe, mentions: groupParticipants.map(a => a.id) })
    }
};
