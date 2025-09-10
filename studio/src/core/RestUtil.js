class RestUtil {

    getAllVariables (rest, hintType) {
        const variables = []

  
        if (rest && rest.output && rest.output.hints) {
            const hints = rest.output.hints
            this.getHints(hints, hintType).forEach(variable => {
                if(variables.indexOf(variable)<0){
                  variables.push(variable);
                }
            })
        }

        this.getRestInputBindings(rest).forEach(variable => {
            if(variables.indexOf(variable)<0){
              variables.push(variable);
            }
        })
        if(rest && rest.output && rest.output.databinding){
            let variable = rest.output.databinding
            if(variables.indexOf(variable)<0){
                variables.push(variable);
            }
        }
        variables.sort((a, b) => {
            return b.length - a.length
        })
        return variables
    }

    getHints (hints, hintType) {
        const variables = []     
        if (hints) {
            for (let key in hints) {
                const type = hints[key]
                if (!hintType || type === hintType) {
                    // in old versions we used _
                    if (key.indexOf('<') === 0) {
                        let path = key.substring(1).replace(/>/g, ".")
                        variables.push(path)
                    } else {
                        let path = key.replace(/_/g, ".")
                        variables.push(path)
                    }
             
                }						
            }
        }        
        return variables
    }

    getRestInputBindings(rest) {
        let result = []
        this.parseVariableString(rest.url, result)
        this.parseVariableString(rest.token, result, true)
        if ((rest.method === 'POST' || rest.method === 'PUT' || rest.method === 'PATCH') && (rest.input.type === 'JSON' || rest.input.type === 'FORM')) {
            this.parseVariableString(rest.input.template, result)
        }
        if (rest.input.fileDataBinding) {
            result.push(rest.input.fileDataBinding)
        }
        if (rest.input.databinding) {
            result.push(rest.input.databinding)
        }
        if (rest.headers) {
            rest.headers.forEach(header => {
                this.parseVariableString(header.key, result, true)
                this.parseVariableString(header.value, result, true)
            })
        }
        return result;
    }

    parseVariableString(s, result) {
        if (!s) {
            return
        }
        const matches = s.match(/\$\{(.*?)\}/g)
        if (matches) {
            matches.forEach(m => {
                const variable = m.substring(2, m.length - 1)
                if (!this.isScretVariable(variable)) {
                    if (result.indexOf(variable) < 0) {
                        result.push(variable)
                    }
                }
            })
        }
    }

    getVariablesFromString(s) {
        const res = []
        this.parseVariableString(s, res)
        return res
    }

    isScretVariable(variable) {
        return variable.indexOf('secrets.') >= 0
    }

    buildHints (prefix, object) {
        const hints = {}
        this.visitResult(object, hints, "<"+prefix)
        return hints
    }

    visitResult (object, result, prefix) {
        try {
            if (prefix.length > 300) {
                return
            }
            if (Array.isArray(object)) {
                let path = prefix + '[0]'
                result[path] = "Array"
                object.forEach(o => {
                    this.visitResult(o, result, path)
                })
                return
            }
            if (this.isObject(object)) {
                for (let key in object) {
                    const o = object[key]
                    // FIXME: change this!! The issue is that the key might might contain all kind
                    // of chars
                    const path = prefix + '>' + key
                    if (this.isObject(o)) {
                        result[path] = "Object"
                    } else {
                        result[path] = "Value"
                    }    
                    this.visitResult(o, result, path)
                }
                return
            }
        } catch (e) {
            console.error(e)
            console.error(e.stack)
        }
    }

    isObject (it) {
        return it !== undefined &&
            (it === null || typeof it == "object" || Array.isArray(it)); // Boolean
    }


}
export default new RestUtil()