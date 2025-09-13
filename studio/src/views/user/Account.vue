<template>
  <div class="VommondContentContainer">
    <div class="MatcContent MatcAbout">
      <div class="MatcSection">
        <div class="container container-center-xxl" v-if="user">
          <div class="">
    
            <div class="">
              <div v-if="activeTab === 'profile'">
                <div v-if="isQuxAuth">
                  <div class="MatcCard">
                    <div class="MatcCardHeader">
                      <p>Change Profile Details</p>
                    </div>
                    <div class="MatcCardContent">
                      <div
                        v-if="accounterror && accounterror.lenght > 0"
                        class="MatcAlertBox MatcMarginBottom MatcAlertBoxDanger"
                      >
                        <span class="MatcAlertBoxContent">
                          {{ accounterror }}</span
                        >
                      </div>
                      <div class="row">
                        <div class="col-md-4">
                          <div>
                            <div
                              class="MatcMarginTop col-md-2 col-md-offset-1 visible-md-block visible-lg-block"
                            >
                              <UserImage :user="user" />
                            </div>
                          </div>
                        </div>

                        <div class="col-md-8">
                          <div class="field form-group">
                            <label class="MatcLabel">Name</label>
                            <div class="control">
                              <input
                                class="input form-control is-normal"
                                v-model="user.name"
                                placeholder="Enter your name"
                                data-binding-required="true"
                              />
                            </div>
                          </div>

                          <div class="field form-group">
                            <label class="MatcLabel">Surname</label>
                            <div class="control">
                              <input
                                class="input form-control is-normal"
                                v-model="user.lastname"
                                placeholder="Enter your surname"
                                data-binding-required="true"
                              />
                            </div>
                          </div>

                          <div class="form-group">
                            <div>
                              <CheckBox
                                v-model="user.newsletter"
                                label="I want to receive the newsletter"
                              />
                            </div>
                          </div>

                          <div class="MatcButtonBar">
                            <div class="field is-grouped">
                              <div class="control">
                                <button class="MatcButton MatcButtonPrimary" @click="save">
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="MatcCard MatcMarginTop">
                    <div class="MatcCardHeader">
                      <p>Change Password</p>
                    </div>
                    <div class="MatcCardContent">
                      <div
                        v-if="passworderror && passworderror.length > 0"
                        class="MatcAlertBox MatcMarginBottom MatcAlertBoxDanger"
                      >
                        <span class="MatcAlertBoxContent">
                          {{ passworderror }}</span
                        >
                      </div>
                      <div class="form-group">
                        <label class="MatcLabel">New Password</label>
                        <p class="control has-icons-left">
                          <input
                            type="password"
                            class="input form-control is-normal"
                            v-model="password"
                            placeholder="To change, enter new password"
                          />
                          <span class="icon is-small is-left">
                            <i class="mdi mdi-lock"></i>
                          </span>
                        </p>
                      </div>
                      <div class="form-group">
                        <label class="MatcLabel">Repeat Password</label>
                        <p class="control has-icons-left">
                          <input
                            type="password"
                            class="input form-control is-normal"
                            v-model="doublepassword"
                            placeholder="To change, enter new password"
                          />
                          <span class="icon is-small is-left">
                            <i class="mdi mdi-lock"></i>
                          </span>
                        </p>
                      </div>

                      <div class="MatcButtonBar">
                        <div class="field is-grouped">
                          <div class="control">
                            <button class="MatcButton MatcButtonPrimary" @click="savePassword">
                              Change Password
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="MatcCard MatcMarginTop">
                    <div class="MatcCardHeader">
                      <p>Delete Account</p>
                    </div>
                    <div class="MatcCardContent">
                      <div class="MatcAlertBox MatcBetween MatcAlertBoxWarning">
                        <span class="MatcAlertBoxContent"
                          >Warning: If you delete your account, you will lose your account data!</span>
                        <a class="MatcLinkButton MatcLinkWarningButton" @click="retire"
                          >Delete</a
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6" v-if="isQuxAuth">
                    <div data-dojo-type="de/vommond/Form"></div>
                  </div>
                  <div class="col-md-6" v-else>
                    <p class="MatcLead MatcMarginBottomXL">
                      Your credentials are managed in Keycloak. Contact your
                      admin for help.
                    </p>
                  </div>
                </div>
              </div>

              <!--<div v-if="activeTab === 'organizations'">
                <div class="MatcCard">
                  <div class="MatcCardHeader">
                    <p>Organizations</p>
                  </div>
                  <div class="MatcCardContent">
                    <div
                      v-for="organization in filteredOrganizations"
                      :key="organization.id"
                    >
                      <table class="MatcTable is-fullwidth">
                        <thead>
                          <tr class="MatcTableHeader">
                            <th>Name</th>
                            <th>Users</th>
                            <th>Apps</th>
                            <th class="MatcTableAction">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="MatcTableBody">
                            <td>{{ organization.name }}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div class="MatcCard MatcMarginTop">
                  <div class="MatcCardHeader">
                    <p>Flowrabbit Credits</p>
                  </div>
                  <div class="MatcCardContent">
                    <div
                      v-for="organization in filteredOrganizations"
                      :key="organization.id"
                      class="organization"
                    >
                      <Accordion :header="organization.name">
                        <template>
                          <table class="MatcTable is-fullwidth">
                            <thead>
                              <tr class="MatcTableHeader">
                                <th>Name</th>
                                <th>Used API Calls</th>
                                <th>Total API Calls</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                class="MatcTableBody"
                                v-for="(
                                  apiCalls, name
                                ) in organization.apiCalls"
                                :key="name"
                              >
                                <td>{{ apiCalls.label }}</td>
                                <td>
                                  {{ apiCalls.currentApiCalls }}
                                </td>
                                <td>
                                  {{ apiCalls.maxApiCalls }}
                                </td>
                                <td>-</td>
                              </tr>
                            </tbody>
                          </table>
                        </template>
                      </Accordion>
                    </div>
                  </div>
                </div>
              </div>-->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import lang from "dojo/_base/lang";
