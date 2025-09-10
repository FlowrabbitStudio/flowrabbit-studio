<template>
  <BaseDialog
    title="Add Team Member"
    :subtitle="subTitle"
    :labels="labels"
    ref="dialog"
    @confirmAction="handleAddUser"
  >
    <div  class="MatcTeamDialogContent">
      <div class="MatcDialogContent">
      
              <Combo
                :value="email"
                :hints="options"
                placeholder="Enter the email"
                :formControl="true"
                ref="input"
                cssClass="input"
                :fireEmpty="true"
                @change="onChangeEmail"
              />
        
          <div class="MatcError MatcMarginTop" v-is="errorMessage">
            {{ errorMessage }}
          </div>
     
      </div>
    </div>
  </BaseDialog>
</template>

<script>
import BaseDialog from "./BaseDialog.vue";
import Services from "@/services/Services";
import Combo from "common/Input.vue";

export default {
  name: "AddTeamDialog",
  props: ["appID", "onUserAdded", "team"],
  mixins: [],
  data() {
    return {
      email: "",
      orgName:'',
      errorMessage: "",
      isSaving: false,
      labels: {
        confirm: "Add User",
        cancel: "Cancel",
        type: "primary"
      },
      options: []
    };
  },
  components: {
    Combo,
    BaseDialog
  },
  computed: {
    subTitle() {
      if (this.orgName) {
        return `(${this.orgName})`;
      }
      return "";
    }
  },
  methods: {
    handleClose() {
      this.$refs.dialog.close();
    },
    onChangeEmail(value) {
      this.email = value;
    },
    async handleAddUser() {
      if (this.isSaving) return;

      const emailStr = this.email.trim();
      if (emailStr === "") {
        this.errorMessage = "Email cannot be empty!";
        return;
      }

      let found = this.team.find((t) => t.email === this.email);
      if (found) {
        this.errorMessage = "User already in team";
        return;
      }

      this.isSaving = true;
      this.$refs.dialog.setLoading(true); // Start loading
      const user = { email: this.email, permission: 2 };
      const result = await Services.getModelService().createTeam(this.appID,user);
  
      this.isSaving = false;
      this.$refs.dialog.setLoading(false); // End loading
      if (result.type === "error") {
        this.handleAddUserError(result.errors[0]);
      } else {
        this.onUserAdded();
        this.handleClose();
      }
 
    },
    handleAddUserError(errorCode) {
      if (errorCode === 'apps.team.member.add.error.not.in.org') {
        this.errorMessage = "The user is not member of the Organization";
      } else if (errorCode === "apps.team.member.add.error.email") {
        this.errorMessage = "No user is registered with the email!";
      } else if (errorCode === "apps.team.member.add.error.read") {
        this.errorMessage = "You can only read the app!";
      } else {
        this.errorMessage = "Something went wrong!";
      }
    },
    show(suggestions, orgName) {
      this.options = suggestions;
      this.orgName = orgName
      this.errorMessage = ""
      this.email = ""
      this.$refs.dialog.show()
      setTimeout(() => {
        if (this.$refs && this.$refs.input) {
          this.$refs.input.focus();
        }
      }, 100);
    }
  },
  mounted() {
   
  },
};
</script>

<style scoped>
</style>
