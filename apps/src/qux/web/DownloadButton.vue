<template>
  <router-link :class="['qux-button', cssClass]" v-if="hasLink" :to="link" @click="onDownload">
    <span class="qux-common-label" v-if="!hasSlot">
      {{label}}
    </span>
    <span class="qux-common-label" v-if="hasSlot">
      <slot></slot>
    </span>
  </router-link>
  <div style="cursor:pointer" :class="['qux-button', cssClass]" v-else @click="onDownload">
    <span class="qux-common-label" v-if="!hasSlot">
       {{label}}
    </span>
    <span style="cursor:pointer"  class="qux-common-label" v-if="hasSlot">
      <slot></slot>
    </span>
  </div>
</template>
<style lang="scss">
    @import '../scss/qux.scss';
    @import '../scss/qux-button.scss';
</style>
<script>

import _Base from './_Base.vue'

export default {
  name: 'qDownloadButton',
  mixins: [_Base],
  data: function () {
      return {
      }
  },
  computed: {
     src () {
      let file = this.dataBindingInput
      if (file) {
        return file
      }
      return ""
    }
  },
  methods: {
    getFileTypeFromUrl(url) {
      if (!url) {
        url = this.dataBindingInput
      }
      const match = url.match(/\.([^\.\/\?#]+)(\?|#|$)/);
      if (match) {
        return match[1].toLowerCase(); 
      } else {
        return ""; 
      }
    },
    downloadFile(url) {
      const filetype = this.getFileTypeFromUrl(url);

      fetch(url, { mode: 'no-cors' })
        .then(resp => {
          if (resp.status === 200) {
            return resp.blob();
          } else if (resp.type === 'opaque') {
            // Handle opaque response by using the direct URL
            return Promise.resolve(); // Resolve with no blob to trigger fallback
          } else {
            return Promise.reject('something went wrong');
          }
        })
        .then(blob => {
          if (blob) {
            // Create a URL for the blob and initiate the download
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = `file.${filetype}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            alert('Your file has downloaded!');
          } else {
            // If blob is not available (for opaque responses), open the URL in a new tab
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.target = '_blank'; // Open in a new window/tab
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a); // Clean up after click
            alert('Your file has downloaded!');
          }
        })
        .catch(() => alert('oh no!'));
    },
    onDownload(e) {
      if (!this.hasLink) {
        e.preventDefault(); // Prevent default if it's not navigating
        this.downloadFile(this.src);
      }
      this.onClick(e)
    }
  },
  mounted () {
  }
}
</script>
