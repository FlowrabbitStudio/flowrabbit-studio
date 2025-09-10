import * as SchemaUtil from '../../src/core/SchemaUtil'


test('Test SchemaUtil > getAllArrayPaths() Object add', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'table[0].a', "Filipe")
    SchemaUtil.updateSchemaPath(schema, 'table[0].b', "Schaefers")
    SchemaUtil.updateSchemaPath(schema, 'table[0].c', 2)
    SchemaUtil.updateSchemaPath(schema, 'list[0].a', 2)
    SchemaUtil.updateSchemaPath(schema, 'list[0].b', 2)

    SchemaUtil.updateSchemaPath(schema, 'user.children[0].age', 2)
    SchemaUtil.updateSchemaPath(schema, 'user.children[0].name', 2)
   
 
    SchemaUtil.updateSchemaPath(schema, 'a.b.c', 2)
    SchemaUtil.updateSchemaPath(schema, 'b', 2)
    SchemaUtil.updateSchemaPath(schema, 'c', 2)


    let paths = SchemaUtil.getAllArrayPaths(schema)
    expect(paths.length).toBe(3)
    expect(paths.indexOf('user.children') >= 0).toBe(true)
    expect(paths.indexOf('table') >= 0).toBe(true)
    expect(paths.indexOf('list') >= 0).toBe(true)
  
})
