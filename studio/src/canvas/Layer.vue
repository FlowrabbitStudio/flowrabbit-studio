<script>
import css from 'dojo/css'

export default {
    name: 'Layer',
    methods: {

		setLayerList(layerList){
			this.logger.log(2,"setLayerList", "entry");
			this.layerList = layerList
			this.selectionListener = layerList;
		},

		setLayerVisibility (v){
			this.logger.log(-1,"setLayerVisibility", "enter", v);
			if (this.layerList){
				// this does not work.. should be done later with v-if
				// this.layerList.$destroy();
				//delete this.layerList
			}
			delete this.selectionListener;
			css.remove("CanvasNode", "MatcLayerListVisible");
			if (v){
				this.buildLayerList();
			}

			this.setLayerListScrollBar(v)

			this.setSettings({layerListVisible: v})
		},

		setLayerListScrollBar(v) {
		
			if (v) {
				css.add(this.scrollBottom, "MatcCanvasScrollBarBottomLayerList");
			} else {
				css.add(this.scrollBottom, "MatcCanvasScrollBarBottomLayerList");
			}
		},



		renderLayerList (model){
			if (this.layerList){
				requestAnimationFrame(() => {
					this.layerList.render(model);
				})
			}
		}
    },
    mounted () {
    }
}
</script>