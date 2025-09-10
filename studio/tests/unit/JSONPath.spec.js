import JSONPath from "../../src/core/JSONPath"

test('Test JSONPath.get(-1)', async () => {

    const data = {
        list: [
            'a', 'b'
        ]
    }

    expect(JSONPath.get(data, "list[0]")).toBe('a')
    expect(JSONPath.get(data, "list[1]")).toBe('b')
    expect(JSONPath.get(data, "list[-1]")).toBe('b')

    const data2 = [{id:1}, {id:2}]
    expect(JSONPath.get(data2, "[0].id")).toBe(1)
    expect(JSONPath.get(data2, "[1].id")).toBe(2)
    expect(JSONPath.get(data2, "[-1].id")).toBe(2)
    
})

test('Test JSONPath.set(-1)', async () => {

    const data = {
        list: [
            'a', 'b'
        ]
    }

    expect(JSONPath.set(data, "list[1]", 'c').list.join(',')).toBe('a,c')
    // the first call will already alter the array
    expect(JSONPath.set(data, "list[-1]", 'd').list.join(',')).toBe('a,c,d')    
})