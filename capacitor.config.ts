import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
    appId: "io.parking.finder",
    appName: "Parking Finder",
    webDir: ".output/public",
    bundledWebRuntime: false,
    plugins: {
        SplashScreen: {
            launchShowDuration: 3000,
            backgroundColor: "#ffffffff",
            androidSplashResourceName: "splash",
            androidScaleType: "CENTER_CROP",
            showSpinner: true,
            androidSpinnerStyle: "large",
            iosSpinnerStyle: "small",
            spinnerColor: "#999999",
            splashFullScreen: true,
            splashImmersive: true,
        },
    },
}

export default config

