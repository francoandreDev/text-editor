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

    static async saveContent(save, currentFileHandle, header, fileHandles, main, currentIndex) {
        save(); // Ensure current content is saved before actual file save

        const currentContent = main.querySelector(".content").value;

        try {
            if (!currentFileHandle) {
                // Intentar guardar utilizando FileSystemAccess
                currentFileHandle = await window.showSaveFilePicker({
                    types: [{
                        description: 'Text Files',
                        accept: { 'text/plain': ['.txt'] },
                    }],
                    excludeAcceptAllOption: true,
                });

                fileHandles[currentIndex] = currentFileHandle;
            }

            const writable = await currentFileHandle.createWritable();
            await writable.write(currentContent);
            await writable.close();

            console.log('File saved successfully.');
        } catch (error) {
            console.error('Failed to save the file using FileSystemAccess:', error);

            // Si falla FileSystemAccess, intentamos la simulación de descarga
            this.simulateDownload(currentContent, header, fileHandles, currentIndex);
        }
    }

    async simulateDownload(content, header, fileHandles, currentIndex) {
        const suggestedName = header.querySelector(".filename.current").textContent || 'Untitled.txt';
        const blob = new Blob([content], { type: 'text/plain' });

        // Create a hidden download link and click it to simulate saving the file
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = suggestedName;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(link.href); // Clean up the URL object

        fileHandles[currentIndex] = { handle: null, name: suggestedName, blob: blob };
    }
}
