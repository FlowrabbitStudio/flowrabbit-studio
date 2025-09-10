import * as SchemaUtil from '../../src/core/SchemaUtil'


test('Test SchemaUtil > updateSchemaPath() Array', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'list', "", 'array')
 
    expect(schema['list']).not.toBeUndefined()
    expect(schema['list']).not.toBeNull()
    expect(schema['list'].type).toBe('array')
    expect(schema['list'].properties).toBeUndefined()
    expect(schema['list'].items).not.toBeUndefined()


    SchemaUtil.updateSchemaPath(schema, 'list.name', "klaus", 'string')
    //SchemaUtil.print(schema)
    expect(schema['list']).not.toBeUndefined()
    expect(schema['list']).not.toBeNull()
    expect(schema['list'].type).toBe('array')
    expect(schema['list'].properties).toBeUndefined()
    expect(schema['list'].items).not.toBeUndefined()
  
})


test('Test SchemaUtil > updateSchemaPath() Nested Array', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user.children', "", 'array')
    //SchemaUtil.print(schema)
 
    expect(schema['user']).not.toBeUndefined()
    expect(schema['user']).not.toBeNull()
    expect(schema['user'].type).toBe('object')
    expect(schema['user'].properties).not.toBeUndefined()
    expect(schema['user'].items).toBeUndefined()

    let element = SchemaUtil.getElement(schema, 'user.children')
  
    expect(element.type).toBe('array')
    expect(element.items).not.toBeUndefined()  
})

test('Test SchemaUtil > updateSchemaPath() Double Nested Array', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user[0].children', "", 'array')
    SchemaUtil.print(schema)
 
    expect(schema['user']).not.toBeUndefined()
    expect(schema['user']).not.toBeNull()
    expect(schema['user'].type).toBe('array')
    expect(schema['user'].properties).toBeUndefined()
    expect(schema['user'].items).not.toBeUndefined()

    let element = SchemaUtil.getElement(schema, 'user.children')
  
    expect(element.type).toBe('array')
    expect(element.items).not.toBeUndefined()  
})