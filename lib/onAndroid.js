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
        const name = header.querySelector(".filename.current").textContent;
        try {
            currentFileHandle = new File(currentContent, name, "text/plain");
            var url = URL.createObjectURL(currentFileHandle);

            // Crear un elemento de enlace
            var a = document.createElement("a");
            a.href = url;
            a.download = name;

            // Simular clic en el enlace para iniciar la descarga
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Limpiar después de la descarga
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);

            const blob = new Blob([currentContent], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);

            const filenameElement = name;
            const suggestedName = filenameElement.textContent || "Untitled.txt";
            link.download = suggestedName;

            if (
                fileHandles[currentIndex] &&
                fileHandles[currentIndex].name === suggestedName
            ) {
                link.click();
                URL.revokeObjectURL(link.href); // Clean up the URL object
                return;
            }

            link.onclick = () => {
                URL.revokeObjectURL(link.href); // Clean up the URL object
                fileHandles[currentIndex] = {
                    name: suggestedName,
                    content: currentContent,
                };
            };

            link.click();
        }
    }
}
