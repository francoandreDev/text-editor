class Theme {
    switcherBtn: HTMLButtonElement;
    modes: string[];
    names: string[];
    current: number;
    constructor(switcherBtn: HTMLButtonElement) {
        this.modes = ["light-mode", "dark-mode"];
        this.names = ["modo claro", "modo oscuro"];
        this.current = 0;
        this.switcherBtn = switcherBtn;
        this.switcherBtn.textContent = this.currentName;
    }

    eventListener() {
        this.switcherBtn.addEventListener("click", this.changeMode.bind(this));
    }

    get previousMode() {
        if (this.current === 0) return this.modes.length - 1;
        return this.current - 1;
    }

    get nextMode() {
        if (this.current === this.modes.length - 1) return 0;
        return this.current + 1;
    }

    get previousTheme() {
        return this.modes[this.previousMode];
    }

    get currentTheme() {
        return this.modes[this.current];
    }

    get nextTheme() {
        return this.modes[this.nextMode];
    }

    get currentName() {
        return this.names[this.current];
    }

    get nextName() {
        return this.names[this.nextMode];
    }

    updateMode() {
        if (this.current === this.modes.length - 1) this.current = 0;
        else this.current++;
    }

    changeMode() {
        document.body.classList.remove(this.previousTheme);
        document.body.classList.add(this.currentTheme);
        this.switcherBtn.textContent = this.nextName;
        this.updateMode();
    }
}

const switcherBtn = document.getElementById("switcherBtn") as HTMLButtonElement;
const currentTheme = new Theme(switcherBtn);
export { currentTheme };
