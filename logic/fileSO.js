import { WindowsFile } from "../lib/onWindows.js";
import { AndroidFile } from "../lib/onAndroid.js";

class File {
    constructor(header, main, newFileBtn, openFileBtn, so) {
        this.__content = [];
        this.header = header.querySelector(".files");
        this.main = main;
        this.newFileBtn = newFileBtn;
        this.openFileBtn = openFileBtn;
        this.currentFileHandleWrapper = { currentFileHandle: null };
        this.currentIndex = 0;
        this.fileHandles = [];
        this.so = so;
    }

    eventListeners() {
        this.newFileBtn.addEventListener("click", this.createNewTab.bind(this));
        this.openFileBtn.addEventListener(
            "click",
            this.openExistingFile.bind(this)
        );
        this.header.addEventListener("click", this.switchTab.bind(this));
        this.main.addEventListener(
            "input",
            this.debounce(
                this.saveContent.bind(this),
                this.so === "android" ? 15000 : 2000
            )
        );
    }

    get currentContent() {
        return this.__content[this.currentIndex] || "";
    }

    async createNewTab() {
        const newFileName = prompt("Enter the new file name:", "Untitled.txt");
        if (newFileName) {
            this.createTab(newFileName, "");
            this.fileHandles.push({
                handle: null,
                name: newFileName,
                blob: null,
            });
            this.currentIndex = this.fileHandles.length - 1;
            this.currentFileHandleWrapper.currentFileHandle = null;
        }
    }

    async openExistingFile() {
        switch (this.so) {
            case "android":
                await AndroidFile.openExistingFile(
                    this.createTab.bind(this),
                    this.fileHandles
                );
                break;
            default:
                await WindowsFile.openExistingFile(
                    this.createTab.bind(this),
                    this.fileHandles
                );
        }
    }

    async saveContent() {
        this.saveCurrentContent();
        switch (this.so) {
            case "android":
                await AndroidFile.saveContent(
                    this.saveCurrentContent.bind(this),
                    this.header,
                    this.fileHandles,
                    this.main,
                    this.currentIndex
                );
                break;
            default:
                await WindowsFile.saveContent(
                    this.saveCurrentContent.bind(this),
                    this.currentFileHandleWrapper,
                    this.header,
                    this.fileHandles,
                    this.main,
                    this.currentIndex
                );
        }
    }

    createTab(fileName, content) {
        const newSpan = document.createElement("span");
        newSpan.classList.add("filename");
        newSpan.textContent = fileName;
        this.header.appendChild(newSpan);

        this.__content.push(content);
        this.currentIndex = this.__content.length - 1;
        this.updateCurrentTab(newSpan);

        this.main.innerHTML = `
            <textarea class="content" id="content" autofocus autocomplete="off">${content}</textarea>
            `;

        this.currentFileHandleWrapper.currentFileHandle =
            this.fileHandles[this.currentIndex] || null;
    }

    switchTab(event) {
        if (event.target.classList.contains("filename")) {
            this.saveCurrentContent();

            const filenameElements = document.querySelectorAll(".filename");
            filenameElements.forEach((el) => el.classList.remove("current"));
            event.target.classList.add("current");
            this.currentIndex = Array.from(filenameElements).indexOf(
                event.target
            );
            const content = this.currentContent;
            this.main.innerHTML = `
                <textarea class="content" id="content" autofocus autocomplete="off">${content}</textarea>
            `;
            this.currentFileHandleWrapper.currentFileHandle =
                this.fileHandles[this.currentIndex] || null;
        }
    }

    updateCurrentTab(nav) {
        const filenameElements = document.querySelectorAll(".filename");
        filenameElements.forEach((el) => el.classList.remove("current"));
        nav.classList.add("current");
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

class DetectSO {
    constructor() {
        this.so = this.detectOS();
    }

    detectOS() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (
            userAgent.indexOf("windows nt") !== -1 ||
            userAgent.indexOf("win32") !== -1 ||
            userAgent.indexOf("win64") !== -1
        ) {
            return "windows";
        } else if (userAgent.indexOf("android") !== -1) {
            return "android";
        } else {
            return "unknown";
        }
    }
}

const detectSO = new DetectSO();
const header = document.getElementById("files");
const main = document.getElementById("contents");
const newFileBtn = document.getElementById("newFileBtn");
const openFileBtn = document.getElementById("openFileBtn");

export const file = new File(
    header,
    main,
    newFileBtn,
    openFileBtn,
    detectSO.so
);
