import app from "./data/fullScreenHeight.json";
import app2 from "./data/fullScreenHeight2.json";
import app3 from './data/fullScreenColsAndGroups.json'

import ModelTransformer from "../../src/qux/core/ModelTransformer";
import * as TestUtil from "./TestUtil";

import CSSOptimizer from '../../src/qux/core/CSSOptimizer'
import CSSFactory from '../../src/qux/core/CSSFactory'
import CSSPosition from '../../src/qux/core/CSSPosition'

test("Test pinned Root", () => {
  let t = new ModelTransformer(app, {
    css: {
      grid: true,
    },
  });
  let model = t.transform();

  let scrn = model.screens[0]
  let box = scrn.children[0]
  expect(box.props.isFullHeight).toBe(true)

  let compressed = new CSSOptimizer().runTree(model)
  let classes = new CSSFactory().generate(compressed)


  let css1 = TestUtil.findCSSBySelector(classes, '.NoGrid .Box')[0]
  expect(css1.code.indexOf('height: 100vh;')).toBeGreaterThan(0)
});

test("Test pinned Chat", () => {
    let t = new ModelTransformer(app, {
      css: {
        grid: true,
      },
    });
    let model = t.transform();
  
    let scrn = model.screens[1]
    //console.debug(TestUtil.print(scrn))
    let chat = scrn.children[0]

    expect(chat.props.isFullHeight).toBe(true)
  
    let compressed = new CSSOptimizer().runTree(model)
    let classes = new CSSFactory().generate(compressed)
  

    let css1 = TestUtil.findCSSBySelector(classes, '.NoGrid1 .Chat')[0]
    expect(css1.code.indexOf('height: 100vh;')).toBeGreaterThan(0)
  });
  
  test("Test pinned Child", () => {
    let t = new ModelTransformer(app, {
      css: {
        grid: true,
      },
    });
    let model = t.transform();
  
    let scrn = model.screens[1]
    //console.debug(TestUtil.print(scrn))
    let chat = scrn.children[0]

    expect(chat.props.isFullHeight).toBe(true)
  
    let compressed = new CSSOptimizer().runTree(model)
    let classes = new CSSFactory().generate(compressed)
  

    let css1 = TestUtil.findCSSBySelector(classes, '.NoGrid .ChildBox')[0]
    expect(css1.code.indexOf('height: calc(100% - 88px')).toBeGreaterThan(0)
  });


  test("Test pinned Float", () => {
    let t = new ModelTransformer(app, {
      css: {
        grid: true,
      },
    });
    let model = t.transform();
  
    let scrn = model.screens[1]
    //console.debug(TestUtil.print(scrn))
    let chat = scrn.children[0]

    expect(chat.props.isFullHeight).toBe(true)
  
    let compressed = new CSSOptimizer().runTree(model)
    let classes = new CSSFactory().generate(compressed)
  

    let css1 = TestUtil.findCSSBySelector(classes, '.NoGrid3 .FloatingBox')[0]
    expect(css1.code.indexOf('height: calc(100vh - 88px')).toBeGreaterThan(0)
  });


  test("Test pinned Group", () => {
    let t = new ModelTransformer(app2, {
      css: {
        grid: true,
      },
    });
    let model = t.transform();
  
    let scrn = model.screens[0]
    //console.debug(TestUtil.print(scrn))
    let group = scrn.children[0]

    expect(group.props.isFullHeight).toBe(true)
   
  
    let compressed = new CSSOptimizer().runTree(model)
    let classes = new CSSFactory().generate(compressed)

  

    let css1 = TestUtil.findCSSBySelector(classes, '.Screen .Group_g10012_38325')[0]
    console.debug(css1.code)
    expect(css1.code.indexOf('height: 100vh')).toBeGreaterThan(0)
    expect(css1.code.indexOf('grid-template-rows: 100vh')).toBeGreaterThan(0)
  });


test("Test pinned Group", () => {
    let t = new ModelTransformer(app3, {
      css: {
        grid: true,
      },
    });
    let model = t.transform();
  
    let scrn = model.screens[0]
    //console.debug(TestUtil.print(scrn))
    let group = scrn.children[0]

    expect(group.props.isFullHeight).toBe(true)
   
  
    let compressed = new CSSOptimizer().runTree(model)
    let classes = new CSSFactory().generate(compressed)

   //console.debug(classes)

    let css1 = TestUtil.findCSSBySelector(classes, '.GrupedScreen .Group_g10016_733')[0]
    console.debug(css1.code)
    expect(css1.code.indexOf('height: 100vh')).toBeGreaterThan(0)
    expect(css1.code.indexOf('grid-template-rows: minmax(0,1fr) 104px 40px')).toBeGreaterThan(0)
  });

  test("Test pinned 2 Cols", () => {
    let t = new ModelTransformer(app3, {
      css: {
        grid: true,
      },
    });
    let model = t.transform();
  
    let scrn = model.screens[1]
    //console.debug(TestUtil.print(scrn))
    let child1 = scrn.children[0]
    let child2 = scrn.children[1]

    expect(child1.props.isFullHeight).toBe(true)
    expect(child2.props.isFullHeight).toBe(undefined)
  
    let compressed = new CSSOptimizer().runTree(model)
    let classes = new CSSFactory().generate(compressed)

    let css1 = TestUtil.findCSSBySelector(classes, '.qux-screen.ColScreen')[0]

    // here it is the screen
    expect(css1.code.indexOf('min-height:100vh')).toBeGreaterThan(0)
    expect(css1.code.indexOf('grid-template-rows: minmax(0,1fr) 136px;')).toBeGreaterThan(0)
  });