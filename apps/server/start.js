const fs = require('fs')
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
const version = "5.0.12"
const assetsRoot = path.resolve(__dirname, '../dist')
const api_URL = process.env.FLR_API_URL || 'http://localhost:8080'
const proxy_URL = process.env.FLR_PROXY_URL || 'http://localhost:8084'
const app_URL = process.env.FLR_APPS_URL || 'http://localhost:8081'
const node_URL = process.env.FLR_NODE_URL || 'http://localhost:8088'
const auth = process.env.QUX_AUTH || 'qux'
const userAllowSignUp = process.env.QUX_USER_ALLOW_SIGNUP !== 'false'

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
      "allowSignUp": userAllowSignUp
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
  target: api_URL,
  changeOrigin: true
}))
 
app.use('/proxy', createProxyMiddleware({
  target: proxy_URL,
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
  const packageJs = JSON.parse(fs.readFileSync('package.json'))
  console.debug('************************************')
  console.debug('FlowRabbit - Apps')
  console.debug(':: Version ::  (' + packageJs['version'] + ')')
  console.debug('Listening on ' + host + ':' + server.address().port)
  console.debug('************************************')
})







