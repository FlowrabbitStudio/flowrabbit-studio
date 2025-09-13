import Logger from '../../core/Logger'


import PagingCSS from './PagingCSS'
import TableCSS from './TableCSS'
import ImageCSS from './ImageCSS'
import ScreenCSS from './ScreenCSS'
import RepeaterCSS from './RepeaterCSS'
import ChartCSS from './ChartCSS'
import VectorCSS from './VectorCSS'
import TimelineCSS from './TimelineCSS'
import SegmentCSS from './SegmentCSS'
import UploadCSS from './UploadCSS'
import CameraCSS from './CameraCSS'
import UploadPreviewCSS from './UploadPreviewCSS'
import ComponentSetCSS from './ComponentSetCSS'
import SpinnerCSS from './SpinnerCSS'
import DynamicContainerCSS from './DynamicContainerCSS'
import RichTextCSS from './RichTextCSS'
import LabeledInput from './LabeledInput'
import SegmentPickerCSS from './SegmentPickerCSS'
import ChatCSS from './ChatCSS'
import NavBarCSS from './NavBarCSS'
import IFrameWidgetCSS from './IFrameWidgetCSS'
import ProgressSegmentsCSS from './ProgressSegmentsCSS'
import ProgressBarCSS from './ProgressBarCSS'
import ImagePagingCSS from './ImagePagingCSS'
import ImageCarouselCSS from './ImageCarouselCSS'
import TabBarCSS from './TabBarCSS'
import AudioPlayerCSS from './AudioPlayerCSS'
import AudioRecordingCSS from './AudioRecordingCSS'
import CountingStepperCSS from './CountingStepperCSS'
import LabeledImageListCSS from './LabeledImageListCSS'

export default class CSSWidgetFactory {

  constructor(cssFactory) {
    Logger.log(5, 'CSSWidgetFactory.constructor()')
    this.cssFactory = cssFactory
    this.factories = {
      'Paging':  new PagingCSS(cssFactory),
      'Table': new TableCSS(cssFactory),
      'Image': new ImageCSS(cssFactory),
      'Screen': new ScreenCSS(cssFactory),
      'Repeater': new RepeaterCSS(cssFactory),
      'BarChart': new ChartCSS(cssFactory),
      'Vector': new VectorCSS(cssFactory),
      'Timeline': new TimelineCSS(cssFactory),
      'Segment': new SegmentCSS(cssFactory),
      'Upload': new UploadCSS(cssFactory),
      'Camera': new CameraCSS(cssFactory),
      'UploadPreview': new UploadPreviewCSS(cssFactory),
      'ComponentSet': new ComponentSetCSS(cssFactory),
      'Spinner': new SpinnerCSS(cssFactory),
      'DynamicContainer': new DynamicContainerCSS(cssFactory),
      'RichText': new RichTextCSS(cssFactory),
      'LabeledTextBox': new LabeledInput(cssFactory),
      'SegmentPicker':  new SegmentPickerCSS(cssFactory),
      'Chat': new ChatCSS(cssFactory),
      'NavBar': new NavBarCSS(cssFactory),
      'IFrameWidget': new IFrameWidgetCSS(cssFactory),
      'ProgressSegments': new ProgressSegmentsCSS(cssFactory),
      'ProgressBar': new ProgressBarCSS(cssFactory),
      'ImagePaging': new ImagePagingCSS(cssFactory),
      'ImageCarousel': new ImageCarouselCSS(cssFactory),
      'TabBar':  new TabBarCSS(cssFactory),
      'AudioPlayer':  new AudioPlayerCSS(cssFactory),
      'AudioRecording':  new AudioRecordingCSS(cssFactory),
      'CountingStepper':  new CountingStepperCSS(cssFactory),
      'LabeledImageList': new LabeledImageListCSS(cssFactory)
    } // do not forget to make a get_XXX method...
  }

  getCSS_TabBar (selector, style, widget) {
    Logger.log(5, 'getCSS_TabBar', widget)
    return this.factories.TabBar.run(selector, style, widget)
  }

