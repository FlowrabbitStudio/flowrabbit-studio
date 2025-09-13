<template>
  <div class="MatcContent MatcSettings">
    <section class="MatcSection">
      <div class="container">
        <div class="MatcCard">
          <div class="MatcCardHeader"><p>Prototype Name</p></div>
          <div class="MatcCardContent">
            <input
              type="text"
              class="form-control"
              v-model="app.name"
              @change="setAppName"
              placeholder="Enter App name"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="MatcSection">
      <div class="container">
        <div class="MatcCard">
          <div class="MatcCardHeader"><p>Team</p></div>
          <div class="MatcCardContent">
            <Team v-if="app && user" :appID="app.id" :userID="user.id" />
          </div>
        </div>
      </div>
    </section>

    <section class="MatcSection">
      <div class="container">
        <div class="MatcCard">
          <div class="MatcCardHeader"><p>Secrets</p></div>
          <div class="MatcCardContent">
            <SecretsList :app="app"></SecretsList>
          </div>
        </div>
      </div>
    </section>

    <section class="MatcSection">
      <div class="container">
        <div class="MatcCard">
          <div class="MatcCardHeader">
            <p>Delete App</p>
          </div>
          <div class="MatcCardContent MatcFlex MatcGapM">
    
                <a
                class="MatcButton MatcButtonRed"
                @click="showDeleteDialog"
                >Delete</a
              >

            <div class="MatcAlertBox MatcBetween MatcAlertBoxWarning">
              <span class="MatcAlertBoxContent"
                >Warning: If you delete the app, you will lose it
                permanently.</span
              >          
            </div>
          
         
          </div>
        </div>
      </div>
    </section>
    <!-- <section class="section">
      <div class="container">
        <div class="box">
          <h2 class="title">Comments</h2>
          <Comment
            v-if="app"
            :appID="app.id"
            type="app_settings"
            :reference="sessionID"
            contentID
            insertPosition="top"
          />
        </div>
      </div>
    </section> -->
  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
//import Comment from "page/Comment";
import on from "dojo/on";
import touch from "dojo/touch";
import Dialog from "common/Dialog";
import lang from "dojo/_base/lang";
import DomBuilder from "common/DomBuilder";
import SecretsList from "page/SecretsList";
import Team from "page/Team";
import AnalyticsService from "services/AnalyticsService";

export default {
  name: "Test",
  mixins: [DojoWidget],
  props: ["app", "test", "annotation", "events", "pub", "user", "invitations"],
  data: function () {
    return {
      sessionID: "",
      eventsWithAnnimations: [],
      mouseEvents: [],
    };
  },
  components: {
    SecretsList,
    Team: Team
  },
  computed: {
    base() {
      return location.protocol + "//" + location.host;
    },
    iframe() {
      if (this.app) {
        var w = this.app.screenSize.w + "px";
        var h = this.app.screenSize.h + "px";
        var code =
          '<iframe src="' +
          this.base +
          "/em.html?h=" +
          this.hashes[1] +
          '" width="' +
          w +
          '" height="' +
          h +
          '" allowTransparency="true" frameborder="0"></iframe>';
        return code;
      }
      return "-";
    },
    hashes() {
      var temp = {};
      for (var key in this.invitations) {
        temp[this.invitations[key]] = key;
      }
      return temp;
    },
  },
  methods: {
    async showDeleteDialog() {
      let db = new DomBuilder();
      var div = db.div("box MatcDeleteDialog").build();
      db.h3("title is-4", "Delete Prototype").build(div);
      db.p("", `Do you want to delete the '${this.app.name}' prototype?`).build(
        div
      );
      var bar = db.div("buttons").build(div);
      var cancel = db.a("button is-text", this.getNLS("btn.cancel")).build(bar);
      var write = db
        .a("button is-danger", this.getNLS("btn.delete"))
        .build(bar);

      var d = new Dialog();
      d.own(on(cancel, touch.press, lang.hitch(d, "close")));
      d.own(on(write, touch.press, lang.hitch(this, "deleteApp", d)));
      d.popup(div, this.$refs.deleteBtn);
    },

    async deleteApp(d) {
      await Services.getModelService().deleteApp(this.app);
      d.close();
      this.$router.push({ path: "/" }).catch((err) => {
        console.log(err);
      });
    },
    async resetShare() {
      await Services.getModelService().resetTeam(this.app.id);
      /**
       * Could be nicer by reloading invitaions and passing to parent. This is lazy
       */
      location.reload();
    },
    async setAppName() {
      let res = await Services.getModelService().updateAppProps(this.app.id, {
        id: this.app.id,
        name: this.app.name,
      });
      if (res.status === "ok") {
        this.showSuccess("Name was saved...");
      } else {
        this.showError("Oooppps, Could not change the name. Try again!");
      }
    },
  },
  watch: {
    $route() {
      this.load();
    },
  },
  async mounted() {
    this.logger = new Logger("SettingsTab");
    this.logger.info("mounted", "exit");

    const orgID = this.$route.params.orgId || "private";
    AnalyticsService.log("AppSettings", orgID, 'view')
  },
};
</script>

