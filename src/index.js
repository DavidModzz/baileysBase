import {
    Browsers,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from "baileys";
import pino from "pino";
import socket from "./lib/core/socket.js"
import { loadCommands, loadEvents } from "./lib/loaders.js"

const logger = pino({ level: "silent" });

export async function startSock(phoneNumber) {
    // Se guardan las sesiones en la carpeta "auth"
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const { version } = await fetchLatestBaileysVersion();

    const sock = socket({
        version,
        logger,
        browser: Browsers.appropriate("chrome"),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        }
    });

    sock.ev.on("creds.update", saveCreds);
    sock.id = phoneNumber;
    
    await loadEvents(sock)
    await loadCommands(sock)
}

startSock("595994966449")