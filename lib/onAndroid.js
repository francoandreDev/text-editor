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

    static async saveContent(save, currentFileHandle, header, fileHandles, main, currentIndex) {
        save();

        const currentContent = main.querySelector(".content").value;
        const blob = new Blob([currentContent], { type: 'text/plain' });

        let fileReference = fileHandles[currentIndex] && fileHandles[currentIndex].name;
        const suggestedName = header.querySelector(".filename.current").textContent || 'Untitled.txt';

        if (!fileReference) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = suggestedName;

            link.onclick = () => {
                URL.revokeObjectURL(link.href); 
                fileHandles[currentIndex] = { handle: null, name: suggestedName, blob: link.href };
            };

            link.click();
        } else {
            try {
                const writable = await currentFileHandle.handle.createWritable();
                await writable.write(blob);
                await writable.close();

                fileHandles[currentIndex].blob = URL.createObjectURL(blob); 
            } catch (error) {
                console.error("Failed to save file:", error);
            }
        }
    }
}