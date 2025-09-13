<template>
  <div :class="'MatcLoginPage MactMainGradient'">
    <div class="MatcLoginPageDialog">
      <div class="MatcLoginPageContainer MatcLoginPageContainerXS">
        <div :class="' MatcLoginWrapper ' + tab">
          <div class="MatcLoginContent">
            <div class="MatcLoginPageSection">
              <div class="MatcLoginPagePasswordForm">
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
                <a class="luisa-btn-primary" @click="login">Login</a>
              </div>
            </div>
          </div>
          <!-- login-->
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
      password: "",
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
    setError() {
      this.errorMessage = "The password is wrong";
    },
    async login() {
      Logger.log(-1, "AppPassword.login()", "enter ");
      this.$emit("login", this.password);
    },
  },
  async mounted() {
    this.config = Services.getConfig();
  },
};
</script>
