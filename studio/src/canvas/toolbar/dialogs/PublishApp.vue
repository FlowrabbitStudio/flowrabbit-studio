<template>
  <div class="MatcFlexDialog">

    <div class="MatcFlexDialogHeader">
      Publish
    </div>

    <div class="MatcFlexDialogContent">
      <template v-if="settings.mode">
        <div class="form-group">
          <label>Access</label>
          <RadioBoxList 
            class="MatcMarginTopXS" 
            :qOptions="options" 
            :qValue="settings.mode" 
            @change="setType" 
            qCols="2"></RadioBoxList>
        </div>

        <div class="form-group MatcMarginTopL" v-if="settings.mode === 'password'">
          <label>Password</label>
          <input type="text" class="form-control" @change="isDirty = true" v-model="settings.password"
              placeholder="Users have to enter this password" />
        </div>

        <!-- <div class="form-group MatcMarginTopL" v-if="settings.mode !== 'forbidden' && organizations">
          <label>Organization</label>

          <RadioBoxList class="MatcMarginTopXS" :qOptions="organizations" :qValue="settings.orgID" @change="setOrg" qCols="2"></RadioBoxList>
        </div> -->

        <div class="form-group MatcMarginTopL" v-if="settings.mode !== 'forbidden'">
          <label>Name</label>
          <input type="text" class="form-control" @change="isDirty = true" v-model="settings.name"
            placeholder="Enter the name where app will be reacheable" />
        </div>
    
        <div class="form-group MatcMarginTopL" v-if="settings.mode !== 'forbidden' && settings.name">
          <label>URL</label>
          <p class="MatcHint">
            The app will be reacheable under the following link.
          </p>
          <div class="MatcMarginTopXS">
            <a :href="url" target="_blank">{{ url }}</a>
          </div>
          <div class="MatcInfoBox MatcMarginTopXS">
            The links work only once you have saved the publish settings.
          </div>
        </div>

      </template>
    </div>
    <div class="MatcFlexDialogFooter">
      <div class="MatcButtonBarDialog">
          <span class="MatcError" v-show="errorMSG && errorMSG.length > 0">
                  {{ errorMSG }}
          </span>
        
          <div class="MatcLinkButtonDialog" @click="cancel">Cancel</div>
          <div class="MatcButton MatcButtonPrimary" @click="save" :disabled="!isDirty">Save</div>    
        </div>
    </div>

  </div>
</template>
<script>
import Logger from "common/Logger";
import DojoWidget from "dojo/DojoWidget";
import Services from "services/Services";
import RadioBoxList from 'common/RadioBoxList';

export default {
  name: "PublishApp",
  mixins: [DojoWidget],
  props: ["app", "user", "invitations", "onCancel"],
  data: function () {
    return {
      errorMSG: '',
      isDirty: false,
      organizations: false,
      settings: {},
      options: [
        { value: 'forbidden', label: "Not reachable" },
        { value: 'public', label: "Public" },
        { value: 'team', label: "Team" },
        { value: 'password', label: "Password" },
        { value: 'organization', label: "Organization" }
      ]
    };
  },
  components: {
    RadioBoxList
  },
  computed: {
    url() {
      return `${this.domain}/${this.settings.name}.html`
    },
    organizationName() {
      if (this.organizations && this.settings) {
        const org = this.organizations.find(o => o.value === this.settings.orgID)
        if (org) {
          return org.name
        }
      }
      return "private"
    },
    domain() {
      if (this.organizations && this.settings) {
        const org = this.organizations.find(o => o.value === this.settings.orgID)
        if (org && org.domain) {
          return org.domain
        }
      }
      return `${Services.getConfig().app_URL}/${this.organizationName}`
    }
  },
  methods: {
    setApp(app) {
      this.app = app;
    },
    setUser(user) {
      this.user = user;
    },
    setInvitations(invitations) {
      this.invitations = invitations;
    },
    setOnCancel(fn) {
      this.onCancel = fn
    },
    setType(o) {
      this.settings.mode = o
      this.isDirty = true
    },
    setLoading(loading) {
      this.loading = loading;
    },
    setSettings(settings) {
      this.settings = settings
    },
    setOrg(o) {
      this.settings.orgID = o
      this.isDirty = true
    },

    getChange() {
      const result = {
        mode: this.settings.mode,
        orgID: this.settings.orgID
      }
      if (this.oldName !== this.settings.name) {
        result.name = this.settings.name
      }
      if (result.mode === 'password') {
        result.password = this.settings.password
      }
      return result
    },
    async setWidget() {
      this.logger = new Logger("SettingsTab");
      if (this.app) {
        // FIXME: add here edit token
        this.settings = await Services.getModelService().findPubSettings(this.app.id)
        const orgs = await Services.getOrgService().findUserOrganizations(this.user.id)

        // we never show private now
        const allorgs = orgs.filter(o => o.name !== "private")
          .map(o => {
            return {
                value: o.id ? o.id : o._id,
                label: o.displayName ? o.displayName : o.name,
                domain: o.domains && o.domains[0],
                name: o.name
            }      
        })
    
        if (!this.settings.orgID) {
          this.logger.error("setWidget", "no orgID");
        } else {
          // we could filter here and make somehow the options cooler
        }

   
        this.organizations = allorgs;
        this.oldName = this.settings.name
      }
    },

    async save() {
      this.errroMsg = ''
      if (!this.isDirty) {
        this.logger.log(-1, "save", "exit > no change");
        return
      }

      const res = await Services.getModelService().updatePubSettings(this.app.id, this.getChange());

      if (res.type === "error") {
        this.errroMsg = this.getNLS('app.public.errorNotUnique')
        return
      } else {
        this.oldName = this.settings.name
        // update app for icons and sp
        await Services.getModelService().updateAppProps(this.app.id, {
          publicOrgName: this.organizationName,
          publicName: this.settings.name,
          publicType: this.settings.mode
        });
        this.isDirty = false
        this.app.publicType = this.settings.mode
        this.app.publicName = this.settings.name
      }
      // wait a little, otherwise it is very sudden
      setTimeout(() => {
        this.emit("save")
      }, 100)

    },

    cancel() {
      this.emit("cancel")
    }
  },
  watch: {
    $route() {
      this.load();
    }
  }
};
</script>