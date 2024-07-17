export class WindowsFile {
    static async openExistingFile(createTab, fileHandles) {
        try {
            const fileHandle = await getFile();

            if (fileHandle) {
                await getInfo(fileHandle);
            }
        } catch (error) {
            alert("Error abriendo el archivo: " + error);
        }

        async function getFile() {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: "Text Files",
                        accept: { "text/plain": [".txt"] },
                    },
                ],
                multiple: false,
            });
            return fileHandle;
        }

        async function getInfo(fileHandle) {
            const file = await fileHandle.getFile();
            const content = await file.text();
            createTab(file.name, content);
            fileHandles.push(fileHandle);
        }
    }

    static async saveContent(...args) {
        const [
            filesWrapper,
            filesElement,
            fileHandles,
            contentsElement,
            currentIndex,
        ] = args;

        if (!filesWrapper.currentFileHandle) {
            const res = await createNewFileForSave();
            if (!res) return;
        }

        await saveTextFile();

        async function createNewFileForSave() {
            try {
                const newFileHandle = await window.showSaveFilePicker({
                    suggestedName:
                        filesElement.querySelector(".filename.current")
                            .textContent || "Untitled.txt",
                    types: [
                        {
                            description: "Text Files",
                            accept: { "text/plain": [".txt"] },
                        },
                    ],
                });
                filesWrapper.currentFileHandle = newFileHandle;
                fileHandles[currentIndex] = newFileHandle;
            } catch (error) {
                alert("Error cerrando el archivo: " + error);
                return false;
            }
            return true;
        }

        async function saveTextFile() {
            try {
                const writable =
                    await filesWrapper.currentFileHandle.createWritable();
                const currentContent =
                    contentsElement.querySelector(".content").value;
                await writable.write(currentContent);
                await writable.close();
            } catch (error) {
                alert("Error guardando el archivo: " + error);
            }
        }
    }
}
