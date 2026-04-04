const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  expo: {
    name: "Platform Scaffold",
    slug: "platform-scaffold",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "platformscaffold",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0f172a",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.example.platformscaffold",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundColor: "#0f172a",
      },
      package: "com.example.platformscaffold",
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
    },
    plugins: ["expo-router"],
    extra: {
      router: { origin: false },
      apiBaseUrl: process.env.API_BASE_URL,
      features: {
        commerce: true,
        feed: true,
        media: true,
      },
    },
  },
};
