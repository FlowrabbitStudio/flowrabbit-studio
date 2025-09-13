
var apiURL = process.env.API_URL || 'https://api-os.flowrabbit.ai'

module.exports = {
    devServer: {
      proxy: {
        '^/rest': {
          target: apiURL,
          ws: true,
          changeOrigin: true
        },
        '^/proxy': {
          target: apiURL,
          ws: true,
          changeOrigin: true
        }
      }
    },
}