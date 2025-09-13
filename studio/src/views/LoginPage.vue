<template>
  <div
    :class="
      'MatcLoginPage ' +
      (resetToken ? 'MatcLoginPageReset' : 'MactMainGradient')
    "
  >
    <div class="MatcLoginPageDialog" v-if="isQuxAuth">
      <div class="MatcLoginPageContainer">
        <div class="MatcCenter">
          <img src="/img/logo-long-b-s.png" width="200px" />
        </div>
        <div
          class="MatcToolbarTabs MatcToolbarTabsBig MatcMarginTop"
          v-if="!resetToken"
        >
          <a
            :class="{ MatcToolbarTabActive: tab === 'login' }"
            @click="setTab('login')"
            >Login</a
          >
          <a
            :class="{ MatcToolbarTabActive: tab === 'signup' }"
            @click="setTab('signup')"
            v-if="allowSignUp"
            >Sign Up</a
          >
        </div>

        <div :class="' MatcLoginWrapper ' + tab">
          <div class="MatcLoginContent">
            <div class="MatcLoginPageSection">
              <span
                class="MatcAlertBox MatcAlertBoxDanger MatcMarginBottom"
                v-if="errorMessage && errorMessage.length > 0"
                ><div class="MatcAlertBoxContent">{{ errorMessage }}</div></span
              >
              <div class="MatcLoginPageForm">
                <form>
                    <div class="form-group">
                      <label class="">Email</label>
                      <input
                        class="form-control input-lg"
                        placeholder="Your email"
                        type="text"
                        autocomplete="off"
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
                        autocomplete="off"
                        @keyup.enter="login"
                      />
                    </div>
                </form>
              </div>
              <div class="MatcCenter MatcMarginTop">
                <a
                  class="MatcButton MatcButtonPrimary MatcButtonFullWidth"
                  @click="login"
                  >Login</a
                >
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
              <span
                class="MatcAlertBox MatcAlertBoxDanger MatcMarginBottom"
                v-if="errorMessage && errorMessage.length > 0"
                ><div class="MatcAlertBoxContent">{{ errorMessage }}</div></span
              >
              <div class="MatcLoginPageForm">
                <form>
                  <div class="form-group">
                    <label class="">Email</label>
                    <input
                      class="form-control input-lg"
                      placeholder="Your email"
                      type="text"
                      autocomplete="off"
                      v-model="email"
                    />
                  </div>
                  <div class="form-group has-feedback">
                    <label class="">Password</label>
                    <input
                      class="form-control input-lg"
                      placeholder="Your password"
                      type="password"
                      autocomplete="off"
                      v-model="password"
                    />
                  </div>
                  <div class="form-group has-feedback">
                    <label class="">Workspace Name</label>
                    <input
                      class="form-control input-lg"
                      placeholder="The name of your workspace"
                      autocomplete="off"
                      v-model="orgName"
                    />
                  </div>
                  <div
                    style="font-size: 12px"
                    class="form-group has-feedback MatcFlex"
                  >
                    <CheckBox v-model="tos" />
                    <span class="MatcMarginLeft">
                      I accept the
                      <a
                        target="_blank"
                        style="color: var(--primary-color)"
                        href="#/privacy.html"
                        >privacy of policy</a
                      >
                      and
                      <a
                        target="_blank"
                        style="color: var(--primary-color)"
                        href="#/terms-of-service.html"
                        >terms of service</a
                      >
                    </span>
                  </div>
                </form>
              </div>
              
              <div class="MatcCenter">
                <a
                  class="MatcButton MatcButtonPrimary MatcButtonFullWidth"
                  @click="signup"
                  >Sign Up</a
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
              <span class="MatcErrorLabel">{{ errorMessage }}</span>
              <div class="MatcButtonBar">
                <a class="MatcButton MatcButtonRed" @click="resetPassword"
                  >Set new password</a
                >
              </div>
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

<style lang="scss" scoped>
@import "../style/scss/login.scss";
a.MatcButton.MatcButtonPrimary.MatcButtonFullWidth {
  padding: 10px 20px;
}
</style>
<style lang="css">
@import "../style/toolbar/tab.css";
</style>
<style>
@import url("../style/matc.css");
@import url("../style/qux.css");
@import url("../style/fonts.css");
</style>
<style lang="sass">
@import "../style/bulma.sass"
</style>

