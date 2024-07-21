import { AndroidFile } from "../lib/onAndroid";
import { WindowsFile } from "../lib/onWindows";
import { moveCursorToEnd } from "../utils/textarea";
import { os } from "../lib/DetectOS";
import { TFileHandles, TFilesWrapper } from "../types/file";
import { addInputEventListener } from "./autocomplete";
import { InactivityTimer, androidTime, winTime } from "../lib/InactivityTimer";

class File {
    os: string;
    __contents: string[];
    fileHandles: TFileHandles;
    filesWrapper: TFilesWrapper;
    currentIndex: number;
    filesElement: HTMLElement;
    contentsElement: HTMLElement;
    newFileElement: HTMLButtonElement;
    openFileElement: HTMLButtonElement;
    footerElement: HTMLElement;
    inactiveTimer: null | InactivityTimer;
    constructor(
        ...args: [
            string,
            HTMLElement,
            HTMLElement,
            HTMLButtonElement,
            HTMLButtonElement
        ]
    ) {
        [
            this.os,
            this.filesElement,
            this.contentsElement,
            this.newFileElement,
            this.openFileElement,
        ] = args;
        this.__contents = [];
        this.fileHandles = [];
        this.filesWrapper = { current: null };
        this.currentIndex = 0;
        this.footerElement = document.getElementById("footer") as HTMLElement;
        this.inactiveTimer = null;
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
                this.os === "android" ? androidTime * 1000 : winTime * 1000
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
        } else {
            this.inactiveTimer?.addErrorMessage("Error al crear el archivo");
        }
    }

    async openExistingFile() {
        switch (this.os) {
            case "android":
                await AndroidFile.openExistingFile(
                    this.createTab.bind(this),
                    this.fileHandles,
                    this.inactiveTimer
                );
                break;
            default:
                await WindowsFile.openExistingFile(
                    this.createTab.bind(this),
                    this.fileHandles,
                    this.inactiveTimer
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
                    this.currentIndex,
                    this.inactiveTimer
                );
                break;
            default:
                await WindowsFile.saveContent(
                    this.filesWrapper,
                    this.filesElement,
                    this.fileHandles,
                    this.contentsElement,
                    this.currentIndex,
                    this.inactiveTimer
                );
        }
    }

    createTab(fileName: string, content: string) {
        const newSpan = document.createElement("span");
        newSpan.classList.add("filename");
        newSpan.setAttribute("contenteditable", "true");
        newSpan.textContent = fileName;
        this.filesElement.insertBefore(newSpan, this.newFileElement);

        this.__contents.push(content);
        this.currentIndex = this.__contents.length - 1;
        this.updateCurrentTab(newSpan);

        this.contentsElement.innerHTML = `<textarea class="content" id="content" autocomplete="off">${content}</textarea>`;
        const textarea: HTMLTextAreaElement = document.getElementById(
            "content"
        ) as HTMLTextAreaElement;
        this.inactiveTimer = new InactivityTimer(
            textarea,
            this.footerElement,
            this.os
        );
        addInputEventListener(textarea);
        moveCursorToEnd(textarea);
        this.filesWrapper.current = this.fileHandles[this.currentIndex] || null;
    }

    switchTab(event: MouseEvent) {
        if (!event.target) return;
        const target = event.target as Element;
        if (target.classList.contains("filename")) {
            this.saveCurrentContent();

            const filenameElements = document.querySelectorAll(".filename");
            filenameElements.forEach((el) => el.classList.remove("current"));
            target.classList.add("current");
            this.currentIndex = Array.from(filenameElements).indexOf(target);
            const content = this.currentContent;
            this.contentsElement.innerHTML = `<textarea class="content" id="content" autocomplete="off">${content}</textarea>`;
            const textarea: HTMLTextAreaElement = document.getElementById(
                "content"
            ) as HTMLTextAreaElement;
            this.inactiveTimer = new InactivityTimer(
                textarea,
                this.footerElement,
                this.os
            );
            addInputEventListener(textarea);
            moveCursorToEnd(textarea);

            this.filesWrapper.current =
                this.fileHandles[this.currentIndex] || null;
        }
    }

    updateCurrentTab(span: HTMLSpanElement) {
        const filenameElements = document.querySelectorAll(".filename");
        filenameElements.forEach((el) => el.classList.remove("current"));
        span.classList.add("current");
    }

    saveCurrentContent() {
        const textarea: HTMLTextAreaElement =
            this.contentsElement.querySelector(
                ".content"
            ) as HTMLTextAreaElement;
        if (textarea) {
            this.__contents[this.currentIndex] = textarea.value;
        }
    }

    debounce(func: Function, wait: number) {
        let timeout: ReturnType<typeof setTimeout>;
        return (...args: any) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    getInactiveTimer() {
        return this.inactiveTimer;
    }
}

const filesElement = document.getElementById("files") as HTMLElement;
const contentsElement = document.getElementById("contents") as HTMLElement;
const newFileElement = document.getElementById(
    "newFileBtn"
) as HTMLButtonElement;
const openFileElement = document.getElementById(
    "openFileBtn"
) as HTMLButtonElement;

export const file = new File(
    os,
    filesElement,
    contentsElement,
    newFileElement,
    openFileElement
);
