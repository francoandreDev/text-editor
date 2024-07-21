export class InactivityTimer {
    textarea: HTMLTextAreaElement;
    footer: HTMLElement;
    tiempoInactivo: number;
    timeoutID: ReturnType<typeof setInterval> | null;
    loadingPercent: number;
    growthProgressBar: number;
    inactivityLimit: number;
    os: string;
    constructor(
        textarea: HTMLTextAreaElement,
        footer: HTMLElement,
        os: string
    ) {
        this.textarea = textarea;
        this.footer = footer;
        this.tiempoInactivo = 0;
        this.timeoutID = null;
        this.loadingPercent = 0;
        this.growthProgressBar = os === "windows" ? 50 : 6.66666666666667;
        this.inactivityLimit = os === "windows" ? 2 : 15;
        this.os = os;

        this.textarea.addEventListener("input", () => this.reiniciarContador());
        this.iniciarContador();
    }

    incrementarTiempoInactivo() {
        this.tiempoInactivo++;
        if (this.tiempoInactivo >= this.inactivityLimit) {
            this.addOkMessage();
            clearInterval(this.timeoutID as number);
        } else {
            this.addLoadingElement();
        }
    }

    reiniciarContador() {
        clearInterval(this.timeoutID as number);
        this.tiempoInactivo = 0;
        this.loadingPercent = 0;
        this.clearFooter();
        this.iniciarContador();
    }

    iniciarContador() {
        this.timeoutID = setInterval(
            () => this.incrementarTiempoInactivo(),
            1000
        );
    }

    addMessageElement(message: string) {
        this.removeMessageElement();
        const spanElement = document.createElement("span");
        spanElement.classList.add("message");
        spanElement.textContent = message;
        this.footer.appendChild(spanElement);
    }

    removeMessageElement() {
        const prevMessageElement = this.footer.querySelector(".message");
        if (prevMessageElement) {
            this.footer.removeChild(prevMessageElement);
        }
    }

    clearFooter() {
        while (this.footer.firstChild) {
            this.footer.removeChild(this.footer.firstChild);
        }
        this.loadingPercent = 0;
    }

    addOkMessage() {
        if (this.os === "android") {
            setTimeout(() => {
                this.clearFooter();
                this.addOKIconElement();
                this.addMessageElement("Guardado");
            }, 15 * 1000);
        } else {
            setTimeout(() => {
                this.clearFooter();
                this.addOKIconElement();
                this.addMessageElement("Guardado");
            }, 2 * 1000);
        }
    }

    addOKIconElement() {
        const iconElement = document.createElement("i");
        iconElement.classList.add("fa-solid", "fa-check", "success");
        this.footer.appendChild(iconElement);
    }

    addLoadingElement() {
        this.clearFooter();
        this.addProgressBarElement();
        this.addLoadingIcon();
        this.addMessageElement("Guardando...");
    }

    addProgressBarElement() {
        const progressBarElement = document.createElement("progress");
        progressBarElement.classList.add("progress");
        progressBarElement.value = this.loadingPercent;
        progressBarElement.max = 100;
        this.footer.appendChild(progressBarElement);
        this.growthProgressBarElement(progressBarElement);
    }

    growthProgressBarElement(progressBarElement: HTMLProgressElement) {
        const interval = setInterval(() => {
            this.loadingPercent += this.growthProgressBar;
            if (this.loadingPercent >= 100) {
                clearInterval(interval);
                progressBarElement.value = 100;
            }
            progressBarElement.value = this.loadingPercent;
        }, 1000);
    }

    addLoadingIcon() {
        const loadingElement = document.createElement("i");
        loadingElement.classList.add("fa-solid", "fa-spinner", "loading");
        this.footer.appendChild(loadingElement);
    }

    addErrorMessage(message: string) {
        this.clearFooter();
        this.addErrorIconElement();
        this.addMessageElement(message);
    }

    addErrorIconElement() {
        const iconElement = document.createElement("i");
        iconElement.classList.add("fa-solid", "fa-ban", "error");
        this.footer.appendChild(iconElement);
    }

    addWarningMessage(message: string) {
        this.clearFooter();
        this.addWarningIconElement();
        this.addMessageElement(message);
    }

    addWarningIconElement() {
        const iconElement = document.createElement("i");
        iconElement.classList.add("fa-solid", "fa-exclamation", "failed");
        this.footer.appendChild(iconElement);
    }
}