  getCSS_AudioRecording (selector, style, widget) {
    Logger.log(5, 'getCSS_AudioRecording', widget)
    return this.factories.AudioRecording.run(selector, style, widget)
  }

  getCSS_LabeledImageList (selector, style, widget) {
    Logger.log(5, 'getCSS_LabeledImageList', widget)
    return this.factories.LabeledImageList.run(selector, style, widget)
  }

  getCSS_NavBar (selector, style, widget) {
    Logger.log(5, 'getCSS_NavBar', widget)
    return this.factories.NavBar.run(selector, style, widget)
  }

  getCSS_SegmentPicker (selector, style, widget) {
    Logger.log(5, 'getCSS_SegmentPicker', widget)
    return this.factories.SegmentPicker.run(selector, style, widget)
  }


  getCSS_Chat(selector, style, widget) {
    Logger.log(5, 'getCSS_Chat', widget)
    return this.factories.Chat.run(selector, style, widget)
  }

  getCSS_RichText(selector, style, widget) {
    Logger.log(5, 'getCSS_RichText', widget)
    return this.factories.RichText.run(selector, style, widget)
  }

  getCSS_DynamicContainer(selector, style, widget) {
    Logger.log(5, 'getDynamicContainer', widget)
    return this.factories.DynamicContainer.run(selector, style, widget)
  }

  getCSS_Spinner(selector, style, widget) {
    Logger.log(5, 'getSpinner', widget)
    return this.factories.Spinner.run(selector, style, widget)
  }

  getCSS_ComponentSet(selector, style, widget) {
    Logger.log(5, 'getComponentSet', widget)
    return this.factories.ComponentSet.run(selector, style, widget)
  }

  getCSS_UploadPreview(selector, style, widget) {
    Logger.log(5, 'getCSS_UploadPreview', widget)
    return this.factories.UploadPreview.run(selector, style, widget)
  }

  getCSS_Camera (selector, style, widget) {
    Logger.log(5, 'getCSS_Camera', widget)
    return this.factories.Camera.run(selector, style, widget)
  }

  getCSS_Upload (selector, style, widget) {
    Logger.log(5, 'getCSS_Upload', widget)
    return this.factories.Upload.run(selector, style, widget)
  }

  getCSS_BarChart (selector, style, widget) {
    Logger.log(5, 'getCSS_BarChart', widget)
    return this.factories.BarChart.run(selector, style, widget)
  }

  getCSS_RingChart (selector, style, widget) {
    Logger.log(5, 'getCSS_RingChart', widget)
    return this.factories.BarChart.run(selector, style, widget)
  }

  getCSS_SegmentButton (selector, style, widget) {
    Logger.log(5, 'getCSS_SegmentButton', widget)
    return this.factories.Segment.run(selector, style, widget)
  }

  getCSS_Timeline (selector, style, widget) {
    Logger.log(5, 'getCSS_Timeline', widget)
    return this.factories.Timeline.run(selector, style, widget)
  }

  getCSS_Vector (selector, style, widget) {
    Logger.log(5, 'getCSS_Vector', widget)
    return this.factories.Vector.run(selector, style, widget)
  }

  getCSS_PieChart (selector, style, widget) {
    Logger.log(5, 'getCSS_PieChart', widget)
    return this.factories.BarChart.run(selector, style, widget)
  }

  getCSS_MultiRingChart (selector, style, widget) {
    Logger.log(5, 'getCSS_MultiRingChart', widget)
    return this.factories.BarChart.run(selector, style, widget)
  }

  getCSS_Screen (selector, style, widget) {
    Logger.log(5, 'getCSS_Screen', widget)
    return this.factories.Screen.run(selector, style, widget)
  }

  getCSS_Repeater(selector, style, widget) {
    Logger.log(5, 'getCSS_Repeater', widget)
    return this.factories.Repeater.run(selector, style, widget)
  }

  getCSS_LabeledTextBox(selector, style, widget) {
    Logger.log(5, 'getCSS_LabeledTextBox', widget)
    return this.factories.LabeledTextBox.run(selector, style, widget)
  }

