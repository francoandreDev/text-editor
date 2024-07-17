class DetectOS {
    constructor() {
        this.os = this.detectOS();
    }

    detectOS() {
        const { userAgent } = navigator;

        if (this.isWindows(userAgent)) return "windows";
        if (this.isAndroid(userAgent)) return "android";
        if (this.isMac(userAgent)) return "macos";
        if (this.isLinux(userAgent)) return "linux";
        if (this.isIOS(userAgent)) return "ios";
        
        return "unknown";
    }

    isWindows(userAgent) {
        return /Windows NT|Win/.test(userAgent);
    }

    isAndroid(userAgent) {
        return /Android/.test(userAgent);
    }

    isMac(userAgent) {
        return /Macintosh/.test(userAgent);
    }

    isLinux(userAgent) {
        return /Linux|X11/.test(userAgent);
    }

    isIOS(userAgent) {
        return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    }
}

export const { os } = new DetectOS();
