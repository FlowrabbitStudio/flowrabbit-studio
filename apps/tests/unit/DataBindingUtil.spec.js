import dataBindingTable from './data/dataBindingTable.json'
import dataBindingChat from './data/dataBindingChat.json'
import dataBindingAssistant from './data/dataBindingAssistant.json'

import * as Util from '../../src/qux/core/ExportUtil'
import DataBindingUtil from '../../src/qux/core/DataBindingUtil'
import * as TestUtil from './TestUtil'

test('Test DataBindingUtil.addDefaultDataBinding()', async () => {

  let model = DataBindingUtil.addDefaultDataBinding(dataBindingTable)
  expect(model).not.toBeNull()

  const rest = model.widgets['w10144_34834']
  expect(rest.props.databinding.default).toBe('canvas.rest')

  const textBox = model.widgets['w10246_33094']
  expect(textBox.props.databinding.default).toBe('screen.text_box')

  const pading = model.widgets['w10250_12267']
  expect(pading.props.databinding.default).toBe('screen.paging')

});

test('Test DataBindingUtil.addDataBindingLinks() > with defaults', async () => {

  let model = DataBindingUtil.addDefaultDataBinding(Util.clone(dataBindingTable))
  model = DataBindingUtil.addDataBindingLinks(model)

  expect(model).not.toBeNull()

  const table = model.widgets['w10077_14804']
  expect(table.props.databinding.default).toBe('users')
  expect(table.props.databinding.filter).toBe('screen.text_box')
  expect(table.props.databinding.paginationCount).toBe('w10250_12267_input')
  expect(table.props.databinding.paginationPosition).toBe('w10250_12267_output')
});

test('Test DataBindingUtil.addDataBindingLinks() > with custom', async () => {

  let model = Util.clone(dataBindingTable)

  const rest = model.widgets['w10144_34834']
  rest.props.rest.output.databinding = 'aaa'

  const textBox = model.widgets['w10246_33094']
  textBox.props.databinding ={default : 'bbb'}

  const paging = model.widgets['w10250_12267']
  paging.props.databinding = {input : 'ccc', output: 'ddd'}

  model = DataBindingUtil.addDataBindingLinks(model)
  expect(model).not.toBeNull()

  const table = model.widgets['w10077_14804']
  expect(table.props.databinding.default).toBe('aaa')
  expect(table.props.databinding.filter).toBe('bbb')
  expect(table.props.databinding.paginationCount).toBe('ccc')
  expect(table.props.databinding.paginationPosition).toBe('ddd')
});

test('Test DataBindingUtil.addDataBindingLinks() > with custom and default', async () => {

  let model = Util.clone(dataBindingTable)


  const paging = model.widgets['w10250_12267']
  paging.props.databinding = {input : 'ccc', output: 'ddd'}

  model = DataBindingUtil.addDefaultDataBinding(model)
  model = DataBindingUtil.addDataBindingLinks(model)
  expect(model).not.toBeNull()

  const table = model.widgets['w10077_14804']
  expect(table.props.databinding.default).toBe('users')
  expect(table.props.databinding.filter).toBe('screen.text_box')
  expect(table.props.databinding.paginationCount).toBe('ccc')
  expect(table.props.databinding.paginationPosition).toBe('ddd')
});

// test('Test DataBindingUtil.addDataBindingLinks() > Chat', async () => {

//   let model = Util.clone(dataBindingChat)

//   model = DataBindingUtil.addDefaultDataBinding(model)
//   model = DataBindingUtil.addDataBindingLinks(model)
//   expect(model).not.toBeNull()

//   const chatWithDB = model.widgets['w10002_91063']

//   expect(chatWithDB.props.databinding.input).toBe('chatAllMessages')
//   expect(chatWithDB.props.databinding.output).toBe('chatMessage')

//   const chatNoDB = model.widgets['w10005_81592']
//   expect(chatNoDB.props.databinding.input).toBe('chatAllMessages')
//   expect(chatNoDB.props.databinding.output).toBe('chatMessage')

// });


// test('Test DataBindingUtil.addDataBindingLinks() > Assistant', async () => {

//   let model = Util.clone(dataBindingAssistant)

//   model = DataBindingUtil.addDefaultDataBinding(model)
//   model = DataBindingUtil.addDataBindingLinks(model)
//   expect(model).not.toBeNull()

//   const chatNoDB = model.widgets['w10002_39087']
//   console.debug(chatNoDB.props.databinding)
//   expect(chatNoDB.props.databinding.input).toBe('assistantOutput')
//   expect(chatNoDB.props.databinding.output).toBe('assistantInput')

// });
