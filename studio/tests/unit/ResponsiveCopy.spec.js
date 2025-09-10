
import reponsiveCopy from './data/reponsiveCopy.json'
import * as TestUtil from './TestUtil'

test('Responsive Copy', async () => {

    const [controller, model] = TestUtil.createController(reponsiveCopy)
  
    const screen_m = model.screens['s10000_48666']
    const screen_d = model.screens['s10002_66843']

    // await controller.updateScreenStart('s10000_48666', {start:true})
    // expect(screen_m.props.start).toBe(true)
    // expect(screen_d.props.start).toBe(false)

    // console.debug(screen_m.props)
    // console.debug(screen_d.props)

    // await controller.updateScreenStart('s10002_66843', {start:true})
    // expect(screen_m.props.start).toBe(true)
    // expect(screen_d.props.start).toBe(true)

    // await controller.undo()
    // expect(screen_m.props.start).toBe(true)
    // expect(screen_d.props.start).toBe(false)
 
})
