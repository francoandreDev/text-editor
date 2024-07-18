import { os } from "../lib/DetectOS";
import { moveCursorToEnd } from "../utils/textarea";

class Autocomplete {
    private dictSymbols: Record<string, number> = {};

    constructor() {
        this.dictSymbols = {
            "¿": 0,
            "¡": 0,
            '"': 0,
            "'": 0,
            "<": 0,
            "(": 0,
            "[": 0,
            "{": 0,
            "?": 0,
            "!": 0,
            ">": 0,
            ")": 0,
            "]": 0,
            "}": 0,
        };
    }

    private resetCount() {
        this.dictSymbols = {
            "¿": 0,
            "¡": 0,
            '"': 0,
            "'": 0,
            "<": 0,
            "(": 0,
            "[": 0,
            "{": 0,
            "?": 0,
            "!": 0,
            ">": 0,
            ")": 0,
            "]": 0,
            "}": 0,
        };
    }

    private countSymbols(text: string) {
        //? detect last open symbol without closing symbol related to it
        this.resetCount();

        const openingSymbols = ["¿", "¡", '"', "'", "<", "(", "[", "{"];
        const closingSymbols = ["?", "!", '"', "'", ">", ")", "]", "}"];

        for (let i = text.length - 1; i >= 0; i--) {
            const char = text[i];
            if (
                openingSymbols.includes(char) ||
                closingSymbols.includes(char)
            ) {
                this.dictSymbols[char] += 1;
            }
        }
    }

    complete(textArea: HTMLTextAreaElement, symbol: string) {
        let closingSymbol = symbol;
        const text = textArea.value;
        const start = textArea.selectionStart;
        const end = textArea.selectionEnd;
        textArea.value =
            text.substring(0, start) + closingSymbol + text.substring(end);
        if (closingSymbol !== "")
            textArea.selectionStart = textArea.selectionEnd = start;
        else moveCursorToEnd(textArea);
    }

    isBalance(textArea: HTMLTextAreaElement) {
        this.countSymbols(textArea.value);
        let flag = true;
        if (this.dictSymbols["¿"] !== this.dictSymbols["?"]) flag = false;
        if (this.dictSymbols["¡"] !== this.dictSymbols["!"]) flag = false;
        if (this.dictSymbols["'"] % 2 === 1) flag = false;
        if (this.dictSymbols['"'] % 2 === 1) flag = false;
        if (this.dictSymbols["<"] !== this.dictSymbols[">"]) flag = false;
        if (this.dictSymbols["("] !== this.dictSymbols[")"]) flag = false;
        if (this.dictSymbols["["] !== this.dictSymbols["]"]) flag = false;
        if (this.dictSymbols["{"] !== this.dictSymbols["}"]) flag = false;
        return this.isBalanceWithOrder(textArea.value) && flag;
    }

    isBalanceWithOrder(input: string) {
        const stack = [];
        const opening = ["{", "[", "(", "¡", "¿"];
        const closing = ["}", "]", ")", "!", "?"];
        const matches = {
            "}": "{",
            "]": "[",
            ")": "(",
            "!": "¡",
            "?": "¿",
        };

        for (let char of input) {
            if (opening.includes(char)) {
                stack.push(char);
            } else if (closing.includes(char)) {
                if (
                    stack.length === 0 ||
                    stack.pop() !== matches[char as keyof typeof matches]
                ) {
                    return false;
                }
            }
        }

        return stack.length === 0;
    }

    balance(textArea: HTMLTextAreaElement) {
        let closingSymbol = "";
        this.countSymbols(textArea.value);

        if (this.dictSymbols["¿"] > this.dictSymbols["?"]) closingSymbol = "?";
        if (this.dictSymbols["¡"] > this.dictSymbols["!"]) closingSymbol = "!";
        if (this.dictSymbols["'"] % 2 === 1) closingSymbol = "'";
        if (this.dictSymbols['"'] % 2 === 1) closingSymbol = '"';
        if (this.dictSymbols["<"] > this.dictSymbols[">"]) closingSymbol = ">";
        if (this.dictSymbols["("] > this.dictSymbols[")"]) closingSymbol = ")";
        if (this.dictSymbols["["] > this.dictSymbols["]"]) closingSymbol = "]";
        if (this.dictSymbols["{"] > this.dictSymbols["}"]) closingSymbol = "}";

        this.complete(textArea, closingSymbol);
    }
}

class CheckGrammar {
    private autocomplete: Autocomplete;
    constructor() {
        this.autocomplete = new Autocomplete();
    }

    grammar(textArea: HTMLTextAreaElement) {
        // after a point or at the begin of the sentence the letter will be put in upper case
        const marks = [".", "¡", "!", "¿", "?", "\n"];
        const text = textArea.value;

        let temporal = text[0].toUpperCase();
        let flag = false;

        for (let i = 1; i < text.length; i++) {
            const char = text[i];
            if (marks.includes(text[i - 1])) {
                flag = true;
            }
            if (flag && char !== " " && char !== "\n") {
                temporal += char.toUpperCase();
                flag = false;
            } else {
                temporal += char;
            }
        }

        // after a point symbol or close symbol the letter will be put after an extra space
        const newText = temporal.replace(/([.,;:)\]}!?])(?=\S|$)/g, "$1 ");

        textArea.value = newText;
    }

    addPointAtTheEnd(textArea: HTMLTextAreaElement) {
        const endPointMarks = ["!", "?"];
        const symbol = textArea.value[textArea.value.length - 1];
        const prevSymbol = textArea.value[textArea.value.length - 2];
        if (prevSymbol === " ") return;
        if (symbol === "\n") return;
        if (
            !endPointMarks.includes(symbol) &&
            symbol !== " " &&
            prevSymbol !== "."
        )
            textArea.value += ". ";
    }

    isOk(textArea: HTMLTextAreaElement): boolean {
        const isBalance: boolean = this.autocomplete.isBalance(textArea);
        if (!isBalance) return false;
        return true;
    }
}

export function addInputEventListener(textArea: HTMLTextAreaElement) {
    let firstEnter = true;
    textArea.addEventListener("keydown", (e: Event) => {
        const input: KeyboardEvent = e as KeyboardEvent;

        const autocomplete = new Autocomplete();
        const checkGrammar = new CheckGrammar();

        switch (os) {
            case "windows":
                if (input.key === "Tab") {
                    e.preventDefault();
                    autocomplete.balance(textArea);
                    checkGrammar.grammar(textArea);
                }
                break;
            case "android":
                e.preventDefault();
                autocomplete.balance(textArea);
                checkGrammar.grammar(textArea);

                break;
        }
        const res: boolean = checkGrammar.isOk(textArea);
        if (!res) textArea.style.borderColor = "#ff0000";
        else textArea.style.borderColor = "";

        if (firstEnter) {
            if (input.key === "Enter") {
                e.preventDefault();
                checkGrammar.addPointAtTheEnd(textArea);
                if (os === "android") textArea.value += "\n";
                firstEnter = false;
            }
        } else {
            if (input.key === "Enter") {
                firstEnter = true;
            }
        }
    });
}
