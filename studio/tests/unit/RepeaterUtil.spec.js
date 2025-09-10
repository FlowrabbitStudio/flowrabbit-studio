import * as RepeaterUtil from '../../src/core/widgets/RepeaterUtil'


test('Test RepeaterUtil.calculateGrid() > fixed', async () => {


    let grid = RepeaterUtil.calculateGrid(
        {w: 200, h: 300, x:0, y:0},
        {w: 50, h: 25, x:10, y:20},
        10,
        20
    )
    expect(grid.paddingLeft).toBe(10)
    expect(grid.paddingRight).toBe(10)
    expect(grid.paddingTop).toBe(20)
    expect(grid.paddingBottom).toBe(20)
    expect(grid.contentWidth).toBe(180)
    expect(grid.contentHeight).toBe(260)
    expect(grid.columns).toBe(3)
    expect(grid.rows).toBe(5)
    expect(grid.spacingX).toBe(10)
    expect(grid.spacingY).toBe(20)
    expect(grid.childWidth).toBe(60) // + spacingX
    expect(grid.childHeight).toBe(45) // + spacingX
    //console.debug(grid)

})

test('Test RepeaterUtil.calculateGrid() > auto 20', async () => {


    let grid = RepeaterUtil.calculateGrid(
        {w: 200, h: 300, x:0, y:0},
        {w: 50, h: 25, x:10, y:20},
        -1,
        20
    )
    expect(grid.paddingLeft).toBe(10)
    expect(grid.paddingRight).toBe(10)
    expect(grid.paddingTop).toBe(20)
    expect(grid.paddingBottom).toBe(20)
    expect(grid.contentWidth).toBe(180)
    expect(grid.contentHeight).toBe(260)
    expect(grid.childWidth).toBe(50)
    expect(grid.childHeight).toBe(45)
    expect(grid.columns).toBe(3)
    expect(grid.rows).toBe(5)

    expect(grid.spacingY).toBe(20)
    expect(grid.spacingX).toBe(15)
    console.debug(grid)
})

test('Test RepeaterUtil.calculateGrid() > auto auto', async () => {


    let grid = RepeaterUtil.calculateGrid(
        {w: 200, h: 300, x:0, y:0},
        {w: 50, h: 25, x:10, y:20},
        -1,
        -1
    )
    expect(grid.paddingLeft).toBe(10)
    expect(grid.paddingRight).toBe(10)
    expect(grid.paddingTop).toBe(20)
    expect(grid.paddingBottom).toBe(20)
    expect(grid.contentWidth).toBe(180)
    expect(grid.contentHeight).toBe(260)
    expect(grid.childWidth).toBe(50)
    expect(grid.childHeight).toBe(25)
    expect(grid.columns).toBe(3)
    expect(grid.rows).toBe(10)

    expect(grid.spacingY).toBe(1)
    expect(grid.spacingX).toBe(15)
    console.debug(grid)
})