  getCSS_Icon(selector, style, widget) {
    let result = ''
    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += `  font-size:${widget.h}px;\n`
    result += `  line-height:1;\n`
    result += '}\n\n'

    result += selector + ' .mdi:before {\n'
    result += `  font-size:${widget.h}px;\n`
    result += '}\n\n'

    return result
  }

  getCSS_ChildrenToggle(selector, style, widget) {

    /**
     * For now we assume this thingy has a fixed width...
     */

    let result = ''
    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += `  width:${widget.w}px;\n`
    result += '}\n\n'


    if (widget.active) {
      result += selector + '.qux-active {\n'
      result += this.getRawStyle(widget.active, widget);
      result += '}\n\n'
    }

    /**
     * We should add here still some other stuff for children...
     */

    return result
  }

  getCSS_LabeledRadioBox(selector, style, widget) {
    let result = ''

    let correctedHeight = this.cssFactory.getCorrectedHeight(widget, false, -1)
   
    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + '.qux-radiobox {\n'
    result += `  height:${widget.h}px;\n`
    result += `  min-width:${widget.w}px;\n`
    result += '}\n\n'


    result += selector + ' .qux-radiobox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${correctedHeight};\n`
    result += `  width:${correctedHeight};\n`
    result += '}\n\n'


    result += selector + ' .qux-radiobox-hook {\n'
    result += `  background: ${style.colorButton};\n`
    result += '}\n\n'

    result += selector + ' .qux-radiobox-label {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.fontProperties)
    result += '}\n\n'

    if (widget.checked) {
      result += selector + '.qux-radiobox-checked .qux-radiobox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.checked, widget, this.cssFactory.borderColorProperties)
      result += '}\n\n'
    }


    return result
  }


  getCSS_RadioGroup(selector, style, widget) {
    let result = ''

    let correctedHeight = this.cssFactory.getCorrectedHeight(widget, false, widget.style.boxHeight)
    let height = widget.style.boxHeight + 'px'

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + '.qux-radiobox {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)

    result += `  height:${height};\n`
    result += `  width:${height};\n`
    result += '}\n\n'


    result += selector + ' .qux-radiobox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${correctedHeight};\n`
    result += `  width:${correctedHeight};\n`
    result += '}\n\n'


    result += selector + ' .qux-radiobox-hook {\n'
    result += `  background: ${style.colorButton};\n`
    result += '}\n\n'

    result += selector + ' .qux-radiobox-label {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.fontProperties)
    result += '}\n\n'

    if (widget.checked) {
      result += selector + '.qux-radiobox-checked .qux-radiobox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.checked, widget, this.cssFactory.borderColorProperties)
      result += '}\n\n'
    }


    return result
  }


  getCSS_CheckBoxGroup(selector, style, widget) {
    let result = ''

    let correctedHeight = this.cssFactory.getCorrectedHeight(widget, false, widget.style.boxHeight)

    let height = widget.style.boxHeight + 'px'

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + '.qux-checkbox {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)

    result += `  height:${height};\n`
    result += `  width:${height};\n`
    result += '}\n\n'


    result += selector + ' .qux-checkbox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${correctedHeight};\n`
    result += `  width:${correctedHeight};\n`
    result += '}\n\n'


    result += selector + ' .qux-checkbox-hook {\n'
    result += `  border-color: ${style.colorButton};\n`
    result += `  border-bottom-width: ${height/ 10}px;\n`
    result += `  border-right-width:  ${height / 10}px;\n`
    result += '}\n\n'

    result += selector + ' .qux-checkbox-label {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.fontProperties)
    result += '}\n\n'

    if (widget.checked) {
      result += selector + '.qux-checkbox-checked .qux-checkbox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.checked, widget, this.cssFactory.borderColorProperties)
      result += '}\n\n'
    }

    if (widget.error) {
      result += selector + '.qux-validation-error .qux-checkbox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.error, widget, this.cssFactory.borderColorProperties)
      if(widget.error.background) {
        result += `  background:${widget.error.background};\n`
      }
      if(widget.error.color) {
        result += `  color:${widget.error.color};\n`
      }
      result += '}\n\n'
    }

    return result
  }

