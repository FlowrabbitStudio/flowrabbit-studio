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
      figmaConfigHome: {
        figmaFile: "nfCU36n8I1eMIOhE6RZGbK",// "8aw4XrD9mPfGcwrtw6LWP2",
        figmaAccessKey: "48109-41e7ee0d-48eb-4f88-af6e-9f1bc4072dda",
      },
      figmaDropDown: {
        figmaFile: "DnhqFyYhqCD9HLHwmKIsbU",
        figmaAccessKey: "48109-41e7ee0d-48eb-4f88-af6e-9f1bc4072dda",
      },
      figmaMixedBorder: {
        figmaFile: "qkxH3VGJCw1H4N6SkPMk2a",// "8aw4XrD9mPfGcwrtw6LWP2",
        figmaAccessKey: "48109-41e7ee0d-48eb-4f88-af6e-9f1bc4072dda",
      },
      figmaConfigTodo: {
        figmaFile: "5zTcZwe1mxHlR7hmOltcAk",
        figmaAccessKey: "48109-41e7ee0d-48eb-4f88-af6e-9f1bc4072dda",
      },      
      figmaConfig: {
        figmaFile: "PYuz4ne9vi23f8EuHV5Dbv",
        figmaAccessKey: "48109-41e7ee0d-48eb-4f88-af6e-9f1bc4072dda",
      },      
      figmaConfigMichael: {
        figmaFile: "uKgt9PzMeazuh8SqXJQoVs",
        figmaAccessKey: "188835-f78a3047-5333-45c7-bdf0-4d426ebf3277",
      },
      figmaConfigKokos: {
        figmaFile:"IaT7dtnwfvT8PEF6L9R2d2",
        figmaAccessKey: "188835-f78a3047-5333-45c7-bdf0-4d426ebf3277",
      },
      figmaBug: {
        figmaFile:"owrluppOzpQweDmLkkml8M",
        figmaAccessKey: "188835-f78a3047-5333-45c7-bdf0-4d426ebf3277",
      },
      figmaBugAbsolute: {
        figmaFile:"MUavpxPw8WxNamP5qtOTFn",
        figmaAccessKey: "188835-f78a3047-5333-45c7-bdf0-4d426ebf3277",
      },
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
