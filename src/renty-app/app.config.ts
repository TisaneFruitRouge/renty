export default {
  expo: {
    name: "renty-app",
    slug: "renty",
    version: "1.0.0",
    owner: "Vincent WENDLING",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/images/adaptive-icon.png",
          backgroundColor: "#ffffff"
        }
      },
      web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png"
      },
      plugins: [
        "expo-router",
        [
          "expo-splash-screen",
          {
            image: "./assets/images/splash-icon.png",
            imageWidth: 200,
            resizeMode: "contain",
            backgroundColor: "#ffffff"
          }
        ],
        "expo-localization",
        [
          "expo-secure-store",
          {
            configureAndroidBackup: true,
            faceIDPermission: "Allow $(PRODUCT_NAME) to access your Face ID biometric data."
          } 
        ]
      ],
      experiments: {
        typedRoutes: true
      },
      extra: {
        apiUrl: process.env.API_URL,
        ablyApiKey: process.env.ABLY_API_KEY
      },
    },
  };