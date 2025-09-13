import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import qux from './qux'
import Services from './services/Services'
import store from './store'

(async () => {
	await Services.initConfig()
	const app = createApp(App)

	app.use(store)
	app.use(router).mount('#app')
	app.use(qux)
	app.config.unwrapInjectedRef = true
})();
console.debug("star2t")