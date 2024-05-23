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
                    fileHandles.push(file); // Store the file reference
                }
            };
            input.click();
        } catch (error) {
            console.error("Failed to open file:", error);
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
        save(); // Ensure current content is saved before actual file save

        const currentContent = main.querySelector(".content").value;
        const blob = new Blob([currentContent], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);

        const suggestedName =
            header.querySelector(".filename.current").textContent ||
            "Untitled.txt";
        link.download = suggestedName;
        link.click();

        URL.revokeObjectURL(link.href); // Clean up the URL object

        // Optionally update the file handle if necessary
        if (!fileHandles[currentIndex]) {
            fileHandles[currentIndex] = {
                name: suggestedName,
                content: currentContent,
            };
        } else {
            fileHandles[currentIndex].content = currentContent;
        }
    }
}
