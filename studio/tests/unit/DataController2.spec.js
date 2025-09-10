import dataControllerApp from './data/dataControllerApp.json'
import dataControllerSchema from './data/dataControllerSchema.json'
import * as TestUtil from './TestUtil'
import * as SchemaUtil from '../../src/core/SchemaUtil'
import RestUtil from '../../src/core/RestUtil'

test('Test Data >  updateWidgetProperties() > data model', async () => {

    const [controller, model, data] = TestUtil.createController(dataControllerApp, dataControllerSchema)
    const schema = data.schema

    expect(SchemaUtil.exists(schema, 'search.filter')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'test.cool')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'API')).toBeTruthy()
    expect(SchemaUtil.exists(schema, 'abc.def')).toBeFalsy()

    controller.createSchemaVariable("abc.def", "xyz")

    expect(SchemaUtil.exists(schema, 'abc.def')).toBeTruthy()
    expect(model.data.abc.def).toBe("xyz")

    await controller.undo()
    
    expect(SchemaUtil.exists(schema, 'abc.def')).toBeFalsy()
    expect(model.data.abc).toBe(undefined)

    await controller.redo()
    expect(SchemaUtil.exists(schema, 'abc.def')).toBeTruthy()
    expect(model.data.abc.def).toBe("xyz")

})


test('Test Data >  updateWidgetProperties() > change name', async () => {

  const [controller, model, data] = TestUtil.createController(dataControllerApp, dataControllerSchema)
  const schema = data.schema
  let nameWidget = model.widgets['w10006_4411']
  let lastnameWidget = model.widgets['w10007_98510']
  let emailWidget = model.widgets['w10014_75729']


  expect(SchemaUtil.exists(schema, 'user.name')).toBeTruthy()
  expect(SchemaUtil.exists(schema, 'user.nome')).toBeFalsy()
  expect(nameWidget.props.databinding.default).toBe("user.name")
  expect(lastnameWidget.props.databinding.default).toBe("user.lastname")
  expect(emailWidget.props.databinding.var1).toBe("API[0].email")
  expect(emailWidget.props.databinding.var2).toBe("API.email")

  // child change
  controller.renameSchemaVariable("user.name", "nome")
  expect(SchemaUtil.exists(schema, 'user.name')).toBeFalsy()
  expect(SchemaUtil.exists(schema, 'user.nome')).toBeTruthy() 
  expect(nameWidget.props.databinding.default).toBe("user.nome")
  // other widgets not changed
  expect(lastnameWidget.props.databinding.default).toBe("user.lastname")

  // child change
  controller.renameSchemaVariable("user.lastname", "nachname")
  expect(SchemaUtil.exists(schema, 'user.lastname')).toBeFalsy()
  expect(SchemaUtil.exists(schema, 'user.nachname')).toBeTruthy() 
  expect(lastnameWidget.props.databinding.default).toBe("user.nachname")
  // other widgets not changes
  expect(nameWidget.props.databinding.default).toBe("user.nome")

  // no change
  controller.renameSchemaVariable("user.name", "nome")
  expect(SchemaUtil.exists(schema, 'user.name')).toBeFalsy()
  expect(SchemaUtil.exists(schema, 'user.nome')).toBeTruthy() 
  expect(nameWidget.props.databinding.default).toBe("user.nome")
 
  // root change
  controller.renameSchemaVariable("user", "nutzer")
  expect(SchemaUtil.exists(schema, 'user.nome')).toBeFalsy()
  expect(SchemaUtil.exists(schema, 'nutzer.nome')).toBeTruthy() 
  expect(nameWidget.props.databinding.default).toBe("nutzer.nome")
  expect(lastnameWidget.props.databinding.default).toBe("nutzer.nachname")


  // array
  controller.renameSchemaVariable("API.email", "xxx")

  //SchemaUtil.print(schema)

  expect(SchemaUtil.exists(schema, 'API.email')).toBeFalsy()
  expect(SchemaUtil.exists(schema, 'API.xxx')).toBeTruthy() 
  expect(emailWidget.props.databinding.var1).toBe("API[0].xxx")
  expect(emailWidget.props.databinding.var2).toBe("API.xxx")



})


test('Test Data >  updateWidgetProperties() > change name / undo redo', async () => {

  const [controller, model, data] = TestUtil.createController(dataControllerApp, dataControllerSchema)
  const schema = data.schema
  let nameWidget = model.widgets['w10006_4411']
  let lastnameWidget = model.widgets['w10007_98510']
  let emailWidget = model.widgets['w10014_75729']


  expect(SchemaUtil.exists(schema, 'user.name')).toBeTruthy()
  expect(SchemaUtil.exists(schema, 'user.nome')).toBeFalsy()
  expect(nameWidget.props.databinding.default).toBe("user.name")
  expect(lastnameWidget.props.databinding.default).toBe("user.lastname")
  expect(emailWidget.props.databinding.var1).toBe("API[0].email")
  expect(emailWidget.props.databinding.var2).toBe("API.email")



    // child change name to xxx
    controller.renameSchemaVariable("user.name", "xxx")
    expect(SchemaUtil.exists(schema, 'user.name')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'user.xxx')).toBeTruthy() 
    expect(nameWidget.props.databinding.default).toBe("user.xxx")
    // other widgets not changed
    expect(lastnameWidget.props.databinding.default).toBe("user.lastname")

    const renameChange = controller.commandChangeStack.stack[0]
    //console.log(JSON.stringify(renameChange, null, 2))
    expect(renameChange.modelChanges[0].object.props.databinding.default).toBe("user.xxx")
    expect(renameChange.modelChanges[0].oldValue.props.databinding.default).toBe("user.name")


    await controller.undo()
    nameWidget = model.widgets['w10006_4411']
    expect(SchemaUtil.exists(schema, 'user.name')).toBeTruthy()
    expect(SchemaUtil.exists(schema, 'user.xxx')).toBeFalsy() 
    expect(nameWidget.props.databinding.default).toBe("user.name")

    await controller.redo()
    nameWidget = model.widgets['w10006_4411']
    expect(SchemaUtil.exists(schema, 'user.name')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'user.xxx')).toBeTruthy() 
    expect(nameWidget.props.databinding.default).toBe("user.xxx")

})