<template>
    <div class="MatcLight">
      <h1>DesignGPTDialog Test <input type="checkbox" @change="togglePage" /> </h1>
      <div>
        <button class="MatcButton" @click="setExample1()">Example 1</button>
        <button class="MatcButton" @click="setExample2()">Example 2</button>
        <button class="MatcButton" @click="setExample3()">Example 3</button>
      </div>
      <div :class="'MatcDialog MatchImportDialog MatchImportOpenAIDialog MatcPadding ' + pageCSS">
        <DesignGPTDialog ref="dialog"/>
      </div>
    </div>
  </template>
  
  <style>
    @import url("../style/matc.css");
    @import url("../style/matc.css");
    @import url("../style/canvas/all.css");
    @import url('../style/toolbar/all.css');
    .MatcDialog {
        box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2), 0px 0px 2px rgba(0, 0, 0, 0.2);
        overflow: auto;
        margin: 10px;
        background: #fff;
    }
  </style>
  
  <style lang="sass">
    @import "../style/bulma.sass"
  </style>
  
  <script>
  
  import DesignGPTDialog from 'canvas/toolbar/dialogs/DesignGPTDialogSmall'
  import app from './data/designGPTResponsive.json'
  import * as SchemaUtil from '../../src/core/SchemaUtil'
  import Services from '../../src/services/Services'

  const example1 = `
  CONTAINER:
    FLEX-DIRECTION: COLUMN
    BACKGROUND: "#F0F0F0"
    CHILDREN:
      - LABEL:
          CONTENT: "Join the Fun Club!"
          TYPE: Headline
          COLOR: "#333333"
      - LABEL:
          CONTENT: "Sign up to laugh at our terms & conditions"
          TYPE: Paragraph
          COLOR: "#666666"
      - INPUT:
          PLACEHOLDER: "Username"
          TYPE: Text
          LABEL:
            CONTENT: "Choose a Username"
            TYPE: Label
          BORDER_COLOR: "#CCCCCC"
      - INPUT:
          PLACEHOLDER: "Email"
          TYPE: Text
          LABEL:
            CONTENT: "Enter your Email"
            TYPE: Label
          BORDER_COLOR: "#CCCCCC"
      - INPUT:
          PLACEHOLDER: "Password"
          TYPE: Password
          LABEL:
            CONTENT: "Create a Password"
            TYPE: Label
          BORDER_COLOR: "#CCCCCC"
      - BUTTON:
          CONTENT: "Sign Me Up!"
          COLOR: "#FFFFFF"
          BACKGROUND: "#007BFF"
          BORDER_COLOR: "#0056b3"
      - LABEL:
          CONTENT: "Already chuckling with us? Login here."
          TYPE: Label
          COLOR: "#9933FF"
`

const example2 =`
CONTAINER:
  FLEX-DIRECTION: COLUMN
  BACKGROUND: "#f0f8ff"
  CHILDREN:
    - LABEL:
        CONTENT: "Welcome to GiggleSpace!"
        TYPE: "Headline"
        COLOR: "#ff6347"
    - LABEL:
        CONTENT: "Let's get you signed up so you can start giggling!"
        TYPE: "Paragraph"
        COLOR: "#4682b4"
    - LABEL:
        CONTENT: "Name"
        TYPE: "Label"
    - INPUT:
        PLACEHOLDER: "Enter your name"
        TYPE: "Text"
        BORDER_COLOR: "#dcdcdc"
    - LABEL:
        CONTENT: "Email"
        TYPE: "Label"
    - INPUT:
        PLACEHOLDER: "Enter your email"
        TYPE: "Text"
        BORDER_COLOR: "#dcdcdc"
    - LABEL:
        CONTENT: "Password"
        TYPE: "Label"
    - INPUT:
        PLACEHOLDER: "Choose a password"
        TYPE: "Password"
        BORDER_COLOR: "#dcdcdc"
    - LABEL:
        CONTENT: "Confirm Password"
        TYPE: "Label"
    - INPUT:
        PLACEHOLDER: "Re-enter your password"
        TYPE: "Password"
        BORDER_COLOR: "#dcdcdc"
    - BUTTON:
        CONTENT: "Join the Fun Club!"
        COLOR: "#ffffff"
        BACKGROUND: "#ff4500"
        BORDER_COLOR: "#cd5c5c"
    - LABEL:
        CONTENT: "By signing up, you agree to be part of an exclusive giggle fest!"
        TYPE: "Paragraph"
        COLOR: "#808080"
`

