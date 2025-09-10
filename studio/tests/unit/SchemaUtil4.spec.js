import * as SchemaUtil from '../../src/core/SchemaUtil'


test('Test SchemaUtil > wrong array update() 8', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'api[0].name', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'api[0].lastname', "Farro", 'string')
    SchemaUtil.updateSchemaPath(schema, 'api[0].age', 1)

    // make sure leaving our the array does not cause an issue
    SchemaUtil.updateSchemaPath(schema, 'api.newsletter', true)

    expect(schema['api'].items.properties['newsletter'].title).toBe('newsletter')
    expect(schema['api'].items.properties['newsletter'].type).toBe('boolean')
    expect(schema['api'].items.properties['newsletter'].defaultValue).toBe(true)
    expect(schema['api'].items.properties['age'].title).toBe('age')

    //SchemaUtil.print(schema)
})

test('Test SchemaUtil > wrong array update 2', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'api[0]', "Peter", 'string')  
    expect(schema['api'].type).toBe('array')
    expect(schema['api'].items.type).toBe('string')

    SchemaUtil.updateSchemaPath(schema, 'api.newsletter', true)
    SchemaUtil.print(schema)

    expect(schema['api'].type).toBe('array')
    expect(schema['api'].items.type).toBe('object')
    expect(schema['api'].items.properties['newsletter'].title).toBe('newsletter')
    expect(schema['api'].items.properties['newsletter'].type).toBe('boolean')
    expect(schema['api'].items.properties['newsletter'].defaultValue).toBe(true)


})


test('Test SchemaUtil > wrong array delete() 8', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'api[0].name', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'api[0].lastname', "Farro", 'string')
    SchemaUtil.updateSchemaPath(schema, 'api[0].age', 1)
    SchemaUtil.updateSchemaPath(schema, 'api[0].pet.type', "dog")

    //SchemaUtil.print(schema)

    SchemaUtil.deleteElement(schema, 'api.pet.type')
    expect(schema['api'].items.properties['pet'].title).toBe('pet')
    expect(schema['api'].items.properties['pet'].type).toBe('object')
    expect(schema['api'].items.properties['pet'].properties['type']).toBeUndefined()

})

test('Test SchemaUtil >  Exists', async () => {

    let schema = {}
    SchemaUtil.updateSchemaPath(schema, 'user.address.street', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'api[0].name', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'api[0].lastname', "Farro", 'string')
    SchemaUtil.updateSchemaPath(schema, 'api[0].age', 1)
    SchemaUtil.updateSchemaPath(schema, 'api[0].pet.type', "dog")

    //SchemaUtil.print(schema)
    expect(SchemaUtil.exists(schema, 'user.address.street')).toBe(true)
    expect(SchemaUtil.exists(schema, 'user.address')).toBe(true)
    expect(SchemaUtil.exists(schema, 'api')).toBe(true)
    expect(SchemaUtil.exists(schema, 'api[0]')).toBe(true)
    expect(SchemaUtil.exists(schema, 'api.age')).toBe(true)
    expect(SchemaUtil.exists(schema, 'api[0].age')).toBe(true)


    expect(SchemaUtil.exists(schema, 'user.address.streetx')).toBe(false)
    expect(SchemaUtil.exists(schema, 'user.addresss')).toBe(false)
    expect(SchemaUtil.exists(schema, 'apix.age')).toBe(false)
    expect(SchemaUtil.exists(schema, 'ap')).toBe(false)
})


test('Test SchemaUtil >  Exists', async () => {

    let schema = {}
    SchemaUtil.updateSchemaPath(schema, 'user.address.street', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'api[0].name', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'api[0].lastname', "Farro", 'string')
    SchemaUtil.updateSchemaPath(schema, 'api[0].age', 1)
    SchemaUtil.updateSchemaPath(schema, 'api[0].pet.type', "dog")

    let paths = SchemaUtil.getAllPaths(schema)
    expect(paths.includes('user.address.street')).toBe(true)
    expect(paths.includes('api[0].lastname')).toBe(true)
    expect(paths.includes('api')).toBe(true)
})
