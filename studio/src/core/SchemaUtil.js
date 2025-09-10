import JSONPath from "./JSONPath"
import Logger from "./Logger"

const log_level = 11

// export function setDefaultValue(schema, path, value, type) {
//     if (!schema['_defaultValues']) {
//         schema['_defaultValues']  = {}
//     }
//     schema['_defaultValues'][path] = value
// }

export function removeParentPrefix(hints, parentPath) {
    return hints.filter(h => {
        return h.indexOf(parentPath) === 0
    }).map(h => {
        h = h.replace(parentPath, '')
        if (h.indexOf('[0].') === 0) {
            h = h.substring(4)
        }
        if (h.indexOf('[0]') === 0) {
            h = h.substring(3)
        }
        return h
    }).filter(h => h.length > 0)

}

export function updateSchemaPath(schema, path, value, type) {
    path = path.trim();
    if (path === '') {
        Logger.warn('SchemaUtil.updateSchemaPath() > path is empty')
        return
    }
    // we create tuples of <part,type>
    const parts = JSONPath.getJsonPath(path)
    const types = parts.map( () => undefined)
    types[types.length-1] = type
    Logger.log(log_level, 'Schemautil.updateSchemaPath', parts, types)
    addSchema(schema, parts, value, types)    
    return schema
}

function addSchema(schema, parts, value, types) {
    const part = parts.shift()
    const type = types.shift()
    Logger.log(log_level, 'Schemautil.addSchema', part, type)
    if (!schema[part]) {
        schema[part] = createElement(parts[0], part, type) 
    }
    const element = schema[part]
    setElement(element, parts, value, types, type)
}

function createElement(nextPart, title, type) {
    if(isArray(nextPart) || type === 'array') {
        return {
            title: title,
            type: 'array',
            items: {
                type: 'object',
                properties: {}
            }
        }    
    } else {
        return {
            title: title,
            properties: {}
        }    
    }
}

function setElement(element, parts, value, types, lastType){
    // if we are at the end we add a primitive
    if (parts.length === 0) {
        //const type = types[0]
        //fix to check if element is Array
        if (element.type !== 'array' && element.type !== 'object') {
            element.type = guessPrimitiveType(value, lastType)
        } 
        if (value !== undefined) {
            element.defaultValue = value
        }

    } else {
        // if we have an existing element,
        // we have to convert it. This means
        // removing the default value AND
        // changing the type. If it is an array (0 or type is array)
        // we keep the array, otherwise object
        delete element.defaultValue
        element.type = guessObjectOrArray(parts[0], element.type )
        addElement(element, parts, value, types)
    }    
}

function addElement(parentElement, parts, value, types) {
    let part = parts.shift()
    let type = types.shift()
    Logger.log(log_level, 'Schemautil.addElement', part, type)
    if (parentElement.items) {
        if (parts.length === 0) {
            // we do not want to set for somewthing like user.names[0] and object
            if (parentElement.items.properties && part !== '0' && part !== 0) {
     
                if (!parentElement.items.properties[part]) {
                    const element = createElement(parts[0], part, type) 
                    element.type = guessPrimitiveType(value)
                    element.defaultValue = value
                    parentElement.items.properties[part] = element
                } 
            } else {
        
                if ( part !== '0' && part !== 0) {          
                    parentElement.items.type = 'object'
                    parentElement.items.properties = {}
                    // fixme. This happens while looping the tree 
                    // add a [0] is missing. the guessObjectOrArray()
                    // in setElement() might cause here an issue
                    parentElement.type = 'array'

                    const element = createElement(parts[0], part) 
                    element.type = guessPrimitiveType(value)
                    element.defaultValue = value
                    parentElement.items.properties[part] = element

                } else {
                 
                    parentElement.items.type = guessPrimitiveType(value)
                    delete parentElement.items.properties     
                }
           
        
            }     
        } else {
            if (isArray(part)) {
                part = parts.shift()
                type = types.shift()
            }
            // we had a primitive before
            if (parentElement.items.type !== 'object') {
                parentElement.items.type = 'object'
                parentElement.items.properties = {}
            }
            if (!parentElement.items.properties[part]) {
                parentElement.items.properties[part] = createElement(parts[0], part, type) 
            }     
            const element = parentElement.items.properties[part]
            setElement(element, parts, value, types, type)
        }

    } else {
        if (!parentElement.properties[part]) {
            parentElement.properties[part] = createElement(parts[0], part, type) 
        }     
        const element = parentElement.properties[part]
        setElement(element, parts, value, types, type)
    }
}

function guessObjectOrArray (value, type) {
    if (type === 'array') {
        return 'array'
    }
    if (isArray(value)) {
        return 'array'
    }
    return 'object'
}

export function isArray(value) {
    return typeof value == 'number'
}

