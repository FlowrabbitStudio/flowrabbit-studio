<template>
  <div class="MatcSettings">
    <section class="MatcSection" aria-label="Workspace Details">
      <div class=" MatcCard">
        <div class="MatcCardHeader">
          <span>Details</span>
        </div>
        <div class="MatcCardContent">
          <div class="MatcMarginBottom">
            <div class="form-group">
              <label for="orgName" class="form-label ">Organization Name</label>
              <div class="form-group-button-row">
                <input type="text" id="orgName" :value="organizationName" @change="onChangeOrgName" class="form-control"
                  placeholder="Enter organization name" :disabled="isNameLocked" />
                <button class="MatcButton update-button" @click="updateProfile">Update Organization Name</button>
              </div>
            </div>
          </div>
        </div>
        

      </div>
    </section>
  </div>

</template>

<script>
import { mapState, mapActions } from "vuex";
import dayjs from "dayjs";
//import Services from "services/Services";
export default {
  name: "OrganizationInfo",
  data() {
    return {
      organizationName: "",
      customDomain: "",
      isNameLocked: false,
      isDomainLocked: false,
    };
  },
  computed: {
    ...mapState(["selectedOrg"]),

    formattedCreatedDate() {
      const created = this.selectedOrg.created;
      if (created) {
        const date = dayjs(created);
        return date.format("MMMM D, YYYY [at] h:mm A");
      }
      return "N/A";
    },
  },
  components: {  },
  methods: {
    ...mapActions(["updateSelectedOrg"]),
    onChangeOrgName(event) {
      const value = event.target.value;
      if (value !== this.selectedOrg.displayName) {
        this.organizationName = value;
      }
    },
    closeRequestDomainDialog() {
      this.$refs.requestDomainDialog.close();
    },
    showDomainModal() {
      this.$refs.requestDomainDialog.show();
    },
    validateDomainForm() {
      this.errors = {};
      if (!this.newDomain.name) {
        this.errors.name = "Domain name is required.";
      }
      if (!this.newDomain.reason) {
        this.errors.reason = "Reason for change is required.";
      }
      if (!this.newDomain.contactEmail) {
        this.errors.contactEmail = "Contact email is required.";
      }
      return Object.keys(this.errors).length === 0;
    },
    submitDomainChange(domain) {
      this.newDomain = domain;
      if (this.validateDomainForm()) {
        this.showMessage("Domain change request submitted!", false);
        this.closeRequestDomainDialog();
      } else {
        this.showMessage("Please correct the errors and try again.", true);
      }
    },
    editDomain() {
      // Logic for editing the domain
      console.log("Edit domain clicked");
    },
    async updateProfile() {
      const org = {
        id: this.selectedOrg.id,
        displayName: this.organizationName,
      };
      console.log("updateProfile -> org", org);
      // await Services.getOrgService().updateOrganizationName(org.id, org);
    },
  },
  mounted() {
    this.organizationName = this.selectedOrg.displayName || this.selectedOrg.name;
    this.customDomain = this.selectedOrg.customDomain;
    this.isNameLocked = this.selectedOrg.isNameLocked;
    this.isDomainLocked = this.selectedOrg.isDomainLocked;
  },
};
</script>

<style scoped>

.update-button {
  min-width: fit-content;
}

.info-label,
.form-helper {
  font-size: 12px;
  color: #666;
}

.info-label {
  font-weight: 500;
}


</style>
