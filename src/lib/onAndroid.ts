import { TFileHandles } from "../types/file";

export class AndroidFile {
    static async openExistingFile(
        createTab: Function,
        fileHandles: TFileHandles
    ) {
        try {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "text/plain";
            input.onchange = async (event) => {
                if (!event.target) return;
                const target = event.target as HTMLInputElement;
                if (!target.files) return;
                const file = target.files[0];
                if (file) {
                    const content = await file.text();
                    createTab(file.name, content);
                    fileHandles.push({
                        handle: file as unknown as FileSystemFileHandle,
                        name: file.name,
                        blob: null,
                    });
                }
            };
            input.click();
        } catch (error) {
            alert("Error al abrir el archivo: " + error);
        }
    }

    static async saveContent(
        ...args: [HTMLElement, TFileHandles, HTMLElement, number]
    ) {
        const [filesElement, fileHandles, contentsElement, currentIndex] = args;
        const currentContent = (
            contentsElement.querySelector(".content") as HTMLInputElement
        ).value;
        const blob = new Blob([currentContent], { type: "text/plain" });

        // Check if the file has been saved previously and use that reference
        let fileReference =
            fileHandles[currentIndex] && fileHandles[currentIndex].name;
        if (!fileReference) {
            updateAndDownload();
            return;
        }
        //? Create a hidden download link and click it to simulate saving the file
        downloadTextDocument();

        function downloadTextDocument() {
            const link: HTMLAnchorElement = document.createElement(
                "a"
            ) as HTMLAnchorElement;
            link.href = URL.createObjectURL(blob);
            link.download = fileReference || "defaultFileName.txt";
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(link.href); // Clean up the URL object

            fileHandles[currentIndex].blob = blob; // Update the blob content
        }

        function updateAndDownload() {
            const suggestedName =
                filesElement.querySelector(".filename.current")?.textContent ||
                "Untitled.txt";
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = suggestedName;

            link.onclick = () => {
                URL.revokeObjectURL(link.href); // Clean up the URL object
                fileHandles[currentIndex] = {
                    handle: null,
                    name: suggestedName,
                    blob: blob,
                };
            };

            link.click();
        }
    }
}
