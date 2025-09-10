<template>
<div class="MatcFlex MatcGapM MatcMarginBottomXS">
    <div class="MatcSegmentButtonInline MatcFlex50">
        <label>Type
            <span ref="typeTooltip" class="MatcToolbarItemIcon">
                <span class="mdi mdi-help-circle-outline"></span>
            </span>
        </label>
        <DropDownButton class="MatcFlex50" :value="imageProps.type || imageType[0]" :options="imageType"
                @change="onImageTypeChange(imageProps.type, $event)" :formControl="true" placeholder="Select the image type"/>
    </div>
    <div class="MatcSegmentButtonInline MatcFlex50">
        <label>Style
            <span ref="styleTooltip" class="MatcToolbarItemIcon">
                <span class="mdi mdi-help-circle-outline"></span>
            </span>
        </label>
        <DropDownButton class="MatcFlex50" :value="imageProps.style || imageStyle[0]" :options="imageStyle"
                @change="onImageStyleChange(imageProps.style, $event)" :formControl="true" placeholder="Select the image style"/>
    </div>
</div>
</template>

<script>
import DojoWidget from "dojo/DojoWidget";
import Util from "core/Util";
import Logger from "common/Logger";
import DropDownButton from "page/DropDownButton";
import AIModelsUtil from '../../../util/aimodels/AIModelsUtil'
import _Tooltip from "common/_Tooltip";

export default {
  name: "AIRestImage",
  mixins: [DojoWidget, Util, _Tooltip],
  props: ["rest", "imageProps"],
  data() {
    return {
        imageStyle: AIModelsUtil.imageStyles,
        imageType: AIModelsUtil.imageTypes,
        imagePropmts: AIModelsUtil.imagePrompts
    };
  },
  components: {
    DropDownButton: DropDownButton
  },
  computed: {
  },
  methods: {
    onImageStyleChange(element, value) {
        this.logger.log(5, 'onImageStyleChange', 'enter')
        this.imageProps = {
            style: value,
            type: this.imageProps.type
        }
        this.rest.imageProps =  this.imageProps
        this.logger.log(-5, 'onImageStyleChange', 'exit', JSON.stringify(this.rest, null, 2))
    },
    onImageTypeChange(element, value) {
        this.logger.log(5, 'onImageTypeChange', 'enter')
        this.imageProps = {
            style: this.imageProps.style,
            type: value
        }
        this.rest.imageProps =  this.imageProps
        this.logger.log(-5, 'onImageTypeChange', 'exit', JSON.stringify(this.rest, null, 2))
    },
  },   
  mounted() {
    this.logger = new Logger("AIRestImage");
    if (this.$refs.typeTooltip) {
        this.addTooltip(this.$refs.typeTooltip, 'The type of the image')
    }
    if (this.$refs.styleTooltip) {
        this.addTooltip(this.$refs.styleTooltip, 'The style of the image')
    }
  },
};
</script>