function guessPrimitiveType (value, type) {
    if (type) {
        return type
    }
    if (typeof value == 'number') {
        return 'number'
    }
    if (value === true || value === false) {
        return "boolean"
    }
    return "string"
}

export function convertDefaultValue (defaultValue) {
    if (typeof defaultValue === "string") {
        if (defaultValue === 'true') {
            return true
        }
        if (defaultValue === 'false') {
            return false
        }
        const n = defaultValue * 1
        if (!isNaN(n)) {
            return n
        }
    }
    return defaultValue
}

export function deleteElement(schema, path) {
    path = cleanPath(path)
    const parts = JSONPath.getJsonPath(path)
    const part = parts.pop()
    const parentPath = parts.join(".")
    const parent = getElement(schema, parentPath)
    if (parent) {
        if (parent.properties) {
            delete parent.properties[part]
        } else if (parent.items) {
            if (parent.items.properties) {                
                delete parent.items.properties[part]
            } else {
                delete parent.items[part * 1]
            }
        } else if (parent[part] && parent == schema) {
            delete parent[part]
        } 
    } else {
        console.error('deleteElement() > couold not find parent ', parentPath)
    }
}

export function updateVariable(value, oldPath, newPath) {

    // we new old and new parts do not have [0] array
    // stuff inside
    const parts = JSONPath.getJsonPath(value)
    const oldParts = JSONPath.getJsonPath(oldPath)

    const newParts = JSONPath.getJsonPath(newPath)
    const l = parts.length

    for (let i = 0; i < l && newParts.length > 0; i++) {
        if (isArray(parts[i])) {
            i++
        }
        const o = oldParts.shift()
        if (o === parts[i]) {
            const n = newParts.shift()
            if (n != undefined) {
                parts[i] = n
            }
        } else {
            break
        }
    }

    // if we didn't replace everything, there is an issue
    if (newParts.length > 0) {
        return 
    }

    // make one string
    let result = ''
    for (let i = 0; i < l; i++) {
        const v = parts[i]
        if (isArray(v)) {
            result += `[${v}]`
        } else {
            if (i > 0) {
                result += '.'
            }
            result += v
        }
    }
    return result
    // return value.r
    // if (value.indexOf(oldPath) === 0) {
    //     return value.replace(oldPath, newPath)
    // }
}

export function splitPath(path) {
    const parts = JSONPath.getJsonPath(path)
    const part = parts.pop()
    const parentPath = parts.join(".")
    return [part, parentPath]
}

export function exists (schema, path) {
    const element = getElement(schema, path)
    return (element !== null && element !== undefined)
}

export function renameElement(schema, path, newName) {
    path = cleanPath(path)
    const parts = JSONPath.getJsonPath(path)
    const part = parts.pop()
    // we do nothing if there is no change
    if (part == newName) {
        return
    }
    const parentPath = parts.join(".")
    const parent = getElement(schema, parentPath)
    if (parent) {
        // check parent[part] last because this might be magic values like "type" or props
        if (parent.properties) {
            parent.properties[newName] = parent.properties[part]
            parent.properties[newName].title = newName
            delete parent.properties[part]
            return this.buildPath(parentPath, newName)
        } else if (parent.items) {
            if (parent.items.properties) {
                parent.items.properties[newName] = parent.items.properties[part]
                parent.items.properties[newName].title = newName
                delete parent.items.properties[part]
                return this.buildPath(parentPath, newName)
            } else {
                const index = part * 1
                if (parent.items[index]) {
                    parent.items[index].title = newName
                    return this.buildPath(parentPath, newName)
                } else {
                    Logger.log(-1, "SchemaUtil.renameElement() > cannot find " + parentPath)
                }
            }
        // check here if we have actually a schema (root)
        } else if (parent[part] && parent == schema) {
            parent[newName] = parent[part]
            parent[newName].title = newName
            delete parent[part]
            return this.buildPath(parentPath, newName)
        } else {
            Logger.log(-1, "SchemaUtil.renameElement() > cannot find " + parentPath)
        }
    } else {
        Logger.log(-1, "SchemaUtil.renameElement() > cannot find " + parentPath)
    }

}

export function buildPath(parentPath, name) {
    return parentPath ? `${parentPath}.${name}` : name
}

export function getElement(schema, path) {
    path = cleanPath(path)
    const parts = JSONPath.getJsonPath(path)
    let current = schema
    while (parts.length > 0 && current) {
        let part = parts.shift()
        // handle 0s from arrays
        if (isArray(part)) {
            part = parts.shift()
            // handle api[0]
            if (!part) {
                return current
            }
        }
        if (current[part]) {
            current = current[part]
        } else if (current.properties) {
            current = current.properties[part]
        } else if (current.items) {
            if (current.items.properties) {
                current = current.items.properties[part]
            } else {
                current = current.items[part * 1]
            }
        } else {
            return undefined
        }
    }
    return current
}

export function cleanPath(p) {
    return p
}

