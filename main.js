import { file } from "./logic/fileSO.js";
import { currentTheme } from "./logic/themes.js";

document.addEventListener("DOMContentLoaded", () => {
    currentTheme.eventListener();
    file.eventListeners();
});

