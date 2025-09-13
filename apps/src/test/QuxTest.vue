<template>
  <div class="home luisa-low-code-wrapper">
    <Luisa :design="formValication" :config="config" v-model="viewModel" ref="qux" @qClick="logEvent"/>
    <div v-if="showViewModel" class="luisa-view-model">
      <pre>{{JSON.stringify(viewModel, null, 2)}}</pre>
    </div>
  </div>
</template>

<style lang="scss">
.luisa-view-model{
  position: fixed;
  right:0px;
  top:0px;
  font-size: 10px;
  width: 200px;
  background: orange;
}

.Xqux {
   scroll-behavior: smooth;
}

.xluisa-low-code-wrapper {
  width: 350px;
  height: 600px;
}
</style>
<script>


export default {
  name: "home",
  mixins: [],
  data: function() {
    return {
      formValication: 'a2aa10aPl90VUzsbLbrz6FzA9MnfyY8b0i9f7jrTJgp0tjL9LIi8mNqd7V9q',
      design: 'a2aa10azGpOieHSMFasNOH4dyxzqOwIjNyWTQXUALIjUapeJzHSAgfdqJN3O',// 'a2aa10asVIH8UynqTEimaiuQztwzemBSByXL5CiWlxzshwv2DdxYk4iDuGWC',
      showViewModel: true,
      viewModel: {
          content: {
            type:'richtext',
            value: '<b>Rhis is fat</b> not fat <b>fat agaib</b> - <B>FAT</B>'
          },
          stringValue: 'klaus was here',
          booleanValue: true,
          selectedValue: 'BBB',
          keyA: 'AAA',
          keyB: 'BBB',
          user: {
            name: 'Klaus',
            lastname: 'Schaefers'
          },
          contentFullKey: 'x5nMV2FGvitHMLOldJ_PzTDNW7GvA0PqOFIWOfksyUU'
      },
      config: {
        scrollIntoViewOnFocus: false,
        components: {
        },
        router: {
          key: 'screenName',
          prefix: 'test/qux',
          routerLinkPrefix: '/test/qux'
        }
      }
    }
  },
  components: {
   
  },
  computed: {
    isGuest () {
      return this.user.role === 'guest'
    }
  },
  methods: {
    logEvent () {
      //console.debug('logEvent', e.element.name, e)
    },
    components () {
      return this.cf.componets
    },
    onClick (){
      console.debug('TEXT.onCLICK')
    }
  },
  watch :{
    '$route' () {
    }
  },
  async mounted() {
    this.viewModel.content.value += '<script>' + 'alert("XXX")' + '</' +'script>'
  }
};
</script>