import on from "dojo/on";
import Dialog from "common/Dialog";
import DomBuilder from "common/DomBuilder";
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import CheckBox from "common/CheckBox.vue";
import UserImage from "page/UserImage.vue";
//import Accordion from "../../components/Accordion.vue";

export default {
  name: "Account",
  mixins: [DojoWidget],
  data: function () {
    return {
      password: "",
      doublepassword: "",
      passworderror: "",
      accounterror: "",
      user: null,
      errorHomepage: false,
      errorName: false,
      errorLastName: false,
      activeTab: "profile",
      organizations: [],
      newApiCallName: "",
      newMaxApiCalls: 0,
      email: "",
    };
  },
  watch: {},
  components: {
    CheckBox: CheckBox,
    UserImage: UserImage,
    //Accordion: Accordion,
  },
  computed: {
    isQuxAuth() {
      return Services.getConfig().auth !== "keycloak";
    },
    filteredOrganizations() {
      return this.organizations.filter((org) => org.name !== "private");
    },
  },
  methods: {
    async retire() {
      this.logger.log(0, "retire", "entry");

      var db = new DomBuilder();
      var dialog = db.div("MatcDialog").build();

      var name = this.user.name ? this.user.name : this.user.email;

      db.h3("", this.getNLS("user.retire.hi") + name + ",").build(dialog);
      db.div("MatcMarginTop", this.getNLS("user.retire.msg"), true).build(
        dialog
      );

      var bar = db.div("MatcButtonBar MatcMarginTopXXL").build(dialog);

      var del = db
        .a("MatcButton MatcButtonRed", this.getNLS("btn.delete"))
        .build(bar);
      var cancel = db.a("MatcLinkButton", this.getNLS("btn.cancel")).build(bar);

      var d = new Dialog();
      d.popup(dialog, document.getElementById("accountRetireButton"));
      d.own(on(del, "click", lang.hitch(this, "_retireUser", d, dialog)));
      d.own(
        on(cancel, "click", function () {
          d.close();
        })
      );
    },

    _retireUser(d, dialog) {
      this.logger.error("_retireUser", "enter");
      Services.getUserService().retire(this.user); // this._doGet("/rest/retire");
      d.shake();
      dialog.innerHTML = this.getNLS("user.retire.cusoon");
      d.own(
        on(d, "close", () => {
          this.$root.$emit("logout");
        })
      );
    },

    async save() {
      this.logger.log(0, "save", "entry");
      let data = {
        name: this.user.name,
        lastname: this.user.lastname,
        homepage: this.user.homepage,
        newsletter: this.user.newsletter,
      };
      let result = await Services.getUserService().save(this.user._id, data);
      this.$root.$emit("user", result);
      this.showSuccess("Account updated");
    },

    async savePassword() {
      this.logger.log(0, "save new password", "entry");
      let data = {};
      if (!this.password || this.password.length === 0) {
        this.passworderror = "Field required: Enter a new password";
        return;
      }
      if (!this.doublepassword || this.doublepassword.length === 0) {
        this.passworderror = "Field required: Repeat the new password";
        return;
      }
      if (
        this.doublepassword &&
        this.password &&
        this.doublepassword !== this.password
      ) {
        this.passworderror = "The passwords must match";
        return;
      }
      if (this.password.length > 0) {
        if (this.password.length < 6) {
          console.warn("Password too short");
          this.passworderror = "The password must have at least 6 characters";
          return;
        } else {
          data.password = this.password;
        }
      }
      let result = await Services.getUserService().save(this.user._id, data);
      this.$root.$emit("user", result);
      this.showSuccess("Password updated");
    },

    async loadOrganizations() {
      const orgs = await Services.getOrgService().findUserOrganizations(
        this.user.id
      );
      this.organizations = orgs;
    },

    async removeApiCall(orgId, name) {
      let org = this.organizations.find((org) => org.id === orgId);
      this.$delete(org.apiCalls, name);
      /*const res = await Services.getOrganizationService().updateOrganization(orgId, org);
      if (res.error || res.errors) {
        this.$root.$emit('Error', 'Error deleting API call');
      } else {
        this.$root.$emit('Success', 'API call deleted');
      }*/
    },

    async addApiCall(orgId) {
      if (!this.newApiCallName || this.newMaxApiCalls <= 0) {
        this.$root.$emit("Error", "Invalid API call details");
        return;
      }
      let org = this.organizations.find((org) => org.id === orgId);
      this.$set(org.apiCalls, this.newApiCallName, {
        currentApiCalls: 0,
        maxApiCalls: this.newMaxApiCalls,
      });
      /*const res = await Services.getOrganizationService().updateOrganization(orgId, org);
      if (res.error || res.errors) {
        this.$root.$emit('Error', 'Error adding API call');
      } else {
        this.$root.$emit('Success', 'API call added');
        this.newApiCallName = '';
        this.newMaxApiCalls = 0;
      }*/
    },
  },
  async mounted() {
    this.logger = new Logger("Finish");
    let user = Services.getUserService().load();
    Services.getUserService()
      .loadById(user.id)
      .then((full) => {
        this.user = full;
        this.logger.info("mounted", "exit >> " + this.user.email);
        this.email = this.user.email;
        this.loadOrganizations();
      });
  },
};
</script>
