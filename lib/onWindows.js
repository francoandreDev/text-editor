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
                console.log(`File opened: ${file.name}`);
            }
        } catch (error) {
            console.error(
                "File picker was closed without selecting a file or an error occurred.",
                error
            );
        }
    }

    static async saveContent(
        save,
        currentFileHandleWrapper,
        header,
        fileHandles,
        main,
        currentIndex
    ) {
        save();

        console.log(`Saving content at index ${currentIndex}`);
        console.log(
            `Current file handle:`,
            currentFileHandleWrapper.currentFileHandle
        );

        if (!currentFileHandleWrapper.currentFileHandle) {
            try {
                const newFileHandle = await window.showSaveFilePicker({
                    suggestedName:
                        header.querySelector(".filename.current").textContent ||
                        "Untitled.txt",
                    types: [
                        {
                            description: "Text Files",
                            accept: { "text/plain": [".txt"] },
                        },
                    ],
                });
                currentFileHandleWrapper.currentFileHandle = newFileHandle;
                fileHandles[currentIndex] = newFileHandle;
                console.log(
                    `New file handle assigned at index ${currentIndex}`
                );
            } catch (error) {
                console.error(
                    "File picker was closed without selecting a file or an error occurred.",
                    error
                );
                return;
            }
        }

        try {
            const writable =
                await currentFileHandleWrapper.currentFileHandle.createWritable();
            const currentContent = main.querySelector(".content").value;
            await writable.write(currentContent);
            await writable.close();
            console.log(
                `File saved successfully at index ${currentIndex}. Content: ${currentContent}`
            );
        } catch (error) {
            console.error("Failed to save the file.", error);
        }
    }
}
