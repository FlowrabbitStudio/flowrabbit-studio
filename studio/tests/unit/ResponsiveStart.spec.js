
import responsiveApp from './data/responsiveApp.json'
import * as TestUtil from './TestUtil'

test('Responsive Start', async () => {

    const [controller, model] = TestUtil.createController(responsiveApp)
  
    let screen_m = model.screens['s10000_48666']
    let screen_d = model.screens['s10002_66843']

    await controller.updateScreenStart('s10000_48666', {start:true})
    expect(screen_m.props.start).toBe(true)
    expect(screen_d.props.start).toBe(false)
 
    await controller.updateScreenStart('s10002_66843', {start:true})
    expect(screen_m.props.start).toBe(true)
    expect(screen_d.props.start).toBe(true)

    await controller.undo()
    screen_m = model.screens['s10000_48666']
    screen_d = model.screens['s10002_66843']
    expect(screen_m.props.start).toBe(true)
    expect(screen_d.props.start).toBe(false)
 
})
