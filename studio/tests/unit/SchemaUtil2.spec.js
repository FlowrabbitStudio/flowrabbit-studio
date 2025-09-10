import * as SchemaUtil from '../../src/core/SchemaUtil'

test('Test SchemaUtil2 > getDefaultValues() ', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.name', "Klaus", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.age', 34)
    SchemaUtil.updateSchemaPath(schema, 'user.lastname', "Schaefers", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.address.street', "FlowStreet", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.address.city', "Eindhoven", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.cats[0]', "Bobo")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].name', "Filipe")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].lastname', "Schaefers")
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].age', 2)
    SchemaUtil.updateSchemaPath(schema, 'image', "abc")

    const flat = SchemaUtil.getDefaultValues(schema)
    
    expect(flat['user.name']).toBe('Klaus')
    expect(flat['user.address.street']).toBe('FlowStreet')
    expect(flat['user.children[0].lastname']).toBe('Schaefers')
  
})