export function getOutputSchema(widget) {
    if (widget.type === 'GeoLocation') {
        return ['accuracy', 'latitude','longitude', 'altitude', 'altitudeAccuracy', 'heading', 'speed']
    }
}

export function getLeafNodes(schema, prefix, includeArrays=false) {
    const result=new Set()
    const element = getElement(schema, prefix)
    if (element) {
        if (isLeaf(element)) {
            result.add(prefix)
        } else {
            if (element.properties) {
                getAllLeafPaths(element.properties, prefix, result, includeArrays)
            }
            if (includeArrays && element.items && element.items.properties) {
                getAllLeafPaths(element.items.properties, prefix + '[0]', result, includeArrays)
            }
        }
    }
    const variables = Array.from(result)
    variables.sort((a,b) => {
        return a.localeCompare(b, undefined, {sensitivity: 'base'})
    })
    return variables
}

export function getAllLeafPaths(schema, prefix='', result=new Set(), includeArrays) {

    for (let key in schema) {
        const value = schema[key]
        const newKey = prefix ? `${prefix}.${key}` : key
        if (isLeaf(value)) {
            result.add(newKey)
        } else {
            if (value.properties) {
                getAllLeafPaths(value.properties, newKey, result, includeArrays)
            }
            if (includeArrays && value.items && value.items.properties) {
                getAllLeafPaths(value.items.properties, newKey + '[0]', result, includeArrays)
            }
        }

    }
}

export function isLeaf(value) {
    if (value.properties) {
        return Object.keys(value.properties).length === 0
    }
    if (value.items) {
        return false
    }
    return true
}

export function getChildPaths(schema, prefix) {
    const result=new Set()
    const element = getElement(schema, prefix)
    if (element) {
        if (element.properties) {
            getAllPaths(element.properties, '', result)
        }
        if (element.items && element.items.properties) {
            getAllPaths(element.items.properties, '', result)
        }
    }
    const variables = Array.from(result)
    variables.sort((a,b) => {
        return a.localeCompare(b, undefined, {sensitivity: 'base'})
    })
    return variables
}

export function getAllPaths(schema, prefix='', result=new Set()) {
    for (let key in schema) {
        const value = schema[key]
        const newKey = prefix ? `${prefix}.${key}` : key
        result.add(newKey)
        if (value.properties) {
            getAllPaths(value.properties, newKey, result)
        }
        if (value.items && value.items.properties) {
            getAllPaths(value.items.properties, newKey + '[0]', result)
        }
    }
    const variables = Array.from(result)
    variables.sort((a,b) => {
        return a.localeCompare(b, undefined, {sensitivity: 'base'})
    })
    return variables
}

export function getAllArrayPaths(schema, prefix='', result=new Set()) {
    for (let key in schema) {
        const value = schema[key]
        const newKey = prefix ? `${prefix}.${key}` : key
        if (value.type === 'array') {
            result.add(newKey)
        }
        if (value.properties) {
            getAllArrayPaths(value.properties, newKey, result)
        }
        if (value.items && value.items.properties) {
            getAllArrayPaths(value.items.properties, newKey + '[0]', result)
        }
    }
    const variables = Array.from(result)
    variables.sort((a,b) => {
        return a.localeCompare(b, undefined, {sensitivity: 'base'})
    })
    return variables
}

export function getDefaultValues(schema, prefix='', result={}) {
    for (let key in schema) {
        const value = schema[key]
        const newKey = prefix ? `${prefix}.${key}` : key
        if (value.defaultValue) {
            result[newKey] = value.defaultValue
        }
        if (value.properties) {
            getDefaultValues(value.properties, newKey, result)
        }
        if (value.items && value.items.properties) {
            getDefaultValues(value.items.properties, newKey + '[0]', result)
        }
    }

    return result
}

export function getType(schema, path) {
    const parts = JSONPath.getJsonPath(path)

    const part = parts.shift()

    if (schema[part]) {
        const element = schema[part]
        if (parts.length === 0) {
            return element.type
        } else {
            return getElementType(element, parts)
        }
    }

    return null
}

export function getElementType(parentElement, parts) {
    let part = parts.shift()
    if (parentElement.properties && parentElement.properties[part]) {
        const element = parentElement.properties[part]
        if (parts.length === 0) {
            return element.type
        } else {
            return getElementType(element, parts)
        }
    }

    if (parentElement.items) {
        if (isArray(part)) {

            if (parts.length === 0) {
                return parentElement.type
            } else {
                part = parts.shift()
                const element = parentElement.items.properties[part]
                if (parts.length === 0) {
                    return element.type
                } else {
                    return getElementType(element, parts)
                }
            }

        } else {
            const element = parentElement.items.properties[part]
            if (parts.length === 0) {
                return element.type
            } else {
                return getElementType(element, parts)
            }
        }
   
    }
}

export function print(schema) {
    console.debug(JSON.stringify(schema, null, 2))
}
