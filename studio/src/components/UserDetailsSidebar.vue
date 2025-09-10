<template>
  <transition name="slide-fade">
    <div class="overlay" v-if="showDetails" @click.self="closeSidebar">
      <div class="user-details-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">User Details</span>
          <button class="close-btn" @click="closeSidebar">&times;</button>
        </div>
        <div class="sidebar-content">
          <div class="user-info">
            <div :class="['user-image', !userImage ? 'placeholder' : '']">
              <img v-if="userImage" :src="userImage" alt="User Image" />
              <span v-else class="mdi mdi-account-circle"></span>
            </div>
            <div class="user-details-text">
              <h2>{{ user.name }} {{ user.lastname }}</h2>
              <p class="email">{{ user.email }}</p>
            </div>
          </div>
          <div>
            <div class="role-container">
              <div class="MatcFlex MatcBetween" v-if="!editingRole">
                <span class="role">{{ getRole(user.permission) }}</span>
                <button
                  v-if="validateEditableUser"
                  class="edit-role-btn"
                  @click="editRole"
                >
                  <span class="mdi mdi-pencil"></span>
                </button>
              </div>
              <div v-if="editingRole && validateEditableUser" class="edit-role">
                <DropDownButton v-model="newRole" :options="roles" />
                <div class="savebuttons">
                  <button class="cancel-role-btn" @click="cancelEditRole">
                    <span class="">X</span>
                  </button>
                  <button class="save-role-btn" @click="saveRole">
                    <span class="mdi mdi-content-save"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="extra-info">
            <div class="info-item">
              <strong>Joined:</strong>
              <span>{{ formatDate(user.created) }}</span>
              <span class="relative-time">{{ timeSince(user.created) }}</span>
            </div>
            <div class="info-item">
              <strong>Last Active:</strong>
              <span>{{ formatDate(user.lastlogin) }}</span>
              <span class="relative-time">{{ timeSince(user.lastlogin) }}</span>
            </div>
          </div>
        </div>
        <div v-if="validateEditableUser" class="sidebar-footer">
          <div v-if="confirmingRemoveUser" class="confirm-remove-user">
            <p>Are you sure you want to remove this user?</p>
            <div class="action-buttons">
              <button class="cancel-btn" @click="cancelRemoveUser">
                <span class="mdi">&times;</span> No
              </button>
              <button class="confirm-btn" @click="removeUser">
                <span class="mdi mdi-check"></span> Yes
              </button>
            </div>
          </div>
          <button v-else class="remove-user-btn" @click="confirmRemoveUser">
            <span class="mdi mdi-delete"></span> Remove User
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>



<script>
import { getRoles } from "src/util/Util.js";
import { getRolesWithLabels } from "src/util/Util.js";
import DropDownButton from "page/DropDownButton";
import Services from "services/Services";
import { mapState } from "vuex";

export default {
  name: "UserDetailsSidebar",
  props: ["currentUser", "user", "showDetails"],
  data() {
    return {
      editingRole: false,
      newRole: this.user.permission,
      confirmingRemoveUser: false,
    };
  },
  components: {
    DropDownButton: DropDownButton,
  },
  computed: {
    ...mapState(["selectedOrg"]),
    roles() {
      return getRolesWithLabels();
    },
    userImage() {
      return this.user && this.user.image
        ? `rest/user/${this.user.id}/images/${this.user.name}_${this.user.lastname}/${this.user.image}`
        : "";
    },
    validateEditableUser() {
      let valid = false;
      if (
        this.user &&
        this.user.id &&
        this.currentUser &&
        this.currentUser.id &&
        this.user.id !== this.currentUser.id
      ) {
        valid = true;
      }
      return valid;
    },
  },
  methods: {
    closeSidebar() {
      this.$emit("close");
    },
    getRole(permission) {
      const roles = getRoles();
      return roles[permission] || "Unknown";
    },
    formatDate(timestamp) {
      if (!timestamp) return "N/A";
      const date = new Date(timestamp);
      return date.toLocaleDateString(); // Only show the date
    },
    timeSince(date) {
      if (!date) return "N/A";
      const now = new Date();
      const past = new Date(date);

      if (isNaN(past.getTime())) {
        return "Invalid date";
      }

      const seconds = Math.floor((now - past) / 1000);

      let interval = Math.floor(seconds / 31536000);
      if (interval > 1) return interval + " years ago";

      interval = Math.floor(seconds / 2592000);
      if (interval > 1) return interval + " months ago";

      interval = Math.floor(seconds / 86400);
      if (interval > 1) return interval + " days ago";

      interval = Math.floor(seconds / 3600);
      if (interval > 1) return interval + " hours ago";

      interval = Math.floor(seconds / 60);
      if (interval > 1) return interval + " minutes ago";

      return Math.floor(seconds) + " seconds ago";
    },
    editRole() {
      this.newRole = this.user.permission;
      this.editingRole = true;
    },
    async saveRole() {
      try {
        await Services.getOrgService().updateOrganizationUser(
          this.selectedOrg.id,
          this.user.id,
          { permission: this.newRole }
        );
        this.$emit("role-updated");
        this.editingRole = false;
      } catch (e) {
        console.log(e);
      }
    },
    cancelEditRole() {
      this.newRole = this.user.permission;
      this.editingRole = false;
    },
    confirmRemoveUser() {
      this.confirmingRemoveUser = true;
    },
    removeUser() {
      this.$emit("remove-user", this.user);
      this.confirmingRemoveUser = false;
    },
    cancelRemoveUser() {
      this.confirmingRemoveUser = false;
    },
  },
};
</script>
<style scoped>
@import "style/scss/userDetailsSidebar.scss";
</style>
