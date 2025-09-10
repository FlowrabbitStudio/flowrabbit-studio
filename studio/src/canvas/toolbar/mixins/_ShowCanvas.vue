<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
//import lang from 'dojo/_base/lang'
import _Tooltip from 'common/_Tooltip'

export default {
    name: '_ShowCanvas',
    mixins:[_Tooltip, DojoWidget],
    data: function () {
        return {
					colorWidgets: []
      }
	},
    components: {},
		computed: {

		},
    methods: {

      showCanvas () {
			  this.logger.log(-1,"showCanvas", "entry > ", this.isDesignView);

        this.showProperties();

        if (this.isDesignView) {	
          this.designTokenList.setModel(this.model)
          css.remove(this.designTokenDiv, 'MatcToolbarSectionHidden')
        } else {
          css.add(this.designTokenDiv, 'MatcToolbarSectionHidden')
        }

      },

      showLineDetails (line) {
			  this.logger.log(-1,"showLineDetails", "entry > ", line);

        this.showProperties();
        css.remove(this.lineDetailsDiv, 'MatcToolbarSectionHidden')

        this.lineDetails.setValue(line)
      }

    },
    mounted () {
    }
}
</script>