# Base de Bot con Baileys

## Introducción

Esta base proporciona una arquitectura **modular y escalable** para desarrollar bots de WhatsApp con **Baileys**.  
Su diseño permite **cargar comandos y eventos dinámicamente**, además de ofrecer un sistema de **serialización** que simplifica el manejo de mensajes.

Está pensada para desarrolladores que buscan una estructura sólida, limpia y fácilmente extensible.

---

## Requisitos Previos

- **Node.js 18** o superior  
- **Cuenta de WhatsApp** para enlazar el bot  
- **Conocimientos básicos de JavaScript (ESM)**

Instala las dependencias con:

```bash
npm install
```

---

## Estructura de un Comando

Los comandos se almacenan dentro de `src/commands/<categoria>/`.  
Ejemplo: `src/commands/fun/saludo.js`

```js
export default {
  // Información del comando
  name: "saludo",
  aliases: ["hola", "hi"],
  category: "fun",
  description: "Envía un saludo personalizado.",
  usage: "[nombre]",
  example: "saludo David",

  // Parámetros de verificación
  onlyDm: false,      // true → solo en chats privados
  onlyGroup: false,   // true → solo en grupos
  onlyAdmin: false,   // true → requiere que el usuario sea admin
  botAdmin: false,    // true → requiere que el bot sea admin

  // Lógica del comando
  async execute(m, { sock, args, isGroupAdmin, isBotAdmin }) {
    const nombre = args[0] || "amigo";
    await m.reply(`¡Hola, ${nombre}! 👋`);
  }
};
```

> 🔹 **Nota:** el loader detecta automáticamente nuevos comandos al iniciar el bot.  
> No es necesario registrar nada manualmente.

---

## Flujo de Verificación Automático

Antes de ejecutar cualquier comando, el sistema valida las propiedades de restricción en el evento `messages.upsert`.  
Esto evita errores y asegura que cada comando se ejecute solo en el contexto permitido.

Ejemplo del flujo de validación:

```js
if (command?.onlyDm && m.isGroup)
  return m.reply("❌ Este comando no se puede usar en grupos.");

if (command?.onlyGroup && !m.isGroup)
  return m.reply("❌ Este comando solo se puede usar en grupos.");

if (command?.onlyAdmin && !isGroupAdmin)
  return m.reply("❌ Este comando está limitado a administradores.");

if (command?.botAdmin && !isBotAdmin)
  return m.reply("❌ El bot necesita ser administrador para ejecutar este comando.");
```

De esta manera, el desarrollador solo necesita definir las propiedades en el archivo del comando;  
la lógica de validación es global y no debe repetirse.

---

## Ejemplo Completo

Archivo: `src/commands/admin/ban.js`

```js
export default {
  name: "ban",
  aliases: ["kick", "expulsar"],
  category: "admin",
  description: "Expulsa a un usuario del grupo.",
  usage: "@usuario",
  example: "ban @usuario",

  // Restricciones
  onlyGroup: true,
  onlyAdmin: true,
  botAdmin: true,

  async execute(m, { sock, args }) {
    const mentioned = m.mentions[0];
    if (!mentioned) return m.reply("Debes mencionar a un usuario.");

    await sock.groupParticipantsUpdate(m.chat, [mentioned], "remove");
    await m.reply("Usuario expulsado correctamente.");
  }
};
```

---

## Ejecución del Bot

Inicia el bot con:

```bash
node .
```

Durante el arranque, se generará un **código de emparejamiento (pairing code)** que deberás ingresar en WhatsApp para vincular la cuenta.  
Una vez enlazado, el bot estará listo para responder y ejecutar comandos.
