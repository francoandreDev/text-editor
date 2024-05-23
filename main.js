class Theme {
    constructor(toggleBtn) {
        this.toggleBtn = toggleBtn;
        this.toggleBtn.addEventListener("click", this.toggleMode.bind(this));
        this.darkMode = true;
    }

    toggleMode() {
        document.body.classList.toggle("dark-mode", this.darkMode);
        this.toggleBtn.textContent = this.darkMode
            ? "Modo Claro"
            : "Modo Oscuro";
        this.darkMode = !this.darkMode;
    }
}

class File {
    constructor(header, main, newFileBtn, openFileBtn) {
        this.__content = [];
        this.header = header;
        this.main = main;
        this.newFileBtn = newFileBtn;
        this.openFileBtn = openFileBtn;
        this.currentFileHandle = null;
        this.currentIndex = 0;
        this.fileHandles = []; // Array to store file handles for each tab
        this.evenListeners();
    }

    evenListeners() {
        this.newFileBtn.addEventListener("click", this.createNewTab.bind(this));
        this.openFileBtn.addEventListener(
            "click",
            this.openExistingFile.bind(this)
        );
        this.header.addEventListener("click", this.switchTab.bind(this));
        //change the debounce value here if you want to change the debounce time for saving
        this.main.addEventListener(
            "input",
            this.debounce(this.saveContent.bind(this), 8000)
        );
    }

    getCurrentContent() {
        return this.__content[this.currentIndex] || "";
    }

    async createNewTab() {
        const newFileName = prompt("Enter the new file name:", "Untitled.txt");
        if (newFileName) {
            this.createTab(newFileName, "");
            this.fileHandles.push(null); // Add null entry for new tab
        }
    }

    async openExistingFile() {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: "Text Files",
                        accept: { "text/plain": [".txt"] },
                    },
                ],
                multiple: false,
            });

            if (fileHandle) {
                const file = await fileHandle.getFile();
                const content = await file.text();
                this.createTab(file.name, content);
                this.fileHandles.push(fileHandle); // Store file handle for the opened file
            }
        } catch (error) {
            console.error("File picker was closed without selecting a file.");
        }
    }

    createTab(fileName, content) {
        const newSpan = document.createElement("span");
        newSpan.classList.add("filename");
        newSpan.setAttribute("contenteditable", "true");
        newSpan.textContent = fileName;
        this.header.insertBefore(newSpan, this.newFileBtn);

        this.__content.push(content); // Add content to array
        this.currentIndex = this.__content.length - 1;
        this.updateCurrentTab(newSpan);

        this.main.innerHTML = `
            <textarea class="content" id="content" autofocus autocomplete="off">${content}</textarea>
        `;

        this.currentFileHandle = this.fileHandles[this.currentIndex] || null; // Set file handle for the current tab
    }

    switchTab(event) {
        if (event.target.classList.contains("filename")) {
            this.saveCurrentContent(); // Save the current content before switching

            const filenameElements = document.querySelectorAll(".filename");
            filenameElements.forEach((el) => el.classList.remove("current"));
            event.target.classList.add("current");
            this.currentIndex = Array.from(filenameElements).indexOf(
                event.target
            );
            const content = this.getCurrentContent();
            this.main.innerHTML = `
                <textarea class="content" id="content" autofocus autocomplete="off">${content}</textarea>
            `;
            this.currentFileHandle =
                this.fileHandles[this.currentIndex] || null; // Reset file handle for the current tab
        }
    }

    updateCurrentTab(span) {
        const filenameElements = document.querySelectorAll(".filename");
        filenameElements.forEach((el) => el.classList.remove("current"));
        span.classList.add("current");
    }

    async saveContent() {
        this.saveCurrentContent(); // Ensure current content is saved before actual file save

        if (!this.currentFileHandle) {
            try {
                this.currentFileHandle = await window.showSaveFilePicker({
                    suggestedName:
                        this.header.querySelector(".filename.current")
                            .textContent,
                    types: [
                        {
                            description: "Text Files",
                            accept: { "text/plain": [".txt"] },
                        },
                    ],
                });
                this.fileHandles[this.currentIndex] = this.currentFileHandle; // Store file handle
            } catch (error) {
                console.error(
                    "File picker was closed without selecting a file."
                );
                return;
            }
        }

        const writable = await this.currentFileHandle.createWritable();
        const currentContent = this.main.querySelector(".content").value;
        await writable.write(currentContent);
        await writable.close();
    }

    saveCurrentContent() {
        const textarea = this.main.querySelector(".content");
        if (textarea) {
            this.__content[this.currentIndex] = textarea.value;
        }
    }

    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("files");
    const main = document.getElementById("contents");
    const newFileBtn = document.getElementById("newFileBtn");
    const openFileBtn = document.getElementById("openFileBtn");
    const toggleModeBtn = document.getElementById("toggleModeBtn");

    const theme = new Theme(toggleModeBtn);
    theme.toggleMode();
    const file = new File(header, main, newFileBtn, openFileBtn);
});

// Todo - Add support for android
// Todo - Add support for ios
// Todo - Refactor code
// Todo - Add support for multiple files
// Todo - Add support for saving multiple files
// Todo - Refactor code