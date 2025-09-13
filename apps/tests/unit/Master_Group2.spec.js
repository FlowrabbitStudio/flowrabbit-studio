import ModelTransformer from '../../src/qux/core/ModelTransformer'
import masterGroups from './data/masteGroupBug.json'
import * as Util from '../../src/qux/core/ExportUtil'
import * as TestUtil from './TestUtil'

test('Test Master Groups 2', () => {

  /**
   * Check that group is copied
   */
  let inModel = Util.createInheritedModel(masterGroups)


  let t = new ModelTransformer(masterGroups, {
    css: {
      grid: true
    }
  })
  let model = t.transform()

  expect(model).not.toBeNull()

  let master = model.screens[0]
  //console.debug(TestUtil.print(master))

  expect(Object.values(inModel.groups).length).toBe(2)
  for (const group of Object.values(inModel.groups)) {
    expect(group.id.indexOf("@")).toBe(-1)
  }

});