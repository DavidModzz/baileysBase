import { startSock } from "../index.js";
import { delay, DisconnectReason } from "baileys";
import { Boom } from "@hapi/boom";
import { ask } from "#lib/utils.js";

export default async (sock, update) => {
    try {
        const { connection, lastDisconnect, qr } = update;
    
        if (connection == "connecting" || !!qr) {
            await delay(1500); // delay necesario para evitar errores 
            const phone = await ask("Ingresa tu número de WhatsApp con el código de país, sin el signo +:\nEjemplo: 595981234567\n");
            const code = await sock.requestPairingCode(phone);
            console.log("Codigo de emparejamiento:", code);
            return;
        }
    
        if (connection === "open") {
            console.log("Conexión abierta");
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
                `Conexión cerrada. Código: ${statusCode}. ${
                shouldReconnect ? "Reconectando..." : "No se reconectará."
                }`
            );
            
            if (!shouldReconnect) {
                console.error(`Conexión cerrada permanentemente, elimina la carpeta "auth" y vuelve a emparejar.`);
                process.exit(1);
            }
            
            await startSock();
            return;
        }
    } catch (err) {
        console.error("Error en connection.update:", err);
    }
}