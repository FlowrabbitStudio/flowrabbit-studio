<template>
  <div class="home luisa-low-code-wrapper">
    <Luisa
      :design="figmaBugAbsolute"
      :config="config"
      v-model="viewModel"
      v-if="figmaApp"
      ref="qux"
    />
    <pre class="viewModel" v-if="false"> {{ JSON.stringify(viewModel, null, 2) }}</pre>
  </div>
</template>

<style lang="scss">
.viewModel {
  position: fixed;
  top: 0px;
  right: 0px;
  width: 200px;
  background: orange;
}

</style>
<script>
import FigmaService from "../qux/figma/FigmaService";
//import figmaDynamicToggle from '../../tests/unit/data/figmaDynamicToggle.json'
//import figmaFontTest from '../../tests/unit/data/figmaFontTest.json'#

export default {
  name: "home",
  mixins: [],
  data: function () {
    return {
      design: "a2aa10a4Ft2zyQmIT9yztCezHRZyyc4pFHSGpjcyuX8nYOB3aF98i1AVxVqW",
      viewModel: {
        toggle2: false,
        signup: {
          tos: false,
          email: "",
          password: "",
          error: "",
        },
        options: ['o1', 'o2', 'o3'],
        selected: 'o2',
        searchFilter: "",
        todos: [
          {
              name: "This is the first todo",
              details: "You should create more todos, to track your work"
            },        {
                name: "This is the second todo",
                details: "You should create more todos, to track your work"
              }
        ],
        newTodo: {
          name: "",
          details: "",
        },
        selectedTodo: {
          name: "",
          details: "",
        },
        selectedDropDownValue: 'Nooon e',
        dropdownOptions: [
          {label: 'A', value: '1'},
          {label: 'B', value: 'C'}
        ]
      },
      figmaApp: true,
      config: {
        components: {},
        loadFonts: true,
        css: {
          attachLabels: true,
          huggedCanResize: true
        },
        router: {
          key: "screenName",
          prefix: "test/figma",
        },
        responsive: [
          { page: "Desktop", types: ["desktop"] },
          { page: "Mobile", types: ["tablet", "mobile"] },
        ],
      },
    };
  },
  components: {
 
  },
  computed: {
    isGuest() {
      return this.user.role === "guest";
    },
  },
  methods: {
    components() {
      return this.cf.componets;
    },
    onHomeLoad () {
      console.debug('Home.onHomeLoad()')
    },
    createNewTodo (e) {
      console.debug('Home.createNewTodo()', e.viewModel)

      return 'Home'
    },
  },
  watch: {
    $route() {},
  },
  async mounted() {
    let figmaService = new FigmaService();
    figmaService.setDownloadVectors(false);
    //this.figmaApp = await figmaService.parse(figmaTodoexample.id, figmaTodoexample)
  },
};
</script>