  getCSS_LabeledCheckBox(selector, style, widget) {
    let result = ''

    let height = widget.h + 'px'
    let correctedHeight = this.cssFactory.getCorrectedHeight(widget, false, -1)



    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + '.qux-checkbox {\n'
    result += `  height:${widget.h}px;\n`
    result += `  min-width:${widget.w}px;\n`
    result += '}\n\n'


    result += selector + ' .qux-checkbox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${correctedHeight};\n`
    result += `  width:${correctedHeight};\n`
    result += '}\n\n'


    result += selector + ' .qux-checkbox-hook {\n'
    result += `  border-color: ${style.colorButton};\n`
    result += `  border-bottom-width: ${Math.round(height/ 10)}px;\n`
    result += `  border-right-width:  ${Math.round(height / 10)}px;\n`
    result += '}\n\n'

    result += selector + ' .qux-checkbox-label {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.fontProperties)
    result += '}\n\n'

    if (widget.checked) {
      result += selector + '.qux-checkbox-checked .qux-checkbox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.checked, widget, this.cssFactory.borderColorProperties)
      result += '}\n\n'
    }

    if (widget.error) {
      result += selector + '.qux-validation-error .qux-checkbox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.error, widget, this.cssFactory.borderColorProperties)
      if(widget.error.background) {
        result += `  background:${widget.error.background};\n`
      }
      if(widget.error.color) {
        result += `  color:${widget.error.color};\n`
      }
      result += '}\n\n'
    }

    return result
  }


  getCSS_RadioBox2(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + ' .qux-radiobox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${this.cssFactory.getCorrectedHeight(widget)};\n`
    result += `  width:${this.cssFactory.getCorrectedWidth(widget)};\n`
    result += '}\n\n'


    result += selector + ' .qux-radiobox-hook {\n'
    result += `  background: ${style.colorButton};\n`
    result += '}\n\n'

    if (widget.checked) {
      result += selector + '.qux-radiobox-checked .qux-radiobox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.checked, widget, this.cssFactory.borderColorProperties)
      result += '}\n\n'
    }

    return result
  }

  getCSS_CheckBox(selector, style, widget) {
    let result = ''
    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    // FIXME: we set width and height twice
    result += `  height:${widget.h}px;\n`
    result += `  width:${widget.w}px;\n`
    result += '}\n\n'

    result += selector + ' .qux-checkbox-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += this.cssFactory.getBackGround(style, widget)
    result += `  height:${this.cssFactory.getCorrectedHeight(widget)};\n`
    result += `  width:${this.cssFactory.getCorrectedWidth(widget)};\n`
    result += '}\n\n'


    result += selector + ' .qux-checkbox-hook {\n'
    result += `  border-color: ${style.colorButton};\n`
    result += `  border-bottom-width: ${Math.round(widget.h / 10)}px;\n`
    result += `  border-right-width:  ${Math.round(widget.h / 10)}px;\n`
    result += '}\n\n'

    if (widget.checked) {
      result += selector + '.qux-checkbox-checked .qux-checkbox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.checked, widget, this.cssFactory.borderColorProperties)
      result += '}\n\n'
    }

    if (widget.error) {
      result += selector + '.qux-validation-error .qux-checkbox-cntr {\n'
      result += this.cssFactory.getStyleByKey(widget.error, widget, this.cssFactory.borderColorProperties)
      if(widget.error.background) {
        result += `  background:${widget.error.background};\n`
      }
      result += '}\n\n'
    }


    return result
  }


