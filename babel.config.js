module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // --- HEMOS COMENTADO (APAGADO) ESTO PARA QUE PASE EL BUILD ---
      // [
      //   "@tamagui/babel-plugin",
      //   {
      //     components: ["tamagui"],
      //     config: "./tamagui.config.ts",
      //     logTimings: true,
      //     disableExtraction: true,
      //   },
      // ],
      // -------------------------------------------------------------

      // Mantén este si usas animaciones
      "react-native-reanimated/plugin",
    ],
  };
};