import { TFileHandles, TFilesWrapper } from "../types/file";
import { InactivityTimer } from "./InactivityTimer";

export class WindowsFile {
    static async openExistingFile(
        createTab: Function,
        fileHandles: TFileHandles,
        inactivityTimer: InactivityTimer | null
    ) {
        try {
            const fileHandle = await getFile();

            if (fileHandle) {
                await getInfo(fileHandle);
            }
        } catch (error) {
            inactivityTimer?.addErrorMessage("Error al abrir el archivo");
        }

        async function getFile() {
            const [fileHandle] = await (window as any).showOpenFilePicker({
                types: [
                    {
                        description: "Text Files",
                        accept: { "text/plain": [".txt"] },
                    },
                ],
                multiple: false,
            });
            return fileHandle;
        }

        async function getInfo(fileHandle: FileSystemFileHandle) {
            const file = await fileHandle.getFile();
            const content = await file.text();
            createTab(file.name, content);
            fileHandles.push({
                handle: fileHandle,
                name: file.name,
                blob: null,
            });
        }
    }

    static async saveContent(
        ...args: [
            TFilesWrapper,
            HTMLElement,
            TFileHandles,
            HTMLElement,
            number,
            InactivityTimer | null
        ]
    ) {
        const [
            filesWrapper,
            filesElement,
            fileHandles,
            contentsElement,
            currentIndex,
            inactivityTimer,
        ] = args;

        if (!filesWrapper.current?.handle) {
            const res = await createNewFileForSave();
            if (!res) return;
        }

        await saveTextFile();

        async function createNewFileForSave() {
            try {
                const element = filesElement.querySelector(".filename.current");
                const suggestedName = element
                    ? element.textContent || "Untitled.txt"
                    : "Untitled.txt";

                const newFileHandle = await (window as any).showSaveFilePicker({
                    suggestedName,
                    types: [
                        {
                            description: "Text Files",
                            accept: { "text/plain": [".txt"] },
                        },
                    ],
                });
                filesWrapper.current = {
                    handle: newFileHandle,
                    name: newFileHandle.name,
                    blob: null,
                };
                fileHandles[currentIndex] = newFileHandle;
            } catch (error) {
                inactivityTimer?.addErrorMessage("Error al crear el archivo");
                return false;
            }
            return true;
        }

        async function saveTextFile() {
            try {
                const writable = await (
                    filesWrapper.current?.handle as any
                ).createWritable();
                const currentContent = (
                    contentsElement.querySelector(
                        "#content"
                    ) as HTMLTextAreaElement
                ).value;
                await writable.write(currentContent);
                await writable.close();
            } catch (error) {
                inactivityTimer?.addErrorMessage("Error al guardar el archivo");
            }
        }
    }
}
