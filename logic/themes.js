class Theme {
    constructor(switcherBtn) {
        this.themes = [
            { mode: "light-mode", name: "modo claro" },
            { mode: "dark-mode", name: "modo oscuro" },
            // Añadir más temas aquí
        ];
        this.switcherBtn = switcherBtn;
        this.current = 0;
        this.switcherBtn.textContent = this.currentTheme.name;
    }

    eventListener() {
        this.switcherBtn.addEventListener("click", this.changeMode.bind(this));
    }

    get previousCurrent() {
        return this.current === 0 ? this.themes.length - 1 : this.current - 1;
    }

    get nextCurrent() {
        return this.current === this.themes.length - 1 ? 0 : this.current + 1;
    }

    get previousTheme() {
        return this.themes[this.previousCurrent].mode;
    }

    get currentTheme() {
        return this.themes[this.current];
    }

    get nextTheme() {
        return this.themes[this.nextCurrent];
    }

    updateCurrent() {
        this.current = this.nextCurrent;
    }

    changeMode() {
        document.body.classList.remove(this.previousTheme);
        document.body.classList.add(this.currentTheme.mode);
        this.switcherBtn.textContent = this.nextTheme.name;
        this.updateCurrent();
    }
}

const switcherBtn = document.getElementById("switcherBtn");
const currentTheme = new Theme(switcherBtn);

export { currentTheme };
