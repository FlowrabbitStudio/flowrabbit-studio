import dataControllerApp from './data/dataControllerApp.json'
import dataControllerSchema from './data/dataControllerSchema.json'
import * as TestUtil from './TestUtil'
import * as SchemaUtil from '../../src/core/SchemaUtil'

test('Test Data >  updateWidgetProperties() > DataBdinding', async () => {

    const [controller, model, data] = TestUtil.createController(dataControllerApp, dataControllerSchema)
    const schema = data.schema

    expect(SchemaUtil.exists(schema, 'search.filter')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'test.cool')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'API')).toBeTruthy()

    controller.updateWidgetProperties('w10035_34562', {databinding: {default: 'test.cool', 'search': 'search.filter', 'pagimg': 'API'}}, 'props')


    expect(SchemaUtil.exists(schema, 'search.filter')).toBeTruthy()
    expect(SchemaUtil.exists(schema, 'test.cool')).toBeTruthy()

    await controller.undo()    
    expect(SchemaUtil.exists(schema, 'search.filter')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'test.cool')).toBeFalsy()

    await controller.redo()
    expect(SchemaUtil.exists(schema, 'search.filter')).toBeTruthy()
    expect(SchemaUtil.exists(schema, 'test.cool')).toBeTruthy()
})

test('Test Data >  updateWidgetProperties() > REST', async () => {

    const [controller, model, data] = TestUtil.createController(dataControllerApp, dataControllerSchema)
    const schema = data.schema

    expect(SchemaUtil.exists(schema, 'REST.hasNewsletter')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'REST')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'template.variable')).toBeFalsy()

    const rest = {
        "method" : "POST",
        "url" : "https://flowrabbit.de/test/users.json?${query}",
        "token" : "",
        "authType" : "Bearer",
        "input" : {
          "type" : "JSON",
          "fileDataBinding" : "",
          "template" : "${template.variable}"
        },
        "output" : {
          "databinding" : "list",
          "template" : "",
          "type" : "JSON",
          "hints" : {
            "REST[0]" : "Array",
            "REST[0].id" : "Value",
            "REST[0].email" : "Value",
            "REST[0].name" : "Value",
            "REST[0].lastname" : "Value",
            "REST[0].hasNewsletter" : "Value"
          }
        },
        "headers" : [ ],
        "isProxyEnabled" : true
    }


    controller.updateWidgetProperties('w10009_93623', {rest: rest}, 'props')


    expect(SchemaUtil.exists(schema, 'REST.hasNewsletter')).toBeTruthy()
    expect(SchemaUtil.exists(schema, 'REST')).toBeTruthy()
    expect(SchemaUtil.exists(schema, 'template.variable')).toBeTruthy()
    expect(SchemaUtil.exists(schema, 'query')).toBeTruthy()
    expect(SchemaUtil.exists(schema, 'query')).toBeTruthy()

})


test('Test Data >  updateWidgetProperties() > API', async () => {

    const [controller, model, data] = TestUtil.createController(dataControllerApp, dataControllerSchema)
    const schema = data.schema

    expect(SchemaUtil.exists(schema, 'REST.hasNewsletter')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'REST')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'template.variable')).toBeFalsy()

    const api = {
        "operation" : "readTable",
        "token" : "pateTDlBNrfLUdhGC.630b952d7e3d4e80a6332a647dbc041bcf46191546d609a536c032374b1bf2d6",
        "baseId" : "appWLK5W0MPDqaAHo",
        "tableIdOrName" : "tblRbzsnVDploO5X7",
        "tableLabel" : "Flowrabbit - Table 1",
        "output" : {
          "hints" : {
            "<Table_5[0]" : "Array",
            "<Table_5[0]>id" : "Value",
            "<Table_5[0]>createdTime" : "Value",
            "<Table_5[0]>fields" : "Object",
            "<Table_5[0]>fields>Name" : "Value",
            "<Table_5[0]>fields>Age" : "Value",
            "<Table_5[0]>fields>newletter" : "Value",
            "<Table_5[0]>fields>email" : "Value",
            "<Table_5[0]>fields>Children" : "Value"
          }
        }  
    }

    controller.updateWidgetProperties('w10009_93623', {api: api}, 'props')
    expect(SchemaUtil.exists(schema, 'Table_5.id')).toBeTruthy()

})