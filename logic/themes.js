class Theme {
    themes = ["light-mode", "dark-mode"];
    names = ["modo claro", "modo oscuro"];
    constructor(switcherBtn) {
        this.switcherBtn = switcherBtn;
        this.current = 0;
        this.switcherBtn.textContent = this.currentNameTheme;
    }

    eventListener() {
        this.switcherBtn.addEventListener("click", this.changeMode.bind(this));
    }

    get previousCurrent() {
        if (this.current === 0) return this.themes.length - 1;
        return this.current - 1;
    }

    get nextCurrent() {
        if (this.current === this.themes.length - 1) return 0;
        return this.current + 1;
    }

    get previousTheme() {
        return this.themes[this.previousCurrent];
    }

    get currentTheme() {
        return this.themes[this.current];
    }

    get nextTheme() {
        return this.themes[this.nextCurrent];
    }

    get currentNameTheme() {
        return this.names[this.current];
    }

    get nextNameTheme() {
        return this.names[this.nextCurrent];
    }

    updateCurrent() {
        if (this.current === this.themes.length - 1) this.current = 0;
        else this.current++;
    }

    changeMode() {
        document.body.classList.remove(this.previousTheme);
        document.body.classList.add(this.currentTheme);
        this.switcherBtn.textContent = this.nextNameTheme;
        this.updateCurrent();
    }
}

const switcherBtn = document.getElementById("switcherBtn");
const currentTheme = new Theme(switcherBtn);
export { currentTheme };
