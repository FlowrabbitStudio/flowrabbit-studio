import * as SchemaUtil from '../../src/core/SchemaUtil'


test('Test SchemaUtil > isArray() 1', async () => {
    expect(SchemaUtil.isArray('a')).toBeFalsy()
    expect(SchemaUtil.isArray(0)).toBeTruthy()  
})


test('Test SchemaUtil > updateSchemaPath() 1', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user.name', 'klaus')

    //SchemaUtil.print(schema)

    expect(schema['user']).not.toBeUndefined()
    expect(schema['user']).not.toBeNull()
    expect(schema['user'].type).toBe('object')
    expect(schema['user'].properties).not.toBeUndefined()
    expect(schema['user'].items).toBeUndefined()

    //expect(schema['user'].properties['name'].defaultValue).toBe('klaus')
    expect(schema['user'].properties['name'].type).toBe('string')
})

test('Test SchemaUtil > updateSchemaPath() 2', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user.names[0]', 'klaus')

    expect(schema['user']).not.toBeUndefined()
    expect(schema['user']).not.toBeNull()
    expect(schema['user'].type).toBe('object')

    //SchemaUtil.print(schema)
    expect(schema['user'].properties['names'].type).toBe('array')
    expect(schema['user'].properties['names'].items).not.toBeUndefined()
    expect(schema['user'].properties['names'].items.type).toBe('string')
 
})


test('Test SchemaUtil > updateSchemaPath() 3', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user.age', 1)

    expect(schema['user']).not.toBeUndefined()
    expect(schema['user']).not.toBeNull()
    expect(schema['user'].type).toBe('object')

    expect(schema['user'].properties['age'].type).toBe('number')

})

test('Test SchemaUtil > updateSchemaPath() 3', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user.isAdmin', true)

    expect(schema['user']).not.toBeUndefined()
    expect(schema['user']).not.toBeNull()
    expect(schema['user'].type).toBe('object')

    expect(schema['user'].properties['isAdmin'].type).toBe('boolean')

})

test('Test SchemaUtil > updateSchemaPath() 4', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user.age', 1, 'string')

    expect(schema['user']).not.toBeUndefined()
    expect(schema['user']).not.toBeNull()
    expect(schema['user'].type).toBe('object')
    expect(schema['user'].properties['age'].type).toBe('string')

})


test('Test SchemaUtil > updateSchemaPath() 5', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user', "Peter", 'string')
    expect(schema['user']).not.toBeUndefined()
    expect(schema['user']).not.toBeNull()
    expect(schema['user'].type).toBe('string')
    expect(schema['user'].defaultValue).toBe("Peter")

    SchemaUtil.updateSchemaPath(schema, 'user.name', "Klaus", 'string')

    expect(schema['user'].properties['name'].type).toBe('string')
    expect(schema['user'].properties['name'].defaultValue).toBe('Klaus')
})

test('Test SchemaUtil > getFlatSchema() 6', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.name', "Klaus", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.age', 1)
    SchemaUtil.updateSchemaPath(schema, 'user.cats[0]', "Bobo")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].name', "Filipe")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].age', 12)

    expect(schema['user'].properties['name'].type).toBe('string')
    expect(schema['user'].properties['name'].defaultValue).toBe('Klaus')


    expect(schema['user'].properties['cats'].type).toBe('array')
    expect(schema['user'].properties['cats'].items.type).toBe('string')

    expect(schema['user'].properties['children'].type).toBe('array')
    expect(schema['user'].properties['children'].items.properties['name'].type).toBe("string")
    expect(schema['user'].properties['children'].items.properties['age'].type).toBe("number")
})


test('Test SchemaUtil > updateSchemaPath() 7', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.name', "Klaus", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.age', 1)
    SchemaUtil.updateSchemaPath(schema, 'user.cats[0]', "Bobo")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].name', "Filipe")


    expect(schema['user'].properties['name'].type).toBe('string')
    expect(schema['user'].properties['name'].defaultValue).toBe('Klaus')


    expect(schema['user'].properties['cats'].type).toBe('array')
    expect(schema['user'].properties['cats'].items.type).toBe('string')

    expect(schema['user'].properties['children'].type).toBe('array')
    expect(schema['user'].properties['children'].items.type).toBe("object")
    expect(schema['user'].properties['children'].items.properties['name'].type).toBe("string")

})

test('Test SchemaUtil > updateSchemaPath() 7', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.name', "Klaus", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.age', 1)
    SchemaUtil.updateSchemaPath(schema, 'user.cats[0]', "Bobo")

    expect(schema['user'].properties['cats'].type).toBe('array')
    expect(schema['user'].properties['cats'].items.type).toBe('string')

    SchemaUtil.updateSchemaPath(schema, 'user.cats[0].name', "Filipe")

    

    expect(schema['user'].properties['cats'].type).toBe('array')
    expect(schema['user'].properties['cats'].items.type).toBe("object")
    expect(schema['user'].properties['cats'].items.properties['name'].type).toBe("string")
})
