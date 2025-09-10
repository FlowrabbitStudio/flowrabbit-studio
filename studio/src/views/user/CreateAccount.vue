<template>
  <div :class="'MatcLoginPage MactMainGradient'">
    <div class="MatcLoginPageDialog">
      <div class="MatcLoginPageContainer">
        <div class="MatcCenter">
          <img src="/img/logo-long-b-s.png" width="200px" />
        </div>
        <div class="MatcLoginWrapper">
          <div class="MatcLoginContent signup">
            <div class="MatcLoginPageSection">
              <span
                class="MatcAlertBox MatcAlertBoxDanger MatcMarginBottom"
                v-if="errorMessage && errorMessage.length > 0"
                ><div class="MatcAlertBoxContent">{{ errorMessage }}</div></span
              >
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
                      href="https://www.flowrabbit.ai/privacy"
                      >privacy of policy</a
                    >
                    and
                    <a
                      target="_blank"
                      style="color: var(--primary-color)"
                      href="https://www.flowrabbit.ai/terms-of-service"
                      >terms of service</a
                    >
                  </span>
                </div>
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
        </div>
      </div>
    </div>
  </div>
</template>


<style lang="scss">
@import "src/style/scss/login.scss";
@import url("src/style/matc.css");
@import url("src/style/qux.css");
</style>
<script>
import Services from "services/Services";
import Logger from "common/Logger";
import CheckBox from "src/common/CheckBox.vue";

export default {
  name: "CreateAccount",
  mixins: [],
  props: [],
  data: function () {
    return {
      hasLoginError: false,
      resetToken: false,
      email: "",
      password: "",
      tos: false,
      errorMessage: "",
      config: {},
      orgInvite: ""
    };
  },
  computed: {
  },
  components: {
    CheckBox,
  },
  methods: {
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

      var result = await Services.getUserService().signup({
        email: this.email,
        password: this.password,
        tos: this.tos,
        orgInvite: this.orgInvite
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
        this.$router.push({ path: "/#/" }).catch((err) => {
          console.log(err);
        });
        this.$root.$emit("UserLogin", user);
        this.logger.log(-1, "signup", "exit with login", this.email);
      }
    },
  },
  async mounted() {
    this.logger = new Logger("LoginPage");
    this.config = Services.getConfig();
    this.orgInvite = this.$route.query.invite;
  },
};
</script>