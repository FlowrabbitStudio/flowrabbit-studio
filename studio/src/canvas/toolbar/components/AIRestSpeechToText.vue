<template>
<div>
    <label>Audio File Input Variable 
        <span class="MatcToolbarItemIcon" ref="audioFileTooltip">
            <span class="mdi mdi-help-circle-outline"></span>
        </span>
    </label>
    <Combo :value="rest.input.fileDataBinding" @change="onChangeInputVar" :hints="hints" :fireOnBlur="true"
        :formControl="true" :isDropDown="true" placeholder="Name of input variable" />
</div>
</template>

<script>
import DojoWidget from "dojo/DojoWidget";
import Util from "core/Util";
import Logger from "common/Logger";
import Input from 'common/Input'
import _Tooltip from "common/_Tooltip";

export default {
  name: "AIRestSpeechToText",
  mixins: [DojoWidget, Util, _Tooltip],
  props: ["rest", "onChangeInputVar", "hints"],
  data() {
    return {
    };
  },
  components: {
    'Combo': Input,
  },
  computed: {
  },
  methods: {
  },   
  mounted() {
    this.logger = new Logger("AIRestImage");
    if (this.$refs.audioFileTooltip) {
        this.addTooltip(this.$refs.audioFileTooltip, 'The input variable where the audio file is stored')
    }
  },
};
</script>
