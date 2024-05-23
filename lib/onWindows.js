export class WindowsFile {
    static async openExistingFile(createTab, fileHandles) {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: "Text Files",
                        accept: { "text/plain": [".txt"] },
                    },
                ],
                multiple: false,
            });

            if (fileHandle) {
                const file = await fileHandle.getFile();
                const content = await file.text();
                createTab(file.name, content);
                fileHandles.push(fileHandle); 
            }
        } catch (error) {
            console.error("File picker was closed without selecting a file.");
        }
    }

    static async saveContent(
        save,
        currentFileHandle,
        header,
        fileHandles,
        main,
        currentIndex
    ) {
        save();

        if (!currentFileHandle) {
            try {
                currentFileHandle = await window.showSaveFilePicker({
                    suggestedName: header.querySelector(".filename.current").textContent,
                    types: [
                        {
                            description: "Text Files",
                            accept: { "text/plain": [".txt"] },
                        },
                    ],
                });
                fileHandles[currentIndex] = currentFileHandle; 
            } catch (error) {
                console.error("File picker was closed without selecting a file.");
                return;
            }
        }

        try {
            const writable = await currentFileHandle.createWritable();
            const currentContent = main.querySelector(".content").value;
            await writable.write(currentContent);
            await writable.close();
        } catch (error) {
            console.error("Failed to save the file.", error);
        }
    }
}
