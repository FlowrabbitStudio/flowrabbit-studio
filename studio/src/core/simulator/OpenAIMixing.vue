<template>
    <div>
    </div>
  </template>
  <script>
import OpenAIEngine from 'core/OpenAIEngine'
import RestEngine from 'core/RestEngine'

export default {
    name: 'OpenAIMixing',
    methods: {

        async executePromptBuilder (widget) {
            this.logger.log(-1,"executePromptBuilder","enter >  rest:" + widget.id);
            const rest = widget.props.rest
            try {
                const prompt = rest.prompt              
                const requiredDataBindings = RestEngine.getDataBindingVariables(prompt)
                const data = {}
                requiredDataBindings.forEach(path => {
                    const value = this.getDataBindingByPath(path)
                    data[path] = value
                })

                const result = RestEngine.fillSimpleString(prompt, data)
                if (result) {
                    if (rest.output.databinding) {
                        this.setDataBindingByKey(rest.output.databinding, result)
                        this.updateAllDataBindings(this.currentScreen.id, rest.output.databinding, result)
                        this.logger.log(-1, "executePromptBuilder","set data " + rest.output.databinding, result);
                    }
                    return true
                }
            } catch (e) {
                this.logger.error("executePromptBuilder","error", e);
                this.emit('onRestError', e, rest)
            }
            return false
        },
  
        async executeOpenAIAssistant (widget) {
            this.logger.log(-1,"executeOpenAIAssistant","enter >  rest:" + widget.id);
            const rest = widget.props.rest
            try {
                const message = this.getDataBindingByPath(rest.input.databinding)
                const result = await OpenAIEngine.query(
                    this.model.id, 
                    this.hash, 
                    rest.token, 
                    rest.assistant,
                    message
                )
                if (result) {
                    if (rest.output.databinding) {
                        this.setDataBindingByKey(rest.output.databinding, result)
                        this.updateAllDataBindings(this.currentScreen.id, rest.output.databinding, result)
                        this.logger.log(-1, "executeOpenAIAssistant","set data " + rest.output.databinding, this.dataBindingValues);
                    }
                    return true
                }
            } catch (e) {
                this.logger.error("executeOpenAIAssistant","error", e);
                this.emit('onRestError', e, rest)
            }
            return false
        }

    }
  }
  </script>