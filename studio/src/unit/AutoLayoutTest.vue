<template>
    <div class="MatcLight">
      <div class="MatcFlex" style="gap:16px; align-items: center; padding: 24px;">
        <h1>Auto Layout Test</h1> 
        <div>
            <input type="checkbox" v-model="useGrid" @change="update">  Grid
        </div>
        <div>
            <input type="checkbox" v-model="useTree" @change="update"> TRee
        </div>
        <div>
            <input type="checkbox" v-model="useMode" @change="update"> Mode
        </div>
        <div>
            <input type="range" v-model="autoSnapMargin" @change="update"> {{autoSnapMargin}}px
        </div>
      </div>


      <template  v-for="screen in screens">
        <div
            class="MatcPreviewCntr"
            :key="screen.id"
            :style="{'width': width, 'height':height}">
            <Preview :app="model" :screen="screen.id" />
        </div>


        <div
            class="MatcPreviewCntr"
            :key="screen.id +'s'"
            :style="{'width': width, 'height':height}">
            <Preview :app="orgModel" :screen="screen.id" />
        </div>
    </template>
  
    </div>
  </template>
  
  <style>
    @import url("../style/matc.css");
    @import url("../style/qux.css");

    h1 {
      margin: 0;
    }

    .MatcFlex {
      div {
        padding: 24px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .MatcPreviewCntr {
        background: #f2f2f2;
        box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.2);
        display: inline-block;
        width: 250px;
        height: 400px;
        overflow: scroll;
        margin-left: 30px;
        font-size: 14px;
        vertical-align: top;
        overflow: auto;
        border-radius: 10px;
    }
  </style>
  
  <script>
  
  import Preview from 'page/Preview'
  import autoLayoutTest1 from './data/autoLayoutTest1.json'
  import Logger from '../core/Logger'
  import AutoLayout from '../core/responsive/AutoLayout'
  import Config from '../core/responsive/Config'
  
  export default {
    name: "FigmaTest",
    mixins: [],
    data: function() {
      return {
          files: [],
          previews: [],
          model: null,
          orgModel: autoLayoutTest1,
          selectedFile: '',
          useGrid: false,
          useTree: false,
          useMode: true,
          autoSnapMargin: 8,
      };
    },
    components: {
      'Preview': Preview
    },
    computed: {
      screens () {
        if (this.model) {
          let screens = Object.values(this.model.screens)
          if (screens.length > 10) {
            screens = screens.slice(0, 10)
          }
          return screens
        }
        return []
      },
      width () {
        if (this.model && this.model.screenSize) {
          return this.model.screenSize.w + 'px'
        }
        return 0
      },
      height () {
        if (this.model && this.model.screenSize) {
          return this.model.screenSize.h + 'px'
        }
        return 0
      }
    },
    methods: {
        getPreview() {
        },
        onSelect (d) {
            this.selection = d
        },
        showOrg () {
          this.model = null
          this.$nextTick(() => {
            this.model = autoLayoutTest1
          })
          this.$forceUpdate()
        },

        update() {
          this.model = null
          this.$nextTick(() => {
            this.run()
          })
        },

        async run() {
            const app = structuredClone(autoLayoutTest1)
            const s = Object.values(app.screens)[0]
            const config = Config.getDefault()
            config.autoSnapMargin = this.autoSnapMargin
            config.autoUseGrid = this.useGrid
            config.autoUseTree = this.useTree
            config.autoClusterMergeMode = this.useMode ? 'mode' : 'mean'
            const l = new AutoLayout(app, config)
            const changes = l.layout(s, s.children, true)
            
      
            for (let id in changes) {
    
              if (app.widgets[id]) {
                const w = app.widgets[id]
                const c = changes[id]
               // console.debug("change", w.x, c.x)
                w.x = c.x
                w.y = c.y 
                w.w = c.w
                w.h = c.h
              }
            }
            this.model = null
            this.$nextTick(() => {
              this.model = app
            })
            this.$forceUpdate()
        }
    },
    mounted() {
      Logger.setLogLevel(0)
      this.run()
    }
  };
  </script>
  