  getCSS_Switch(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    let cntrHeight = this.cssFactory.getCorrectedHeight(widget, false, widget.h)
    let cntrWidth = this.cssFactory.getCorrectedWidth(widget, false, widget.w)
    if (style.cssClass === 'MatcWidgetTypeSwitchThin') {
      cntrHeight = '50%';
    }

    result += selector + ' .qux-switch-cntr {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += `  height:${cntrHeight};\n`
    result += `  width:${cntrWidth};\n`
    result += '}\n\n'

    let borderWidthButton = style._borderTopWidth
    const borderColorButton = style.borderColorButton ? style.borderColorButton : 'rgba(0,0,0,0)'
    result += selector + ' .qux-switch-handle {\n'
    result += `  background:${style.colorButton};\n`
    result += `  border-radius:${style.borderRadius};\n`
    result += `  border-width:${borderWidthButton}px;\n`
    result += `  border-color:${borderColorButton};\n`
    result += this.cssFactory.getStyleByKey(style, widget, ['boxShadow'])
    result += `  height: ${widget.h}px;\n`
    result += `  width: ${widget.h}px;\n`
    result += '}\n\n'

    result += selector + '.qux-active .qux-switch-handle {\n'
    result += `  left:calc(100% - ${widget.h-1}px);\n`
    result += '}\n\n'

    result += selector + ' .qux-switch-on {\n'
    result += `  background:${style.background};\n`
    result += '}\n\n'

    result += selector + ' .qux-switch-off {\n'
    result += `  background:${style.colorForeGround};\n`
    result += '}\n\n'

    return result
  }

  getCSS_MobileDropDown(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    // make sure we have always some focus
    result += this.addOpenZIndex(selector)

    result += this._addCaret(selector, widget, style)

    result += selector + ' .qux-dropdown-popup {\n'
    result += `  background:${style.popupBackground};\n`
    result += `  color:${style.popupColor};\n`
    result += '}\n\n'

    if (widget.focus) {
      result += selector + ':hover {\n'
      result += this.cssFactory.getRawStyle(widget.focus, widget);
      result += '}\n\n'
      result += this._addCaret(selector + ':hover', widget, widget.focus)

      result += selector + ':hover .qux-dropdown-popup {\n'
      result += this.cssFactory.getStyleByKey(widget.focus, widget, this.cssFactory.borderProperties)
      result += '}\n\n'
    }

    return result
  }

  getCSS_DropDown(selector, style, widget) {

    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += this._addCaret(selector, widget, style)

    // make sure we have always some focus
    result += this.addOpenZIndex(selector)

    result += selector + ':not(.qux-dropdown-mobile) .qux-dropdown-popup {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += 'padding: 4px 0;'
    // ugly hack
    result += `  left: -${style._borderLeftWidth}px;\n`
    if (style.popupBorder) {
      result += `  border-color:${style.popupBorder};\n`
    }
    if (style.popupShadow) {
      result += this.cssFactory.getBoxShadow(style.popupShadow)
    }
    if (widget.props.hideUpperBorder) {
      result += `  border-top-width: 0px;\n`
      result += `  border-radius: 0px 0px ${style._borderBottomLeftRadius}px ${style._borderBottomRightRadius}px;\n`
    }
    result += '}\n\n'

    result += selector + ':not(.qux-dropdown-mobile) .qux-dropdown-item {\n'
    result += `  background:${style.popupBackground ? style.popupBackground : style.backgroundColor};\n`
    result += `  color:${style.popupColor ? style.popupColor : style.color};\n`
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.paddingProperties)
    result += 'margin: 0 4px;'
    result += 'border-radius: 4px;'
    result += '}\n\n'


    result += selector + ':not(.qux-dropdown-mobile) .qux-dropdown-item:hover {\n'
    result += `  background:${style.selectedOptionBackground};\n`
    result += `  color:${style.selectedOptionColor};\n`
    result += '}\n\n'

    // in QUX we have focus
    if (widget.focus) {
      result += selector + ':hover {\n'
      result += this.cssFactory.getRawStyle(widget.focus, widget);
      result += '}\n\n'
      result += this._addCaret(selector + ':hover', widget, widget.focus)

      result += selector + ':hover .qux-dropdown-popup {\n'
      result += this.cssFactory.getStyleByKey(widget.focus, widget, this.cssFactory.borderProperties)
      result += '}\n\n'
    }

    // in Figma we have hover
    if (widget.hover) {
      result += selector + ':hover {\n'
      result += this.cssFactory.getRawStyle(widget.hover, widget);
      result += '}\n\n'
      result += this._addCaret(selector + ':hover', widget, widget.focus)

      result += selector + ':hover .qux-dropdown-popup {\n'
      result += this.cssFactory.getStyleByKey(widget.hover, widget, this.cssFactory.borderProperties)
      result += '}\n\n'
    }


