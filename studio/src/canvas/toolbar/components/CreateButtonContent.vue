<template>
  <div class="">
    <div class="MatcSidebarHeader">
      <div class="MatcCreateSearchContainer">
        <input
          type="search"
          class="MatcCreateSearch MatcIgnoreOnKeyPress form-control"
          placeholder="Search"
          data-dojo-attach-point="searchBox"
        />
        <QIcon icon="DeleteX" @click="resetSearch" v-if="searchQuery"></QIcon>
      </div>

      <div data-dojo-attach-point="categoriesCntr" @mousedown.stop @dblclick.stop></div>
      <div data-dojo-attach-point="leftCntr" @mousedown.stop @dblclick.stop></div>
    </div>
    <div class="MatcSidebarList">
      <div class="MatcCreateBtnElementList MatcCreateBtnRight" data-dojo-attach-point="rightCntr">
        <div class="MatcHint">Loading Widgets...</div>
      </div>
    </div>
  </div>
</template>

<script>
import DojoWidget from "dojo/DojoWidget";
import css from "dojo/css";
import lang from "dojo/_base/lang";
import on from "dojo/on";
import domStyle from "dojo/domStyle";
import touch from "dojo/touch";
import DomBuilder from "common/DomBuilder";
import ScrollContainer from "common/ScrollContainer";
import Util from "core/Util";
import RenderFactory from "core/RenderFactory";
import Services from "services/Services";
import ModelUtil from "core/ModelUtil";
import QSS from "../../../core/QSS";
import QIcon from "../../../page/QIcon.vue";

