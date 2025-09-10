<template>
  <div class="MatcMainMenu">
    <div class="MatcMainMenuSection">
      <a class="MatcMainMenuItem" href="/#/">
        <img src="/img/logo-long-w-s.png" width="120" />
      </a>
    </div>
    <div class="MatcMainMenuCenter">
      <div class="MatcCenter">
        <div
          id="workspaceDropdown"
          class="dropdown"
          :class="{ 'is-active': isDropdownActive }"
        > 
          <div class="dropdown-trigger">
            <button
              class="MatcOrganizationMenu button"
              aria-haspopup="true"
              aria-controls="dropdown-menu"
              @click="toggleDropdown"
            >
              <span v-if="showOrgname">{{ orgName(selectedOrg) }}</span>
              <span v-else>Loading</span>
              <span class="icon is-small">
                <i class="mdi mdi-chevron-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
          <transition name="fade">
            <div
              v-if="isDropdownActive"
              class="MatcOrganizationMenu dropdown-menu"
              id="dropdown-menu"
              role="menu"
              ref="menudropdown"
            >
              <div class="dropdown-content">
                <a
                  v-for="(org, index) in organizations"
                  :key="index"
                  @click="updateOrganization(org)"
                  :class="[
                    'dropdown-item',
                    { 'is-active': org.id === selectedOrg.id },
                  ]"
                >
                  {{ orgName(org) }}
                </a>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <div class="MatcMainMenuSection">
      
  
      <div class="dropdown" :class="{ 'is-active': isAccountDropdownActive }">
        <div class="dropdown-trigger">
          <div id="avatarDropdown" class="MatcMainMenuItem">
            <button
              @click="toggleAccountDropdown"
              style="background: none; border: none"
            >
              <img
                v-if="userImage"
                :src="userImage"
                aria-haspopup="true"
                aria-controls="dropdown-menu"
                class="AvatarDropdown"
              />
              <div
                v-else
                aria-haspopup="true"
                aria-controls="dropdown-menu"
                class="AvatarFallback"
              >
                {{ userInitial }}
              </div>
            </button>
            <transition name="fade">
              <div
                v-if="isAccountDropdownActive"
                class="AvatarDropdownMenu dropdown-menu"
                id="dropdown-menu"
                role="menu"
              >
                <div class="dropdown-content" ref="accountdropdown">
                  <div class="dropdown-profile">
                    <img
                      v-if="userImage"
                      :src="userImage"
                      alt="User Avatar"
                      class="profile-avatar"
                    />
                    <div v-else class="profile-avatar AvatarFallback">
                      {{ userInitial }}
                    </div>
                    <div class="profile-info">
                      <p class="profile-name">
                        {{ user.name }} {{ user.surname }}
                      </p>
                      <p class="profile-email">{{ user.email }}</p>
                    </div>
                  </div>
                  <hr class="dropdown-divider" />
                  <a
                    class="dropdown-item"
                    @click="navigate('#/my-account.html')"
                  >
                    <i class="fas fa-user"></i> My Account
                  </a>
                  <hr class="dropdown-divider" />
                  <a class="dropdown-item" @click="logout">
                    <i class="fas fa-sign-out-alt"></i> Logout
                  </a>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
      <LanguagePicker @change="setLanguage" v-if="hasLanguage" />
    </div>
  </div>
</template>

<style>
@import url("../style/menu.css");
@import url("../style/canvas/commandbar.css");

/* Add your styles for AvatarDropdown */
.AvatarDropdown {
  cursor: pointer;
  /* Add any other styles you need */
}
</style>

<script>
import Services from "services/Services";
import Logger from "common/Logger";
import hash from "dojo/hash";
import LanguagePicker from "page/LanguagePicker";

import ConstantsUtil from "../util/ConstantsUtil.js";
import { mapState, mapActions } from "vuex";

export default {
  name: "Header",
  data() {
    return {
      isDropdownActive: false,
      hasLanguage: false,
      isAccountDropdownActive: false,
      organizationMap: [],
      userImage: "",
      organizations: [],
    };
  },
  components: {
    LanguagePicker,
  },
  computed: {
    ...mapState(["user", "selectedOrg"]),
    userImageSrc() {
      return this.userImage;
    },
    userInitial() {
      return this.user.email.charAt(0).toUpperCase();
    },
    showOrgname () {
      return this.selectedOrg.id !== ConstantsUtil.DEFAULT_ORG_ID;
    }
  },
  methods: {
    ...mapActions(["updateSelectedOrg", "loadApps", "loadSummaries"]),
    navigate(url) {
      hash(url);
      this.isAccountDropdownActive = false;
    },
    orgName(org) {
      if (org && org.id === ConstantsUtil.DEFAULT_ORG_ID) {
        return ConstantsUtil.DEFAULT_ORG_LABEL;
      }
      if (org.displayName) {
        return org.displayName
      }
      return org.name;
    },
    setLanguage(language) {
      this.logger.log(-1, "setLanguage", "entry", language);
      Services.getUserService().setLanguage(language);
      this.$root.$i18n.locale = language;
      this.$root.$emit("Success", this.$i18n.t("common.language-changed"));
    },
    logout() {
      this.logger.log(2, "logout", "entry");
      Services.getUserService().logout();
      this.$emit("logout", Services.getUserService().GUEST);
      hash("/", true);
    },
    async updateOrganization(org) {
      this.isDropdownActive = false;
      this.$router.push({ path: `/apps/${org.id}.html` }).catch((err) => {
        console.log(err);
      });
      await this.updateSelectedOrg(org);
      await this.loadSummaries();
      await this.loadApps();
    },
    toggleDropdown() {
      this.isDropdownActive = !this.isDropdownActive;
    },
    toggleAccountDropdown() {
      this.isAccountDropdownActive = !this.isAccountDropdownActive;
    },
    closeDropdown(event) {
      if (
        this.$refs.menudropdown &&
        !this.$refs.menudropdown.contains(event.target)
      ) {
        this.isDropdownActive = false;
      }
    },
    closeAccountDropdown(event) {
      if (
        this.$refs.accountdropdown &&
        !this.$refs.accountdropdown.contains(event.target)
      ) {
        this.isAccountDropdownActive = false;
      }
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.isDropdownActive = false;
        this.isAccountDropdownActive = false;
      }
    },
  },
  async mounted() {
    this.logger = new Logger("Header");
    this.logger.log(7, "mounted", "exit >> " + this.user.email);
    if (this.user) {
      this.organizations = await Services.getOrgService().findUserOrganizations(
        this.user.id
      );
      this.organizations.sort((a, b) => a.name.localeCompare(b.name))
      if (this.organizations && this.organizations.length > 0) {
        this.organizationMap = this.organizations.map((org) => {
          return {
            value: org.id,
            label: org.name,
          };
        });
        if (this.user.role !== "adXmin") {
          this.organizations = this.organizations.filter(
            (org) => org.id !== ConstantsUtil.DEFAULT_ORG_ID
          );
        }
      }
      this.userImage =
        this.user && this.user.image
          ? `rest/user/${this.user.id}/images/${this.user.name}_${this.user.lastname}/${this.user.image}`
          : "";
    }
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>
