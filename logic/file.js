import { AndroidFile } from "../lib/onAndroid.js";
import { WindowsFile } from "../lib/onWindows.js";
import { moveCursorToEnd } from "../utils/textarea.js";
import { os } from "../lib/DetectOS.js";

class File {
    constructor(...args) {
        [
            this.os,
            this.filesElement,
            this.contentsElement,
            this.newFileElement,
            this.openFileElement,
        ] = args;
        this.initializeVariables();
    }

    initializeVariables() {
        this.__contents = [];
        this.fileHandles = [];
        this.filesWrapper = { current: null };
        this.currentIndex = 0;
    }

    eventListeners() {
        this.newFileElement.addEventListener(
            "click",
            this.createNewTab.bind(this)
        );
        this.openFileElement.addEventListener(
            "click",
            this.openExistingFile.bind(this)
        );
        this.filesElement.addEventListener("click", this.switchTab.bind(this));
        this.contentsElement.addEventListener(
            "input",
            this.debounce(
                this.saveContent.bind(this),
                this.os === "android" ? 15000 : 2000
            )
        );
    }

    get currentContent() {
        return this.__contents[this.currentIndex] || "";
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
            this.filesWrapper.current = null;
        }
    }

    async openExistingFile() {
        switch (this.os) {
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
        switch (this.os) {
            case "android":
                await AndroidFile.saveContent(
                    this.filesElement,
                    this.fileHandles,
                    this.contentsElement,
                    this.currentIndex
                );
                break;
            default:
                await WindowsFile.saveContent(
                    this.filesWrapper,
                    this.filesElement,
                    this.fileHandles,
                    this.contentsElement,
                    this.currentIndex
                );
        }
    }

    createTab(fileName, content) {
        const newSpan = document.createElement("span");
        newSpan.classList.add("filename");
        newSpan.setAttribute("contenteditable", "true");
        newSpan.textContent = fileName;
        this.filesElement.insertBefore(newSpan, this.newFileElement);

        this.__contents.push(content);
        this.currentIndex = this.__contents.length - 1;
        this.updateCurrentTab(newSpan);

        this.contentsElement.innerHTML = `<textarea class="content" id="content" autocomplete="off">${content}</textarea>`;
        const textarea = document.getElementById("content");
        moveCursorToEnd(textarea);
        this.filesWrapper.current = this.fileHandles[this.currentIndex] || null;
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
            this.contentsElement.innerHTML = `<textarea class="content" id="content" autocomplete="off">${content}</textarea>`;
            const textarea = document.getElementById("content");
            moveCursorToEnd(textarea);
            this.filesWrapper.current =
                this.fileHandles[this.currentIndex] || null;
        }
    }

    updateCurrentTab(span) {
        const filenameElements = document.querySelectorAll(".filename");
        filenameElements.forEach((el) => el.classList.remove("current"));
        span.classList.add("current");
    }

    saveCurrentContent() {
        const textarea = this.contentsElement.querySelector(".content");
        if (textarea) {
            this.__contents[this.currentIndex] = textarea.value;
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

const filesElement = document.getElementById("files");
const contentsElement = document.getElementById("contents");
const newFileElement = document.getElementById("newFileBtn");
const openFileElement = document.getElementById("openFileBtn");

export const file = new File(
    os,
    filesElement,
    contentsElement,
    newFileElement,
    openFileElement
);
