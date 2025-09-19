const http = require('http')
const express = require('express')
const path = require('path')
const compression = require('compression')
const { createProxyMiddleware } = require('http-proxy-middleware');


/**
 * Some config stuff
 */
const host = '0.0.0.0'
const port = 8083
const version = "5.0.17"
const assetsRoot = path.resolve(__dirname, '../dist')
const internal_API_URL = process.env.FLR_INTERNAL_API_URL || 'http://localhost:8080'
const internal_Proxy_URL = process.env.FLR_INTERNAL_PROXY_URL || 'http://localhost:8084'
const api_URL = process.env.FLR_API_URL || 'http://localhost:8080'
const proxy_URL = process.env.FLR_PROXY_URL || 'http://localhost:8084'
const app_URL = process.env.FLR_APPS_URL || 'http://localhost:8081'
const node_URL = process.env.FLR_NODE_URL || 'http://localhost:8088'
const auth = process.env.QUX_AUTH || 'qux'


/**
 *
 * Init express
 */
const app = express()
app.use(compression())

/** 
 * make config dynamic on env variables
 */
app.get("/config.json", (_req, res) => {
  res.send({
    "version": version,
    "auth": auth,
    "user": {
      "allowSignUp": true
    },
    "api_URL": api_URL,
    "proxy_URL": proxy_URL,
    "app_URL": app_URL,
    "node_URL": node_URL
  })
})

/**
 * init proxies
 */
app.use('/rest',  createProxyMiddleware({
  target: internal_API_URL,
  changeOrigin: true
}))
 
app.use('/proxy', createProxyMiddleware({
  target: internal_Proxy_URL,
  changeOrigin: true
}))


/**
 * Setup static to serve all html, js and images from server/dist
 */
 app.use(express.static(assetsRoot))

/**
 * Set up history shit...
 */
app.get("/*.html", (_req, res) => {
  try {
    res.sendFile(assetsRoot + '/index.html');
  } catch (err) {
    console.error('flowrabbit-apps > could not server index', err)
  }
});



/**
 * Create the server
 */
const server = http.createServer(app)


// Finish application create.
module.exports = server.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.debug('************************************')
  console.debug('FlowRabbit - Apps - ' + version)
  console.debug(':: Proxy            ::  (' + proxy_URL + ')')
  console.debug(':: API         ::  (' + proxy_URL + ')')
  console.debug(':: Internal Proxy   ::  (' + internal_Proxy_URL + ')')
  console.debug(':: Internal API     ::  (' + internal_API_URL + ')')
  console.debug('Listening on ' + host + ':' + server.address().port)
  console.debug('************************************')
})







