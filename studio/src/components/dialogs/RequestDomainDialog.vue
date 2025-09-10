<template>
  <BaseDialog
    title="Request Domain Change"
    subtitle="Please provide the details below"
    @confirmAction="confirmRequest"
    :labels="labels"
    ref="dialog"
  >
    <div>
      <div class="form-group MatcMarginTop">
        <label>Organization</label>
        <p><strong>{{ selectedOrg.name }}</strong></p>
      </div>
      <div class="form-group MatcMarginTop">
        <label>New Domain Name</label>
        <input v-model="domain.name" type="text" class="form-control" placeholder="Enter new domain" />
      </div>
      <div class="form-group MatcMarginTop">
        <label>Reason for Change</label>
        <input v-model="domain.reason" type="text" class="form-control" placeholder="Enter reason" />
      </div>
      <div class="form-group MatcMarginTop">
        <label>Contact Email</label>
        <input v-model="domain.contactEmail" type="email" class="form-control" placeholder="Enter contact email" />
      </div>
    </div>
  </BaseDialog>
</template>

<style lang="scss" scoped>
.form-control {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
</style>

<script>
import BaseDialog from "./BaseDialog.vue";
import { mapState } from "vuex";

export default {
  name: "RequestDomain",
  components: {
    BaseDialog,
  },
  data() {
    return {
      domain: {
        name: "",
        reason: "",
        contactEmail: "",
      },
      labels: {
        confirm: "Submit Request",
      },
    };
  },
  computed: {
    ...mapState(["selectedOrg"]),
  },
  methods: {
    confirmRequest() {
      if (this.validateForm()) {
        // Emit event to parent component with the domain change details
        this.$emit("on-request-domain", {
          organizationId: this.selectedOrg.id,
          ...this.domain,
        });

        // Close the dialog
        if (this.$refs && this.$refs.dialog) this.$refs.dialog.close();
      }
    },
    show() {
      // Reset the form fields before showing the dialog
      this.resetForm();
      this.$refs.dialog.show();
    },
    validateForm() {
      // Basic validation for required fields
      if (!this.domain.name || !this.domain.reason || !this.domain.contactEmail) {
        alert("All fields are required.");
        return false;
      }
      return true;
    },
    resetForm() {
      this.domain.name = "";
      this.domain.reason = "";
      this.domain.contactEmail = "";
    },
  },
};
</script>