<script>
import Services from "services/Services";
import Logger from "common/Logger";
import CheckBox from "../common/CheckBox.vue";
import { mapState, mapActions } from "vuex";

export default {
  name: "Header",
  mixins: [],
  props: [],
  data: function () {
    return {
      hasLoginError: false,
      resetToken: false,
      email: "",
      password: "",
      orgName: "",
      tos: false,
      errorMessage: "",
      tab: "login",
      config: {},
    };
  },
  computed: {
    ...mapState(["user"]),
    isQuxAuth() {
      return Services.getConfig().auth !== "keycloak";
    },
    allowSignUp() {
      return (
        this.config && this.config.user && this.config.user.allowSignUp === true
      );
    },
  },
  watch: {
    // user(v) {
    //   this.logger.log(6, "watch", "user >> " + v.email);
    //   this.user = v;
    // },
  },
  components: {
    CheckBox,
  },
  methods: {
    ...mapActions(["updateSelectedOrg", "loadSummaries", "loadApps"]),
    setTab(tab) {
      this.tab = tab;
      this.errorMessage = "";
    },
    async resetPassword() {
      this.logger.info("resetPassword", "enter ", this.email);

      if (this.email.length < 2) {
        this.errorMessage = "Please enter your email";
        return;
      }

      if (this.password.length < 6) {
        this.errorMessage = "Password too short";
        return;
      }

      if (this.resetToken.length < 6) {
        this.errorMessage = "Token is wrong";
        return;
      }

      const result = await Services.getUserService().reset2(
          this.email,
          this.password,
          this.resetToken
      )
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
      this.logger.info("requestPasswordReset", "enter ", this.email);
      await Services.getUserService().reset(this.email);
      this.errorMessage =
        "A link to reset your password was sent. Check your mail.";
    },
    async login() {
      this.logger.info("login", "enter ", this.email);
      const result = await Services.getUserService().login({
        email: this.email,
        password: this.password,
      });
      if (result.type == "error") {
        this.$root.$emit("Error", "Wrong login credentials");
        if (result.errors && result.errors.indexOf("user.login.blocked") >= 0) {
          this.errorMessage = "Your account is blocked";
        }
        if (result.errors && result.errors.indexOf("user.login.notpaid") >= 0) {
          this.errorMessage = "Your plan has expired.";
        } else {
          this.errorMessage = "The user or password is not correct.";
          this.hasLoginError = true;
        }
      } else {
        this.$emit("login", result);
        this.$root.$emit("UserLogin", result);
        await this.load();
        this.hasLoginError = false;
      }
    },
    async signup() {
      this.logger.info("signup", "enter ", this.email);

      if (this.password.length < 6) {
        this.errorMessage = "Password too short";
        return;
      }

      if (this.tos !== true) {
        this.errorMessage = "Please accept the terms of service";
        return;
      }

      if (this.orgName.length < 6) {
        this.errorMessage = "Choose a workspace name with at least 7 chars";
        return;
      }

      var result = await Services.getUserService().signup({
        email: this.email,
        password: this.password,
        orgName: this.orgName,
        tos: this.tos,
      });
      if (result.type == "error") {
        if (result.errors.indexOf("user.create.domain") >= 0) {
          this.errorMessage = "Not the correct domain";
        } else if (result.errors.indexOf("user.create.nosignup") >= 0) {
          this.errorMessage = "No sign-ups allowed.";
        } else if (result.errors.indexOf("user.email.not.unique") >= 0) {
          this.errorMessage = "The Email is already taken";
        } else {
          this.errorMessage = "Password required or too short";
        }
      } else {
        let user = await Services.getUserService().login({
          email: this.email,
          password: this.password,
        });
        this.$emit("login", user);
        this.$root.$emit("UserLogin", user);
        this.logger.log(-1, "signup", "exit with login", this.email);
      }
    },
    async load() {
    },
    initKeyCloak(conf) {
      const keycloakService = Services.getUserService();
      keycloakService.init(conf);
    },
  },
  async mounted() {
    this.logger = new Logger("LoginPage");
    this.resetToken = this.$route.query.id;
    if (this.resetToken && this.resetToken.length > 2) {
      this.logger.log(-1, "mounted", "reset ");
      this.tab = "reset";
    }

    this.config = Services.getConfig();
    this.logger.log(-1, "mounted", "exit > ", this.config.user);
  },
};
</script>