    if (widget.error) {
      result += selector + '.qux-validation-error  {\n'
      result += this.cssFactory.getStyleByKey(widget.error, widget, this.cssFactory.borderColorProperties)
      if(widget.error.background) {
        result += `  background:${widget.error.background};\n`
      }
      if(widget.error.color) {
        result += `  color:${widget.error.color};\n`
      }
      result += '}\n\n'
    }

    return result
  }

  _addCaret(selector, widget, style) {
    let result = ''
    if (widget.props && widget.props.caretBorderColor) {
      result += selector + ' .qux-dropdown-expend {\n'
      result += `  background:${style._borderRightColor};\n`
      result += '}\n\n'

      result += selector + ' .qux-dropdown-carret {\n'
      result += `  border:${style.background};\n`
      result += '}\n\n'
    }

    return result
  }

  getCSS_Stepper(selector, style, widget) {

    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'
        
    result += selector + ' .qux-stepper-btn {\n' 
    result += `  cursor: pointer;\n`    
    result += '}\n\n'

    result += selector + ' .qux-stepper-plus {\n' 
    result += `  border-left: ${widget.style.border};\n`    
    result += '}\n\n'

    result += selector + ' .qux-stepper-plus:hover {\n' 
    result += `  border-radius:0 ${style.borderRadius} ${style.borderRadius} 0 ;\n`
    result += '}\n\n'

    result += selector + ' .qux-stepper-minus:hover {\n' 
    result += `  border-radius:${style.borderRadius} 0 0 ${style.borderRadius};\n`
    result += '}\n\n'
    
    if (widget.hover) {
      result += selector + ' .qux-stepper-btn:hover {\n'
      result += `  background:${widget.hover.background};\n`
      result += `  color:${widget.hover.color};\n`
      result += '}\n\n'
    }

    return result
  }

  getCSS_HSlider(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + ' .qux-slider-track {\n'
    result += `  background:${style.background};\n`
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += '}\n\n'

    result += selector + ' .qux-slider-progress {\n'
    result += `  background:${style.barColor};\n`
    result += '}\n\n'

    result += selector + ' .qux-slider-handle  {\n'
    result += `  background:${style.handleColor};\n`
    result += `  border-radius:${style.handleRadius}%;\n`
    result += `  height:${style.handleHeight * widget.h}px;\n`
    result += `  width:${style.handleWidth }px;\n`
    result += `  font-size:${style.fontSize }px;\n`
    result += '}\n\n'

    result += selector + ' .qux-slider-handle-cntr  {\n'
    result += `  margin-left: ${style.handleWidth / 2}px;\n`
    result += `  width: calc(100% - ${style.handleWidth}px);\n`
    result += '}\n\n'

    return result
  }

  darkenHex(hex, factor = 0.1) {
    // 1) Strip leading "#"
    let color = hex.replace(/^#/, '');
    
    // If shorthand "#FFF", make it "#FFFFFF"
    if (color.length === 3) {
      color = color.split('').map(c => c + c).join('');
    }
    
    // 2) Parse into r/g/b
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
  
    // 3) Darken each channel by "factor"
    // e.g. factor=0.1 => each channel = channel - (channel * 0.1)
    r = Math.round(r * (1 - factor));
    g = Math.round(g * (1 - factor));
    b = Math.round(b * (1 - factor));
  
    // 4) Ensure they stay in [0..255]
    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);
  
    // 5) Convert back to hex
    const toHex = (val) => val.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  getCSS_Date(selector, style, widget, isInPopup = false) {
    let result = ''

    if (!isInPopup) {
      result += selector + ' {\n'
      result += this.cssFactory.getRawStyle(style, widget);
      result += this.cssFactory.getPosition(widget);
      result += '}\n\n'
    }
    result += selector + ' {\n'
    result += this.cssFactory.getStyleByKey(style, widget, ['boxShadow'])
    result += '}\n\n'

    if (style.tableBorderWidth) {
      result += selector + ' table {\n'
      result += `  border-spacing:${style.tableBorderWidth}px;\n`
      result += `  border-collapse: separate;\n`
      result += '}\n\n'
    }

    result += selector + ' .qux-date-week-days {\n'
    result += `  background:${style.tableHeaderBackground};\n`
    result += `  color:${style.tableHeaderColor};\n`
    result += '}\n\n'

    result += selector + ' .qux-date-header {\n'
    result += `  background:${style.headerBackground};\n`
    result += `  color:${style.headerColor};\n`
    result += `  border:${style.headerBorderWidth}px solid ${style.headerBorderColor};\n`
    result += `  border-radius:${style.headerBorderRadius}px;\n`
    result += `  font-weight:${style.headerFontWeight || 400};\n`
    result += '}\n\n'

    if (style.weekendBackground && style.weekendColor) {
      result += selector + ' .qux-date-weekend {\n'
      result += `  background:${style.weekendBackground};\n`
      result += `  color:${style.weekendColor};\n`
      result += '}\n\n'
    }

    if (style.weekdayBackground && style.weekdayColor) {
      result += selector + ' .qux-date-workday {\n'
      result += `  background:${style.weekdayBackground};\n`
      result += `  color:${style.weekdayColor};\n`
      result += '}\n\n'
    }
    const baseHex = style.background || '#cccccc'; // fallback
    const hoverHex = this.darkenHex(baseHex, 0.1); 
    result += selector + ' td:hover {\n'
    result += `  background: ${hoverHex};\n`
    if (style.selectedBorderRadius) {
      result += `  border-radius:${style.selectedBorderRadius}px;\n`
    }
    result += '}\n\n'

    if (widget.props.range) {

      result += selector + ' .qux-date-range-start {\n'
      result += `  background:${style.selectedBackground};\n`
      result += `  color:${style.selectedColor};\n`
      if (style.selectedBorderRadius) {
        result += `  border-radius:${style.selectedBorderRadius}px;\n`
      }
      result += '}\n\n'

      result += selector + ' .qux-date-range-end {\n'
      result += `  background:${style.selectedBackground};\n`
      result += `  color:${style.selectedColor};\n`
      if (style.selectedBorderRadius) {
        result += `  border-radius:${style.selectedBorderRadius}px;\n`
      }
      result += '}\n\n'

      result += selector + ' .qux-date-range-middle {\n'
      result += `  background:${style.selectedInRangeBackground};\n`
      result += `  color:${style.selectedInRangeColor};\n`
      result += '}\n\n'

      result += selector + ' .qux-date-range-middle::before {\n'
      result += `  background:${style.selectedInRangeBackground};\n`
      result += '}\n\n'

    } else {
      result += selector + ' .qux-date-selected {\n'
      result += `  background:${style.selectedBackground};\n`
      result += `  color:${style.selectedColor};\n`
      if (style.selectedBorderRadius) {
        result += `  border-radius:${style.selectedBorderRadius}px;\n`
      }
      result += '}\n\n'
    }


    return result
  }

  getCSS_DateDropDown(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    // make sure we have always some focus
    result += this.addOpenZIndex(selector)

    result += this._addCaret(selector, widget, style)

    result += selector + ' .qux-date-picker-popup {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += `  min-width:${style.fontSize * 18}px;\n`
    result += `  width:97%;\n`
    result += `  font-size:${style.fontSize}px;\n`
    result += '}\n\n'

    result += this.getCSS_Date(selector + " .qux-date-picker-popup", style, widget, true)

    result += selector + ' .qux-date-range-middle::before {\n'
    result += `  left:-8px;\n`
    result += `  right:-8px;\n`
    result += '}\n\n'

    return result
  }

  getCSS_Rating(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += `  color:${style.color};\n`
    result += `  font-size:${widget.h}px;\n`
    result += '}\n\n'

    return result
  }

  getCSS_LabeledIconToggle(selector, style, widget) {
    return this.getCSS_IconToggle(selector, style, widget)
  }

  getCSS_IconToggle(selector, style, widget) {
    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.textProperties)
    result += `  color:${style.passiveColor};\n`
    result += `  font-size:${style.fontSize}px;\n`
    result += '}\n\n'

    result += selector + '.qux-icon-toggle-selected {\n'
    result += `  color:${style.activeColor};\n`
    result += '}\n\n'

    result += selector + ' .qux-icon {\n'
    result += `  font-size:${widget.h}px;\n`
    result += '}\n\n'

    return result
  }


  getCSS_TypeAheadTextBox(selector, style, widget) {

    let result = ''

    result += selector + ' {\n'
    result += this.cssFactory.getPosition(widget);
    result += '}\n\n'

    result += selector + ' .qux-combo-input {\n'
    result += this.cssFactory.getRawStyle(style, widget);
    let paddingH = style._paddingLeft + style._paddingRight;
    let paddingV = style._paddingTop + style._paddingBottom;
    result += `  width:calc(100% - ${paddingH}px);\n`
    result += `  height:calc(100% - ${paddingV}px);\n`
    result += '}\n\n'


    // make sure we have always some focus
    result += this.addOpenZIndex(selector)

    result += selector + ' .qux-combo-popup {\n'
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.borderProperties)
    result += '}\n\n'


    result += selector + ' .qux-combo-item {\n'
    result += `  background:${style.background};\n`
    result += `  color:${style.color};\n`
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.paddingProperties)
    result += `  font-size:${style.fontSize}px;\n`
    result += '}\n\n'


    result += selector + ' .qux-combo-item:hover,\n'
    result += selector + ' .qux-combo-item-selected {\n'
    result += `  background:${style.selectedOptionBackground};\n`
    result += this.cssFactory.getStyleByKey(style, widget, this.cssFactory.paddingProperties)
    result += `  color:${style.selectedOptionColor};\n`
    result += '}\n\n'

    // FIXME: make here a default style for mobile?


    if (widget.focus) {
      result += selector + ':hover {\n'
      result += this.cssFactory.getRawStyle(widget.focus, widget);
      result += '}\n\n'
      result += this._addCaret(selector + ':hover', widget, widget.focus)

      //result += selector + ':hover .qux-combo-popup {\n'
      //result += this.cssFactory.getStyleByKey(widget.focus, widget, this.cssFactory.borderProperties)
      //result += '}\n\n'
    }

    return result
  }

  getCSS_Image(selector, style, widget){
    return this.factories.Image.run(selector, style, widget)
  }


  getCSS_Paging(selector, style, widget){
    return this.factories.Paging.run(selector, style, widget)
  }

  getCSS_Table(selector, style, widget) {
    return this.factories.Table.run(selector, style, widget)
  }

  getCSS_IFrameWidget(selector, style, widget) {
    return this.factories.IFrameWidget.run(selector, style, widget)
  }

  getCSS_ProgressSegments(selector, style, widget) {
    Logger.log(5, 'getCSS_ProgressSegments', widget)
    return this.factories.ProgressSegments.run(selector, style, widget)
  }

  getCSS_CountingStepper(selector, style, widget) {
    Logger.log(5, 'getCSS_CountingStepper', widget)
    return this.factories.CountingStepper.run(selector, style, widget)
  }
  
  getCSS_ProgressBar(selector, style, widget) {
    Logger.log(5, 'getCSS_ProgressBar', widget)
    return this.factories.ProgressBar.run(selector, style, widget)
  }

  getCSS_ImagePaging(selector, style, widget) {
    Logger.log(5, 'getCSS_ImagePaging', widget)
    return this.factories.ImagePaging.run(selector, style, widget)
  }

  getCSS_ImageCarousel(selector, style, widget) {
    Logger.log(5, 'getCSS_ImageCarousel', widget)
    return this.factories.ImageCarousel.run(selector, style, widget)
  }

  getCSS_AudioPlayer (selector, style, widget) {
    Logger.log(5, 'getCSS_AudioPlayer', widget)
    return this.factories.AudioPlayer.run(selector, style, widget)
  }

  addOpenZIndex (selector) {
      let result = ''
      result += selector + '.qux-open {\n'
      result += `  z-index: 1000;\n`
      result += '}\n\n'
      return result
  }

}