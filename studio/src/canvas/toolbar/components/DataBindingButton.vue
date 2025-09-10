
<template>
     <div class="MatcToobarRow " @click.stop="onOpenDialog" v-if="!isDataView">
		<div class="MatcToolbarItem MatcToolbarDropDownButton MatcToolbarGridFull">
            <QIcon :icon="icon"/>
			<span class="MatcToolbarDropDownButtonLabel">{{label}}</span>
		</div>
	</div>
    <div v-else class="">
        <div class="MatcToolbarItem MatcToolbarGridFull MatcToobarInputIconCntr" v-for="variable in dataBindingVars" :key="variable.value">


            <Combo
                :fireOnBlur="true"
                :top="false"
                :placeholder="variable.label"
                :toolbar="true"
                :inline="true"
                :isDropDown="true"
                :hints="getHints(variable)"
                :actions="actions"
                size="s"
                :value="getDataBindingValue(variable.value)"
                @focus="hasNewTypeSelector = true"
                @change="onChangeVaribale(variable.value, $event)"
                @more="onOpenDialog(variable)"
				:formControl="false"/>


            <QIcon :icon="icon" class="MatcToobarInputIcon" @click.stop="onOpenDialog(variable)"/>


	    </div>


    </div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import lang from 'dojo/_base/lang'
import Logger from 'common/Logger'
import _Tooltip from 'common/_Tooltip'
import DataBindingService from 'services/DataBindingService'
import Input from 'common/Input'
import Util from 'core/Util'
import QIcon from 'page/QIcon'
import * as SchemaUtil from '../../../core/SchemaUtil'
import ModelUtil from '../../../core/ModelUtil'

export default {
    name: 'DataBindingButton',
    mixins:[_Tooltip, Util, DojoWidget],
    data: function () {
        return {
            model: null,
            widget: null,
            isDataView: true
        }
    },
    components: {
        'Combo': Input,
        'QIcon': QIcon
    },
    computed: {
        actions () {
            return [
                {
                    label: 'More...',
                    value: 'More...',
                    css:'MatcToobarInputAction',
                    action: 'more'
                }
            ]
        },
        dataBindingVars () {
            return this.widget && DataBindingService.getDefautlBindings(this.widget)
        },
        icon () {
            let dataBinding = this.getDataBinding(this.widget);
			if(dataBinding && Object.keys(dataBinding).length > 0){
				return "DataBinding";
            }
            return 'DataBindingPlus'
        },
        label () {
            let dataBinding = this.getDataBinding(this.widget);
			if(dataBinding && Object.keys(dataBinding).length > 0){
			    return Object.values(dataBinding).join(', ')
            }
            return 'Add Data Binding'
        }
    },
    methods: {
      
        getIcon(v) {
            let dataBinding = this.getDataBinding(this.widget);
            if (dataBinding[v.value]) {
                return "DataBinding";
            }
            return 'DataBindingPlus'
          
        },
        getHints (variable) {
            let hints = SchemaUtil.getAllPaths(this.schema)
            const parentDataBinding = ModelUtil.getParentDataBinding(this.model, this.widget, "default")
            if (parentDataBinding) {
                // show with full path, because otherwise we create strange variables for the children
                hints = hints.filter(h => h.indexOf(parentDataBinding) === 0)
                // remove also the []
            }
            if (variable?.value === 'default' && DataBindingService.isArrayDataBindingWidget(this.widget)) {
                hints = SchemaUtil.getAllArrayPaths(this.schema)
            }
            hints = hints.map(h => {
				return {
					label: h,
					value: h
				}
            })
            return hints
        },
        onChangeVaribale (key, value) {
            let dataBinding = lang.clone(this.getDataBinding(this.widget));
            if (!dataBinding) {
                dataBinding = {}
            }
            if (value !== undefined) {
                dataBinding[key] = value
                this.emit('change', dataBinding)
            }
        },
        getDataBindingValue (key) {
            var dataBinding = this.getDataBinding(this.widget);
			if(dataBinding){
                return dataBinding[key]
            }
            return ''
        },
        setModel (m) {
            this.model = m
        },
        setSchema (schema) {
            this.schema = schema
        },
        setDataView (isDataView) {
            this.isDataView = isDataView
        },
        setWidget(w) {
            this.widget = w
        },
        onOpenDialog (variable) {
            this.emit('showDialog', variable)
        }
    },
    mounted () {
        this.logger = new Logger('DataBindingButton')
    }
}
</script>