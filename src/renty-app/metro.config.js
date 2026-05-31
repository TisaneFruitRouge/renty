const path = require("path")
const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

const workspaceRoot = path.resolve(__dirname, "../..")
const config = getDefaultConfig(__dirname)

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
]

module.exports = withNativeWind(config, { input: "./global.css" })
