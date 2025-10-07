function getMessageContent(msg) {
    const content = msg?.message?.extendedTextMessage?.text ||
    msg?.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
    msg?.message?.conversation ||
    msg?.message?.imageMessage?.caption ||
    msg?.message?.videoMessage?.caption;
    
    return content;
}

const getGroupAdmins = (participants) => {
    const admins = [];
    for (const p of participants) {
      if (p.admin === "admin" || p.admin === "superadmin") {
          admins.push(p.id);
      }
    }
    return admins;
};
  
export { getMessageContent, getGroupAdmins }