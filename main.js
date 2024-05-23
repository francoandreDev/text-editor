import { file } from "./logic/fileSO.js";
import { currentTheme } from "./logic/themes.js";

document.addEventListener("DOMContentLoaded", () => {
    currentTheme.eventListener();
    file.eventListeners();
});

// Todo - Add support for ios
// Todo - Refactor code
// Todo - Add support for multiple files
// Todo - Add support for saving multiple files
// Todo - Refactor code
