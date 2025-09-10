
<template>
    <div class="MatcToolbarDropDownButton MatcToolbarArrowDropDown MatcToolbarItem MatcToolbarViewConfig"
       @mousedown.stop="showPopup" @mouseup.stop="">
        <div>
           <QIcon icon="Ruler2" size="20"></QIcon>
        
        </div>
        <div class=" MatcToolbarPopUp MatcToolbarPopUpOpen MatcToolbarViewConfigPopup" role="menu" v-if="hasPopup"
           @mouseup.stop=""
           @mousedown.stop=""
           >
            <!--
            <div class="MatcToolbarPopUpArrowCntr">
                <div class="MatcToolbarPopUpArrow"></div>
           </div>
           -->
            <div class=" MatcToolbarPopUpWrapper">

               <div v-if="analytic == true">

                   <div class="MatcToolbarViewConfigCntrRow">
                       <CheckBox label="Lines" :value="hasLines"  @change="onChangeLines"/>
                   </div>

                   <div class="MatcToolbarViewConfigCntrRow">
                       <CheckBox label="Comments" :value="hasComments"  @change="onChangeComments"/>
                   </div>

                   <div class="MatcToolbarViewConfigCntrRow">
                       <CheckBox label="Gray Scale" :value="hasBW"  @change="onChangeBW"/>
                   </div>

               </div>
               <div v-else>
                   <div @mousedown="showGrid" class="MatcToolbarViewConfigCntrRow">
                       <CheckBox label="Snapp to Grid" :value="hasGrid"  @change="onChangeGrid"/>
                   </div>

                   <div @mousedown="showGrid" class="MatcToolbarViewConfigCntrRow">
                       <CheckBox label="Show Grid" :value="hasVisibleGrid"  @change="onChangeVisibleGrid"/>
                   </div>

                    <div @mousedown="showGrid" class="MatcToolbarViewConfigCntrSpace MatcToolbarViewConfigCntrRow">
                       <span class="mdi mdi-cog " style="margin-right:4px"/>
                       <span class="MatcStatusItemLabel" >Configure Grid</span>
                   </div>

                   <!-- <div class="MatcToolbarViewConfigCntrRow">
                       <CheckBox label="Layers" :value="hasLayers"  @change="onChangeLayer"/>
                   </div> -->

                   <!--
                   <div class="MatcToolbarViewConfigCntrRow">
                       <CheckBox label="Lines" :value="hasLines"  @change="onChangeLines"/>
                   </div>
                   -->

                   <div class="MatcToolbarViewConfigCntrRow">
                       <CheckBox label="Distance" :value="hasDistance"  @change="onChangeDistance"/>
                   </div>

                   <div class="MatcToolbarViewConfigCntrRow">
                       <CheckBox label="Ruler" :value="hasRuler"  @change="onChangeRuler"/>
                   </div>

                   <div class="MatcToolbarViewConfigCntrRow">
                       <CheckBox label="Comments" :value="hasComments"  @change="onChangeComments"/>
                   </div>
                   <!--
                   <div class="MatcToolbarViewConfigCntrRow">
                       <CheckBox label="Data" :value="hasData"  @change="onChangeData"/>
                   </div>
                   -->
               </div>                
           </div> <!-- end MatcToolbarPopUpWrapper-->

           <div class="MatcToolbarPopUpArrowCntr">
                   <div class="MatcToolbarPopUpArrow">
                   </div>
               </div>
       </div>
   </div>
</template>
<script>

import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import topic from 'dojo/topic'
import Logger from 'common/Logger'
import win from 'dojo/win'
import CheckBox from 'common/CheckBox'
import QIcon from 'page/QIcon'

