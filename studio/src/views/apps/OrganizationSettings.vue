<template>
  <div class="organization-settings container MatcCardContainerXS">
    <div class="MatcWorkspaceTabs">
        <div class="MatcWorkspaceTab" :class="{ 'active': activeTab === 'org-info' }" @click="activeTab = 'org-info'">
          <QIcon size="20" icon="Building"></QIcon><span>Organization Info</span>
        </div>

        <div class="MatcWorkspaceTab" :class="{ 'active': activeTab === 'apps' }" @click="activeTab = 'apps'">
          <QIcon size="20" icon="Money"></QIcon><span>Published Apps</span>
        </div>
    </div>

    <!-- Tab Panels -->
    <div class="">
      <div v-if="activeTab === 'org-info'">
        <OrganizationInfo :selectedOrg="selectedOrg"/>
      </div>

      <div v-if="activeTab === 'billing'">
        <BillingSection :selectedOrg="selectedOrg" :user="user"/>
      </div>



      <div v-if="activeTab === 'apps'">
        <OrganizationApps :selectedOrg="selectedOrg"/>
      </div>
    </div>
    <!-- Success/Error Messages -->
    <transition name="fade">
      <div v-if="message" class="message" :class="{ 'error-message': isError, 'success-message': !isError }" role="alert">
        {{ message }}
      </div>
    </transition>

    <!-- Domain Request Dialog (Optional place) -->
    <!-- If you want this at the root level instead of inside DomainSettings -->
    <RequestDomain ref="requestDomainDialog" @close="closeRequestDomainDialog" @request-domain="submitDomainChange" />
  </div>
</template>

<script>
import OrganizationInfo from "./OrganizationInfo.vue";

import OrganizationApps from "./OrganizationApps.vue";
import RequestDomain from "@/components/dialogs/RequestDomainDialog.vue";
import { mapState } from "vuex";
import QIcon from "page/QIcon";

export default {
  name: "OrganizationSettings",
  components: {
    OrganizationInfo,
    RequestDomain,
    QIcon,
    OrganizationApps    
  },
  props: {
  },
  data() {
    return {
      activeTab: "org-info",
      message: "",
      isError: false,
    };
  },
  computed: {    
    ...mapState(["selectedOrg", "user"]),
  },
  methods: {
    handleDomainRequest() {
      // Called from DomainSettings child component
      this.showMessage("Domain request triggered!", false);
    },
    closeRequestDomainDialog() {
      this.$refs.requestDomainDialog.close();
    },
    submitDomainChange(domain) {
      // Example: handle domain request
      this.showMessage(`Domain change request submitted for ${domain.name}`, false);
      this.closeRequestDomainDialog();
    },
    showMessage(msg, isError = false) {
      this.message = msg;
      this.isError = isError;
      setTimeout(() => {
        this.message = "";
      }, 3000);
    },
  },
};
</script>

<style scoped>
.organization-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Example fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Messages styling */
.message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  font-weight: 500;
  text-align: center;
}
.error-message {
  background: #f8d7da;
  color: #721c24;
}
.success-message {
  background: #d4edda;
  color: #155724;
}
</style>
