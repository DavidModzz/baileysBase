import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import { Collection } from "@discordjs/collection";

async function loadCommands(sock) {
    sock.commands = new Collection();
    sock.aliases = new Collection();

    try {
        const dirs = await fs.readdir(path.join(process.cwd(), "src", "commands"));

        for (const dir of dirs) {
            const folderPath = path.join(process.cwd(), "src", "commands", dir);
            const stat = await fs.stat(folderPath);
            if (!stat.isDirectory()) continue;

            const files = await fs.readdir(folderPath);

            for (const file of files.filter(f => f.endsWith(".js"))) {
                const filePath = path.join(folderPath, file);
                const commandModule = await import(`file://${filePath}`);
                const command = commandModule.default;

                if (command?.name && typeof command.execute === "function") {
                    sock.commands.set(command.name, command);

                    if (Array.isArray(command.aliases)) {
                        for (const alias of command.aliases) {
                            sock.aliases.set(alias, command.name);
                        }
                    }
                } else {
                    console.log(`Comando no cargado: ${file}`);
                }
            }
        }

        console.log("Comandos cargados correctamente.");
    } catch (err) {
        console.error("Error al cargar los comandos:", err);
    }
}

async function loadEvents(sock) {
  try {
    const events = await fs.readdir(path.join(process.cwd(), "src", "events"));

    for (const file of events.filter((file) => file.endsWith(".js"))) {
    
      const module = await import(pathToFileURL(path.join(process.cwd(), "src", "events", file)));
      const event = module.default || module;
      sock.ev.on(file.replace(".js", ""), event.bind(null, sock));
    }

    console.log("Eventos cargados");
  } catch (error) {
    console.error("Error cargando los eventos:", error);
  }
};

export { loadCommands, loadEvents }