export default {
   name: 'ViewConfig',
   mixins:[],
   props: ['value', 'analytic'],
   data: function () {
       return {
           hasPopup: false,
           hasIcon: false
       }
   },
   components: {
    'CheckBox': CheckBox,
    'QIcon': QIcon
   },
   computed: {
       gridLabel () {
           if (this.value && this.value.grid) {
               if (this.value.grid.type === 'grid') {
                   return `${this.value.grid.w} x ${this.value.grid.h}`
               }
           }
           return ''
       },
       hasLines () {
           if (this.value) {
               return this.value.renderLines
           }
           return true
       },
       hasDistance () {
           if (this.value) {
               return this.value.showDistance
           }
           return true
       },
       hasComments () {
           if (this.value) {
               return this.value.showComments
           }
           return true
       },
       hasRuler () {
            if (this.value) {
               return this.value.showRuler
           }
           return true
       },
       hasData () {
           if (this.value) {
               return this.value.hasDataView
           }
           return true
       },
       hasLayers () {
           if (this.value) {
               return this.value.layerListVisible
           }
           return false
       },
       hasBW () {
           if (this.value) {
               return this.value.isBlackAndWhite
           }
           return false
       },
       hasGrid () {
           if (this.value) {
               return this.value.hasGrid
           }
           return false
       },
       hasVisibleGrid () {
           if (this.value) {
               return this.value.hasVisibleGrid
           }
           return false
       }
   },
   methods: {
       showGrid () {
           this.$emit('change', 'showGrid', this.$el)
       },

       onChangeVisibleGrid (value) {
           this.log.log(-1, 'onChangeVisibleGrid', 'enter', value)
           this.value.hasVisibleGrid = value
           //this.hideMaybe()
           this.$emit('change', 'hasVisibleGrid', value)
       },

       onChangeGrid (value) {
           this.log.log(-1, 'onChangeGrid', 'enter', value)
           this.value.hasGrid = value
           //this.hideMaybe()
           this.$emit('change', 'hasGrid', value)
       },

       onChangeBW (value) {
           this.log.log(-1, 'onChangeBW', 'enter', value)
           this.value.isBlackAndWhite = value
           //this.hideMaybe()
           this.$emit('change', 'isBlackAndWhite', value)
       },

       onChangeLayer (value) {
           this.log.log(-1, 'onChangeLayer', 'enter', value)
           this.value.layerListVisible = value
           //this.hideMaybe()
           this.$emit('change', 'layerListVisible', value)
       },

       onChangeLines (value) {
           this.log.log(-1, 'onChangeLines', 'enter', value)
           this.value.renderLines = value
           // this.hideMaybe()
           this.$emit('change', 'renderLines', value)
       },

       onChangeDistance (value) {
           this.log.log(-1, 'onChangeDistance', 'enter', value)
           this.value.showDistance = value
           // this.hideMaybe()
           this.$emit('change', 'showDistance', value)
       },

       onChangeRuler (value) {
           this.log.log(-1, 'onChangeRuler', 'enter', value)
           this.value.showRuler = value
           // this.hideMaybe()
           this.$emit('change', 'showRuler', value)
       },

       onChangeComments (value) {
           this.log.log(-1, 'onChangeRuler', 'enter', value)
           this.value.showComments = value
           // this.hideMaybe()
           this.$emit('change', 'showComments', value)
       },

       onChangeData (value) {
           this.log.log(-1, 'onChangeData', 'enter', value)
           this.value.hasDataView = value
          // this.hideMaybe()
           this.$emit('change', 'hasDataView', value)
       },

       showPopup () {
           this.hasPopup = true
           /**
            * this will force all other popups to close
            */
           topic.publish("matc/canvas/click", "", "");
           /**
            * the canvas can register to this to flush stuff
            */
           topic.publish("matc/toolbar/click", "");

           this._mouseDownListener = on(win.body(),"mousedown", lang.hitch(this,"hidePopup"));
           this._topicListener = topic.subscribe("matc/canvas/click", lang.hitch(this,"onCanvasClick"));
           this._escListener = topic.subscribe("matc/canvas/esc", lang.hitch(this,"hidePopup"));
           this._dialogListner = topic.subscribe("vommond/dialog/open", lang.hitch(this,"hidePopup"));

           this.ignoreHide = false
       },

       onCanvasClick () {
           /**
            * A lot if the changes we trigger a rerender, which will as a result also
            * trigger a 'matc/canvas/click'. We want to be able to ignore this once!
            */
           if (this.ignoreHide) {
               this.ignoreHide = false
               return
           }
           this.hidePopup()
       },

       hideMaybe () {
           // this.ignoreHide = true
           this.hidePopup()
       },

       hidePopup () {
           this.hasPopup = false
           if(this._mouseDownListener){
               this._mouseDownListener.remove();
               delete this._mouseDownListener;
           }
           if(this._topicListener){
               this._topicListener.remove();
               delete this._topicListener;
           }
           if (this._escListener){
               this._escListener.remove()
               delete this._escListener;
           }
           if (this._dialogListner){
               this._dialogListner.remove();
               delete this._dialogListner;
           }
       }
   },
   watch: {
       value (v) {
           this.log.log(2, 'watch(value)', 'enter', v)
           this.value = v
       }
   },
   mounted () {
       this.log = new Logger('ViewConfig')
   }
}
</script>