export default {
  name: "CreateButtonContent",
  mixins: [Util, DojoWidget],
  data: function () {
    return {
      searchQuery: "",
      screenWidth: 300,
      screenHeight: 600,
      selectedCategory: "All",
      showSubCatgeoryLabels: false,
      icons: [],
      categoriesList: [
        "Screens",
        "Buttons",
        "Form",
        "Text",
        "Image",
        "Icon",
        "Advanced",
        "Table",
        "Menu",
        "Layout",
        "Container",
        "Charts",
      ],
      categoryNames: {
        Screens: "Screens (S)",
        WireFrame: "Basic",
        Advanced: "Advanced",
        Container: "Responsive Container",
      },
      previewSizes: {
        default: { w: 88, h: 72 },
        Screen: { w: 88, h: 72 },
      },
      tab: "widgets",
      importableApps: [],
      currentPage: "m",

      /**
       * Tracks expand/collapse state for each category.
       */
      categoryOpen: {},
    };
  },
  components: {
    QIcon,
  },
  methods: {
    scrollLeft(e) {
      this.stopEvent(e);
      e.stopPropagation();
      this.categoryContent.scrollBy({ left: -100, behavior: "smooth" });
    },
    scrollRight(e) {
      this.stopEvent(e);
      e.stopPropagation();
      this.categoryContent.scrollBy({ left: 100, behavior: "smooth" });
    },
    setIcons() {},
    onThemeChange() {
      if (this.coreThemes) {
        this._replacedWidgetCache = {};
        this.onThemesLoaded(this.coreThemes);
      }
    },
    setPage(p) {
      this.currentPage = p;
      if (this.model.pages && this.model.pages[p]) {
        const page = this.model.pages[p];
        this.screenWidth = page.w;
        this.screenHeight = page.h;
        if (this.coreThemes) {
          this.onThemesLoaded(this.coreThemes);
        }
      }
    },
    setUser(user) {
      this.user = user;
    },
    async setModel(m) {
      this.model = m;
      this.screenWidth = m.screenSize.w;
      this.screenHeight = m.screenSize.h;
      this.setPage(this.currentPage);
      this.renderFactory = new RenderFactory();
      this.renderFactory.setModel(m);
      this.renderFactory.setSourceModel(m);
      this.renderFactory.setSymbol(true);
      this._importedApps = {};
      this._replacedWidgetCache = {};
      this.importableApps = await Services.getModelService(this.$route).findMyAppSummaries();
      this.init();
    },
    focus() {
      setTimeout(() => {
        this.searchBox.focus();
        this.searchBox.select();
      }, 30);
    },
    setJwtToken(t) {
      if (this.renderFactory) {
        this.renderFactory.setJwtToken(t);
      }
    },
    onVisible() {
      this.showWidgets();
      this._replacedWidgetCache = {};
      if (this.selectedCategory == "Template") {
        this.renderTemplates();
      }
      setTimeout(() => {
        this.searchBox.select();
        this.searchBox.focus();
      }, 250);
      css.add(this.domNode, "MatcToolbarItemActive");
    },
    onHide() {
      css.remove(this.domNode, "MatcToolbarItemActive");
    },
    async init() {
      if (!this.categories) {
        this.coreThemes = await Services.getSymbolService().getCore();
        this.onThemesLoaded(this.coreThemes);

        this.own(
          on(this.searchBox, "mousedown", function (e) {
            e.stopPropagation();
            return false;
          })
        );
        this.own(
          on(this.searchBox, "pointerdown", function (e) {
            e.stopPropagation();
            return false;
          })
        );
        this.own(
          on(this.searchBox, "keypress", function (e) {
            e.stopPropagation();
          })
        );
        this.own(
          on(this.searchBox, "keydown", function (e) {
            e.stopPropagation();
          })
        );
        this.own(on(this.searchBox, "keyup", lang.hitch(this, "onSearch")));
      }
    },
    onSearch(e) {
      e.stopPropagation();
      const k = e.keyCode ? e.keyCode : e.which;
      if (k === 13) {
        if (this._visibleElements && this._visibleElements.length === 1) {
          this.onCreate(this._visibleElements[0], e);
          return;
        }
      }
      const query = this.searchBox.value;
      if (query.length > 0) {
        this.searchQuery = query.toLowerCase();
        this.renderSearchResultByTab(this.searchQuery);
      } else {
        this.searchQuery = null;
        if (this.selectedCategory === "All") {
          this.showAll();
        } else if (this.selectedCategory === "Template") {
          this.showTemplates();
        } else if (this.selectedCategory === "Resources") {
          this.showResources();
        }
      }
    },
    renderSearchResultByTab(query) {
      let elements = [];
      if (this.selectedCategory === "All") {
        for (let cat in this.categories) {
          if (cat === "Resources") continue;
          const children = this.categories[cat];
          for (let id in children) {
            const child = children[id];
            if (child.name && child.name.toLowerCase().indexOf(query) !== -1) {
              elements.push(child);
            }
          }
        }
        this.renderSelectedTab("All");
        this.renderElements(elements, "search", false);
      } else if (this.selectedCategory === "Template") {
        let templateElements = [];
        if (this.model && this.model.templates) {
          for (let tid in this.model.templates) {
            let template = this.model.templates[tid];
            if (
              template.visible &&
              template.name &&
              template.name.toLowerCase().includes(query)
            ) {
              template = lang.clone(template);
              template._isTemplate = true;
              template._type = template.templateType;
              templateElements.push(template);
            }
          }
        }
        this.renderSelectedTab("Template");
        this.renderElements(templateElements, "search", true);
      } else if (this.selectedCategory === "Resources") {
        if (this.categories && this.categories["Resources"]) {
          const resources = this.categories["Resources"];
          for (let id in resources) {
            const child = resources[id];
            if (child.name && child.name.toLowerCase().indexOf(query) !== -1) {
              elements.push(child);
            }
          }
        }
        this.renderSelectedTab("Resources");
        this.renderElements(elements, "search", false);
      }
    },
    resetSearch(e) {
      if (e) {
        this.stopEvent(e);
      }
      this.searchBox.value = "";
      if (this.searchQuery) {
        this.searchQuery = null;
        if (this.selectedCategory === "All") {
          this.showAll();
        } else if (this.selectedCategory === "Template") {
          this.showTemplates();
        } else if (this.selectedCategory === "Resources") {
          this.showResources();
        }
      }
    },
    onThemesLoaded(themes) {
      this.rightCntr.innerHTML = "";
      const categories = {};
      const temp = {};

      for (let i = 0; i < themes.length; i++) {
        let theme = themes[i];
        if (theme.id) {
          theme = lang.clone(theme);
          let category = theme.category;
          if (!categories[category]) {
            categories[category] = {};
          }
          if (
            category !== "Resources" &&
            this.categoriesList.indexOf(category) === -1
          ) {
            this.categoriesList.push(category);
          }
          if (!categories[category][theme.id]) {
            categories[category][theme.id] = theme;
            temp[theme.id] = theme;
            this.setDefaultValues(theme);
            this.setDefaultValues(theme.min);
          } else {
            console.warn("We have already a theme with the id", theme.id, theme);
          }
        } else {
          console.warn("Theme has no id!");
        }
      }
      for (let id in temp) {
        let theme = temp[id];
        const category = theme.category;
        if (theme._extends) {
          const parent = temp[theme._extends];
          if (parent) {
            theme = lang.mixin(lang.clone(parent), theme);
            theme.props = lang.mixin(lang.clone(parent.props), theme.props);
            theme.style = lang.mixin(lang.clone(parent.style), theme.style);
            theme.has = lang.mixin(lang.clone(parent.has), theme.has);
            if (parent._preview) {
              theme._preview = lang.mixin(lang.clone(parent._preview), theme._preview);
            }
            if (theme.error) {
              theme.error = lang.mixin(lang.clone(parent.error), theme.error);
            }
            if (theme.focus) {
              theme.focus = lang.mixin(lang.clone(parent.focus), theme.focus);
            }
            if (theme.hover) {
              theme.hover = lang.mixin(lang.clone(parent.hover), theme.hover);
            }
            if (theme.checked) {
              theme.checked = lang.mixin(lang.clone(parent.checked), theme.checked);
            }
            if (theme.active) {
              theme.active = lang.mixin(lang.clone(parent.active), theme.active);
            }
            categories[category][id] = theme;
          } else {
            console.warn(
              "Theme " + id + " extends not exiting theme " + theme._extends
            );
          }
        }
      }

      this.render(categories);
    },
    replaceThemeVars(widget) {
      if (this._replacedWidgetCache[widget.id]) {
        return this._replacedWidgetCache[widget.id];
      }
      const theme = this.model.theme;
      const replaced = QSS.replaceVariables(theme, lang.clone(widget));
      this._replacedWidgetCache[widget.id] = replaced;
      return replaced;
    },
    setDefaultValues(box) {
      if (!box) return;
      const theme = this.model.theme;

      QSS.replaceSize(theme, box);
      QSS.replaceBorderVariables(box);

      if (box.w === "$screenwidth") {
        box.w = this.screenWidth;
      }
      if (box.w === "$25%") {
        box.w = Math.round(this.screenWidth * 0.25);
      }
      if (box.w === "$33%") {
        box.w = Math.round(this.screenWidth * 0.33);
      }
      if (box.w === "$50%") {
        box.w = Math.round(this.screenWidth * 0.5);
      }
      if (box.w === "$66%") {
        box.w = Math.round(this.screenWidth * 0.66);
      }
      if (box.w === "$75%") {
        box.w = Math.round(this.screenWidth * 0.75);
      }
      if (box.w === "$80%") {
        box.w = Math.round(this.screenWidth * 0.8);
      }
      if (box.w === "$90%") {
        box.w = Math.round(this.screenWidth * 0.9);
      }
      if (box.w === "$100%") {
        box.w = Math.round(this.screenWidth);
      }

      if (box.h === "$screenheight") {
        box.h = this.screenHeight;
      }
      if (box.h === "$25%") {
        box.h = Math.round(this.screenHeight * 0.25);
      }
      if (box.h === "$33%") {
        box.h = Math.round(this.screenHeight * 0.33);
      }
      if (box.h === "$50%") {
        box.h = Math.round(this.screenHeight * 0.5);
      }
      if (box.h === "$66%") {
        box.h = Math.round(this.screenHeight * 0.66);
      }
      if (box.h === "$75%") {
        box.h = Math.round(this.screenHeight * 0.75);
      }
      if (box.h === "$80%") {
        box.h = Math.round(this.screenHeight * 0.8);
      }
      if (box.h === "$90%") {
        box.h = Math.round(this.screenHeight * 0.9);
      }
      if (box.h === "$100%") {
        box.h = Math.round(this.screenHeight);
      }

      if (box.children) {
        for (let i = 0; i < box.children.length; i++) {
          this.setDefaultValues(box.children[i]);
        }
      }
      if (box.screens) {
        for (let id in box.screens) {
          this.setDefaultValues(box.screens[id]);
        }
      }
      if (box.widgets) {
        for (let id in box.widgets) {
          this.setDefaultValues(box.widgets[id]);
        }
      }
    },

    /**
     * Main rendering of categories. Then calls showAll().
     */
    render(categories) {
      this.categories = categories;
      const db = new DomBuilder();
      this._categoryElements = {};

      const content = db.div("category-container").build();

      // "All"
      const allCategoryId = "category-badge-all";
      const categoryElementAll = db.div(`category-header-badge active`).build(content);
      categoryElementAll.id = allCategoryId;
      db.span("", "Elements").build(categoryElementAll);
      this._categoryElements["All"] = categoryElementAll;
      this.own(
        on(categoryElementAll, touch.press, lang.hitch(this, "showAll", "All", true))
      );

      // "Templates"
      const divResource = db.div(`category-header-badge`).build(content);
      divResource.id = `category-badge-resources`;
      db.span("", "Templates").build(divResource);
      this._categoryElements["Resources"] = divResource;
      this.own(on(divResource, touch.press, lang.hitch(this, "showResources", true)));

      // "Components" icon
      const divTemplates = db.div(`category-header-badge icon`).build(content);
      divTemplates.id = `category-badge-template`;
      const iconContainer = db.div("").build(divTemplates);
      const IconComponent = this.$new(QIcon, { icon: "Component" });
      IconComponent.placeAt(iconContainer);
      this._categoryElements["Template"] = divTemplates;
      this.own(on(divTemplates, touch.press, lang.hitch(this, "showTemplates", true)));

      this.categoriesCntr.innerHTML = "";
      this.categoriesCntr.appendChild(content);

      this.scroller = this.$new(ScrollContainer);
      this.scroller.placeAt(this.rightCntr);

      this.iconCntr = db.div("").build();
      this.scroller.wrap(this.iconCntr);

      // Show the "All" tab by default
      this.showAll(this.selectedCategory);
    },

    async showWidgets() {
      this.tab = "widgets";
    },
    scrollToTop() {
      this.rightCntr.scrollTop = 0;
    },

    showAll() {
      this.selectedCategory = "All";
      this.tab = "widgets";
      this.scrollToTop();
      this.renderAll();
      this.setActiveSelectedTab("All");
      this.resetSearch();
    },

    showTemplates() {
      this.selectedCategory = "Template";
      this.tab = "widgets";
      this.scrollToTop();
      this.resetSearch();
      this.renderTemplates();
      this.setActiveSelectedTab("Template");
    },

    showResources() {
      this.selectedCategory = "Resources";
      this.tab = "widgets";
      this.scrollToTop();
      this.renderSelectedTab("Resources");
      const elements = [];
      if (this.categories && this.categories["Resources"]) {
        const resources = this.categories["Resources"];
        for (let id in resources) {
          elements.push(resources[id]);
        }
      }
      this.resetSearch();
      this.renderElements(elements, "Resources", false);
      this.setActiveSelectedTab("Resources");
    },

    setActiveSelectedTab(category) {
      const categories = ["All", "Template", "Resources"];
      categories.forEach((cat) => {
        const element = document.getElementById(`category-badge-${cat.toLowerCase()}`);
        if (!element) {
          console.warn(`No element found for category-badge-${cat.toLowerCase()}`);
          return;
        }
        if (cat === category) {
          css.add(element, "active");
        } else {
          css.remove(element, "active");
        }
      });
    },

    renderSelectedTab(category) {
      this.setAllButtonLabel(false);
      ["All", "Template", "Resources"].forEach((cat) => {
        if (this._categoryElements[cat]) {
          css.remove(this._categoryElements[cat], "allactive");
        }
      });
      if (category === "All" && this._categoryElements["All"]) {
        css.add(this._categoryElements["All"], "allactive");
      }
      if (category === "Template") {
        this.leftCntr.innerHTML = "";
      }
    },

    setAllButtonLabel(isBack) {
      const element = document.getElementById("category-badge-all");
      if (!element) return;
      const db = new DomBuilder();
      if (isBack) {
        const content = db.div("MatcFlex MatcCenter MatcPlaceCenter").build();
        const icon = db.span("mdi mdi-chevron-left").build();
        content.appendChild(icon);
        const label = db.span("").build();
        label.innerHTML = "Back to All";
        content.appendChild(label);
        element.innerHTML = "";
        element.appendChild(content);
      } else {
        const content = db.div("").build();
        content.innerHTML = "Elements";
        element.innerHTML = "";
        element.appendChild(content);
      }
    },

    renderImportedApp(app) {
      let elements = Services.getSymbolService().convertAppToSymbols(app);
      this.renderElements(elements, app.id, false);
    },

    renderTemplates() {
      const elements = [];
      if (this.model && this.model.templates) {
        for (let tid in this.model.templates) {
          let template = this.model.templates[tid];
          if (template.visible) {
            template = lang.clone(template);
            template._type = template.templateType;
            template._isTemplate = true;
            ModelUtil.inlineBoxDesignToken(template, this.model);
            elements.push(template);
          }
        }
      }
      this.renderElements(elements, "Template", true);
    },

    /**
     * This method now correctly shows the accordion title + chevron, and toggles open/closed.
     */
    renderAll() {
      this.renderFactory.cleanUp();
      this.cleanUpTempListener();

      const db = new DomBuilder();
      const cntr = db.div().build();

      // For each category in categoriesList:
      this.categoriesList.forEach((cat) => {
        if (!this.categories[cat]) return; // skip if category is missing
        const children = this.categories[cat];

        // Outer container for this category
        const categoryGroup = db.div("MatcCreateCat").build(cntr);

        // Header row: label + item count + chevron
        const catTitle = db.div("MatcCreateCatTitle").build(categoryGroup);
        const headerLeft = db.div("MatcCreateCatHeaderLeft").build(catTitle);

        // Use custom name if defined, else just the cat
        const catLabelText = this.categoryNames[cat] || cat;
        db.span("MatcCreateCatTitlelabel", catLabelText).build(headerLeft);

        db
          .span("MatcCreateCatTitleNum", `(${Object.keys(children).length})`)
          .build(headerLeft);

        // Right side: chevron
        const chevronContainer = db.div("MatcCreateCatChevron").build(catTitle);
        const chevronIcon = this.$new(QIcon, {
          icon: this.categoryOpen[cat] !== false ? "ChevronDown" : "ChevronRight",
          size: '14'
        });
        chevronIcon.placeAt(chevronContainer);

        // The collapsible child container
        const childCntr = db.div("MatcCreateCatChildren").build(categoryGroup);
        childCntr.style.display = this.categoryOpen[cat] !== false ? "flex" : "none";

        // Toggle on click
        this.own(
          on(catTitle, "click", () => {
            this.categoryOpen[cat] = !this.categoryOpen[cat];
            childCntr.style.display = this.categoryOpen[cat] ? "flex" : "none";
            chevronIcon.setIcon(
              this.categoryOpen[cat] ? "ChevronDown" : "ChevronRight"
            );
          })
        );

        // Render each child in the category
        Object.keys(children).forEach((id) => {
          const child = children[id];
          const size = this._getPreviewSize(child);

          const div = db
            .div("MatcCreateBtnElement MatcToolbarDropDownButtonItem")
            .build(childCntr);

          const preview = db.div("MatcCreateBtnElementPreview").build(div);
          preview.classList.add(child.category);
          Object.assign(preview.style, {
            width: `${size.w}px`,
            height: `${size.h}px`,
          });

          if (child.type === "ScreenAndWidget") {
            this.renderScreenAndWidget(child, preview, db, size, false, div);
          } else if (child.type !== "Group") {
            this.renderWidget(child, preview, db, size, false, div);
          } else {
            this.renderGroup(child, preview, db, size, false, div);
          }

          const lbl = db
            .div("MatcCreateBtnElementLabel", this.formatString(child.name, 18))
            .build(div);
          lbl.style.width = `${size.w}px`;
        });
      });

      // Clear old content, then place the new accordion
      this.iconCntr.innerHTML = "";
      this.iconCntr.appendChild(cntr);
    },

    renderSearchResult(query) {
      const elements = [];
      for (let cat in this.categories) {
        const children = this.categories[cat];
        for (let id in children) {
          const child = children[id];
          if (child.name && child.name.toLowerCase().indexOf(query) >= 0) {
            elements.push(child);
          }
        }
      }
      this.renderSelectedTab();
      this.renderElements(elements, "search", false);
    },

    renderElements(elements, category, isTemplate, append) {
      this._visibleElements = elements;
      elements.sort((a, b) => {
        if (a.subcategory && b.subcategory) {
          if (a.subcategory == b.subcategory) {
            return a.name.localeCompare(b.name);
          }
          return a.subcategory.localeCompare(b.subcategory);
        }
        return a.name.localeCompare(b.name);
      });

      this.renderFactory.cleanUp();
      this.cleanUpTempListener();

      const db = new DomBuilder();
      const cntr = db.div("MatcCreateCatChildren").build();

      if (elements.length === 0) {
        const content = db.div("MatcCreateSearchContainer").build(cntr);
        if (isTemplate) {
            const labelhint = "No custom components defined. To create one, select on one or a group of UI elements in the canvas and click on the icon ";
            const iconhint = "mdi mdi-rhombus-split";
            const labellasthint = " 'Create Component' in the bottom toolbar!"
            const hint = db.div("MatcHint").build(content);
            db.span("", labelhint).build(hint);
            db.span(iconhint).build(hint);
            db.span("", labellasthint).build(hint);
        } else if (this.searchQuery) {
          db.span("MatcHint", "No elements match the search query").build(content);
        }
      } else {
        for (let i = 0; i < elements.length; i++) {
          let child = elements[i];
          let size = this._getPreviewSize(child);

          let div = db
            .div("MatcCreateBtnElement MatcToolbarDropDownButtonItem")
            .build(cntr);

          if (elements.length === 1) {
            css.add(div, "MatcCreateBtnElementSelected");
          }

          let preview = db.div("MatcCreateBtnElementPreview").build(div);
          css.add(preview, child.category);
          domStyle.set(preview, {
            width: size.w + "px",
            height: size.h + "px",
          });

          if (child.type === "ScreenAndWidget") {
            this.renderScreenAndWidget(child, preview, db, size, isTemplate, div);
          } else if (child.type != "Group") {
            this.renderWidget(child, preview, db, size, isTemplate, div);
          } else {
            this.renderGroup(child, preview, db, size, isTemplate, div);
          }

          const lbl = db
            .div("MatcCreateBtnElementLabel", this.formatString(child.name, 18))
            .build(div);
          lbl.style.width = size.w + "px";

          if (isTemplate) {
            let delBtn = db.div("MatcCreateBtnRemove  mdi mdi-close-circle").build(div);
            this.tempOwn(
              on(delBtn, touch.press, lang.hitch(this, "onRemoveTemplate", child))
            );
          }
        }
      }

      if (!append) {
        this.iconCntr.innerHTML = "";
      }
      this.iconCntr.appendChild(cntr);
    },

    renderScreenAndWidget(app, preview, db, size, isTemplate, elementDiv) {
      this.tempOwn(on(elementDiv, touch.press, lang.hitch(this, "onCreate", app)));
      let screens = Object.values(app.screens);
      if (screens.length === 1) {
        let screen = screens[0];
        let scale = this.getScale(size, "auto", screen);
        scale.x = Math.min(1, scale.x);
        scale.y = Math.min(1, scale.y);
        let scalledScreen = this._getScalledChild(screen, size);
        let centeredBox = this._createCenteredBox(db, preview, scalledScreen, size);

        let screenBox = db.div("MatcBox").build(centeredBox);
        domStyle.set(screenBox, {
          width: scalledScreen.w + "px",
          height: scalledScreen.h + "px",
          top: "0px",
          left: "0px",
        });
        this.renderFactory.setStyle(screenBox, screen);

        const children = screen.children;
        for (let i = 0; i < children.length; i++) {
          let childID = children[i];
          let widget = app.widgets[childID];
          if (widget) {
            let child = lang.clone(widget);
            this.renderChildWidget(child, scale, screen, screenBox, db, i);
          } else {
            console.debug(
              "CreateButton.renderScreenAndWidget() > No widget with id",
              childID
            );
          }
        }
      }
    },

    renderChildWidget(child, scale, parent, parentDiv, db, i) {
      child.w *= scale.x;
      child.x *= scale.x;
      child.h *= scale.y;
      child.y *= scale.y;
      try {
        child.id = parent.id + "_" + i;
        const widgetBox = db.div("MatcBox").build(parentDiv);
        domStyle.set(widgetBox, {
          width: Math.round(child.w) + "px",
          height: Math.round(child.h) + "px",
          top: child.y + "px",
          left: child.x + "px",
        });
        const replacedChild = this.replaceThemeVars(child);
        this.renderFactory.createWidgetHTML(widgetBox, replacedChild);
      } catch (e) {
        console.error("CreateButton.renderChildWidget() > Error", e);
      }
    },

    renderGroup(group, preview, db, size, isTemplate, elementDiv) {
      this.tempOwn(on(elementDiv, touch.press, lang.hitch(this, "onCreate", group)));
      if (isTemplate) {
        let child = this.getBoundingBox(group.children);
        let scale = this.getScale(size, "auto", child);
        child = this._getScalledChild(child, size);
        child.h -= 10;
        child.w -= 10;
        let box = this._createCenteredBox(db, preview, child, size);

        let children = this.getTemplateGroupOrderChildren(group);
        for (let i = 0; i < children.length; i++) {
          let templateChild = lang.clone(children[i]);
          templateChild = ModelUtil.inlineTemplateVariant(templateChild, this.model);
          this.renderChildWidget(templateChild, scale, group, box, db, i);
        }
      } else {
        const bbbox = this.getBoundingBoxByBoxes(group.children);
        const scale = this.getScale(size, "auto", bbbox);
        scale.x = Math.min(1, scale.x);
        scale.y = Math.min(1, scale.y);

        const scaledBbox = this._getScalledChild(bbbox, size);
        const box = this._createCenteredBox(db, preview, scaledBbox, size);

        const children = group.children;
        for (let i = 0; i < children.length; i++) {
          const groupChild = lang.clone(children[i]);
          this.renderChildWidget(groupChild, scale, group, box, db, i);
        }
      }
    },

    renderWidget(child, preview, db, size, isTemplate, elementDiv) {
      this.tempOwn(on(elementDiv, touch.press, lang.hitch(this, "onCreate", child)));
      child = this._getScalledChild(child, size);
      const box = this._createCenteredBox(db, preview, child, size);
      try {
        const replacedChild = this.replaceThemeVars(child);
        this.renderFactory.createWidgetHTML(box, replacedChild);
      } catch (e) {
        console.error("CreateButton.renderWidget() > Error", child);
        console.error(e);
      }
    },

    _getScalledChild(child, size) {
      if (child._preview) {
        child = child._preview;
      }
      if (child.w > size.w || child.h > size.h) {
        const scale = this.getScale(size, "auto", child);
        this.renderFactory.setScaleFactor(scale.x, scale.y);
        child = this.getZoomedBox(lang.clone(child), scale.x, scale.y);
      } else {
        this.renderFactory.setScaleFactor(1, 1);
      }
      return child;
    },

    _createCenteredBox(db, preview, child, size) {
      const box = db.div("MatcBox").build(preview);
      const left = (size.w - child.w) / 2;
      const top = (size.h - child.h) / 2;
      domStyle.set(box, {
        width: child.w + "px",
        height: child.h + "px",
        top: top + "px",
        left: left + "px",
      });
      return box;
    },

    onRemoveTemplate(template, e) {
      this.stopEvent(e);
      this.emit("removeTemplate", template, e);
      setTimeout(() => {
        this.showTemplates();
      }, 100);
    },
    onCreate(child, e) {
      this.stopEvent(e);
      const value = lang.clone(child);
      if (!child._isTemplate) {
        value.id = value.id + "_" + new Date().getTime();
      }
      value.qssSource = child.id;
      if (child.category) {
        this.model.lastCategory = child.category;
      } else {
        this.model.lastCategory = "WireFrame";
      }
      this.emit("change", value, e);
    },
    _getPreviewSize(child) {
      if (child._previewSize) {
        return child._previewSize;
      }
      let type = child.type;
      if (this.previewSizes[type]) {
        return this.previewSizes[type];
      }
      return this.previewSizes["default"];
    },

    highlight() {
      const parent = this.domNode.parentNode;
      if (parent) {
        css.add(parent, "MatcCreateHighlight");
        setTimeout(() => {
          css.remove(parent, "MatcCreateHighlight");
        }, 400);
        setTimeout(() => {
          css.add(parent, "MatcCreateHighlight");
        }, 800);
        setTimeout(() => {
          css.remove(parent, "MatcCreateHighlight");
        }, 1200);
        setTimeout(() => {
          css.add(parent, "MatcCreateHighlight");
        }, 1600);
        setTimeout(() => {
          css.remove(parent, "MatcCreateHighlight");
        }, 2000);
      }
    },
  },

  mounted() {
    // Initialize all categories to "open" by default
    this.categoriesList.forEach((cat) => {
      this.$set(this.categoryOpen, cat, true);
    });
  },
};
</script>
