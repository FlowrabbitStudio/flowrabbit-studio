import * as SchemaUtil from '../../src/core/SchemaUtil'


test('Test SchemaUtil2 > getElement() Simple ', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user', "Peter", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.name', "Klaus", 'string')
 

    SchemaUtil.print(schema)


    let element =  SchemaUtil.getElement(schema, 'user.name')
    expect(element.title).toBe('name')
    expect(element.type).toBe('string')


})

test('Test SchemaUtil2 > getElement() ', async () => {

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
    SchemaUtil.updateSchemaPath(schema, 'user.cats[0]', "Bobo")
    SchemaUtil.updateSchemaPath(schema, 'image', "abc")

    SchemaUtil.print(schema)

    let element =  SchemaUtil.getElement(schema, 'image')
    expect(element.title).toBe('image')
    expect(element.defaultValue).toBe('abc')

    element =  SchemaUtil.getElement(schema, 'userX.address.street')
    expect(element).toBeUndefined()

    element =  SchemaUtil.getElement(schema, 'user.address.street.number')
    expect(element).toBeUndefined()

    element =  SchemaUtil.getElement(schema, 'user')
    expect(element.title).toBe('user')
    expect(element.type).toBe('object')

    element =  SchemaUtil.getElement(schema, 'user.name')
    expect(element.title).toBe('name')
    expect(element.type).toBe('string')

    element =  SchemaUtil.getElement(schema, 'user.address')
    expect(element.title).toBe('address')
    expect(element.type).toBe('object')


    element =  SchemaUtil.getElement(schema, 'user.address.street')
    expect(element.title).toBe('street')
    expect(element.type).toBe('string')

    element =  SchemaUtil.getElement(schema, 'user.children')
    expect(element.title).toBe('children')
    expect(element.type).toBe('array')

    element =  SchemaUtil.getElement(schema, 'user.children.name')
    expect(element.title).toBe('name')
    expect(element.type).toBe('string')

    element =  SchemaUtil.getElement(schema, 'user.cats')
    expect(element.title).toBe('cats')
    expect(element.type).toBe('array')
    expect(element.items.type).toBe('string')

    element =  SchemaUtil.getElement(schema, '')
    expect(element.user).not.toBeUndefined()
    expect(element.image).not.toBeUndefined()
    expect(element).toBe(schema)
   
})


test('Test SchemaUtil2 > deleteElement() ', async () => {

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
    SchemaUtil.updateSchemaPath(schema, 'user.cats[0]', "Bobo")
    SchemaUtil.updateSchemaPath(schema, 'image', "abc")

    SchemaUtil.deleteElement(schema, 'image')
    let element =  SchemaUtil.getElement(schema, 'image')
    expect(element).toBeUndefined()

    SchemaUtil.deleteElement(schema, 'user.address.street')
    element =  SchemaUtil.getElement(schema, 'user.address.street')
    expect(element).toBeUndefined()
    element =  SchemaUtil.getElement(schema, 'user.address')
    expect(element.title).toBe("address")


    SchemaUtil.deleteElement(schema, 'user.children.name')
    element =  SchemaUtil.getElement(schema, 'user.children.name')
    expect(element).toBeUndefined()
    element =  SchemaUtil.getElement(schema, 'user.children')
    expect(element.title).toBe("children")
    expect(element.type).toBe("array")


    SchemaUtil.deleteElement(schema, 'user.children')
    element =  SchemaUtil.getElement(schema, 'user.children')
    expect(element).toBeUndefined()
    element =  SchemaUtil.getElement(schema, 'user')
    expect(element.title).toBe("user")
    expect(element.type).toBe("object")



    SchemaUtil.deleteElement(schema, 'user')
    element =  SchemaUtil.getElement(schema, 'user')
    expect(element).toBeUndefined()


})


test('Test SchemaUtil2 > renameElement() ', async () => {

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
    SchemaUtil.updateSchemaPath(schema, 'user.cats[0]', "Bobo")
    SchemaUtil.updateSchemaPath(schema, 'image', "abc")

    let newPath = SchemaUtil.renameElement(schema, 'user.name', "nome")
    expect(newPath).toBe('user.nome')
    let element =  SchemaUtil.getElement(schema, 'user.nome')
    expect(element.title).toBe("nome")
    element =  SchemaUtil.getElement(schema, 'user.name')
    expect(element).toBeUndefined()


    newPath = SchemaUtil.renameElement(schema, 'user.address.street', "rua")
    expect(newPath).toBe('user.address.rua')
    element =  SchemaUtil.getElement(schema, 'user.address.rua')
    expect(element.title).toBe("rua")
    element =  SchemaUtil.getElement(schema, 'user.address.street')
    expect(element).toBeUndefined()


    newPath = SchemaUtil.renameElement(schema, 'image', "bild")
    expect(newPath).toBe('bild')
    element =  SchemaUtil.getElement(schema, 'bild')
    expect(element.title).toBe("bild")
    element =  SchemaUtil.getElement(schema, 'image')
    expect(element).toBeUndefined()
  

    SchemaUtil.renameElement(schema, 'user.children.age', "alter")
    element =  SchemaUtil.getElement(schema, 'user.children.alter')
    expect(element.title).toBe("alter")
    element =  SchemaUtil.getElement(schema, 'user.children.age')
    expect(element).toBeUndefined()


    newPath = SchemaUtil.renameElement(schema, 'not.here', "??")
    expect(newPath).toBeUndefined()


    newPath = SchemaUtil.renameElement(schema, 'peter', "fox")
    expect(newPath).toBeUndefined()
})


test('Test SchemaUtil2 > renameElement() 5', async () => {

    let schema = {}

    SchemaUtil.updateSchemaPath(schema, 'user.name', "Klaus", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.age', 34)
    SchemaUtil.updateSchemaPath(schema, 'user.lastname', "Schaefers", 'string')
    SchemaUtil.updateSchemaPath(schema, 'user.address.street', "FlowStreet", 'string')

    SchemaUtil.renameElement(schema, 'user.name', "nome")
    let element =  SchemaUtil.getElement(schema, 'user.nome')
    expect(element.title).toBe("nome")
    element =  SchemaUtil.getElement(schema, 'user.name')
    expect(element).toBeUndefined()


    SchemaUtil.renameElement(schema, 'user.lastname', "lastname")
    element =  SchemaUtil.getElement(schema, 'user.lastname')
    expect(element.title).toBe("lastname")

})
