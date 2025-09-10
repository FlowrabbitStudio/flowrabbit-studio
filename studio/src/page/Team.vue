<template>
  <div class="MatcTeam">
    <div class="MatcTeamContainer" data-dojo-attach-point="cntr"></div>
    <div v-if="team">
      <AddTeamDialog ref="dialog" :appID="appID" :onUserAdded="onUserAdded" :team="team" />
      <AddTeamOrgDialog ref="orgDialog" :appID="appID" :onUserAdded="onUserAdded" :team="team" />
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import touch from "dojo/touch";
import Logger from "common/Logger";
import Dialog from "common/Dialog";
import _Tooltip from "common/_Tooltip";
import DomBuilder from "common/DomBuilder";
import RadioBoxList from "common/RadioBoxList";
import Util from "core/Util";

import { mapState } from "vuex";

import Services from "services/Services";
import AddTeamDialog from "../components/dialogs/AddTeamDialog.vue";
import AddTeamOrgDialog from "../components/dialogs/AddTeamOrgDialog.vue";

export default {
  name: "Team",
  mixins: [Util, _Tooltip, DojoWidget],
  props: ["appID", "userID"],
  data: function () {
    return {
      isSaving: false,
      suggestions: [],
      showAddDialog: false,
      team: {}
    };
  },
  computed: {
    ...mapState(["selectedOrg"])
  },
  components: { AddTeamDialog,AddTeamOrgDialog },
  methods: {
    postCreate() {
      this.logger = new Logger("Team");
      this.db = new DomBuilder();
      if (this.appID && this.userID) {
        this.load();
      }
    },

    async load() {
      let team = await Services.getModelService().findTeam(this.appID);
      this.setTeamLoaded(team);
      return team;
    },

    setTeamLoaded(team) {
      this.team = team;
      this.render();
    },

    render() {
      this.cleanUp();
      const div = document.createElement("div");
      this.plus = this.renderPlus(div);
      this.tempOwn(on(this.plus, touch.press, lang.hitch(this, "showAdd", this.plus)));
      for (let i = 0; i < this.team.length; i++) {
        const user = this.team[i];
        this.renderUser(div, user);
      }
      this.cntr.appendChild(div);
    },

    renderPlus(div) {
      const item = this.db.div("MatcTeamItem ").build(div);
      const plus = this.db.div("MatcUserAdd").build(item);
      this.db.span("mdi mdi-plus MatcMiddle").build(plus);
      return plus;
    },

    renderUser(div, user) {
      const item = this.db.div("MatcTeamItem ").build(div);
      const top = this.db.div("").build(item);
      this.createUserImage(user, top);
      this.tempOwn(on(item, touch.press, lang.hitch(this, "showEdit", top, user)));
      this.addTooltip(top, this.getUserName(user));
    },

    async showAdd() {
      if (this.selectedOrg.id !== "private") {
        const items = await Services.getOrgService().findTeamUsersByOrganization(this.selectedOrg.id);    
        const suggestions = this.getTeamSuggestions(items);    
        this.$refs.orgDialog.show(suggestions, this.selectedOrg.name);
      } else {
        const items = await Services.getModelService().findTeamSuggestions(this.appID);
        const suggestions = this.getTeamSuggestions(items);
        this.$refs.dialog.show(suggestions)
      }
    },

    getTeamSuggestions (data) {
      const ids = {};
      for (let i = 0; i < this.team.length; i++) {
        ids[this.team[i].id] = true;
      }

      const hints = [];
      for (let i = 0; i < data.length; i++) {
        const user = data[i];
        if (!ids[user.id]) {
          const option = { label: "", value: user.email };

          if (user.name) {
            option.label += user.name + " ";
          }

          if (user.lastname) {
            option.label += user.lastname + " ";
          }

          if (option.label.length > 0) {
            option.label += " - ";
          }

          option.label += user.email;
          if (user.image) {
            option.image = user.image;
          }
          hints.push(option);
        }
      }
      return hints;
    },

    showEdit (item, user) {
      var popup = this.db
        .div("MatcTeamDialog MatcTeamDialogEdit MatcPadding MatcActionBox")
        .build();

      var cntr = this.db.div("container").build(popup);
      var row = this.db.div("columns").build(cntr);

      var left = this.db.div("column is-4").build(row);
      this.createUserImage(user, left);

      var right = this.db.div("column is-8").build(row);

      var lbl = this.db
        .div("MatcTeamUserName", this.getUserName(user))
        .build(right);
      var radio = null;
      if (user.permission == 3) {
        var label = this.db.div().build(right);
        css.add(label, "MatcHint MatcMarginTop");
        label.innerHTML = "Is the owner!";
      } else {
        lbl.innerHTML += " can:";
        radio = this.$new(RadioBoxList);
        radio.setOptions([
          { label: "Write", value: 2, css: "" },
          { label: "Read", value: 1, css: "" },
        ]);
        radio.placeAt(right);
        radio.setValue(user.permission);
      }

      row = this.db.div("columns").build(cntr);
      left = this.db.div("column is-4").build(row);
      right = this.db.div("column buttons").build(cntr);

      var d = new Dialog();

      if (user.permission != 3) {
        let write = this.db.div("button is-primary", "Save").build(right);
        let cancel = this.db.a("button is-text", "Cancel").build(right);
        let remove = this.db.a("button is-text", "Remove").build(right);
        d.own(on(cancel, touch.press, lang.hitch(d, "close")));
        d.own(
          on(
            write,
            touch.press,
            lang.hitch(this, "changePermission", user, radio, d)
          )
        );
        d.own(
          on(
            remove,
            touch.press,
            lang.hitch(this, "removeUser", user, radio, d)
          )
        );
      } else {
        let cancel = this.db.div("button is-primary", "Close").build(right);
        d.own(on(cancel, touch.press, lang.hitch(d, "close")));
      }
      d.popup(popup, item);
    },

    async addUser(input, error, dialog, bar, e) {
      this.logger.log(-1, "addUser", "enter");
      this.stopEvent(e);

      /**
       * Make sure we do not add twice!!
       */
      let email = input.getValue();
      let found = this.team.filter((t) => t.email === email);
      if (found.length > 0) {
        this.logger.error("addUser", "EXIT > User already in team");
        dialog.close();
        return;
      }

      /**
       * Sometimes we users click here two times,
       * which causes ACL errors
       */
      if (this.isSaving) {
        this.logger.error("addUser", "EXIT > Is saving");
        return;
      }
      this.isSaving = true;
      var permission = 2;
      var user = { email: input.getValue(), permission: permission };
      let result = await Services.getModelService().createTeam(
        this.appID,
        user
      );

      this.isSaving = false;
      // var result = this._doPost("/rest/apps/" +this.appID + "/team/", user);
      if (result.type == "error") {
        if (result.errors[0] == "apps.team.member.add.error.email") {
          css.remove(error, "MatcErrorLabelEmpty");
          error.innerHTML = "No user is registered with the email!";
        }
        if (result.errors[0] == "apps.team.member.add.error.read") {
          css.remove(error, "MatcErrorLabelEmpty");
          error.innerHTML = "You can only read the app!";
        }
        dialog.shake();
      } else {
        const team = await this.load();
        await Services.getModelService().updateAppProps(this.appID, {
          teamMembers: team.length,
        });
        dialog.close();
      }
    },

    onUserAdded() {
      this.load();
    },

    closeAddDialog() {
      this.showAddDialog = false;
    },

    async changePermission(user, radio, dialog) {
      user.permission = radio.getValue();
      dialog.close();
      radio.destroy();
      await Services.getModelService().updateTeam(this.appID, user);
      this.load();
    },

    async setPermission(permisson, user) {
      user.permission = permisson;
      await Services.getModelService().createTeam(this.appID, user);
      // this._doPost("/rest/apps/" +this.appID + "/team/", user);
      this.load();
    },

    async removeUser(user, radio, dialog) {
      await Services.getModelService().deleteTeam(this.appID, user);
      // this._doDelete("/rest/apps/" +this.appID + "/team/" +  user.id + ".json");
      dialog.close();
      radio.destroy();
      const team = await this.load();
      await Services.getModelService().updateAppProps(this.appID, {
        teamMembers: team.length,
      });
    },

    cleanUp: function () {
      this.cleanUpTempListener();
      this.cntr.innerHTML = "";
    },
  },
  mounted() { },
};
</script>