const { defineConfig } = require('@vue/cli-service');

console.log("Vue config loaded!");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://35.209.156.165', 
        changeOrigin: true, 
        pathRewrite: { '^/api': '' }, 
      },
    },
  },
});
