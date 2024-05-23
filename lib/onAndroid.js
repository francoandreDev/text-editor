export class AndroidFile {
    static async openExistingFile(createTab, fileHandles) {
        try {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "text/plain";
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

    static async saveContent(
        save,
        header,
        fileHandles,
        main,
        currentIndex
    ) {
        save(); 

        const currentContent = main.querySelector(".content").value;
        const blob = new Blob([currentContent], { type: "text/plain" });
        const suggestedName =
            header.querySelector(".filename.current").textContent ||
            "Untitled.txt";

        const fileName = suggestedName || "Untitled.txt";
        await this.deleteIfExists(fileName).catch((error) => {
            console.error(error);
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = suggestedName;
        link.style.display = "none";

        if (fileHandles[currentIndex].blob) {
            URL.revokeObjectURL(fileHandles[currentIndex].blob);
        }

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        fileHandles[currentIndex].blob = link.href;
        fileHandles[currentIndex].name = suggestedName;

        URL.revokeObjectURL(link.href);
    }

    async deleteIfExists(fileName) {
        const options = {
            type: "open-directory",
        };

        try {
            const dirHandle = await window.showDirectoryPicker(options);
            for await (const entry of dirHandle.values()) {
                if (entry.kind === "file" && entry.name === fileName) {
                    await entry.remove();
                    return true;
                }
            }
            return false;
        } catch (err) {
            console.error("Error al acceder al sistema de archivos:", err);
            return false;
        }
    }
}
