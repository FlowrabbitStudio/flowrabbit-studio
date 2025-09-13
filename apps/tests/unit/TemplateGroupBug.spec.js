
import app from './data/templateGroupBug.json'
import ModelTransformer from '../../src/qux/core/ModelTransformer'
import * as TestUtil from './TestUtil'

import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'
import CSSPosition from '../../src/qux/core/CSSPosition'

test('TemplateGroupBug.spec > test', () => {

  /**
   * This error is caused because the screens have different widths!
   */


  let t = new ModelTransformer(app, {
    css: {
      grid: true
    }
  })
  let tree = t.transform()

  expect(tree).not.toBeNull()
  expect(tree.screens.length).toBe(1)

  const compressed = new CSSOptimizer().runTree(tree)
  const classes = new CSSFactory().generate(compressed)

  //console.debug(classes)

  const css1 = TestUtil.findCSSBySelector(classes, '.qux-template-Box')[0]
  expect(css1).not.toBeNull()
  expect(css1.code.indexOf('background-color: #333333')).toBeGreaterThan(0)

});

