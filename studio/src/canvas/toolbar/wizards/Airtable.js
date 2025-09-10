export function build(token, baseId, tableIdOrName, operation, fields) {
   
    const inputTemplate = getTemplate(operation, fields, "@")
    const restTemplate = getTemplate(operation, fields, "$")
    const elements = getElements(operation, fields)
    const method = getMethod(operation)
    const url = getURL(operation, baseId, tableIdOrName, "$")
    const inputUrl = getURL(operation, baseId, tableIdOrName, "@")

    return {
        method: method,
        token: token,
        //types: getTypes(fields),
        template: {
            url: inputUrl,
            template: inputTemplate
        },
        rest: {  
            url: url,
            template: restTemplate,
        },
        elements: elements
    }
}

// function getTypes (fields) {
//     const result = {}
//     for (let key in fields) {
//         const value = fields[key]
//         result[key] = guessPrimitiveType(value)
//     }
//     return result
// }

function guessPrimitiveType (value) {
    if (typeof value == 'number') {
        return 'number'
    }
    if (value == true || value == false) {
        return "boolean"
    }
    return "string"
}

function getURL(operation, baseId, tableIdOrName, sep="$") {
    if (operation === "readRow" || operation === "updateRow" || operation === "deleteRow") {
        return `https://api.airtable.com/v0/${baseId}/${tableIdOrName}/${sep}{recordId}`
    }            
    return `https://api.airtable.com/v0/${baseId}/${tableIdOrName}?pageSize=${sep}{pageSize}`
}

export function getElements (operation, fields, makeVars) {
    if (operation === "readTable") {
        return [ 
            {    
                "id": "pageSize",
                "label": "Page Size",
                "type": "Input",
                "value": 100
            }
        ]
    }
    if (operation === "readRow" || operation === "deleteRow") {
        return [{    
            "id": "recordId",
            "label": "Record ID",
            "type": "Combo",
            "placeholder": "The id of the record to search for"
        }]
    }

    let elements = Object.keys(fields).map(field => {
        return {    
            "id": field,
            "label": field,
            "type": "Combo",
            "value": makeVars ? "${" + field + "}" : field,
            "placeholder": ""
        }
    })

    if (operation === "updateRow") {
        elements.push({
            "id": "recordId",
            "label": "Record ID",
            "type": "Combo",   
            "placeholder": "The id of the record to search for"
        })
    }

    return elements
}

function getMethod (operation) {
    if (operation === "readTable" || operation === "readRow") {
        return "GET"
    }
    if (operation === "createRow") {
        return "POST"
    }
    if (operation === "updateRow") {
        return "PATCH"
    }
    if (operation === "deleteRow") {
        return "DELETE"
    }         
}

function getTemplate (operation, fields, prefix) {
    if (operation === "updateRow" || operation === "createRow") {

        let result = `{"fields": {`
        let temp = []
        for (let key in fields) {
            const value = fields[key]
            const type = guessPrimitiveType(value)
            let t = `"${key}":`
            if (type === "boolean" || type === "number") {
                t += `${prefix}{${key}}`
            }
            if (type === "string") {
                t += `"${prefix}{${key}}"`
            }
            temp.push(t)
        }
        result += temp.join(',')
        result += "}}"
        return result
    }

    return "{}"
}

