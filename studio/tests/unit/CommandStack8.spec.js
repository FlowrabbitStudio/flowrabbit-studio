import commandStackApp from './data/commandStackApp.json'
import * as TestUtil from './TestUtil'
import * as SchemaUtil from '../../src/core/SchemaUtil'

test('Test CommandStack >  changeStack() test add variable ', async () => {

    const [controller, model, data] = TestUtil.createController(commandStackApp)
    const schema = data.schema

    const commandChangeStack = controller.commandChangeStack

    expect(commandChangeStack.pos).toBe(-1)
    expect(commandChangeStack.stack.length).toBe(0)

    controller.createSchemaVariable("user.name", "Nerea", "string")
    expect(SchemaUtil.exists(schema, 'user.name')).toBeTruthy()
    expect(commandChangeStack.stack[0].schemaChanges[0].parent).toBe("schema")

    expect(commandChangeStack.pos).toBe(0)
    expect(commandChangeStack.stack.length).toBe(1)

    controller.undo()
    expect(SchemaUtil.exists(schema, 'user.name')).toBeFalsy()

    controller.redo()
    expect(SchemaUtil.exists(schema, 'user.name')).toBeTruthy()
  
})