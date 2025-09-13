<template>
    <div :class="'luisa-404 luisa-gradient'">
        <div class="luisa-404-header">
            404
        </div>
        <div class="luisa-404-hint">
            No app found
        </div>
        
    </div>
</template>


<style lang="scss">
@import "../scss/login.scss";
@import "../scss/404.scss";
</style>

<script>


import Services from '../services/Services'
import Logger from '../util/Logger'


export default {
    name: "404",
    mixins: [],
    props: [],
    data: function () {
        return {
            hasLoginError: false,
            resetToken: false,
            email: '',
            password: '',
            tos: false,
            errorMessage: ' ',
            tab: 'login',
            config: {}
        }
    },
    computed: {
        isQuxAuth() {
            return Services.getConfig().auth !== 'keycloak'
        },
        allowSignUp() {
            return false //this.config && this.config.user && this.config.user.allowSignUp === true
        }
    },
    watch: {
        'user'(v) {
            Logger.log(6, 'watch', 'user >> ' + v.email)
            this.user = v
        }
    },
    components: {
        //CheckBox
    },
    methods: {
        setTab(tab) {
            this.tab = tab
            this.errorMessage = ' '
        },
        async resetPassword() {
            Logger.info('resetPassword', 'enter ', this.email)

            if (this.email.length < 2) {
                this.errorMessage = "Please enter your email"
                return;
            }

            if (this.password.length < 6) {
                this.errorMessage = "Password too short"
                return;
            }

            if (this.resetToken.length < 6) {
                this.errorMessage = "Token is wrong"
                return;
            }

            let result = await Services.getUserService().reset2(this.email, this.password, this.resetToken)
            if (result.type === 'error') {
                this.errorMessage = 'Someything is wrong'
            } else {
                this.errorMessage = ''
                this.resetToken = ''
                this.tab = 'login'
                this.$router.push('/')
            }

        },
        async requestPasswordReset() {
            Logger.info('requestPasswordReset', 'enter ', this.email)
            await Services.getUserService().reset(this.email)
            this.errorMessage = 'Check you mail.'
        },
        async login() {
            Logger.log(-1,'Login.login()', 'enter ', this.email)
            const result = await Services.getUserService().login({
                email: this.email,
                password: this.password
            })
            if (result.type == "error") {
                this.$root.$emit("Error", "Wrong login credentials")
                this.errorMessage = "Login is wrong"
                this.hasLoginError = true
            } else {
                this.$emit('login', result);
                this.$root.$emit('UserLogin', result)
                this.hasLoginError = false
            }
        },
        async signup() {
            Logger.info('signup', 'enter ', this.email)

            if (this.password.length < 6) {
                this.errorMessage = "Password too short"
                return;
            }

            if (this.tos !== true) {
                this.errorMessage = "Please accept terms of service"
                return;
            }

            var result = await Services.getUserService().signup({
                email: this.email,
                password: this.password,
                tos: this.tos
            })
            if (result.type == "error") {
                if (result.errors.indexOf("user.create.domain") >= 0) {
                    this.errorMessage = "Not the correct domain"
                } else if (result.errors.indexOf("user.create.nosignup") >= 0) {
                    this.errorMessage = "No sign-ups allowed."
                } else if (result.errors.indexOf("user.email.not.unique") >= 0) {
                    this.errorMessage = "Email is taken"
                } else {
                    this.errorMessage = "Password too short"
                }
            } else {
                let user = await Services.getUserService().login({
                    email: this.email,
                    password: this.password,
                })
                this.$emit('login', user);
                this.$root.$emit('UserLogin', user)
                Logger.log(-1, 'signup', 'exit with login', this.email)
            }
        }
    },
    async mounted() {
        this.resetToken = this.$route.query.id
        if (this.resetToken && this.resetToken.length > 2) {
            Logger.log(-1, 'mounted', 'reset ')
            this.tab = 'reset'
        }
        this.config = Services.getConfig()
        Logger.log(-1, 'mounted', 'exit > ', this.config.user)
    }
}
</script>