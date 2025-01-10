const { defineConfig } = require('@vue/cli-service');

console.log("Vue config loaded!");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'https://bbq.nccumisoj.online', 
        changeOrigin: true, 
        pathRewrite: { '^/api': '' }, 
      },
    },
  },
});
