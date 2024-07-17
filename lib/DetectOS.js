class DetectOS {
    constructor() {
        this.os = this.detectOS();
    }

    detectOS() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (
            userAgent.indexOf("windows nt") !== -1 ||
            userAgent.indexOf("win32") !== -1 ||
            userAgent.indexOf("win64") !== -1
        ) {
            return "windows";
        } else if (userAgent.indexOf("android") !== -1) {
            return "android";
        } else {
            return "unknown";
        }
    }
}

export const { os } = new DetectOS();
