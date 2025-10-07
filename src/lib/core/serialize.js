import fs from "fs";
import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import {
  areJidsSameUser,
  downloadMediaMessage,
  extractMessageContent,
  getContentType,
  isJidGroup,
  isLidUser,
  isPnUser,
  jidNormalizedUser
} from "baileys";

export default async (messages, sock) => {
  const m = {};

  m.message = parseMessage(messages.message);

  if (messages.key) {
    m.key = messages.key;
    m.from = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = isJidGroup(m.from);

    if (m.isGroup) {
      m.lid = isLidUser(m.key.participant)
        ? m.key.participant
        : m.key.participantAlt;
    } else {
      m.lid = isLidUser(m.key.remoteJid)
        ? m.key.remoteJid
        : m.key.remoteJidAlt;
    }

    m.participant = m.isGroup
      ? isPnUser(m.key.participant)
        ? m.key.participant
        : m.key.participantAlt
      : false;

    m.sender = jidNormalizedUser(
      m.fromMe ? sock.user.id : m.isGroup ? m.participant : m.from
    );
  }

  if (m.message) {
    m.type = getContentType(m.message) || Object.keys(m.message)[0];
    m.msg = parseMessage(m.message[m.type]) || m.message[m.type];
    m.mentions = m.msg?.contextInfo?.mentionedJid || [];
    m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath;

    if (m.isMedia) {
      m.download = async () =>
        downloadMediaMessage(m, "buffer", {}, {
          reuploadRequest: sock.updateMediaMessage
        });
    }

    m.react = async (emoji = "") =>
      sock.sendMessage(m.from, {
        react: { text: emoji, key: m.key }
      });

    m.reply = async (input, opts = {}) => {
      let text = null;
      let options = {};

      if (typeof input === "string") {
        text = input;
        options = opts;
      } else if (input && typeof input === "object") {
        options = input;
        text = input.text ?? null;
      } else {
        options = opts;
      }

      const from = options.from ?? m.from;
      const quoted = options.hasOwnProperty("quoted") ? options.quoted : m;

      if (options.mentions && !Array.isArray(options.mentions))
        options.mentions = [options.mentions];

      const expiration = m.expiration
        ? { ephemeralExpiration: options.expiration ?? m.expiration }
        : null;
      if (options.expiration) delete options.expiration;

      let content;

      if (options.media) {
        const { mime, buffer } = await getFile(options.media);
        const mtype = /webp/.test(mime)
          ? "sticker"
          : /image/.test(mime)
          ? "image"
          : /video/.test(mime)
          ? buffer.length >= 104857600
            ? "document"
            : "video"
          : /audio/.test(mime)
          ? "audio"
          : "document";

        delete options.media;
        content = { [mtype]: buffer, caption: text, mimetype: mime, ...options };
      }

      else if (
        ["image", "video", "document", "sticker", "audio"].some(k => options[k])
      ) {
        const type = Object.keys(options).find(k =>
          ["image", "video", "document", "sticker", "audio"].includes(k)
        );
        content = { [type]: options[type], caption: text, ...options };
      }

      else if (options.delete || options.forward) {
        content = { ...options };
      }

      else {
        content = { ...(text && { text }), ...options };
      }

      return sock.sendMessage(from, content, {
        quoted,
        ...(expiration ?? {}),
        messageId: options.id ?? null
      });
    };

    m.isQuoted = false;
    if (m.msg?.contextInfo?.quotedMessage) {
      m.isQuoted = true;
      m.quoted = {};
      m.quoted.message = parseMessage(m.msg?.contextInfo?.quotedMessage);

      if (m.quoted.message) {
        m.quoted.type =
          getContentType(m.quoted.message) ||
          Object.keys(m.quoted.message)[0];
        m.quoted.msg =
          parseMessage(m.quoted.message[m.quoted.type]) ||
          m.quoted.message[m.quoted.type];
        m.quoted.isMedia =
          !!m.quoted.msg?.mimetype || !!m.quoted.msg?.thumbnailDirectPath;

        m.quoted.key = {
          remoteJid: m.msg?.contextInfo?.remoteJid || m.from,
          participant: m.msg?.contextInfo?.participant,
          fromMe: areJidsSameUser(
            m.msg?.contextInfo?.participant,
            jidNormalizedUser(
              isLidUser(m.msg?.contextInfo?.participant)
                ? sock.user?.lid
                : sock?.user?.id
            )
          ),
          id: m.msg?.contextInfo?.stanzaId
        };

        m.quoted.sender = isPnUser(m.quoted.key.participant)
          ? m.quoted.key.participant
          : await sock.getPNForLID(m.quoted.key.participant);

        if (m.quoted.isMedia) {
          m.quoted.download = async () =>
            downloadMediaMessage(m.quoted, "buffer", {}, {
              reuploadRequest: sock.updateMediaMessage
            });
        }
      }
    }
  }

  return m;
};

function parseMessage(content) {
  content = extractMessageContent(content);

  if (content?.protocolMessage?.type === 14) {
    const type = getContentType(content.protocolMessage);
    content = content.protocolMessage[type];
  }
  if (content?.message) {
    const type = getContentType(content.message);
    content = content.message[type];
  }
  return content;
}

async function getFile(pathOrUrl) {
  let buffer;

  if (Buffer.isBuffer(pathOrUrl)) {
    buffer = pathOrUrl;
  } else if (/^data:.*?;base64,/.test(pathOrUrl)) {
    buffer = Buffer.from(pathOrUrl.split(",")[1], "base64");
  } else if (/^https?:\/\//.test(pathOrUrl)) {
    buffer = await fetchBuffer(pathOrUrl);
  } else if (fs.existsSync(pathOrUrl)) {
    buffer = fs.readFileSync(pathOrUrl);
  } else {
    throw new Error("Archivo o URL inválido");
  }

  const type = (await fileTypeFromBuffer(buffer)) || {
    mime: "application/octet-stream",
    ext: "bin"
  };

  return { ...type, buffer };
}

async function fetchBuffer(file, options = {}) {
  const { data } = await axios.get(file, {
    responseType: "arraybuffer",
    ...options
  });
  return data;
}