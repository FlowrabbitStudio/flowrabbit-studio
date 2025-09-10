class JSONPath {

    get (data, path, defaultValue = undefined) {
        if (data) {
            if (data[path] !== null && data[path] !== undefined) {
                return data[path]
            }
           
            let elements = this.getJsonPath(path)
            let value = data

            let current = elements.shift()
            current = this.correctCorrentPath(current, value)
            value = data[current]
            while (current != null && current != undefined && value !==null && value != undefined && elements.length > 0) {
                current = elements.shift()
                current = this.correctCorrentPath(current, value)
                value = value[current]
            }
            return value
    
        }
        return defaultValue
    }

    correctCorrentPath(current, context, offset = 0) {
        if (current === -1 && Array.isArray(context)) {
            current = context.length -1 + offset
        }
        return current
    }

    set (data, path, value) {
        let elements = this.getJsonPath(path)
        let node = data
        let current = elements.shift()
        current = this.correctCorrentPath(current, node, 1)

        let i = 0
        while (current !== undefined && current !== null && i < 100) {
            i++
            if (elements.length > 0) {
                if (!node[current]) {
                    if (elements[0].toLowerCase) {
                        node[current] = {}
                    } else {
                        node[current] = []
                    }
                }
                node = node[current]
                current = elements.shift()
                current = this.correctCorrentPath(current, node, 1)
            } else {
                node[current] = value;
            }
        }
        return data
    }


    getJsonPath (path) {
        return path.split('.').flatMap(p => {
            if (p.indexOf('[') >=0) {
                let parts = p.split('[')
                if (parts.length == 2) {
                    let key = parts[0]
                    let index = parts[1].substring(0, parts[1].length-1) * 1
                    return [key, index]
                }
                return p.substring(1, p.length -1) * 1
            }
            return p
        }).filter(p => p !== '')
    }
}

export default new JSONPath()