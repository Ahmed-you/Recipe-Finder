// babel.config.cjs
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current", // so that your code runs in your current Node version
        },
      },
    ],
  ],
  plugins: ["babel-plugin-transform-import-meta"],
};
