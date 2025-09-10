<template>
    <BaseDialog
      title="Add Team Member from Organization"
      subtitle=""
      :labels="labels"
      ref="dialog"
      @confirmAction="handleAddUser"
    >
      <div class="MatcTeamDialogContent">
        <div class="MatcDialogContent">
          
            <div class="MatcTeamDialogList">
                <div v-for="option in options" :key="option.id" class="MatcTeamCheckbox">
                    <Checkbox v-model="selected[option.value]" :label="option.label" />
                </div>
            </div>
               
          
            <div class="MatcError MatcMarginTop" v-if="errorMessage">
              {{ errorMessage }}
            </div>
        
        </div>
      </div>
    </BaseDialog>
  </template>


  <script>
  import BaseDialog from "./BaseDialog.vue";
  import Services from "@/services/Services";
  import Checkbox from "../../common/CheckBox";
  
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
          confirm: "Add Users",
          cancel: "Cancel",
          type: "primary"
        },
        selected: {},
        options: []
      };
    },
    components: {
    Checkbox,
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

        const selected = Object.keys(this.selected).filter((key) => this.selected[key]);

        if (selected.length === 0) {
          this.errorMessage = "Please select at least one user!";
          return;
        }

        this.isSaving = true;
        this.$refs.dialog.setLoading(true); // Start loading
        let errors = []
        for (let email of selected){
          const user = { email: email, permission: 2 };
          const result = await Services.getModelService().createTeam(this.appID,user);
          if (result.type === "error") {
            errors.push(result.errors[0])
          }
        }

        if (errors.length > 0) {
          this.handleAddUserError(errors[0]);
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
        this.isSaving = false
        this.errorMessage = ""
        this.selected = {}
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
  