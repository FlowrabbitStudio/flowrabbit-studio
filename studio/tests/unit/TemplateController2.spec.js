
import * as TestUtil from './TestUtil'
import templateQSSCreate from './data/templateQSSCreate.json'
import templateRest from './data/templateRest.json'
import templateRestUpdate from './data/templateRestUpdate.json'

test('Template.js - Create QSS Template ', async () => {
   
    const [controller, model] = TestUtil.createController(templateQSSCreate)
    const widget = model.widgets['w10021_40378']
    const createdTemplate = controller.addTemplateWidget(widget, 'Debugga', 'Cool stuff')
    expect(Object.keys(model.widgets['w10021_40378'].style).length).toBe(0)

    expect(createdTemplate.style.background).not.toBe('@button-primary-background')
    expect(createdTemplate.style.background).toBe('#3787f2')

})


test('Template.js - Create REST Template ', async () => {
   
    const [controller, model] = TestUtil.createController(templateRest)
    const widget = model.widgets['w10005_29489']
    const createdTemplate = controller.addTemplateWidget(widget, 'Debugga', 'Cool stuff')
    expect(Object.keys(model.widgets['w10005_29489'].style).length).toBe(0)
    //expect(Object.keys(model.widgets['w10005_29489'].props).length).toBe(0)

    expect(createdTemplate.props.rest.url).toBe('https://v1.quant-ux.com/rest/status.json')
    expect(createdTemplate.style.logo).toBe('api')

})


test('Template.js - Update REST Template ', async () => {
   
    const [controller, model] = TestUtil.createController(templateRestUpdate)
    const root = model.widgets['w10016_98115']
    const copy = model.widgets['w10018_70341']

    expect(root.props.rest.url).toBe('https://v1.quant-ux.com/rest/status.json')
    expect(copy.props.rest.url).toBe('https://v1.quant-ux.com/rest/status.json')

    root.props.rest.url = 'http://new.url'
    controller.updateTemplateStyle(root.id, true)

    expect(root.props.rest.url).toBe('http://new.url')
    expect(copy.props.rest.url).toBe('http://new.url')

})

test('Template.js - Update API Template ', async () => {
   
    const [controller, model] = TestUtil.createController(templateRestUpdate)
    const root = model.widgets['w10023_36925']
    const copy = model.widgets['w10025_76218']

    expect(root.props.api.tableIdOrName).toBe('tblRbzsnVDploO5X7')
    expect(copy.props.api.tableIdOrName).toBe('tblRbzsnVDploO5X7')
  
    // update the table and check that all Logic widgets will be updated to
    root.props.api.tableIdOrName = 'NewTable'
    controller.updateTemplateStyle(root.id, true)

    expect(root.props.api.tableIdOrName).toBe('NewTable')
    expect(copy.props.api.tableIdOrName).toBe('NewTable')

})
