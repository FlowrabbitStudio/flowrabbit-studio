<script>

import CreateLogicButton from '../components/CreateLogicButton'
import DataList from '../components/DataList.vue'
import CreateButtonContent from '../components/CreateButtonContent.vue'
import LayerList from '../LayerList'
import css from 'dojo/css'
import on from 'dojo/on'

export default {
    name: '_Sidebar',
    mixins:[],
    data: function () {
      return {
        selectedSidebarItem: null,
      }
	},
    components: {},
    methods: {

        initCreateLogic() {
            this.createLogic = this.$new(CreateLogicButton, {
                add: this.onToolLogicAndRest, 
                onHideSidebar: this.onHideSidebar 
            })
        },

        initCreateContent (){
			/**
			* now we have to factory and create a menu
			* for the widgets
			*/			
			this.createBTNContent = this.$new(CreateButtonContent, {
                onHideSidebar: this.onHideSidebar
            });
			this.createBTNContent.setUser(this.user);
			this.createBTNContent.setModel(this.model);
			this.createBTNContent.setJwtToken(this.jwtToken);
			this.tempOwn(on(this.createBTNContent, "change", (e, p) => this.onNewThemeObject(e, p)));
			this.tempOwn(on(this.createBTNContent, "importsChange", (e,p) => this.onImportChange(e, p)));
			this.tempOwn(on(this.createBTNContent, "removeTemplate", (e, p) => this.onRemoveTemplate(e, p)));

            this.setLeftSidebar(this.createBTNContent, "Widgets")
        },


        initDataList (){
			if (!this.dataList) {
				this.dataList = this.$new(DataList);
				if (this.canvas && this.controller){
					this.dataList.setToolbar(this);		
					this.dataList.setController(this.controller);
					this.dataList.setCanvas(this.canvas);
                    this.canvas.setDataList(this.dataList)
				} else {
					this.logger.log(1,"initDataList", "no canavs or controller", this); // expect in init
				}
			}			
		},

        initLayerList (){
			if (!this.layerList) {
				this.layerList = this.$new(LayerList);
				if (this.canvas && this.controller){
					this.layerList.setToolbar(this.toolbar);
					this.layerList.setController(this.controller);
					this.layerList.setCanvas(this.canvas);
              
                    this.canvas.setLayerList(this.layerList)
				} else {
					this.logger.log(-1,"initLayerList", "no toolbar", this); // expect in init
				}
			}
			this.selectionListener = this.layerList;
			css.add("initLayerList", "MatcLayerListVisible");
		},
		onHideSidebar() {
			this.isLayerOpen = false
		},
		initLeftSidebar(element) {
			this.logger.log(1, "initLeftSidebar", "entry ");
			this.layerList = element;
		},
		setCreateContent() {
			this.setLeftSidebar(this.createBTNContent, "Widgets")
		},
		setLayerList() {
			// Clear existing content from the sidebar container
			if (this.layerListCntr.innerHTML) {
        		this.layerListCntr.innerHTML = '';
			}
			this.layerList.placeAt(this.layerListCntr)
			this.selectedSidebarItem = "Layers";
			this.isLayerOpen = true
		},
		setDataList() {
			// Clear existing content from the sidebar container
			if (this.layerListCntr.innerHTML) {
        		this.layerListCntr.innerHTML = '';
			}
			this.dataList.placeAt(this.layerListCntr)
			this.dataList.setModel(this.model);
			this.selectedSidebarItem = "Data";
			this.isLayerOpen = true
		},
        setLogicSidebar() {
            this.setLeftSidebar(this.createLogic, "Logic")
			this.isLayerOpen = true
		},
		setLeftSidebar(element, name) {
			this.logger.log(1, "setLeftSidebar", "entry ");
			// Clear existing content from the sidebar container
			if (this.layerListCntr.innerHTML) {
        		this.layerListCntr.innerHTML = '';
			}
			this.selectedSidebarItem = name;
			element.placeAt(this.layerListCntr)
			this.isLayerOpen = true
		}
    }
}
</script>