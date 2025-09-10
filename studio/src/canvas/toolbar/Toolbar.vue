<template>
  <div class="MatcToolbar" @dblclick="onDoubleClick">
    <div class="MatcSidebar MatcToobarPropertiesSection MatcToolbar" v-show="isLayerOpen">
      <div class="MatcSidebarSelector">
        <a :class="{ selected: selectedSidebarItem === 'Widgets' }" @click="setCreateContent"> UI </a>
        <a :class="{ selected: selectedSidebarItem === 'Logic' }" @click="setLogicSidebar"> Logic </a>
        <a :class="{ selected: selectedSidebarItem === 'Data' }" @click="setDataList"> Variables </a>
        <a :class="{ selected: selectedSidebarItem === 'Layers' }" @click="setLayerList"> Layers </a>

        <!-- <QIcon icon="AISparkles" @click="showDesignGPT"></QIcon> -->
      </div>
      <div data-dojo-attach-point="layerListCntr" class="MatcSidebarListContainer"></div>
    </div>

    <div class="MatcToolbarTop">
      <div class="MatcToobarHomeSection MatcToobarItemBig" data-dojo-attach-point="home" @click="onGoHome">
        <div class="MatcToolbarItem MatcToolbarItemBig">
          <img src="/img/logo-w.png" width="35" />
        </div>
      </div>
      <!-- Name of the folder and file -->
      <div class="MatcToolbarMaxSectionLink">
        <div v-if="app && app.name" class="MatcToolbarItemLink">
          <!-- <span style="cursor: pointer" @click="navigateToFolder">{{ (selectedFolder && selectedFolder.name) || "All Apps" }}</span>
          <span class="mdi mdi-chevron-right"></span> -->
          <span>{{ app.name }}</span>
        </div>
      </div>
      <!-- Menu icon -->
      <div class="MatcToolbarSection MatcToolbarItemHome" data-dojo-attach-point="menu"></div>

      <div class="MatcToolbarTopCntr">
        <div class="MatcToolbarTopCenterCntr" v-show="!svgEditorVisible">
          <div class="MatcToolbarTopCenterCntrPlaceHolder"></div>
          <div class="MatcToolbarSection" v-if="isResponsiveApp">
            <ResolutionButton @change="onChangePage" />
          </div>


        </div>

        <div class="MatcToolbarNotificationSection MatcToolbarSection" data-dojo-attach-point="notificationSection">
          <div class="MatcToolbarSection">
            <CollabUser :users="collabUsers" @select="onCollabUserClicked" />
          </div>
       

          <GridConfig :value="canvasViewConfig" @change="onChangeCanvasViewConfig" v-if="false" />
          <ViewConfig :value="canvasViewConfig" @change="onChangeCanvasViewConfig" v-if="hasViewConfigVtn" />

          <div class="MatcToolbarSection" v-if="!svgEditorVisible">
            <a @click="startPreview" class="MatcToolbarItem MatcFlex MatcGapXS"> <QIcon icon="Play"></QIcon> <span>Preview</span> </a>
          </div>

          <a @click="onPublish" class="MatcToolbarItem">
            <span class="MatcToolbarItemPrimary"> Publish </span>
          </a>
        </div>
      </div>
    </div>
    <div class="MatcTempToolbarTop"></div>

    <div class="MatcTempToolbarBottom">
      <div class="MatcToolbarSection MatcToolbarDenseSection MatcToolbarSectionTools" data-dojo-attach-point="toolsBottomDiv">
        <AIMenu @text2ui="showDesignGPT($event, 'text2UI')" @formWizard="showFormWizard($event)" @text2js="showTextToScript($event)" />
        <div class="">
          <div class="MatcToolbarSubSection">
            <a class="MatcToolbarItem MatcMultiIcon" @click="onAddArrow">
              <QIcon icon="Pointer"></QIcon>
            </a>
          </div>
        </div>
        <div class="">
          <ToolbarDropUpButton
            qMaxLabelLength="40"
            :qOptions="shapesOptions"
            :qValue="shapesValue"
            @change="onShapesDropdownChange"
            :updateSelection="false"
            :qIcon="'Square'"
            :qHideCaret="true"
            :hasArrow="true"
            :arrowPosition="false"
            :qPlacement="'top'"
            :hideSelectedLabel="true"
          />
        </div>
        <div class="MatcToolbarSubSection">
          <a class="MatcToolbarItem MatcMultiIcon" @click="onAddTextClick">
            <QIcon icon="Text"></QIcon>
          </a>
        </div>
        <div class="MatcToolbarSubSection">
          <a class="MatcToolbarItem MatcMultiIcon" @click="onNewComment">
            <QIcon icon="Comment"></QIcon>
          </a>
        </div>


        <div class="MatcFlex MatcToolsCtntr MatcToolbarSectionHidden" style="gap: 6px" data-dojo-attach-point="toolsCntrDiv">
          <div class="MatcToolbarSubSection MatcToolbarSubSectionGroup" data-dojo-attach-point="groupDIV">
            <a class="MatcToolbarItem MatcMultiIcon" data-dojo-attach-point="groupBTN" @click="onToolGroup">
              <QIcon icon="Group"></QIcon>
            </a>
            <a class="MatcToolbarItem MatcMultiIcon MatcIconDanger" data-dojo-attach-point="ungroupBTN" @click="onToolGroup">
              <QIcon icon="UnGroup"></QIcon>
            </a>
          </div>

          <div class="MatcToolbarSubSection" data-dojo-attach-point="templateDiv"></div>

          <div class="MatcToolbarSubSection" data-dojo-attach-point="toolsDiv"></div>

          <!--<div class="MatcToolbarSubSection" data-dojo-attach-point="developerDiv"></div>-->

          <div class="MatcToolbarSubSection">
            <div class="MatcToolbarItem QIconCntr" v-if="isNinjaMode" @click="showThemeCreateDialog">
              <QIcon icon="Ninja"></QIcon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="MatcToobarPropertiesSection MatcToobarPropertiesSectionRightSidebar" data-dojo-attach-point="propertiesCntr">
      <!-- <div class="MatcToolbarSectionTitle">{{sidebartitle}}</div> -->
      <div class="MatcToobarPropertiesSectionHeader">
        <EditModeButton
          :value="canvasViewConfig"
          @simulate="startPreview"
          @change="onChangeCanvasViewConfig"
          @canvasViewMode="setCanvasViewMode"
          ref="editModeButton"
        />
      </div>
    </div>
  </div>
</template>
<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import hash from "dojo/hash";
import Util from "core/Util";
import topic from "dojo/topic";
import Logger from "common/Logger";
import _Tools from "canvas/toolbar/mixins/_Tools";
import _Render from "canvas/toolbar/mixins/_Render";
import _Dialogs from "canvas/toolbar/mixins/_Dialogs";
import _Show from "canvas/toolbar/mixins/_Show";
import _Add from "canvas/toolbar/mixins/_Add";
import _Sidebar from "canvas/toolbar/mixins/_Sidebar";
import ToolbarDropUpButton from "canvas/toolbar/components/ToolbarDropUpButton";
import ToolbarDropDownButton from "canvas/toolbar/components/ToolbarDropDownButton";
import ViewConfig from "canvas/toolbar/components/ViewConfig";
import EditModeButton from "canvas/toolbar/components/EditModeButton";
import CollabUser from "canvas/toolbar/components/CollabUser";
import ModelUtil from "../../core/ModelUtil";
import ResolutionButton from "./components/ResolutionButton";
import AIMenu from "./components/AIMenu";

import Services from "services/Services";
// import DomBuilder from "common/DomBuilder";
// import Dialog from "common/Dialog";
// import on from "dojo/on";
// import touch from "dojo/touch";

import ScreenSettingsTypes from "../../util/ConstantsUtil.js";
import { mapState, mapActions } from "vuex";
import QIcon from "page/QIcon";
import Actions from "./Actions.vue";
import GridConfig from "./components/GridConfig.vue";

