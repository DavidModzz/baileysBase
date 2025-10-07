import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

async function ask(question) {
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(question);
    rl.close();
    return answer.trim();
}

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
  
export { ask, getMessageContent, getGroupAdmins }