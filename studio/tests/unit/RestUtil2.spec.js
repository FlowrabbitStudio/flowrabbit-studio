import { template } from '@babel/core'
import RestUtil from '../../src/util/RestUtil'

test('Test RestUtil2 >  fillString()', async () => {

    let result = await RestUtil.fillString('{ "name": ${name}}', {name: "Klaus"})
    expect(result).toBe('{ "name": Klaus}')


})

test('Test RestUtil2 >  buildData() - ', async () => {

    const req = {
        input: {
            template: '{ "name": "${name}"}'
        }
    }
    let result = await RestUtil.buildData(req, {name: "Klaus"})
    let obj = JSON.parse(result)
    expect(obj.name).toBe('Klaus')

    result = await RestUtil.buildData(req, {name: 1})
    obj = JSON.parse(result)
    expect(obj.name).toBe(1)

    result = await RestUtil.buildData(req, {name: "1"})
    obj = JSON.parse(result)
    expect(obj.name).toBe("1")
})

test('Test RestUtil2 >  buildData() - 2', async () => {

    const req = {
        input: {
            template: '{ "age": ${age}}'
        }
    }
    let result = await RestUtil.buildData(req, {name: "Klaus", age:45})
    let obj = JSON.parse(result)
    expect(obj.age).toBe(45)

})

test('Test RestUtil2 >  buildData() - 3', async () => {

    const req = {
        input: {
            template: '{ "name": "${name}", "age": ${age}}'
        }
    }
    let result = await RestUtil.buildData(req, {name: "Klaus", age:45})
    let obj = JSON.parse(result)
    expect(obj.age).toBe(45)
    expect(obj.name).toBe("Klaus")
})

test('Test RestUtil2 >  buildData() - 4', async () => {

    const req = {
        input: {
            template: '{ "name": "${name}", "age": ${age}}'
        }
    }
    let result = await RestUtil.buildData(req, {name: 12, age:45})
    let obj = JSON.parse(result)
    expect(obj.age).toBe(45)
    // known bug
    expect(obj.name).toBe("12")
})


// test('Test RestUtil2 >  replacePlaceholders()', async () => {

//     // let result = await RestUtil.replacePlaceholders('{ "name": "${name}"}', {name: "Klaus", age:45})
//     // expect(result).toBe('{ "name": "Klaus"')

//     let result = await RestUtil.replacePlaceholders('{ "name": "${name}"}, "age": ${age}}', {name: "Klaus", age:45})
//     expect(result).toBe('{ "name": "Klaus", "age: 45}')

// })