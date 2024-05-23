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
                    fileHandles.push({ handle: file, name: file.name }); // Store the file reference
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

        // Check if the file has been saved previously and use that reference
        let fileReference =
            fileHandles[currentIndex] && fileHandles[currentIndex].name;
        const suggestedName =
            header.querySelector(".filename.current").textContent ||
            "Untitled.txt";

        // Create a hidden download link and click it to simulate saving the file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = suggestedName;
        link.style.display = "none";

        // Revoke the previous URL object before creating a new one
        if (fileHandles[currentIndex].blob) {
            URL.revokeObjectURL(fileHandles[currentIndex].blob);
        }

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Update the blob content and store the new URL
        fileHandles[currentIndex].blob = link.href;
        fileHandles[currentIndex].name = suggestedName;

        // Clean up the URL object
        URL.revokeObjectURL(link.href);
    }
}
