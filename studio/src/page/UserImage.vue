<template>
  <div class="MatcUser">
    <div class="MatcCenter MatcInline">
      <div class="MatcUserImageCntr">
        <img
          v-if="userImage"
          :src="userImage"
          class="MatcUserImage"
        />
        <span v-else class="mdi mdi-account-circle MatcDefaultAvatar" style="font-size: 100px;"></span>
        <input
          v-if="!userImage"
          key="upload-input"
          type="file"
          class="MatcImageUploadFile"
          @change="onFileChange"
        />
      </div>
      <div>
        <div class="MatcFlexBar" v-if="userImage">
          <div class="MatcButton MatcButtonPrimary MatcUploadButton">
            Change
            <input
              key="change-input"
              type="file"
              class="MatcImageUploadFile"
              @change="onFileChange"
            />
          </div>
          <a class="MatcButton MatcButtonRedSecondary" @click="deleteImage">
            Remove
          </a>
        </div>
        <span v-else class="MatcHint">
          <div class="MatcButton MatcButtonPrimary MatcUploadButton">
            Upload
            <input
              key="upload-input-hint"
              type="file"
              class="MatcImageUploadFile MatcPointer"
              @change="onFileChange"
            />
          </div>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Logger from "common/Logger";
import Services from "services/Services";

export default {
  name: "UserImage",
  props: ["user"],
  data() {
    return {
      value: this.user || {},
      files: null,
      userImage: ""
    };
  },
  computed: {
    userImageSrc() {
      return this.userImage
    },
  },
  methods: {
    initLogger() {
      this.logger = new Logger({ className: "de.vommond.matc.page.User" });
      this.logger.log(2, "constructor", "entry");
    },
    onFileChange(e) {
      e.preventDefault();
      this.files = e.target.files;
      this.sendFiles();
    },
    async deleteImage() {
      try {
        await Services.getUserService().deleteImage(this.value);
        this.load();
      } catch (error) {
        this.logger.log(1, "deleteImage", "Error deleting image", error);
      }
    },
    async sendFiles() {
      const formData = new FormData();
      for (let i = 0; i < this.files.length; i++) {
        formData.append("file", this.files[i]);
      }

      try {
        const token = Services.getUserService().getToken();
        const response = await fetch(`rest/user/${this.user.id}/images/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          this.onUploadDone();
        } else {
          this.onUploadError();
        }
      } catch (error) {
        this.onUploadError();
      }
    },
    onUploadDone() {
      this.load();
    },
    async load() {
      try {
        let u = await Services.getUserService().loadById(this.value.id);
        this.setUser(u);
      } catch (error) {
        this.logger.log(1, "load", "Error loading user", error);
      }
    },
    setUser(u) {
      this.value = u;      
      this.userImage = u && u.image
        ? `rest/user/${u.id}/images/${u.name}_${u.lastname}/${u.image}`
        : "";
    },
    onUploadError() {
      this.logger.log(1, "sendFiles", "Error uploading files");
    },
  },
  mounted() {
    this.initLogger();
    this.load();
  },
};
</script>
