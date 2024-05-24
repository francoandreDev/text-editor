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

        let fileReference =
            fileHandles[currentIndex] && fileHandles[currentIndex].name;
        if (!fileReference) {
            const suggestedName =
                header.querySelector(".filename.current").textContent ||
                "Untitled.txt";
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = suggestedName;

            link.onclick = () => {
                URL.revokeObjectURL(link.href); 
                fileHandles[currentIndex] = {
                    handle: null,
                    name: suggestedName,
                    blob: blob,
                };
            };

            link.click();
        } else {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileReference;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(link.href);

            fileHandles[currentIndex].blob = blob;
        }
    }
}
