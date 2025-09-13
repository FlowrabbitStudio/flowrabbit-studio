//import * as Util from "../core/ExportUtil"

export function getWrapperBoxes(model, all, parent) {

    const style = parent.style
    const gap = style.gap
    const cols = style.cols
    const totalGap =  (cols - 1) * gap
    let width = (parent.w - totalGap) / cols

   

    if (model && model.grid && model.grid.enabled) {
        const gridW = model.grid.w
        width = width - (width % gridW)
    }

    const rest = parent.w - ((width * cols) + totalGap)
     
    const boxes = []
    for (let i=0; i< cols; i++ ) {
        const box = {
            type: "Box",
            id: parent.id + "_c"+i,
            name: parent.name + "_c"+i,
            style: parent.style,
            props: parent.props,
            has: parent.has,
            y: parent.y,
            h: parent.h,
            z: parent.z
        }
        boxes.push(box)
        delete box.style.wrapOnMobile
        delete box.style.gap
        delete box.style.cols

        const left = Math.round((i * (width + gap)))
        box.x = parent.x + left
        if (i == cols - 1) {
          box.w = (width + rest)
        } else {
          box.w = width
        }
        console.debug(box.name, box.w, box.x, box.z)
    }
    return boxes
}