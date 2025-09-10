import commandStackApp from './data/commandStackApp.json'
import * as TestUtil from './TestUtil'
import * as SchemaUtil from '../../src/core/SchemaUtil'

test('Test CommandStack >  changeStack() delete ', async () => {

    const [controller, model, data] = TestUtil.createController(commandStackApp)
    const schema = data.schema
    console.debug("xxx", data.schema)

    const commandChangeStack = controller.commandChangeStack

    expect(commandChangeStack.pos).toBe(-1)
    expect(commandChangeStack.stack.length).toBe(0)


    const wA = controller.addWidget ({'name': `WidgetA`, style: {background: "green"}, props:{}}, {x: 1, y: 1, w: 10, h:10})


    controller.updateWidgetProperties(wA.id, {'databinding': {"default": "API.lastname"}}, "props")
    expect(model.widgets[wA.id].props.databinding.default).toBe("API.lastname")
    expect(SchemaUtil.exists(schema, 'API.lastname')).toBeTruthy()


    controller.undoChangeStack()
    expect(model.widgets[wA.id].props.databinding).toBeUndefined()
    console.log('schema', data.schema)
  

    controller.redoChangeStack()
    expect(model.widgets[wA.id].props.databinding.default).toBe("API.lastname")
    // expect(model.widgets[wA.id].style.background).toBe("red")
    // expect(commandChangeStack.pos).toBe(1)
    // expect(commandChangeStack.stack.length).toBe(2)

  
})