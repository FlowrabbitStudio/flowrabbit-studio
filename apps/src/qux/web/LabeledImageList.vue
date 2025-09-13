<template>
    <div :class="['qux-labeled-image-list', cssClass]">
        <div v-if="images.length === 0" class="qux-labeled-image-list-cntr">
            <div v-for="(placeholder, i) in loadingPlaceHolders" :key="'p'+i" :class="'qux-labeled-image-list-item  qux-labeled-image-list-item-loading qux-labeled-image-list-item-loading-' + i" ></div>

        </div>
        <div v-else class="qux-labeled-image-list-cntr">
            <div v-for="(img,i) in images" :key="i" :class="['qux-labeled-image-list-item', {'qux-labeled-image-list-item-selected': isSelected(img)}]" @click="onSelect(img, $event)">
                <div 
                  :style="{
                    'background-image': img.src
                  }" 
                class="qux-labeled-image-list-image" 
                />
                <span class="qux-labeled-image-list-hook"></span>
            </div>
        </div>   
    </div>     
  </template>
  <style lang="scss">
      @import '../scss/qux-labeled-image-list.scss';
  </style>
  <script>
  
  import _Base from './_Base.vue'
  import Logger from '../core/Logger'
 import JSONPath from '../core/JSONPath'
  
  export default {
    name: 'qLabeledImageList',
    mixins: [_Base],
    data: function () {
        return {
            selection: []
        }
    },
    inject: ['viewModel', 'validationErrors', 'server'],
    computed: {
        loadingPlaceHolders () {
            return [1,2,3, 4,5,6,7,8]
        },
        images () {
         if (this.element) {
            const w = (this.element.props.imageWidth || 128)
            const h = (this.element.props.imageHeight || 128)
            let input = null
            const dataBinding = this.dataBinding
            if (dataBinding?.input) {
                input = JSONPath.get(this.viewModel, dataBinding.input)
            }
         
            if (input && Array.isArray(input) && input.length > 0) {
                return input.map(i => {
                    // we can do strings and elements with an 'src' element
                    const url = i.src ? i.src : i
                    return {
                        src: this.getImageURL(url),
                        text: "",
                        w: w,
                        h: h,
                        selected: false
                    }})
            } else {
                if (this.element?.props?.images) {
            
                    const images = this.element.props.images.map(i => {                    
                        return {
                            src: this.getImageURL(i.url),
                            text: i.text,
                            w: w,
                            h: h,
                            selected: false
                        }
                    })
                    return images
                }
            }
          }
          return []
      },
      imagePrefix() {
        if (this.hash) {
            return `${this.server}/rest/images/${this.hash}/`
        }
        return this.config.imageFolder
      }
    },
    methods: {
        isSelected (img) {
            const pos = this.selection.findIndex(s => {    
                return s.src === img.src
            })
            return pos >=0
        },
        onSelect (img, e) {
            const pos = this.selection.findIndex(s => {    
                return s.src === img.src
            })
            if (this.element?.props?.selectionMode === 'single') {
                this.selection = []
            }
  
            if (pos < 0) {
                this.selection.push(img)
            } else {
                this.selection.splice(pos, 1);
            }           
            const text = this.selection.map(s => s.text).join(', ')
            if (this.element?.props?.selectionMode === 'single') {
                this.onValueChange(this.selection[0], 'output')
            } else {
                this.onValueChange(this.selection, 'output')
            }
            this.onValueChange(text, 'text')
            this.onClick(e)
        },
        getImageURL(url) {
            if (url.indexOf('http') === 0) {
				return `url(${url})`
			} else {
				return `url(${this.imagePrefix}/${url})`
            }
        },
    },
    mounted () {
      Logger.log(-5, 'qLabeledImageList.mounted() enter')      
    }
  }
  </script>
  