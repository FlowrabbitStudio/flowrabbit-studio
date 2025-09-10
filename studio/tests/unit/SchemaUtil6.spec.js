import * as SchemaUtil from '../../src/core/SchemaUtil'


test('Test SchemaUtil > getChildren() All', async () => {

    let result=''

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.name', "Klaus", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.age', 1)
    SchemaUtil.updateSchemaPath(schema, 'user.cats[0]', "Bobo")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].name', "Filipe")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].age', 12)

    result = SchemaUtil.getChildPaths(schema, 'user')
    expect(result.includes("name")).toBeTruthy()
    expect(result.includes("age")).toBeTruthy()
    expect(result.includes("cats")).toBeTruthy()
    expect(result.includes("children[0].age")).toBeTruthy()
    
    result = SchemaUtil.getChildPaths(schema, 'user.children')
    expect(result.includes("name")).toBeTruthy()
    expect(result.includes("age")).toBeTruthy()

    result = SchemaUtil.getChildPaths(schema, 'user.children[0]')
    expect(result.includes("name")).toBeTruthy()
    expect(result.includes("age")).toBeTruthy()

    result = SchemaUtil.getChildPaths(schema, 'xxx')
    expect(result.length).toBe(0)

    result = SchemaUtil.getChildPaths(schema, 'user.cats')
    expect(result.length).toBe(0)

    result = SchemaUtil.getChildPaths(schema, 'user.name')
    expect(result.length).toBe(0)

    result = SchemaUtil.getChildPaths(schema, 'user.children[0].age')
    expect(result.length).toBe(0)

    result = SchemaUtil.getChildPaths(schema, 'user.children.age')
    expect(result.length).toBe(0)

    console.debug(result)
    //SchemaUtil.print(schema)
})


test('Test SchemaUtil > getLeafNodes() ', async () => {

    let result=''

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.name', "Klaus", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.age', 1)
    SchemaUtil.updateSchemaPath(schema, 'user.cats[0]', "Bobo")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].name', "Filipe")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].age', 12)
    SchemaUtil.updateSchemaPath(schema, 'user.address.city.zip', 12)
    SchemaUtil.updateSchemaPath(schema, 'user.address.city.name', 12)
    SchemaUtil.updateSchemaPath(schema, 'user.address.street.name', 12)
    SchemaUtil.updateSchemaPath(schema, 'user.address.street.numner', 12)

    result = SchemaUtil.getLeafNodes(schema, 'user')
    console.debug(result)
    expect(result.includes("user.name")).toBeTruthy()
    expect(result.includes("user.age")).toBeTruthy()
    expect(result.includes("user.address.street.name")).toBeTruthy()
    expect(result.includes("user.address.street.numner")).toBeTruthy()

    expect(result.includes("user.children[0].age")).toBeFalsy()
    expect(result.includes("user.children[0].name")).toBeFalsy()
    expect(result.includes("user.address")).toBeFalsy()
    expect(result.includes("user.address.city")).toBeFalsy()
    expect(result.includes("user.street.city")).toBeFalsy()
    expect(result.includes("user.cats")).toBeFalsy()
    expect(result.includes("user.children")).toBeFalsy()

    //SchemaUtil.print(schema)
})


test('Test SchemaUtil > getLeafNodes() Arraz ', async () => {

    let result=''

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.name', "Klaus", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.age', 1)
    SchemaUtil.updateSchemaPath(schema, 'user.cats[0]', "Bobo")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].name', "Filipe")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].age', 12)
    SchemaUtil.updateSchemaPath(schema, 'user.address.city.zip', 12)
    SchemaUtil.updateSchemaPath(schema, 'user.address.city.name', 12)
    SchemaUtil.updateSchemaPath(schema, 'user.address.street.name', 12)
    SchemaUtil.updateSchemaPath(schema, 'user.address.street.numner', 12)

    result = SchemaUtil.getLeafNodes(schema, 'user', true)
    console.debug(result)
    expect(result.includes("user.name")).toBeTruthy()
    expect(result.includes("user.age")).toBeTruthy()
    expect(result.includes("user.address.street.name")).toBeTruthy()
    expect(result.includes("user.address.street.numner")).toBeTruthy()

    expect(result.includes("user.children[0].age")).toBeTruthy()
    expect(result.includes("user.children[0].name")).toBeTruthy()


    //SchemaUtil.print(schema)
})



