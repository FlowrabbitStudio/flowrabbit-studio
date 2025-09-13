<template>
  <div
    :class="
      'MatcLoginPage ' +
      (resetToken ? 'MatcLoginPageReset' : 'MactMainGradient')
    "
  >
    <div class="MatcLoginPageDialog" v-if="isQuxAuth">
      <div class="MatcLoginPageContainer">
        <div
          class="MatcToolbarTabs MatcToolbarTabsBig"
          v-if="!resetToken & allowSignUp"
        >
          <a
            :class="{ MatcToolbarTabActive: tab === 'login' }"
            @click="setTab('login')"
            >Login</a
          >
          <a
            :class="{ MatcToolbarTabActive: tab === 'signup' }"
            @click="setTab('signup')"
            >Sign Up</a
          >
        </div>

        <div :class="' MatcLoginWrapper ' + tab">
          <div class="MatcLoginContent">
            <div class="MatcLoginPageSection">
              <div class="MatcLoginPageForm">
                <div class="luisa-form-row">
                  <label class="">Email</label>
                  <input
                    class="form-control input-lg"
                    placeholder="Your email"
                    type="text"
                    v-model="email"
                  />
                </div>

                <div class="luisa-form-row">
                  <label class="">Password</label>
                  <input
                    class="form-control input-lg"
                    placeholder="Your password"
                    type="password"
                    v-model="password"
                    @keyup.enter="login"
                  />
                </div>
              </div>
              <span
                class="MatcAlertBox MatcAlertBoxDanger MatcMarginBottom"
                v-if="errorMessage && errorMessage.length > 0"
                ><div class="MatcAlertBoxContent">{{ errorMessage }}</div></span
              >
              <div class="luisa-btn-bar">
                <a
                  class="MatcButton MatcButtonPrimary MatcButtonFullWidth"
                  @click="login"
                  >Login</a
                >
              </div>
              <div class="MatcFlex MatcCenter">
                <a
                  class="MatcLinkButton MatcMarginTop"
                  @click="requestPasswordReset"
                  v-if="hasLoginError"
                  >Reset Password</a
                >
              </div>
            </div>
          </div>
          <!-- login-->

          <div class="MatcLoginContent">
            <div class="MatcLoginPageSection">
              <div class="MatcLoginPageForm">
                <div class="form-group">
                  <label class="">Email</label>
                  <input
                    class="form-control input-lg"
                    placeholder="Your email"
                    type="text"
                    v-model="email"
                  />
                </div>

                <div class="form-group has-feedback">
                  <label class="">Password</label>
                  <input
                    class="form-control input-lg"
                    placeholder="Your password"
                    type="password"
                    v-model="password"
                    @keyup.enter="signup"
                  />
                </div>
                <div class="form-group has-feedback">
                  <!-- <CheckBox v-model="tos" label="I accept the term of service" /> -->
                </div>
              </div>
              <span
                class="MatcAlertBox MatcAlertBoxDanger MatcMarginBottom"
                v-if="errorMessage && errorMessage.length > 0"
                ><div class="MatcAlertBoxContent">{{ errorMessage }}</div></span
              >
              <div class="luisa-btn-bar">
                <a
                  class="MatcButton MatcButtonPrimary MatcButtonFullWidth"
                  @click="signup"
                  >SignUp</a
                >
              </div>
            </div>
          </div>
          <!-- new -->

          <div class="MatcLoginContent">
            <div class="MatcLoginPageSection" v-if="resetToken">
              <div class="MatcLoginPageForm">
                <div class="form-group">
                  <label class="">Email</label>
                  <input
                    class="form-control input-lg"
                    placeholder="Your email"
                    type="text"
                    v-model="email"
                  />
                </div>

                <div class="form-group has-feedback">
                  <label class="">New Password</label>
                  <input
                    class="form-control input-lg"
                    placeholder="The new password"
                    type="password"
                    v-model="password"
                  />
                </div>
              </div>
              <div class="MatcButtonBar">
                <a
                  class="MatcButton MatcButtonPrimary MatcButtonFullWidth"
                  @click="resetPassword"
                  >Set new password</a
                >
              </div>
              <span
                class="MatcAlertBox MatcAlertBoxDanger MatcMarginBottom"
                v-if="errorMessage && errorMessage.length > 0"
                ><div class="MatcAlertBoxContent">{{ errorMessage }}</div></span
              >
            </div>
          </div>
          <!-- reset-->
        </div>
        <!-- end wrapper-->
      </div>
      <!-- Container -->
    </div>
    <!-- Dialog -->
  </div>
