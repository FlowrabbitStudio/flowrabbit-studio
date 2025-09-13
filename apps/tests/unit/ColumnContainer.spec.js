import ModelTransformer from '../../src/qux/core/ModelTransformer'
import columnContainer from './data/columnContainer.json'
import * as TestUtil from './TestUtil'

test('Test Column Conatiner', async () => {

  /**
   * first call figma service to check taht all the boolean stuff and so is ignored
   */

  let t = new ModelTransformer(columnContainer)
  let model = t.transform()
  let screen = model.screens[0]
  //console.debug(TestUtil.print(screen))
  expect(screen.children.length).toBe(2)
});


