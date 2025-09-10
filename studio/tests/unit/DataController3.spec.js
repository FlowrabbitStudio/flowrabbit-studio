import dataControllerApp from './data/dataControllerTableApp.json'
import dataControllerSchema from './data/dataControllerTabeSchema.json'
import * as TestUtil from './TestUtil'
import * as SchemaUtil from '../../src/core/SchemaUtil'
import RestUtil from '../../src/core/RestUtil'

test('Test Data >  updateWidgetProperties() > data model', async () => {

    const [controller, model, data] = TestUtil.createController(dataControllerApp, dataControllerSchema)
    const schema = data.schema

    const tableWidget = model.widgets['w10006_81364']

    expect(SchemaUtil.exists(schema, 'selected')).toBeFalsy()
    expect(SchemaUtil.exists(schema, 'API.lastname')).toBeTruthy()
    expect(SchemaUtil.exists(schema, 'API')).toBeTruthy()

    const databinding = {
        'default': 'API',
        'output': 'selected'
    }


    controller.updateWidgetProperties('w10006_81364', {databinding: databinding}, 'props')
    
    expect(SchemaUtil.exists(schema, 'selected')).toBeTruthy()
    expect(SchemaUtil.exists(schema, 'selected.lastname')).toBeTruthy()

})

