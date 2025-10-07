import { startSock } from "../index.js";
import { delay, DisconnectReason } from "baileys";
import { Boom } from "@hapi/boom";

export default async (sock, update) => {
    try {
        const { connection, lastDisconnect, qr } = update;
    
        if (connection == "connecting" || !!qr) {
            await delay(1500); // delay necesario para evitar errores 
            const code = await sock.requestPairingCode(sock.id);
            console.log(`[${sock.id}] Codigonde emparejamiento:`, code);
            return;
        }
    
        if (connection === "open") {
            console.log(`[${sock.id}] Conexión abierta`);
            return;
        }
        
        if (connection === "close") {
            const error = lastDisconnect?.error;
            const boom = new Boom(error);
            const statusCode = boom.output?.statusCode;
            
            const shouldReconnect = ![
                DisconnectReason.loggedOut,
                DisconnectReason.forbidden,
            ].includes(statusCode);
            
            console.log(
                `[${sock.id}] Conexión cerrada. Código: ${statusCode}. ${
                shouldReconnect ? "Reconectando..." : "No se reconectará."
                }`
            );
            
            if (!shouldReconnect) {
                console.error(`[${sock.id}] Conexión cerrada permanentemente, elimina la carpeta "auth" y vuelve a emparejar.`);
                process.exit(1);
            }
            
            await startSock(sock.id);
            return;
        }
    } catch (err) {
        console.error(`[${sock.id}] Error en connection.update:`, err);
    }
}