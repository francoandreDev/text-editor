class DetectOS {
    os: string;
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

    isWindows(userAgent: string) {
        return /Windows NT|Win/.test(userAgent);
    }

    isAndroid(userAgent: string) {
        return /Android/.test(userAgent);
    }

    isMac(userAgent: string) {
        return /Macintosh/.test(userAgent);
    }

    isLinux(userAgent: string) {
        return /Linux|X11/.test(userAgent);
    }

    isIOS(userAgent: string) {
        return (
            /iPad|iPhone|iPod/.test(userAgent) &&
            (window as any).MSStream === undefined
        );
    }
}

export const { os } = new DetectOS();
