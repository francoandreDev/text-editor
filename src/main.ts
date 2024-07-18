import { file } from "./logic/file";
import { currentTheme } from "./logic/themes";

document.addEventListener("DOMContentLoaded", () => {
    currentTheme.eventListener();
    file.eventListeners();
});
