import {
    isLidUser,
    isPnUser,
    jidNormalizedUser,
    makeWASocket
} from "baileys";
import { NodeCache } from "@cacheable/node-cache";

export default (options) => {
    const sock = makeWASocket({
        ...options,
        msgRetryCounterCache: new NodeCache()
    })
    
    // Conversión de PN <--> LID 
    const store = sock.signalRepository.lidMapping;
    
    sock.getPNForLID = async (LID) => {
        const normalized = jidNormalizedUser(LID)
        if (isPnUser(normalized)) return normalized;
        
        const result = await store.getPNForLID(normalized);
        
        return result ? jidNormalizedUser(result) : null;
    }
    
    sock.getLIDForPN = async (PN) => {
        const normalized = jidNormalizedUser(PN)
        if (isLidUser(normalized)) return normalized;
        
        const result = await store.getLIDForPN(normalized);
        
        return result ? jidNormalizedUser(result) : null;
    }
    
    return sock;
}