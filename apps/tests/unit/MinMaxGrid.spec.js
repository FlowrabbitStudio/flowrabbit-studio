import ModelTransformer from '../../src/qux/core/ModelTransformer'
import app from './data/MinMaxGrid.json'
import CSSPosition from '../../src/qux/core/CSSPosition'
import * as Util from '../../src/qux/core/ExportUtil'
import * as TestUtil from './TestUtil'
import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'

test('MinMaxGrid', () => {

  const t = new ModelTransformer(app, {
    css: {
      grid: true
    }
  })
  const model = t.transform()
  expect(model).not.toBeNull()
  const start = model.screens[0]
  console.debug(start.grid.columns)

  expect(start.grid.columns[1].minWidth).toBe(200)
  expect(start.grid.columns[1].maxWidth).toBe(400)

  expect(start.grid.columns[2].hasMinMax).toBe(false)



  let f = new CSSPosition({})
  let track = f.getGridColumnTracks(start.w, start.grid.columns)
  console.debug(track)

  expect(track).toBe('6.9% minmax(200px,400px) 2.2% 320px 2.5% 11.9% minmax(0,1fr)')
});