import { readdir } from 'node:fs/promises';
const readJSFiles = async (path, base = import.meta.url) => (await readdir(new URL(`${path}/`, base))).filter(file => file.endsWith('.js'));
export const removeJSExtension = (filename) => filename.slice(0, -3);
export const importFolder = async (base, folderPath, files) => Promise.all((files ?? (await readJSFiles(folderPath, base))).map(async (filename) => [
    removeJSExtension(filename),
    (await import(new URL(`${folderPath}/${filename}`, base).pathname)).default
]));
export const commandFiles = await readJSFiles('../commands/slash');
//# sourceMappingURL=import-folder.js.map