export default {
  name: "Toolbar",
  mixins: [Util, _Render, _Dialogs, _Tools, _Show, _Add, _Sidebar, DojoWidget, Actions],
  props: ["pub"],
  data: function () {
    return {
      secretKeys: [],
      canvasViewMode: "design",
      value: false,
      isPublic: false,
      isDevelop: false,
      active: true,
      redirectAfterExit: true,
      showRestTool: true,
      showScriptTool: false,
      hasViewConfigVtn: true,
      canvasViewConfig: {},
      settings: {},
      collabUsers: [],
      showLabels: false,
      publishIcon: "mdi-cloud-outline",
      mode: "",
      loading: true,
      app: {
        name: "",
      },
      user: {},
      invitations: [],
      restLoaded: false,
      isLayerOpen: false,
      sidebartitle: "",
      imagemodels: ScreenSettingsTypes["image"],
      showBugIcon: true,
      isResponsiveApp: false,
      currentPage: "m",
      isNinjaMode: false,
      shapesValue: null,
      layout: null,
      layoutOptions: [
        { label: "Default", value: "Grid" },
        { label: "Custom Component", value: "Custom" },
        { label: "Wrap (Auto Layout)", value: "Wrap" },
      ],
      shapesOptions: [

        {
          label: "Rectangle",
          icon: "Square",
          value: "square",
          callback: this.onAddSquare,
          shortcut: "R",
        },
        {
          label: "Circle",
          icon: "Circle",
          value: "circle",
          callback: this.onAddCircle,
          shortcut: "O",
        },
      ],
    };
  },
  components: {
    ViewConfig: ViewConfig,
    EditModeButton: EditModeButton,
    CollabUser: CollabUser,
    QIcon: QIcon,
    ResolutionButton: ResolutionButton,
    GridConfig: GridConfig,
    AIMenu: AIMenu,
    ToolbarDropUpButton: ToolbarDropUpButton
  },
  computed: {
    ...mapState(["selectedOrg", "selectedFolder"]),
    hasProtoMoto() {
      return this.settings && this.settings.hasProtoMoto;
    },
    svgEditorVisible() {
      return this.mode === "svg";
    },
  },
  methods: {
    ...mapActions(["updateSelectedFolder"]),
    onLayoutChange(item) {
      // item = { label, icon, callback, ... }
      if (item?.callback) {
        item.callback();
      }
    },
    onShapesDropdownChange(item) {
      // item = { label, icon, callback, ... }
      if (item?.callback) {
        item.callback();
      }
    },

    onAddArrow(e) {
      this.controller.setMode("select");
      this.stopEvent(e);
    },
    onAddLine(e) {
      this.controller.setMode("addSeparator");
      this.controller.unSelect();
      this.showHint("Mark the area where to create the box...");
      this.stopEvent(e);
    },
    onAddSquare(e) {
      this.controller.setMode("addBox");
      this.controller.unSelect();
      this.showHint("Mark the area where to create the box...");
      this.stopEvent(e);
    },
    onAddCircle(e) {
      this.controller.setMode("addRound");
      this.controller.unSelect();
      this.showHint("Mark the area where to create the box...");
      this.stopEvent(e);
    },

    // ------------
    // TEXT
    // ------------
    onAddTextClick(e) {
      this.controller.setMode("addText");
      this.showHint("Mark the area where to create the txt...");
      this.stopEvent(e);
    },
    loadRest() {
      let id = this.model.id;
      Promise.all([this.modelService.findInvitation(id), this.modelService.findPubSettings(id), Services.getOrgService().findUserOrganizations(this.user.id)])
        .then((values) => {
          this.restLoaded = true;
          this.invitations = values[0];
          this.publicationSettings = values[1];
          this.organizations = values[2];
          var temp = {};
          for (var key in this.invitations) {
            temp[this.invitations[key]] = key;
          }
          this.hash = temp[1];
        })
        .catch((e) => {
          console.error(e);
        });
    },
    navigateToFolder() {
      hash(`/apps/${this.selectedOrg.id}`);
    },
    onWindowFocus() {
      this.logger.log(1, "onWindowFocus", "enter > ");
    },
    initFocusListener() {
      this.logger.log(1, "initFocusListener", "enter > ");
      this._focusListner = () => {
        this.onWindowFocus();
      };
      window.addEventListener("focus", this._focusListner);
    },
    onPublish(e) {
      this.onShowPublish(this.user, this.model, this.invitations, e);
    },
    postCreate() {
      this.logger = new Logger("Toolbar");
      this.logger.log(3, "constructor", "entry > " + this.pub);
      const btn = this.$new(ToolbarDropDownButton, { arrowPosition: false, hasArrow: true, hasCaret: false });
      btn.updateLabel = false;
      btn.setIcon("Menu");
      btn.setOptions(this.getMainMenu());
      btn.placeAt(this.menu);

      const topElement = document.querySelector(".MatcToolbarTopCenterCntr .MatcToolbarTopCenterCntrPlaceHolder");
      const leftPosition = topElement.getBoundingClientRect().left + 45;
      const viewportWidth = document.documentElement.clientWidth;

      const leftPercentage = (leftPosition / viewportWidth) * 100;
      const lowerElement = document.querySelector(".MatcTempToolbarTop");
      lowerElement.style.left = leftPercentage + "%";
      const bottomElement = document.querySelector(".MatcTempToolbarBottom");
      bottomElement.style.left = leftPercentage + "%";
    },
    onShowInfo() {
      //this.onShowInfoDialog(this.model, this.user, this.invitations, this.organizations);
    },
    onDeleteApp() {
      //this.onShowDeleteAppDialog(this.model, this.user, this.invitations, this.organizations);
    },
    getMainMenu() {
      // TO-DO
      const options = [
       // { label: this.getNLS("toolbar.menu.save-as"), callback: lang.hitch(this, "onSaveAs"), icon: "Copy" },
      //  { label: this.getNLS("toolbar.menu.change-screen-size"), callback: lang.hitch(this, "onChangeScreenSize"), icon: "ScreenSize" },
        { label: this.getNLS("toolbar.menu.keys"), callback: lang.hitch(this, "showSecretesDialog"), icon: "Secret" },
     //   { label: this.getNLS("toolbar.menu.delete"), callback: lang.hitch(this, "showDeleteDialog"), icon: "Delete" },
        { css: "MatcToolbarPopUpLine" },
        { label: "Keyboard Shortcuts", callback: lang.hitch(this, "showShortCuts"), icon: "KeyBoard" },
        { label: "App Settings", callback: lang.hitch(this, "onGoToSettings"), icon: "Settings" },
        { css: "MatcToolbarPopUpLine" },
        { label: this.getNLS("toolbar.menu.exit"), callback: lang.hitch(this, "onExit"), icon: "Exit" },
      ];
      return options;
    },

    setController(c) {
      this.logger.log(3, "setController", "entry");
      this.controller = c;
      this.own(this.controller.on("notSavedWarningShow", lang.hitch(this, "showSaveButton")));
      this.own(this.controller.on("commandAdded", lang.hitch(this, "onCommandAdded")));
    },

    setCanvas(c) {
      this.logger.log(3, "setCanvas", "entry");
      this.canvas = c;
    },

    setHash(h) {
      this.hash = h;
    },

    async reloadSecrets() {
      this.logger.log(3, "setSecrets", "exit", this.secretKeys);
      try {
        const data = await this.modelService.findSecrets(this.model.id);
        if (data.secrets) {
          const secretKeys = data.secrets;
          this.onUpdateKeys(secretKeys);
        }
      } catch (err) {
        this.logger.error("reloadSecrets", "ERROR", err);
      }
    },

    setSecrets(s) {
      this.secretKeys = s.secrets;
    },

    onUpdateKeys(secretKeys) {
      this.setSecrets(secretKeys);
      this.dataWidget.setSecretKeys(secretKeys);
    },

    setContext(context) {
      this.context = context;
    },

    setCurrentTool(t) {
      this.logger.log(3, "setCurrentTool", "entry");
      this.currentTool = t;
    },

    setModelFactory(f) {
      this.logger.log(3, "setModelFactory", "entry");
      this.factory = f;
    },

    setSubMode(subMode) {
      this.logger.log(3, "setSubMode", "entry > '" + subMode + "'");
      this.subMode = subMode;
    },

    setModelService(s) {
      this.modelService = s;
      this.modelService.addChangeListener("secrets", () => {
        this.logger.log(3, "Secret changed", "entry");
        this.reloadSecrets();
      });
    },

    async setModel(m) {
      this.model = m;

      if (!this.schema) {
        this.logger.error("setModel", "No Schema");
      }
      if (this.model.type === "responsive") {
        this.logger.log(-1, "setModel", "Set resposnive");
        this.isResponsiveApp = true;
      }
      this.renderToolbar();
      this.renderProperties();
      if (this.model && this.model.id) {
        this.logger = new Logger("Overview");
        this.user = await Services.getUserService().load();
        await this.loadRest();
        this.initFocusListener();
        this.logger.info("mounted", "exit > ");
      }
      this.app.name = m.name;

      this.onChangePage(ModelUtil.getDefautlPage(this.model));
      // somehow read here the default view??
      // this.onChangePage('m')
    },

    setSchema(schema) {
      this.logger.log(1, "setSchema", "entry");
      this.schema = schema;
    },

    setPublic(isPublic) {
      this.logger.log(-1, "setPublic", "entry > '" + isPublic + "'");
      this.isPublic = isPublic;
    },

    setMode(mode) {
      this.logger.log(3, "setMode", "entry > '" + mode + "'");
      this.mode = mode;
      this.onModeChange();
    },

    setUser(user) {
      this.user = user;
      this.collabUsers.push(user);
    },

    addCollabUser(user) {
      this.logger.log(1, "addCollabUser", "entry ", user);
      const found = this.collabUsers.find((u) => u.id === user.id);
      if (!found) {
        this.collabUsers.push(user);
      }
    },

    removeCollabUser(user) {
      this.logger.log(1, "removeCollabUser", "entry ", user);
      this.collabUsers = this.collabUsers.filter((u) => u.id !== user.id);
    },

    getSettings() {
      if (this.canvas) {
        return this.canvas.getSettings();
      }
      return {};
    },

    setCanvasViewConfig(viewConfig) {
      this.canvasViewConfig = viewConfig;
    },

    setNextCanvasViewConfig() {
      this.logger.log(1, "setNextCanvasViewConfig", "entry > ");
      if (this.$refs.editModeButton) {
        this.$refs.editModeButton.nextView();
      }
    },

    onChangeCanvasViewConfig(key, value) {
      if (this.canvas) {
        this.canvas.setCanvasViewConfig(key, value);
      }
    },

    onChangePage(page) {
      this.currentPage = page;
      if (this.canvas) {
        this.canvas.setPage(page);
      }
      if (this.controller) {
        this.controller.setPage(page);
      }

      if (this.createBTNContent) {
        this.createBTNContent.setPage(page);
      }
      if (this.layerList) {
        this.layerList.setPage(page);
      }
      if (this.dataWidget) {
        this.dataWidget.setPage(page);
      }
      if (this.widgetSize) {
        this.widgetSize.setPage(page);
      }
      if (this.screenSize) {
        this.screenSize.setPage(page);
      }
    },

    startPrototypingView() {
      this.logger.log(1, "startPrototypingView", "entry > ");
      // check here if we need to change
      if (this.$refs.editModeButton) {
        this.$refs.editModeButton.setPrototype();
      }
    },

    setCanvasViewMode(mode) {
      this.logger.log(1, "setCanvasViewMode", "entry > " + mode);
      this.canvasViewMode = mode;
      if (this.canvas) {
        this.canvas.setViewMode(mode);
      }
      this.updatePropertiesView();
    },

    onCollabUserClicked(user) {
      this.logger.log(-1, "onCollabUserClicked", "entry > ", user);
      if (this.canvas && this.user.id !== user.id) {
        this.canvas.moveToCollabUser(user);
      }
    },

    onFadeOut() {
      this.logger.log(-1, "onFadeOut", "entry ");
      css.add(this.layerListCntr, "MatcLayerListFadeOut");
    },

    onFadeIn() {
      this.logger.log(-1, "onFadeIn", "entry ");
      css.remove(this.layerListCntr, "MatcLayerListFadeOut");
    },

    /********************************************************
     * Main menu handlers
     ********************************************************/
    async openHelper() {
      const loggedInUserId = this.user.id;
      window.CommandBar.boot(loggedInUserId);
      window.CommandBar.openHelpHub();
    },

    onDoubleClick() {
      this.logger.log(-1, "onDoubleClick", "entry ", this.isDevelop);
      this.isNinjaMode = !this.isNinjaMode;
      if (this.isNinjaMode && this.canvas) {
        this.canvas.showSuccess("Ninja mode enabled!");
      }
    },

    onGoToSettings() {
      this.logger.log(-1, "onExit", "entry > " + this.pub);
      this.active = false;

      if (this.redirectAfterExit) {
        hash("#/apps/" + this.selectedOrg.id + "/" + this.model.id + ".html");
      } else {
        this.logger.log(-1, "onExit", "exit >> Do not redictect!");
      }
    },
    onExit() {
      this.logger.log(-1, "onExit", "entry > " + this.pub);
      this.active = false;

      if (this.redirectAfterExit) {
        hash("#/apps/" + this.selectedOrg.id + ".html");
      } else {
        this.logger.log(-1, "onExit", "exit >> Do not redictect!");
      }
    },

    onGoHome() {
      this.logger.log(-1, "onExit", "entry > " + this.pub);
      this.active = false;

      if (this.redirectAfterExit) {
        hash("#/apps/" + this.selectedOrg.id + ".html");
      } else {
        this.logger.log(-1, "onExit", "exit >> Do not redictect!");
      }
    },

    onShare() {
      this.logger.log(0, "onShare", "entry");
    },

    onCommandAdded(count) {
      if (this.isPublic && count == 50 && !this.reminderShown) {
        this.showSignUpReminderDialog(this.saveButton);
        this.reminderShown = true;
      }
    },

    /********************************************************
     * Selection handlers!
     ********************************************************/

    onRulerSelected(screen, ruler) {
      this.logger.log("onRulerSelected", "entry : active:" + this.active);

      if (this.active) {
        try {
          this.cleanUp();
          this._selection = "ruler";
          this._selectedRuler = {
            screen: screen,
            ruler: ruler,
          };
          this.showRulerProperties(screen, ruler);
        } catch (e) {
          console.error(e.stack);
          this.logger.sendError(e);
        }
      } else {
        this.logger.log(0, "onRulerSelected", "exit > Not Active");
      }
    },

    onWidgetSelected(widget) {
      this.logger.log(1, "onWidgetSelected", "entry : active:" + this.active);

      /**
       * Make this faster. Just updating the view costs 30ms
       */
      if (this.active && widget) {
        try {
          /**
           * We might want to blur some stuff
           */
          if (this._selectedWidget && this._selectedWidget.id != widget.id) {
            this.logger.log(3, "onWidgetSelected", "exit > no new selection!");
            this.blurWidgetProperties();
          }

          this.cleanUp();
          this._selection = "widget";
          this._selectedWidget = widget;
          this._selectionID = widget.id;
          this.showWidgetProperties(widget);
          this.showCopyPaste();
          this.showDevTools();
          this.showTools();
          this.showTemplate(widget);
          this.sidebartitle = widget.name;
          this.logger.log(3, "onWidgetSelected", "exit");
        } catch (e) {
          console.error(e.stack);
          this.logger.sendError(e);
        }
      } else {
        this.logger.log(0, "onWidgetSelected", "exit > Not Active");
      }
    },

    onInheritedWidgetSelected(widget) {
      this.logger.log(-1, "onInheritedWidgetSelected", "entry:" + widget.id);

      if (this.active) {
        /**
         * We might want to blur some stuff
         */
        if (this._selectedWidget && this._selectedWidget.id != widget.id) {
          this.logger.log(3, "onWidgetSelected", "exit > no new selection!");
          this.blurWidgetProperties();
        }

        this.cleanUp();

        this.showInheritedWidgetProperties(widget);
        this._selection = "inheritedWidget";
        this._selectedWidget = widget;
        this._selectionID = widget.id;
      }
    },

    onScreenSelected(screen) {
      this.logger.log(3, "onScreenSelected", "entry > active: " + this.active);

      if (this.active) {
        try {
          this.cleanUp();

          if (screen) {
            this._selection = "screen";
            this._selectionID = screen.id;
            this._selectedScreen = screen;
            this.showScreenProperties(screen);

            let screenType = undefined;
            if (screen.props && screen.props.start) {
              screenType = "start";
            } else if (screen.segment) {
              screenType = "segment";
            } else if (screen.style && screen.style.overlay) {
              screenType = "overlay";
            }
            this.screenTypeList.setValue(screenType);
            //this.showCopyPaste();
            //this.showDevTools()
            //this.showScreenTools()
            this.sidebartitle = "Screen";
          } else {
            this.logger.error("onScreenSelected", "exit > no screen passed");
          }
        } catch (e) {
          console.error(e.stack);
          this.logger.sendError(e);
        }
        this.logger.log(4, "onScreenSelected", "exit");
      } else {
        this.logger.log(0, "onScreenSelected", "exit > Not active!");
      }
    },

    onLineSelected(line) {
      this.cleanUp();
      this._selection = "line";
      this._selectedLine = line;
      this.showLineDetails(line);
      this.showCopyPaste();
    },

    onMultiSelect(selection) {
      if (this.active) {
        try {
          this.cleanUp();
          this._selection = "multi";
          this._selectedMulti = selection;
          this.showCopyPaste();
          this.showTemplateMerge(selection);
          this.showTools();
          this.showMultiProperties(this._selectedMulti);
          this.sidebartitle = "Selection";
        } catch (e) {
          console.error(e);
          this.logger.sendError(e);
        }
      } else {
        this.logger.log(0, "onMultiSelect", "exit > Not active!");
      }
    },

    onGroupSelect(group) {
      if (this.active) {
        try {
          this.cleanUp();
          this._selection = "group";
          this._selectedGroup = group;
          this.showCopyPaste();
          this.showTemplate(group);
          this.showTools();
          this.showGroupProperties(group);
          this.showDevTools();
          this.sidebartitle = group.name;
        } catch (e) {
          console.error(e);
          this.logger.sendError(e);
        }
      } else {
        this.logger.log(0, "onGroupSelect", "exit > Not active!");
      }
    },

    onCanvasSelected() {
      this.cleanUp();
      this.showCanvas();
    },

    /**
     * method which will update all properties. method is called from controller!
     */
    updatePropertiesView() {
      if (this.active) {
        try {
          /**
           * 1) check if we have to hide general stuff
           */
          this.hideNotNeededButtons();

          /**
           * 2) update stuff
           */
          if (this._selectedWidget) {
            this.onWidgetSelected(this._selectedWidget);
          } else if (this._selectedScreen) {
            this.onScreenSelected(this._selectedScreen);
          } else if (this._selectedGroup) {
            this.showGroupProperties(this._selectedGroup);
          } else {
            this.showCanvas();
          }
        } catch (e) {
          console.error(e);
          console.error(e.stack);
          this.logger.sendError(e);
        }
      } else {
        this.logger.log(0, "updatePropertiesView", "exit > Not active!");
      }
    },

    onChildWidgetSelected(widgetID) {
      if (this.canvas) {
        this.canvas.onWidgetSelected(widgetID);
      }
    },

    /********************************************************
     * CleanUp
     ********************************************************/

    cleanUp() {
      this.storePropertiesState();

      this._flushInputFields();

      this._blurInputFields();

      this.cleanUpUI();

      this._selectedWidget = null;

      this._selectedLine = null;

      this._selectedScreen = null;

      this._selectedMulti = null;

      this._selectedGroup = null;

      this._selection = null;

      this._selectionID = null;

      this._selectedRuler = null;

      this._selectionPaths = null;
    },

    _blurInputFields() {
      var nodes = document.getElementsByTagName("input");
      for (var x = 0; x < nodes.length; x++) {
        nodes[x].blur();
      }
    },

    _flushInputFields() {
      /**
       * a little bit hacky. we flush the screen name now!
       * FIXME; This can cause errors in case of undo and redo!
       */
      this.setScreenName(this.stripHTML(this.screenName.value));

      this.setWidgetName(this.stripHTML(this.widgetName.value));

      this.setGroupName(this.stripHTML(this.groupName.value));

      if (this.widgetSize.isDirty()) {
        this.widgetSize.update();
      }

      if (this.tooltipSettings) {
        this.tooltipSettings.blur();
      }

      if (this.validationWidget) {
        this.validationWidget.blur();
      }
    },

    /**
     * The layer list needs to be able to set the name, otherwise the _flushInputFields
     * method will be called after and write the old value!
     */
    onModelNameChange(id, type, txt) {
      if (type == "widget") {
        this.widgetName.value = txt;
      } else if (type == "screen") {
        this.screenName.value = txt;
      } else if (type == "group") {
        this.groupName.value = txt;
      }
    },

    /**********************************************************************
     * Themes
     **********************************************************************/

    changeThemeVariable(theme) {
      this.logger.log(-1, "changeThemeVariable", "entry", theme);
      this.controller.updateThemeVariable(theme.id, theme.value, theme.keys);
    },

    onThemeChange() {
      this.logger.log(-1, "onThemeChange", "entry > ");
      if (this.createBTNContent) {
        this.createBTNContent.onThemeChange();
      }
    },

    /**********************************************************************
     * Design Token
     **********************************************************************/

    newDesignToken(tokenType, cssProps, name) {
      this.logger.log(-1, "newDesignToken", "entry", name);

      const state = this._getViewStyleModelKey();
      if (this._selectedWidget) {
        this.controller.addDesignToken(this._selectedWidget.id, tokenType, cssProps, state, name, "widget");
      }
      if (this._selectedScreen) {
        this.controller.addDesignToken(this._selectedScreen.id, tokenType, cssProps, state, name, "screen");
      }
      this.designTokenList.setModel(this.model);
    },

    linkDesignToken(designToken, cssProps) {
      this.logger.log(-1, "linkDesignToken", "entry");
      var state = this._getViewStyleModelKey();
      if (this._selectedWidget) {
        this.controller.linkDesignToken(this._selectedWidget.id, designToken.id, state, cssProps, "widget");
      }
      if (this._selectedScreen) {
        this.controller.linkDesignToken(this._selectedScreen.id, designToken.id, state, cssProps, "screen");
      }
    },

    unlinkDesignToken(designToken) {
      this.logger.log(-1, "unlinkDesignToken", "entry", designToken);

      var state = this._getViewStyleModelKey();
      if (this._selectedWidget) {
        this.controller.unlinkDesignToken(this._selectedWidget.id, designToken.id, state, "widget");
      }
      if (this._selectedScreen) {
        this.controller.unlinkDesignToken(this._selectedScreen.id, designToken.id, state, "screen");
      }
    },

    changeDesignToken(designToken) {
      this.logger.log(-1, "changeDesignToken", "entry");
      this.controller.updateDesignToken(designToken.id, designToken.name, designToken.value);
    },

    removeDesignToken() {
      this.logger.log(-1, "deleteDesignToken", "entry");
    },

    /**********************************************************************
     * Action
     **********************************************************************/

    newAction(action) {
      if (this._selectedWidget) {
        this.controller.addAction(this._selectedWidget.id, action, false);
      }

      if (this._selectedGroup) {
        this.controller.addAction(this._selectedGroup.id, action, true);
      }
    },

    removeAction(action) {
      if (this._selectedWidget) {
        this.controller.removeAction(this._selectedWidget.id, action, false);
      }

      if (this._selectedGroup) {
        this.controller.removeAction(this._selectedGroup.id, action, true);
      }
    },

    updateAction(action) {
      this.logger.log(-1, "updateAction", "enter > ", action);

      if (this._selectedWidget) {
        this.controller.updateAction(this._selectedWidget.id, action, false);
      }

      if (this._selectedGroup) {
        this.controller.updateAction(this._selectedGroup.id, action, true);
      }
    },

    /**********************************************************************
     * Modes
     **********************************************************************/

    onMove(e) {
      this.stopEvent(e);
      this.canvas.setMode("move");
    },

    onEdit(e) {
      this.stopEvent(e);
      this.canvas.setMode("edit");
    },

    /**********************************************************************
     * Copy, Paste, Delete
     **********************************************************************/

    onCopy(e) {
      this.stopEvent(e);
      this.logger.log(1, "onCopy", "entry : " + this._selection);

      this.canvas.onCopy();
    },

    onPaste(e) {
      this.stopEvent(e);
      this.logger.log(1, "onPaste", "entry : " + this._selection);
      this.canvas.onPaste(true, e);
    },

    onDelete(e) {
      this.stopEvent(e);
      this.logger.log(1, "onDelete", "entry : " + this._selection);

      if (this._selection == "line") {
        this.removeLine();
      }

      if (this._selection == "widget") {
        this.removeWidget();
      }

      if (this._selection == "screen") {
        this.removeScreen();
      }

      if (this._selection == "multi") {
        this.removeMulti();
      }

      if (this._selection == "group") {
        this.removeGroup();
      }
    },

    removeLine() {
      if (this._selectedLine) {
        this.controller.removeLine(this._selectedLine);
        this.cleanUp();
      }
      if (this._selectedWidget) {
        let line = this.getLine(this._selectedWidget);
        if (line) {
          this.controller.removeLine(line);
          this.cleanUp();
        }
      }
      if (this._selectedGroup) {
        let line = this.getLine(this._selectedGroup);
        if (line) {
          this.controller.removeLine(line);
          this.cleanUp();
        }
      }
      return false;
    },

    removeLineById(id) {
      var line = this.model.lines[id];
      if (line) {
        this.controller.removeLine(line);
        this.cleanUp();
      } else {
        console.debug("removeLineById() > No Line with id", id);
      }
    },

    removeWidget() {
      if (this._selectedWidget) {
        this.controller.removeWidget(this._selectedWidget.id);
        this.cleanUp();
      }
      return false;
    },

    removeScreen() {
      if (this._selectedScreen) {
        this.controller.removeScreen(this._selectedScreen.id);
        this.cleanUp();
      }
      return false;
    },

    removeMulti() {
      if (this._selectedMulti) {
        this.controller.removeMultiWidget(this._selectedMulti);
        this.cleanUp();
      }
      return false;
    },

    removeGroup() {
      if (this._selectedGroup) {
        this.controller.removeGroupAndWidgets(this._selectedGroup.id);
        this.cleanUp();
      }
      return false;
    },

    /**********************************************************************
     * Tools which get activated and change how the canvas responds to clicks
     **********************************************************************/

    onToolCreateTheme(e) {
      this.stopEvent(e);
      this.showThemeCreateDialog(e);
    },

    onToolChangeTemplate(type, e) {
      this.stopEvent(e);
      this.logger.log(-1, "onToolChangeTemplate", "entry : " + type);
      if (type === "update") {
        this.onToolUpdateTemplate(e);
      }
      if (type === "remove") {
        this.onToolRemoveTemplate(e);
      }
    },

    onToolRemoveTemplate(e) {
      this.logger.log(1, "onToolRemoveTemplate", "entry : " + this._selectedWidget);
      this.stopEvent(e);
      if (this._selectedWidget) {
        this.controller.unlinkTemplate(this._selectedWidget.id, false);
      }
      if (this._selectedGroup) {
        this.controller.unlinkTemplate(this._selectedGroup.id, true);
      }
    },

    onToolUpdateTemplate(e) {
      this.stopEvent(e);
      this.logger.log(1, "onToolUpdateTemplate", "entry : " + this._selectedWidget);
      if (this._selectedWidget) {
        this.controller.updateTemplateStyle(this._selectedWidget.id);
      }
      if (this._selectedGroup) {
        this.controller.updateGroupTemplateStyle(this._selectedGroup.id);
      }
    },

    onToolCreateTemplate(e) {
      this.stopEvent(e);
      this.logger.log(1, "onToolCreateTemplate", "entry : " + this._selectedWidget);

      let name = this.getNLS("toolbar.templates.new");
      if (this._selectedWidget && this._selectedWidget.name) {
        name = this._selectedWidget.name;
      }

      if (this._selectedScreen && this._selectedScreen.name) {
        name = this._selectedScreen.name;
      }

      if (this._selectedGroup && this._selectedGroup.name) {
        name = this._selectedGroup.name;
      }

      this.showTemplateCreateDialog(name);
    },

    onToolbarReplicate(e) {
      this.stopEvent(e);
      this.logger.log(1, "onToolbarReplicate", "entry : " + this._selectedWidget);
      this.canvas.onReplicate();
      if (this.replicateBtn) {
        css.toggle(this.replicateBtn, "MatcToolbarItemActive");
      }
    },

    onToolbarDistribute(e) {
      this.stopEvent(e);
      this.logger.log(1, "onToolbarDistribute", "entry : " + this._selectedWidget);
      this.canvas.onDistribute();
      if (this.distributeBtn) {
        css.toggle(this.distributeBtn, "MatcToolbarItemActive");
      }
    },

    onToolbarGridResize(e) {
      this.stopEvent(e);
      this.logger.log(-1, "onToolbarGridResize", "entry : " + this._selectedWidget);
      this.canvas.onGridResize();
      if (this.distributeBtn) {
        css.toggle(this.distributeBtn, "MatcToolbarItemActive");
      }
    },

    onToolCopyStyle(e) {
      this.stopEvent(e);
      this.logger.log(1, "onCopyStyle", "entry : " + this._selection);

      if (this._selection != "screen") {
        this.canvas.onCopyStyle();
        this.toolCopyPasteStyleStart();
      }
    },

    onToolAlignElements(value, e) {
      this.logger.log(-1, "onAlignElements", "entry : " + this._selection + " > " + e.ctrlKey);
      this.stopEvent(e);
      const ignoreGroups = e.shiftKey;

      if (this._selectedMulti) {
        /**
         * in case we are in a selction we will align to the selection!
         */
        this.controller.alignWidgets(value, this._selectedMulti, this._selectedMulti, true);
      } else if (this._selectedWidget) {
        /**
         * Since 2.1.7 we allign on canvas
         */

        // this.toolAlignStart(value);
        // this.canvas.onAlignStart(value);
        const parentScreen = this.getParentScreen(this._selectedWidget);
        if (parentScreen) {
          this.controller.alignWidgets(value, [this._selectedWidget.id], [parentScreen.id]);
        } else {
          this.logger.log(1, "onAlignElements", "exit not parent : ", this._selectedWidget);
        }
      } else if (this._selectedGroup) {
        /**
         * Since 2.1.7 we allign on canvas
         */
        const widgetID = this._selectedGroup.children[0];
        const widget = this.model.widgets[widgetID];
        if (widget) {
          const parentScreen = this.getParentScreen(widget);
          if (parentScreen) {
            /**
             * Groups can have multiple children
             */
            const allChildren = this.getAllGroupChildren(this._selectedGroup);
            if (ignoreGroups) {
              this.controller.alignWidgets(value, allChildren, allChildren, true);
            } else {
              this.controller.alignWidgets(value, allChildren, [parentScreen.id]), false;
            }
          } else {
            this.logger.log(1, "onAlignElements", "exit not parent : ", this._selectedGroup);
          }
        }
      }
    },

    onToolDistributeElements(value, e) {
      this.logger.log(-1, "onToolDistributeElements", "entry : " + this._selection);
      this.stopEvent(e);

      if (this._selectedMulti && this._selectedMulti.length > 2) {
        this.controller.distributeWidgets(value, this._selectedMulti);
      } else {
        this.canvas.showError("Select more than 2 elements");
      }
    },

    onToolSelect(mode, e) {
      this.logger.log(1, "onModeClick", "entry > '" + mode + "'");
      this.stopEvent(e);
      topic.publish("matc/canvas/click", "");
      /**
       * toggle between modes!
       */
      if (this.mode == "select") {
        this.controller.setMode("edit");
      } else {
        this.controller.setMode("select");
      }
    },

    onToolText(e) {
      this.logger.log(1, "onToolHotspot", "entry >");
      this.stopEvent(e);

      topic.publish("matc/canvas/click", "");

      /**
       * toggle between modes!
       */
      if (this.mode == "addText") {
        this.controller.setMode("edit");
      } else {
        this.controller.setMode("addText");
      }
    },

    onToolBox(e) {
      this.logger.log(1, "onToolBox", "entry >");
      this.stopEvent(e);

      topic.publish("matc/canvas/click", "");

      /**
       * toggle between modes!
       */
      if (this.mode == "addBox") {
        this.controller.setMode("edit");
      } else {
        this.controller.setMode("addBox");
      }
    },

    onToolRound(e) {
      this.logger.log(1, "onToolRound", "entry >");
      this.stopEvent(e);

      topic.publish("matc/canvas/click", "");

      /**
       * toggle between modes!
       */
      if (this.mode == "addRound") {
        this.controller.setMode("edit");
      } else {
        this.controller.setMode("addRound");
      }
    },

    onToolHotspot(e) {
      this.logger.log(1, "onToolHotspot", "entry >");
      this.stopEvent(e);
      topic.publish("matc/canvas/click", "");
      if (this.mode == "hotspot") {
        this.controller.setMode("edit");
      } else {
        this.controller.setMode("hotspot");
      }
    },

    onToolSVG(tool, e) {
      this.logger.log(-1, "onToolSVG", "entry >", tool);
      this.stopEvent(e);
      topic.publish("matc/canvas/click", "");

      this.controller.setMode("svg");
      this.emit("onNewSVG", { event: e, type: tool.value });
    },

    onToolEditSVG() {
      if (this._selectedWidget) {
        this.controller.setMode("svg");
        this.emit("onEditSVG", { id: this._selectedWidget.id });
      }
    },

    onToolLogicAndRest(v, e) {
      this.logger.log(-1, "onToolLogicAndRest", "entry >", v.value, e);
      this.stopEvent(e);
      topic.publish("matc/canvas/click", "");

      if (v.value === "rest") {
        this.onNewRestObject(v, e);
        return;
      }

      if (v.value === "ai") {
        this.onNewAIRestObject(e, v.type);
        return;
      }

      if (v.value === "logic") {
        this.onNewLogicObject(e, v);
        return;
      }

      if (v.value === "script") {
        this.onNewScriptObject(e);
        return;
      }

      if (v.value === "assistant") {
        this.onNewAssistantObject(e);
        return;
      }

      if (v.value === "prompt") {
        this.onPromptBuilderObject(e);
        return;
      }

      // if (v.value === 'airtable') {
      // 	this.onAirtableBuilderObject(e)
      // 	return
      // }
      if (v.value === "docToText") {
        this.onDocToTextBuilderObject(e);
        return;
      }
      if (v.value === "textToDoc") {
        this.onTextToDocBuilderObject(e);
        return;
      }
      if (v.value === "download") {
        this.onDownloadObject(e);
        return;
      }
      if (v.value === "ftp") {
        this.onFTPBuilderObject(e);
        return;
      }

      if (v.value === "api") {
        this.onApiObject(e, v);
        return;
      }
      if (v.value === "localStorage") {
        this.onLocalStorageBuilderObject(e);
        return;
      }
      if (v.value === "copyClipboard") {
        this.onCopyClipboardObject(e);
        return;
      }

      this.logger.log(-1, "onToolLogicAndRest", "Not supported", v);
    },

    onToolSVGEnd() {
      this.logger.log(1, "onToolSVGEnd", "entry >");
      if (this.canvas) {
        this.canvas.endSVG();
      }
    },

    onToolGroup(e) {
      this.logger.log(1, "onToolGroup", "entry");
      this.stopEvent(e);

      if (this._selectedGroup) {
        this.controller.removeGroup(this._selectedGroup.id);
      }

      if (this._selectedMulti) {
        /**
         * Create a group and let the canvas select it!
         */
        var group = this.controller.addGroup(this._selectedMulti);
        if (group) {
          this.canvas.onGroupSelected(group.id);
        }
      }
    },

    onToolWidgetLayer(value) {
      this.logger.log(-1, "onToolWidgetLayer", "entry > " + value);

      let selection = this._getSelectedWidgets();
      if (selection.length > 0) {
        let topId = false;
        /**
         * Since 4.0.60 we have a single selection in a group,
         * can we boost the entire group to top?
         */

        if (selection.length === 1 && (value === "front" || value === "back")) {
          const widget = this.model.widgets[selection[0]];
          if (widget) {
            let parentGroup = this.getTopParentGroup(widget.id);
            topId = widget.id;
            if (parentGroup) {
              selection = this.getAllGroupChildren(parentGroup);
            }
          }
        }

        let parent;
        for (let i = 0; i < selection.length; i++) {
          const widget = this.model.widgets[selection[i]];
          if (widget) {
            parent = this.getParentScreen(widget, this.model);
          }
        }

        const widgets = this.model.widgets;
        const oldValues = ModelUtil.getZValuesForScreen(this.model, parent?.id); //this.getZValues(widgets); // can we scope this to a screen. Check layer list
        const offset = this._getZOffset(selection, oldValues);
        const max = this.getMaxZValue(widgets);
        const min = this.getMinZValue(widgets);

        switch (value) {
          case "front":
            for (let i = 0; i < selection.length; i++) {
              let id = selection[i];
              oldValues[id] = max + 1 + offset[id];
            }
            break;
          case "forward":
            for (let i = 0; i < selection.length; i++) {
              let id = selection[i];
              oldValues[id] += 1.1; // we add a little more than one, to make sure we do not collide with other
            }
            break;
          case "backward":
            for (let i = 0; i < selection.length; i++) {
              let id = selection[i];
              oldValues[id] -= 1.1; // we add a little more than one, to make sure we do not collide with other
            }
            break;
          default:
            var l = selection.length + max;
            for (let i = 0; i < selection.length; i++) {
              let id = selection[i];
              oldValues[id] = min - l + offset[id];
            }
            break;
        }

        /**
         * Since 4.0.60 we move groups as well up or down
         */
        if (topId) {
          if (value === "front") {
            oldValues[topId] = max + 10 + selection.length;
          }
          if (value === "back") {
            oldValues[topId] = min - 10 - (selection.length + max);
          }
        }

        /**
         * normalize z-values to have the model a little bit better. Lowest value should be
         * zero, not more than one step between layers
         */
        const newValues = this.getNormalizeWidgetZValues(oldValues);
        this.controller.setWidgetLayers(newValues);
      }
    },

    _getZOffset(selection, values) {
      const offsets = {};

      let min = 100000;

      for (let i = 0; i < selection.length; i++) {
        const id = selection[i];
        min = Math.min(min, values[id]);
      }

      for (let i = 0; i < selection.length; i++) {
        const id = selection[i];
        offsets[id] = values[id] - min;
      }

      return offsets;
    },

    _getSelectedWidgets() {
      let selection = [];
      if (this._selectedWidget) {
        selection.push(this._selectedWidget.id);
      } else if (this._selectedGroup) {
        /**
         * Since 2.1.3 we have sub groups
         */
        selection = this.getAllGroupChildren(this._selectedGroup);
      } else if (this._selectedMulti) {
        selection = this._selectedMulti;
      } else {
        console.warn("_getSelectedWidgets() > Cannot get fint selection!");
      }
      return selection;
    },

    /**********************************************************************
     * UI Callback to update style & props
     **********************************************************************/

    toggleLineHide(value) {
      this.logger.log(3, "toggleLineHide", "entry >" + value);
      if (this._selectedWidget) {
        let line = this.getLineFrom(this._selectedWidget);
        if (line) {
          this.controller.updateLineProperties(line.id, "hidden", value);
        } else {
          console.warn("toggleLineHide() > No line for widget. Check should no be visible!");
        }
      }

      if (this._selectedGroup) {
        let line = this.getLineFrom(this._selectedGroup);
        if (line) {
          this.controller.updateLineProperties(line.id, "hidden", value);
        } else {
          console.warn("toggleLineHide() > No line for Group. Check should no be visible!");
        }
      }
    },

    setLineProperty(key, value) {
      this.logger.log(2, "setLineProperty", "entry >" + key + " : " + value);

      if (this._selectedWidget) {
        let line = this.getLineFrom(this._selectedWidget);
        if (line) {
          this.controller.updateLineProperties(line.id, key, value);
        } else {
          console.warn("setLineProperty() > No line for widget. Check should no be visible!");
        }
      }

      if (this._selectedGroup) {
        let line = this.getLineFrom(this._selectedGroup);
        if (line) {
          this.controller.updateLineProperties(line.id, key, value);
        } else {
          console.warn("setLineProperty() > No line for Group. Check should no be visible!");
        }
      }
    },

    setLinePropertyByID(id, key, value) {
      this.logger.log(0, "setLinePropertyByID", "entry >" + id + " > " + key + " : " + value);

      var line = this.model.lines[id];
      if (line) {
        this.controller.updateLineProperties(line.id, key, value);
      } else {
        console.warn("setLinePropertyByID() > No line with id " + id + ". Check should no be visible!");
      }
    },

    updateLineByID(id, newLine) {
      this.logger.log(0, "updateLineByID", "entry >" + id);

      var line = this.model.lines[id];
      if (line) {
        this.controller.updateLineAllProperties(line.id, newLine);
      } else {
        console.warn("updateLineByID() > No line with id " + id + ". Check should no be visible!");
      }
    },

    setWidgetSize(pos) {
      this.logger.log(1, "setWidgetSize", "entry > ");

      if (this._selectedWidget) {
        this.controller.updateWidgetPosition(this._selectedWidget.id, pos, true);
      }

      return false;
    },

    enableInheritedWidget() {
      this.logger.log(1, "enableInheritedWidget", "entry > ");
      if (this._selectedWidget) {
        const newWidget = this.controller.enableInheritedWidget(this._selectedWidget);
        if (newWidget) {
          /**
           * Trigger Selecion in Canvas which will also trigger back the selection
           * in the controller and then the Toolbar.
           */
          if (this.canvas) {
            this.canvas.onWidgetSelected(newWidget.id);
          }
        }
      }
      return false;
    },

    setScreenSize(pos) {
      this.logger.log(0, "setScreenSize", "entry > " + pos.w + "/" + pos.h);

      if (this._selectedScreen) {
        this.controller.updateScreenWidthAndHeight(this._selectedScreen.id, pos);
      }
      return false;
    },

    toggleStyle(key, value) {
      this.logger.log(0, "toggleStyle", "entry > " + key + " - " + value);
      var modelKey = this._getViewStyleModelKey();
      var newStyle = {};
      if (this._selectedWidget && this._selectedWidget.style) {
        let style = this._selectedWidget[modelKey];
        if (style && (style[key] == null || style[key] != value)) {
          newStyle[key] = value;
        } else {
          newStyle[key] = "";
        }
        this.controller.updateWidgetProperties(this._selectedWidget.id, newStyle, modelKey);
      } else if (this._selectedMulti && this._selectedMulti[0]) {
        var widget = this.model.widgets[this._selectedMulti[0]];
        if (widget) {
          let style = widget[modelKey];
          if (style && (style[key] == null || style[key] != value)) {
            newStyle[key] = value;
          } else {
            newStyle[key] = "";
          }
          this.controller.updateMultiProperties(this._selectedMulti, newStyle, modelKey);
        }
      }
      return false;
    },

    setWidgetStyle(key, value) {
      this.logger.log(2, "setWidgetStyle", "entry > " + key + " - " + value);

      var newSytle = {};
      newSytle[key] = value;
      var modelKey = this._getViewStyleModelKey();

      if (this._selectedWidget && this._selectedWidget.style) {
        this.controller.updateWidgetProperties(this._selectedWidget.id, newSytle, modelKey);
      } else if (this._selectedMulti) {
        this.controller.updateMultiProperties(this._selectedMulti, newSytle, modelKey);
      } else if (this._selectedGroup) {
        const children = this.getAllGroupChildren(this._selectedGroup);
        this.controller.updateMultiProperties(children, newSytle, modelKey);
      }
      return false;
    },

    setWidgetMultiStyle(newStyle) {
      this.logger.log(2, "setWidgetMultiStyle", "entry");
      var modelKey = this._getViewStyleModelKey();
      if (this._selectedWidget && this._selectedWidget.style) {
        this.controller.updateWidgetProperties(this._selectedWidget.id, newStyle, modelKey);
      } else if (this._selectedMulti) {
        this.controller.updateMultiProperties(this._selectedMulti, newStyle, modelKey);
      }
      return false;
    },

    setWidgetMultiProps(newProps) {
      this.logger.log(1, "setWidgetMultiProps", "entry", newProps);
      if (this._selectedWidget && this._selectedWidget.style) {
        this.controller.updateWidgetProperties(this._selectedWidget.id, newProps, "props");
      }
      return false;
    },

    _getViewStyleModelKey() {
      return this.widgetViewModeBtn.getValue();
    },

    // setWidgetDataBinding(dataBinding, schema, data) {
    //   this.logger.log(1, "setWidgetDataBinding", "entry > ", dataBinding, schema);
    //   if (this._selectedWidget) {
    //     this.controller.updateWidgetDataBinding(this._selectedWidget.id, dataBinding, schema, data);
    //   }
    //   return false;
    // },

    setWidgetProps(key, value) {
      this.logger.log(2, "setWidgetProps", "entry > " + key + " - " + value);
      if (this._selectedWidget) {
        if (this._selectedWidget.props) {
          const newProps = {};
          newProps[key] = value;
          this.controller.updateWidgetProperties(this._selectedWidget.id, newProps, "props");
        }
      }
      if (this._selectedMulti) {
        const newProps = {};
        newProps[key] = value;
        this.controller.updateMultiProperties(this._selectedMulti, newProps, "props");
      }
      return false;
    },

    setGroupProperties(key, value) {
      this.logger.log(2, "setGroupProperties", "entry > " + key + " - " + value);
      if (this._selectedGroup) {
        var newProps = {};
        newProps[key] = value;
        this.controller.updateGroup(this._selectedGroup.id, "props", key, value);
      }
      return false;
    },

    setGroupStyle(key, value) {
      this.logger.log(2, "setGroupStyle", "entry > " + key + " - " + value);
      if (this._selectedGroup) {
        var newProps = {};
        newProps[key] = value;
        this.controller.updateGroup(this._selectedGroup.id, "style", key, value);
      }
      return false;
    },

    setScreenStyle(key, value) {
      this.logger.log(2, "setScreenStyle", "entry > " + key + " - " + value);
      if (this._selectedScreen) {
        if (this._selectedScreen.style) {
          var newSytle = {};
          newSytle[key] = value;
          this.controller.updateScreenProperties(this._selectedScreen.id, newSytle, "style");
        }
      }
      return false;
    },

    setRulerProperties(props) {
      this.logger.log(2, "setRulerProperties", "entry ");
      if (this._selectedRuler) {
        this.controller.updateScreenRulerProps(this._selectedRuler.screen.id, this._selectedRuler.ruler.id, props);
      }
      return false;
    },

    setRulerPosition(v) {
      this.logger.log(0, "setRulerPosition", "entry > " + v);
      if (this._selectedRuler) {
        this.controller.updateScreenRulerValue(this._selectedRuler.screen.id, this._selectedRuler.ruler.id, v);
      }
    },

    /***************************************************************************************************************
     *  Temp Styles without model updates. Just update the rendering!
     ***************************************************************************************************************/
    setTempScreenStyle(key, value) {
      this.logger.log(0, "setTempScreenStyle", "entry > " + key + " - " + value);
      if (this._selectedScreen) {
        if (this._selectedScreen.style) {
          var newSytle = {};
          newSytle[key] = value;
          this.canvas.setTempScreenStyle(this._selectedScreen.id, newSytle);
        }
      }
      return false;
    },

    setTempWidgetStyle(key, value) {
      this.logger.log(2, "setTempWidgetStyle", "entry > " + key + " - " + value);
      const modelKey = this._getViewStyleModelKey();
      if ("style" === modelKey) {
        const newStyle = {};
        newStyle[key] = value;
        if (this._selectedWidget && this._selectedWidget.style) {
          this.canvas.setTempWidgetStyle(this._selectedWidget.id, newStyle);
        } else if (this._selectedMulti) {
          for (var i = 0; i < this._selectedMulti.length; i++) {
            this.canvas.setTempWidgetStyle(this._selectedMulti[i], newStyle);
          }
        }
      }
      return false;
    },

    setTempMultiWidgetStyle(newStyle) {
      this.logger.log(0, "setTempMultiWidgetStyle", "entry > " + newStyle);
      const modelKey = this._getViewStyleModelKey();
      if ("style" === modelKey) {
        if (this._selectedWidget && this._selectedWidget.style) {
          this.canvas.setTempWidgetStyle(this._selectedWidget.id, newStyle);
        } else if (this._selectedMulti) {
          for (var i = 0; i < this._selectedMulti.length; i++) {
            this.canvas.setTempWidgetStyle(this._selectedMulti[i], newStyle);
          }
        }
      }
      return false;
    },

    setScreenStart(key, value) {
      this.logger.log(2, "setScreenStart", "entry > " + key + " - " + value);
      if (this._selectedScreen) {
        if (this._selectedScreen.props) {
          var newProps = {};
          newProps[key] = value;
          this.controller.updateScreenStart(this._selectedScreen.id, newProps, "props");
        }
      }
      return false;
    },

    setScreenSegement(key, value) {
      this.logger.log(0, "setScreenSegement", "entry > " + key + " - " + value);
      if (this._selectedScreen) {
        this.controller.setScreenSegment(this._selectedScreen.id, value);
      }
      return false;
    },

    setScreenProps(key, value) {
      this.logger.log(0, "setScreenProps", "entry > " + key + " - " + value);
      if (this._selectedScreen) {
        if (this._selectedScreen.props) {
          var newProps = {};
          newProps[key] = value;
          this.controller.updateScreenProperties(this._selectedScreen.id, newProps, "props");
        }
      }
      return false;
    },

    setScreenParent(parentScreens) {
      this.logger.log(0, "setScreenParent", "entry > " + parentScreens.length);
      if (this._selectedScreen) {
        this.controller.setScreenParent(this._selectedScreen.id, parentScreens);
      }
      return false;
    },

    showImageSelector() {
      this.logger.log(3, "showImageSelector", "entry > ");
    },

    showLineAction(line) {
      this.logger.log(3, "showLineAction", "entry > " + line.id);

      if (this._selectedWidget) {
        if (this.actionBTN) {
          let actionBTN = this.actionBTN;
          setTimeout(function () {
            actionBTN.showActionSettings(line);
          }, 50);
        }
      } else if (this._selectedGroup) {
        if (this.groupActionBTN) {
          let actionBTN = this.groupActionBTN;
          setTimeout(function () {
            actionBTN.showActionSettings(line);
          }, 50);
        }
      }
    },

    showWidgetSelector() {
      this.setCreateContent();
      this.createBTNContent.focus();
    },

    showScreenSelector() {
      if (this.screenCreateBtn) {
        this.screenCreateBtn.onAddScreen();
      }
    },

    onScreenNameChange() {
      this.setScreenName(this.screenName.value);
    },

    setScreenName(value) {
      this.logger.log(3, "setScreenName", "entry > " + value);
      if (this._selectedScreen) {
        this.controller.setScreenName(this._selectedScreen.id, value);
      }
    },

    onWidgetNameChange() {
      this.setWidgetName(this.widgetName.value);
    },

    onGroupNameChange() {
      this.setGroupName(this.groupName.value);
    },

    setWidgetName(value) {
      this.logger.log(3, "setWidgetName", "entry > " + value);
      if (this._selectedWidget) {
        /**
         * FIXME: we could catch if there was a change... well for now the
         * controller does it...
         */
        this.controller.setWidgetName(this._selectedWidget.id, value);
      }
    },

    setGroupName(value) {
      if (this._selectedGroup && this._selectedGroup.name !== value) {
        this.logger.log(-1, "setGroupName", "entry > " + value);
        this.controller.setGroupName(this._selectedGroup.id, value);
      }
    },

    /**********************************************************************
     * Undo  & Redo
     **********************************************************************/

    hideUndoSection() {
      css.add(this.undoSection, "MatcToolbarSectionHidden");
    },

    showUndoSection() {
      css.remove(this.undoSection, "MatcToolbarSectionHidden");
    },

    onUndo() {
      this.logger.log(1, "onUndo", "entry");
      this.controller.undo();
      return false;
    },

    disableUndo() {
      css.add(this.undo, "MatcToolbarItemDisbaled");
    },

    enbaleUndo() {
      css.remove(this.undo, "MatcToolbarItemDisbaled");
    },

    onRedo() {
      this.logger.log(1, "onRedo", "entry");
      this.controller.redo();
      return false;
    },

    disableRedo() {
      css.add(this.redo, "MatcToolbarItemDisbaled");
    },

    enbaleRedo() {
      css.remove(this.redo, "MatcToolbarItemDisbaled");
    },

    setSettings(v) {
      this.logger.log(1, "setSettings", "entry > ", v);
      this.settings = v;
      if (this.settings.hasProtoMoto) {
        this.showScriptTool = true;
      } else {
        this.showScriptTool = false;
      }
    },

    showScriptDialog(widget) {
      this.logger.log(-1, "showScriptDialog", "entry > ", widget);
      if (this.dataWidget) {
        this.dataWidget.setValue(widget);
        this.dataWidget._renderScriptDialog();
      }
    },

    showRestDialog(widget) {
      this.logger.log(-1, "showRestDialog", "entry > ", widget);
      if (this.dataWidget) {
        this.dataWidget.setValue(widget);
        if (widget?.props?.template) {
          this.dataWidget._rendeTemplateRestDialog();
        } else {
          this.dataWidget._renderRestDialog();
        }
      }
    },

    showAIRestDialog(widget) {
      this.logger.log(-1, "showRestDialog", "entry > ", widget);
      if (this.dataWidget) {
        this.dataWidget.setValue(widget);
        this.dataWidget._renderAIRestDialog();
      }
    },

    showPromptBuilderDialog(widget) {
      this.logger.log(-1, "showPromptBuilderDialog", "entry > ", widget);
      if (this.dataWidget) {
        this.dataWidget.setValue(widget);
        this.dataWidget._renderPromptBuilderDialog();
      }
    },

    showFTPDialog(widget) {
      this.logger.log(-1, "showFTPBuilderDialog", "entry > ", widget);
      if (this.dataWidget) {
        this.dataWidget.setValue(widget);
        this.dataWidget._renderFTPDialog();
      }
    },

    showOpenAIAssistantDialog(widget) {
      this.logger.log(-1, "showOpenAIAssistantDialog", "entry > ", widget);
      if (this.dataWidget) {
        this.dataWidget.setValue(widget);
        this.dataWidget._renderOpenAIAssistantDialog();
      }
    },

    showDocToTextDialog(widget) {
      this.logger.log(-1, "showDocToTextDialog", "entry > ", widget);
      if (this.dataWidget) {
        this.dataWidget.setValue(widget);
        this.dataWidget._renderDocToTextDialog();
      }
    },

    showTextToDocDialog(widget) {
      this.logger.log(-1, "showTextToDocDialog", "entry > ", widget);
      if (this.dataWidget) {
        this.dataWidget.setValue(widget);
        this.dataWidget._renderTextToDocDialog();
      }
    },

    showAPIDialog(widget) {
      this.logger.log(-1, "showAPIDialog", "entry > ", widget);
      if (this.dataWidget) {
        this.dataWidget.setValue(widget);
        this.dataWidget._renderAPIDialog();
      }
    },
    showLocalStorageDialog(widget) {
      this.logger.log(-1, "showLocalStorageDialog", "entry > ", widget);
      if (this.dataWidget) {
        this.dataWidget.setValue(widget);
        this.dataWidget._renderLocalStorageDialog();
      }
    },

    /**********************************************************************
     * Helper
     **********************************************************************/

    stopEvent(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
  },
  async mounted() {
    if (this.model && this.model.id) {
      this.user = await Services.getUserService().load();
      //this.modelService = Services.getModelService(this.$route);
      this.loadRest();
      this.initFocusListener();
    }
    this.isDevelop = location.href.indexOf("localhost") > 0;
  },
  beforeDestroy() {
    this.logger.log(-1, "beforeDestroy", "enter > ");
    window.removeEventListener("focus", this._focusListner);
    this.modelService.clearChangeListeners();
    delete this._focusListner;
  },
};
</script>
