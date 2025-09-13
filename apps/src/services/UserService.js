import AbstractService from './AbstractService'
import Logger from '../util/Logger'
import Cookies from 'js-cookie'

class UserService extends AbstractService{

    constructor () {
        super()
        this.language = 'en'
        this.domain = window.location.hostname === 'localhost' ? 'localhost' : 'flowrabbit.ai'
        this.GUEST = {
            id: -1,
            name: "Guest",
            email: "guest@flowrabbit.ai",
            role: "guest",
            lastlogin: 0,
            lastNotification: 0,
            tos: false,
            paidUntil: 0,
            plan: "Free"
        }
    }

    redeemPromoCode (code) {
        return this._post('/rest/store/promo/redeem', {code: code})
    }


    async signup (data) {
        return this._post('/rest/user', data)
    }

    async login (data) {
        let user = await this._post('/rest/login/', data)
        if (!user.errors) {
            this.setUser(user)
        }
        return user;
    }

    save (userID, data) {
        return this._post('/rest/user/' + userID + ".json", data)
    }

    logout () {
        Cookies.remove('marteloUser')
        Cookies.remove('marteloUser', { path: '/' })
        Cookies.remove('marteloUser', { path: '/' , domain: this.domain})
        return this._delete('rest/login/')
    }

    reset (email) {
        return this._post('/rest/user/password/request', {email: email})
    }

    reset2 (email, password, token) {
        let data = {
            email: email,
            password: password,
            key: token
        }
        return this._post('/rest/user/password/set', data)
    }

    retire () {
        this.logger.info('retire()', 'enter > Oh oh')
        return this._get('/rest/retire')
    }

    load () {
        if (!this.user) {
            let s = Cookies.get('marteloUser')       
            if (s) {
                try {
                    const user = JSON.parse(s)
                    this.setTTL(user)
                    if (this.isValidUser(user)) {
                        this.user = user
                        this.setToken(this.getToken())
                    } else {
                        this.user = this.GUEST
                    }
                } catch (error) {
                    this.logger.error('getUser', 'could not parse', s)
                    this.user = this.GUEST
                }
            } else {
                this.user = this.GUEST
            }
        }
        return this.user
    }

    async loadById (id) {
        return await this._get('/rest/user/' + id + '.json')
    }

    getNotications () {
        return this._get('/rest/notifications.json')
    }

    setLastNotication () {
        return this._post('/rest/user/notification/last.json')
    }

    getLastNotication () {
        return this._get('/rest/user/notification/last.json')
    }

    getUser () {
        return this.user
    }

    getToken () {
        /**
         * We might have an issue here on first loads!
         * Make sure we chheck the local storage.
         */
        if (!this.user) {
            this.load()
        }

        if (this.user && this.user.token) {
            if (this.isValidUser(this.user)) {
                return this.user.token
            } else {
                this.logger.error('getToken', 'Error > Token has timed out')
                if (this.errorHandler) {
                    this.errorHandler('', {
                        tokenTimedOut: true
                    })
                }
            }
        }
        return null;
    }

    isValidUser (u) {
        if (u.exp && u.exp > 0) {
            if (u.exp > new Date().getTime()) {
                return true
            } else {
                this.logger.error('isValidUser', 'Error > Token has timed out')
                this.logout()
                location.href= "#/"
            }
        }
        return false
    }

    setTTL (u) {
        if (u.token) {
            let jwt = this.parseJwt(u.token)
            if (jwt) {
                // JWT uses seconds
                u.exp = jwt.exp * 1000
                if (this.ttlTimeout) {
                    clearTimeout(this.ttlTimeout)
                }
                let waitTime = u.exp - new Date().getTime() - (5 * 60 * 1000)
                this.ttlTimeout = setTimeout(() => {
                    location.href = `#/logout.html`
                }, waitTime)
                Logger.log(1, 'setTTL', 'User valid until', new Date(u.exp))
                Logger.log(1, 'setTTL', 'Auto loggout  in ' + (waitTime / 1000) + ' sec')
            } else {
                Logger.log(-1, 'setTTL', 'exit > NO token')
            }
        }
    }

    parseJwt (token) {
        try {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            Logger.error('parseJwt', 'error > could not parse token', e)
        }
        return null
    }

    setUser (u) {
        this.setTTL(u)
        this.user = u
        Cookies.set('marteloUser', JSON.stringify(u), { domain: this.domain, expires: 7, secure: true, path:'/'}) 
    }

    setLanguage (langauge) {
        this.language = langauge
        localStorage.setItem('marteloLanguage', this.language);
    }

    getLanguage () {
        let s = localStorage.getItem('marteloLanguage')
        if (s) {
            this.language = s
        } else {
            this.language = navigator.language
        }
        return this.language
    }

    contact (name, email, message) {
        return this._post("/rest/contact", {
            name: name,
            email: email,
            message: message
        })
    }

    deleteImage (user) {
        return this._delete( "/rest/user/" + user.id + "/images/" + user.image);
    }

    /**
     * UpdateApp_User
     */
    updateAppUserData(data) {
        return this._post(`/data/user/app.json`, data)
    }
    getAppUserData() {
        return this._get(`/data/user/app.json`)
    }

}
export default new UserService()