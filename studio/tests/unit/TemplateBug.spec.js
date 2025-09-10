
import * as TestUtil from './TestUtil'
import lang from "../../src/dojo/_base/lang";
import templateBug from './data/templateBug.json'
import ModelUtil from '../../src/core/ModelUtil';
import CoreUtil from '../../src/core/CoreUtil'

test('Template.js - Bug with QSS ', async () => {
   
  
    const result =  CoreUtil.createInheritedModel(templateBug)
  

    const boxCopy = result.widgets['w10019_55343'];
    console.debug(boxCopy)

    //controller.updateTemplateStyle('w10001_3225')
    // expectStack(controller, 1, 1)
    // let command1 = JSON.stringify(controller.commandStack.stack[0], null, 2)
    // const template =  expectBackground(controller, 'templates', 'tw10002_15681', '#9d5252')
    // const button = expectBackground(controller, 'widgets', 'w10001_3225', undefined)

  
    // await controller.undo()
    // expectStack(controller, 1, 0)
    // let command2 = JSON.stringify(controller.commandStack.stack[0], null, 2)
    // expect(command2).toBe(command1)
    // const templateUpdate =  expectBackground(controller, 'templates', 'tw10002_15681', '#333333')
    // const buttonUpdate = expectBackground(controller, 'widgets', 'w10001_3225', '#9d5252')
    // expect(templateUpdate.modified > template.modified)
    // expect(buttonUpdate.modified > button.modified)


    // await controller.redo()
    // expectStack(controller, 1, 1)
    // let command3 = JSON.stringify(controller.commandStack.stack[0], null, 2)
    // expect(command3).toBe(command1)
    // const templateRedo =  expectBackground(controller, 'templates', 'tw10002_15681', '#9d5252')
    // const buttonRedo = expectBackground(controller, 'widgets', 'w10001_3225', undefined)
    // expect(templateRedo.modified > templateUpdate.modified)
    // expect(buttonRedo.modified > buttonUpdate.modified)


    // await controller.undo()
    // expectStack(controller, 1, 0)
    // let command4 = JSON.stringify(controller.commandStack.stack[0], null, 2)
    // expect(command4).toBe(command1)
    // const templateUndo2 =  expectBackground(controller, 'templates', 'tw10002_15681', '#333333')
    // const buttonUndo2 = expectBackground(controller, 'widgets', 'w10001_3225', '#9d5252')
    // expect(buttonUndo2.modified > buttonRedo.modified)
    // expect(templateUndo2.modified > templateRedo.modified)


   

})



function expectStack(controller, l, p) {
    expect(controller.commandStack.stack.length).toBe(l)
    expect(controller.commandStack.pos).toBe(p)
}

function expectBackground (c, type, id, color) {
    let box = c.model[type][id]
    expect(box).not.toBeUndefined()
    expect(box.style.background).toBe(color)
    return lang.clone(box)
}

function getElement(c, type, id) {
    return c.model[type][id]
}


