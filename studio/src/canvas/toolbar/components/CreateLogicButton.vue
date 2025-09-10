<template>



  <div class="MatcCreateBtnElementList MatcCreateBtnRight">
    <div class="MatcSidebarHeader">


      <div class="MatcCreateSearchContainer">
        <input 
          type="search" 
          v-model="searchFilter" 
          class="MatcCreateSearch MatcIgnoreOnKeyPress form-control" 
          placeholder="Search"
          data-dojo-attach-point="searchBox" />
          <QIcon icon="DeleteX" @click="clearFilter" v-if="searchFilter"></QIcon>
          
      </div>
    </div>
    <div class="MatcLogicScrollerContainer">
      <template v-if="searchFilter">

        <div class="MatcCreateCatTitle">
          <div class="MatcCreateCatTitlelabel">Search</div>
        </div>
        <div class="MatcCreateCatChildren">
          <div class="MatcCreateBtnElementLogic MatcToolbarDropDownButtonItem" v-for="tool in filteredTools"
            :key="tool.id" @click="onSelect(tool)">
            <div class="MatcCreateBtnElementLogicCntr">
              <span :class="tool.class || tool.icon" />
              <label class="MatcToolbarPopUpLabel">{{ tool.label }}</label>
            </div>
          </div>
        </div>

      </template>
      <div v-else v-for="category in categorizedTools" :key="category.name" class="MatcLogicContainer MatcCreateCat">
        <div class="MatcCreateCatTitle">
          <div class="MatcCreateCatTitlelabel">{{ category.name }}</div>
        </div>
        <div class="MatcCreateCatChildren">
          <div class="MatcCreateBtnElementLogic MatcToolbarDropDownButtonItem" v-for="tool in category.tools"
            :key="tool.id" @click="onSelect(tool)">
            <div class="MatcCreateBtnElementLogicCntr">
              <span :class="tool.class || tool.icon" />
              <label class="MatcToolbarPopUpLabel">{{ tool.label }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import Util from "core/Util";
import QIcon from "../../../page/QIcon.vue";
import AIModelsUtil from "../../../util/aimodels/AIModelsUtil";

export default {
  name: "CreateLogicButton",
  mixins: [Util, DojoWidget],
  data: function () {
    return {
      searchFilter: "",
      tools: [
        { value: "rest", icon: "MatcWidgetTypeRestLogo api", label: "API", category: "Logic" },
        { value: "api", icon: "MatcWidgetTypeRestLogo Webhook", label: "Webhook", category: "Logic", type: "webhook", logo: "Webhook" },
        //{value: 'logic', icon: 'MatcWidgetTypeRestLogo or-logic', logo: "or-logic", label: 'Router', type: "LogicOr", id: "Or", category: 'Logic'},
        { value: "logic", icon: "MatcWidgetTypeRestLogo and-logic", logo: "and-logic", label: "Router", type: "LogicAnd", id: "And", category: "Logic" },
        { value: "api", icon: "MatcWidgetTypeRestLogo Make", label: "Make.com", category: "Logic", type: "make", logo: "Make" },
        { value: "api", icon: "MatcWidgetTypeRestLogo Make", label: "Make.com (Bridge)", category: "Logic", type: "make-bridge", logo: "Make" },
        { value: "script", icon: "MatcWidgetTypeRestLogo script", label: "Script", category: "Logic" },
        { value: "assistant", class: "MatcWidgetTypeRestLogo OpenAI", icon: "mdi mdi-account-star-outline", label: "Assistant", category: "AI models" },
        { value: "prompt", icon: "MatcWidgetTypeRestLogo prompt-builder", label: "Prompt Builder", category: "Logic" },
        { value: "ai", icon: "MatcWidgetTypeRestLogo ai-video", label: "Video", category: "AI models", type: AIModelsUtil.aiTypes.video },
        { value: "ai", icon: "MatcWidgetTypeRestLogo ai-image", label: "Image AI", category: "AI models", type: AIModelsUtil.aiTypes.image },
        { value: "ai", icon: "MatcWidgetTypeRestLogo ai-text", label: "Text AI", category: "AI models", type: AIModelsUtil.aiTypes.llms },
        { value: "ai", icon: "MatcWidgetTypeRestLogo ai-text-speech", label: "Text to Speech", category: "AI models", type: AIModelsUtil.aiTypes.textToSpeech },
        { value: "ai", icon: "MatcWidgetTypeRestLogo ai-speech-text", label: "Speech to Text", category: "AI models", type: AIModelsUtil.aiTypes.speechToText },
        { value: "ai", icon: "MatcWidgetTypeRestLogo ai-ionos", label: "Ionos AI (Free)", category: "AI models", type: AIModelsUtil.aiTypes.ionos },
        { value: "api", icon: "MatcWidgetTypeRestLogo doc-ionos", logo: "doc-ionos", label: "Ionos Knowledge Base", category: "AI models", type: "ionosDocs" },
        // { value: "api", icon: "MatcWidgetTypeRestLogo ai-agent", logo: "ai-agent", label: "Agent", category: "AI models", type: "agent" },
        {
          value: "api",
          class: "MatcWidgetTypeRestLogo Airtable",
          icon: "mdi mdi-file-document-outline",
          label: "Airtable",
          type: "airtable",
          category: "Data",
          logo: "Airtable",
        },
        {
          value: "api",
          class: "MatcWidgetTypeRestLogo Rows",
          icon: "mdi mdi-file-document-outline",
          label: "Rows",
          type: "rows",
          category: "Data",
          logo: "Rows",
        },
        { value: "api", icon: "MatcWidgetTypeRestLogo Xano", label: "Xano", category: "Data", type: "xano", logo: "Xano" },
        { value: "docToText", class: "MatcWidgetTypeRestLogo pdf-parser", label: "Document to Text", category: "Data" },
        { value: "download", class: "MatcWidgetTypeRestLogo download", label: "Download", category: "Data" },
        { value: "textToDoc", class: "MatcWidgetTypeRestLogo text-doc", label: "Text To Document", category: "Data" },
        { value: "localStorage", class: "MatcWidgetTypeRestLogo local-storage", label: "Local Storage", category: "Data" },
        { value: "copyClipboard", class: "MatcWidgetTypeRestLogo copy-clipboard", label: "CopyClipboard", category: "Data" },
        { value: "api", class: "MatcWidgetTypeRestLogo parse-json", label: "JSON Parser", category: "Data", type: "json", logo: "parse-json"},
        //{value: 'ftp', class: 'MatcWidgetTypeRestLogo pdf-parser', label: 'FTP', category: 'Data'}
      ],
    };
  },
  computed: {
    filteredTools() {
      return this.tools.filter(a => a.label.toLowerCase().includes(this.searchFilter.toLowerCase()));
    },
    categorizedTools() {
      const categories = {};
      this.tools.forEach((tool) => {
        if (!categories[tool.category]) {
          categories[tool.category] = { name: tool.category, tools: [] };
        }
        categories[tool.category].tools.push(tool);
      });
      return Object.values(categories);
    },
  },
  components: {
    QIcon
  },
  methods: {
    clearFilter () {
      this.searchFilter = '';
    },
    onSelect(t) {
      this.add(t);
    },

    onHide() {
      css.remove(this.domNode, "MatcToolbarItemActive");
    },

    async init() { },
  },
  mounted() { },
};
</script>
