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
                    fileHandles.push({ handle: file, name: file.name }); // Store the file reference
                }
            };
            input.click();
        } catch (error) {
            console.error("Failed to open file:", error);
        }
    }

    static async saveContent(save, header, fileHandles, main, currentIndex) {
        save(); // Ensure current content is saved before actual file save

        const currentContent = main.querySelector(".content").value;
        const blob = new Blob([currentContent], { type: 'text/plain' });

        const suggestedName = header.querySelector(".filename.current").textContent || 'Untitled.txt';
        const existingFileHandle = fileHandles[currentIndex].handle;

        if (existingFileHandle) {
            // If the file handle exists, remove the old object URL
            URL.revokeObjectURL(existingFileHandle);
        }

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = suggestedName;

        link.onclick = () => {
            URL.revokeObjectURL(link.href); // Clean up the URL object
            fileHandles[currentIndex] = { handle: link.href, name: suggestedName, blob: blob };
        };

        link.click();
    }
}