const http = require('http')
const express = require('express')
const path = require('path')
const compression = require('compression')
const proxyMiddleware = require('http-proxy-middleware')

/**
 * Some config stuff
 */
const host = '0.0.0.0'
const assetsRoot = path.resolve(__dirname, '../dist')
const version = "5.0.17"
const port = (process.env.FLR_HTTP_PORT * 1) || 8082
const api_URL = process.env.FLR_API_URL || 'http://localhost:8080'
const proxy_URL = process.env.FLR_PROXY_URL || 'http://localhost:8084'
const app_URL = process.env.FLR_APPS_URL || 'http://localhost:8081'
const node_URL = process.env.FLR_NODE_URL || 'http://localhost:8088'
const wsUrl = process.env.FLR_WS_URL || 'wss://localhost:8086'
const auth = process.env.FLR_AUTH || 'qux'
const tos = process.env.FLR_TOS_URL || ''
const internal_API_URL = process.env.FLR_INTERNAL_API_URL || 'http://localhost:8080'
const internal_Proxy_URL = process.env.FLR_INTERNAL_PROXY_URL || 'http://localhost:8084'
const keycloak_realm = process.env.FLR_KEYCLOAK_REALM || ''
const keycloak_client = process.env.FLR_KEYCLOAK_CLIENT || ''
const keycloak_url = process.env.FLR_KEYCLOAK_URL || ''
const sharedLibs = process.env.FLR_SHARED_LIBS || ''
const userAllowSignUp = process.env.FLR_USER_ALLOW_SIGNUP !== 'false'
const userAllowedDomains = process.env.FLR_USER_ALLOWED_DOMAINS || '*'


/**
 *
 * Init express
 */
const app = express()

/** 
 * Add compression
 */
app.use(compression())


/** 
 * make config dynamic on env variables
 */
app.get("/config.json", (_req, res) => {
  res.send({
    "version": version,
    "auth": auth,
    "websocket": wsUrl,
    "tos": tos,
    "sharedLibs": sharedLibs,
    "user": {
      "allowSignUp": userAllowSignUp,
      "allowedDomains": userAllowedDomains
    },
    "keycloak": {
      "realm": keycloak_realm,
      "clientId": keycloak_client,
      "url": keycloak_url
    },
    "ws_URL": wsUrl,
    "api_URL": api_URL,
    "proxy_URL": proxy_URL,
    "app_URL": app_URL,
    "node_URL": node_URL
  })
})

/**
 * init proxy.
 */
app.use('/rest/', proxyMiddleware.createProxyMiddleware({
    target: internal_API_URL,
    changeOrigin: true
}))

app.use('/ai/', proxyMiddleware.createProxyMiddleware({
  target: internal_API_URL,
  changeOrigin: true
}))

app.use('/proxy', proxyMiddleware.createProxyMiddleware({
  target: internal_Proxy_URL,
  changeOrigin: true
}))

/**
 * Setup static to serve all html, js and images from server/dist
 */
app.use(express.static(assetsRoot))


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
  console.log('************************************')
  console.log('FlowRabbit - Studio :' + version)
  console.log('Root      :' + assetsRoot)
  console.log('Listening on ' + host + ':' + server.address().port)
  console.log('Backend   : ' + api_URL)
  console.log('Backend   : ' + internal_API_URL + ' (internal)')
  console.log('Proxy   : '   + proxy_URL)
  console.log('Proxy   : '   + internal_Proxy_URL + ' (internal)')
  console.log('WebSocket : ' + wsUrl)
  console.log('Auth      : ' + auth)
  console.log('SignUp    : ' + userAllowSignUp)
  console.log('Domains   : ' + userAllowedDomains)
  console.log('************************************')
})







