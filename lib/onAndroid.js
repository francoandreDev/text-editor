export class AndroidFile {
    static async openExistingFile(createTab, fileHandles) {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'text/plain';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (file) {
                    const content = await file.text();
                    createTab(file.name, content);
                    fileHandles.push({ handle: file, name: file.name });
                }
            };
            input.click();
        } catch (error) {
            console.error("Failed to open file:", error);
        }
    }

    static async saveContent(save, header, fileHandles, main, currentIndex) {
        save();

        const currentContent = main.querySelector(".content").value;
        const blob = new Blob([currentContent], { type: 'text/plain' });

        const suggestedName = header.querySelector(".filename.current").textContent || 'Untitled.txt';

        const fileDeleted = await deleteIfExists(suggestedName);

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = suggestedName;

        link.onclick = () => {
            URL.revokeObjectURL(link.href);
            fileHandles[currentIndex] = { handle: link.href, name: suggestedName, blob: blob };
        };

        link.click();
    }
}

async function deleteIfExists(fileName) {
    const options = {
        type: 'open-directory'
    };

    try {
        const dirHandle = await window.showDirectoryPicker(options);
        for await (const [name, handle] of dirHandle.entries()) {
            if (handle.kind === 'file' && name === fileName) {
                await dirHandle.removeEntry(name);
                console.log(`Archivo ${fileName} eliminado.`);
                return true;
            }
        }
        console.log(`Archivo ${fileName} no encontrado.`);
        return false;
    } catch (err) {
        console.error('Error al acceder al sistema de archivos:', err);
        return false;
    }
}