const example3 = `
CONTAINER:
  FLEX-DIRECTION: COLUMN
  CHILDREN:
    - LABEL:
        TYPE: Headline
        CONTENT: "Welcome to GiggleVerse"
    - LABEL:
        TYPE: Paragraph
        CONTENT: "Join us and add your laughing voice to the chorus!"
    - CONTAINER:
        FLEX-DIRECTION: COLUMN
        CHILDREN:
          - LABEL:
              TYPE: Label
              CONTENT: "Username"
          - INPUT:
              TYPE: Text
              PLACEHOLDER: "Enter your username"
              VARIABLE: "signup.username"
          - LABEL:
              TYPE: Label
              CONTENT: "Email Address"
          - INPUT:
              TYPE: Text
              PLACEHOLDER: "Enter your email"
              VARIABLE: "signup.email"
          - LABEL:
              TYPE: Label
              CONTENT: "Password"
          - INPUT:
              TYPE: Password
              PLACEHOLDER: "Create a password"
              VARIABLE: "signup.password"
          - LABEL:
              TYPE: Label
              CONTENT: "Confirm Password"
          - INPUT:
              VARIABLE: email.message
              PLACEHOLDER: "Type your message"
              TYPE: TextArea
          - INPUT:
              TYPE: Password
              PLACEHOLDER: "Confirm your password"
              VARIABLE: "signup.confirmPassword"

    - BUTTON:
        CONTENT: "Sign Me Up to the Fun!"
    - LABEL:
        TYPE: Paragraph
        CONTENT: "By signing up, you agree to have a joke delivered to your inbox every morning!"
        
`

  export default {
    name: "FigmaTest",
    mixins: [],
    data: function() {
      return {
          currentPage: 'm',
          pageCSS: '',
          files: [],
          previews: [],
          model: null,
          accessKey: '',
      };
    },
    components: {
      'DesignGPTDialog': DesignGPTDialog
    },
    computed: {
      screens () {
        if (this.model) {
          return Object.values(this.model.screens)
        }
        return null
      },
      width () {
        if (this.model) {
          return this.model.screenSize.w + 'px'
        }
        return 0
      },
      height () {
        if (this.model) {
          return this.model.screenSize.h + 'px'
        }
        return 0
      }
    },
    methods: {
        togglePage () {
          if (this.currentPage === 'm') {
            this.currentPage = 'd'
          } else {
            this.currentPage = 'm'
          }
          this.pageCSS = this.currentPage === 'm' ? 'MatchImportOpenAIDialogMobile':  'MatchImportOpenAIDialogDesktop'
        },
        getPreview() {
        },
        onSelect (d) {
            this.selection = d
        },
        setAccessKey () {
          localStorage.setItem('quxFigmaTest', this.accessKey)
        },
        setExample1 () {
          this.$refs.dialog.buildAppYAML(example1)
        },
        setExample2 () {
          this.$refs.dialog.buildAppYAML(example2)
        },
        setExample3 () {
          this.$refs.dialog.buildAppYAML(example3)
        },
        async run() {
  
        }
    },
    async mounted() {
      this.pageCSS = this.currentPage === 'm' ? 'MatchImportOpenAIDialogMobile':  'MatchImportOpenAIDialogDesktop'
      const schema = {}
      SchemaUtil.updateSchemaPath(schema, "user.name")
      SchemaUtil.updateSchemaPath(schema, "user.age")
      SchemaUtil.updateSchemaPath(schema, "cats[0].age")

      const invitations = await Services.getModelService().findInvitation(app.id)
      const temp = {};
      for (var key in invitations) {
        temp[invitations[key]] = key;
      }
      const hash = temp[1];
      this.$refs.dialog.setSchema(schema)
      this.$refs.dialog.setModel(app)
      this.$refs.dialog.setHash(hash)
      this.$refs.dialog.setType('text2UI')
      this.$refs.dialog.setPage(this.currentPage)
    }
  };
  </script>
  