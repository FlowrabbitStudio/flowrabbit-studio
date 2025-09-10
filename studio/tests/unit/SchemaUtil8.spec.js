import * as SchemaUtil from '../../src/core/SchemaUtil'


test('Test SchemaUtil > updateSchemaPath() Object add', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'obj', "", 'object')
 
    expect(schema['obj']).not.toBeUndefined()
    expect(schema['obj']).not.toBeNull()
    expect(schema['obj'].type).toBe('object')
    expect(schema['obj'].properties).not.toBeUndefined()
    expect(schema['obj'].items).toBeUndefined()


    SchemaUtil.updateSchemaPath(schema, 'obj.name', "klaus", 'string')
    //SchemaUtil.print(schema)
    expect(schema['obj']).not.toBeUndefined()
    expect(schema['obj']).not.toBeNull()
    expect(schema['obj'].type).toBe('object')
    expect(schema['obj'].properties).not.toBeUndefined()
    expect(schema['obj'].items).toBeUndefined()
  
})

test('Test SchemaUtil > updateSchemaPath() Object add', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'obj', "", 'object')
 
    expect(schema['obj']).not.toBeUndefined()
    expect(schema['obj']).not.toBeNull()
    expect(schema['obj'].type).toBe('object')
    expect(schema['obj'].properties).not.toBeUndefined()
    expect(schema['obj'].items).toBeUndefined()


    SchemaUtil.updateSchemaPath(schema, 'obj.name', "klaus", 'object')
    //SchemaUtil.print(schema)
    expect(schema['obj']).not.toBeUndefined()
    expect(schema['obj']).not.toBeNull()
    expect(schema['obj'].type).toBe('object')
    expect(schema['obj'].properties).not.toBeUndefined()
    expect(schema['obj'].items).toBeUndefined()

    let element = SchemaUtil.getElement(schema, 'obj.name')
    expect(element.type).toBe('object')
    expect(element.items).toBeUndefined()
    expect(element.properties).not.toBeUndefined()
  
})