</template>

<style lang="scss">
@import "../scss/login.scss";
@import "../scss/form.scss";
</style>

<script>
import Services from "../services/Services";
import Logger from "../util/Logger";

export default {
  name: "Login",
  mixins: [],
  props: [],
  data: function () {
    return {
      hasLoginError: false,
      resetToken: false,
      email: "",
      password: "",
      tos: false,
      errorMessage: undefined,
      tab: "login",
      config: {},
    };
  },
  computed: {
    isQuxAuth() {
      return Services.getConfig().auth !== "keycloak";
    },
    allowSignUp() {
      return false; //this.config && this.config.user && this.config.user.allowSignUp === true
    },
  },
  watch: {
    user(v) {
      Logger.log(6, "watch", "user >> " + v.email);
      this.user = v;
    },
  },
  components: {
    //CheckBox
  },
  methods: {
    setTab(tab) {
      this.tab = tab;
      this.errorMessage = " ";
    },
    async resetPassword() {
      Logger.info("resetPassword", "enter ", this.email);

      if (this.email.length < 2) {
        this.errorMessage = "Please enter your email";
        return;
      }

      if (this.password.length < 8) {
        this.errorMessage = "Password too short. It must have at least 8 characters";
        return;
      }

      if (this.resetToken.length < 8) {
        this.errorMessage = "Token is wrong";
        return;
      }

      let result = await Services.getUserService().reset2(
        this.email,
        this.password,
        this.resetToken
      );
      if (result.type === "error") {
        this.errorMessage = "Someything is wrong";
      } else {
        this.errorMessage = "";
        this.resetToken = "";
        this.tab = "login";
        this.$router.push("/");
      }
    },
    async requestPasswordReset() {
      Logger.info("requestPasswordReset", "enter ", this.email);
      await Services.getUserService().reset(this.email);
      this.errorMessage = "Check you mail.";
    },
    async login() {
      Logger.log(-1, "Login.login()", "enter ", this.email);
      const result = await Services.getUserService().login({
        email: this.email,
        password: this.password,
      });
      if (result.type == "error") {
        this.$root.$emit("Error", "Wrong login credentials");
        this.errorMessage = "Login is wrong";
        this.hasLoginError = true;
      } else {
        this.$emit("login", result);
        this.$root.$emit("UserLogin", result);
        this.hasLoginError = false;
      }
    },
    async signup() {
      Logger.info("signup", "enter ", this.email);

      if (this.password.length < 6) {
        this.errorMessage = "Password too short. It must have at least 8 characters";
        return;
      }

      if (this.tos !== true) {
        this.errorMessage = "Please accept terms of service";
        return;
      }

      var result = await Services.getUserService().signup({
        email: this.email,
        password: this.password,
        tos: this.tos,
      });
      if (result.type == "error") {
        if (result.errors.indexOf("user.create.domain") >= 0) {
          this.errorMessage = "Not the correct domain";
        } else if (result.errors.indexOf("user.create.nosignup") >= 0) {
          this.errorMessage = "No sign-ups allowed.";
        } else if (result.errors.indexOf("user.email.not.unique") >= 0) {
          this.errorMessage = "Email is taken";
        } else {
          this.errorMessage = "Password too short. It must have at least 8 characters";
        }
      } else {
        let user = await Services.getUserService().login({
          email: this.email,
          password: this.password,
        });
        this.$emit("login", user);
        this.$root.$emit("UserLogin", user);
        Logger.log(-1, "signup", "exit with login", this.email);
      }
    },
  },
  async mounted() {
    this.resetToken = this.$route.query.id;
    if (this.resetToken && this.resetToken.length > 2) {
      Logger.log(-1, "mounted", "reset ");
      this.tab = "reset";
    }
    this.config = Services.getConfig();
    Logger.log(-1, "mounted", "exit > ", this.config.user);
  },
};
</script>
