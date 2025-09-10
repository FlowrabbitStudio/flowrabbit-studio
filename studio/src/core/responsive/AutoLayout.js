
import Logger from '../Logger'
import * as Flat2Tree from './Flat2Tree'
import * as Quant2Flat from './Quant2Flat'
import Config from './Config'
import ModelGeom from '../ModelGeom'
import * as GridLayouter from './GridLayouter'
//import * as ExportUtil from './ExportUtil'

export default class AutoLayout {

    constructor(app, config = Config.getDefault()) {
        this.app = app
        this.config = config
        this.config.addGrid = false
        this.snapMargin = this.config.autoSnapMargin
        this.clusterMergeMode = this.config.autoClusterMergeMode
        this.useGrid = this.config.autoUseGrid
        this.useTree = this.config.autoUseTree
    }

    layout(refScrn, selection, useScreen){
        Logger.log(-10, `AutoLayout.layout() > enter grid:${this.useGrid} , snapMargin: ${this.snapMargin}, clusterMergeMode: ${this.clusterMergeMode}`)

        const widgets = this.getBoxes(selection)
        if (this.useGrid) {
            this.snappToGrid(refScrn, widgets)
        }

        const boundingBox = useScreen 
            ? ModelGeom.getBoundingBoxByBoxes([refScrn]) 
            : ModelGeom.getBoundingBoxByBoxes(Object.values(widgets))

        const bbBoxOffset = {
            x: refScrn.x + (boundingBox.x - refScrn.x),
            y: refScrn.y + (boundingBox.y - refScrn.y)
        }

        const scrn = {
            id: 's',
            name: 'Selection',
            w: boundingBox.w,
            h: boundingBox.h,
            x: boundingBox.x,
            y: boundingBox.y,
            children: selection,
            style: {},
            props: {}
        }

        const model = {
            widgets: widgets,
            screens:{
                's': scrn
            },
            groups: {}
        }

        let root;
        if (this.useTree) {
            const flat = Quant2Flat.transform(model, this.config)        
            const treeModel = Flat2Tree.transform(flat, this.config)
            this.treeModel = treeModel
            root = treeModel.screens[0]
        } else {
            root = {
                id: 'fake',
                w: boundingBox.w,
                h: boundingBox.h,
                x: boundingBox.x,
                y: boundingBox.y,
                children: this.getFlatChildren(Object.values(widgets), boundingBox),
                style: {},
                props: {}
            }
        }

        this.layoutElement(root, this.snapMargin)
        

        if (this.useTree) {
            return this.getTreePositions(root, bbBoxOffset)
        } else {
            return this.getTreePositions(root, {x:0, y:0})
        }

    
    }

    getFlatChildren(elements, boundingBox) {
        return elements.map(e => {
            e.x = e.x - boundingBox.x
            e.y = e.y - boundingBox.y
            return e
        })
    }
    

    layoutElement (element, threshold = 8) {


        const w = this.app.grid.w
        const grid = GridLayouter.computeGrid(element)
        console.debug(grid.columns.map(v => v.v))
        const cols = this.clusterAndMerge(grid.columns, threshold, w)
        console.debug(cols.map(v => v.v))
        // cols.forEach(c => {
        //     console.debug(c)
        // })


    }

    clusterAndMerge(values, threshold, grid) {
        const result = []
        let current = values[0]
        let temp = [current.v]
        for (let i = 1; i < values.length; i++) {
            const value = values[i]
            const distance = value.v - current.v
            if (distance < threshold) {  
                // merge         
                current.start = current.start.concat(value.start)
                current.end = current.end.concat(value.end)
                // we could make the current.v also grow
                temp.push(value.v)
            } else {
                // new cluster
                let avg = this.getClusterValue(temp)

                // snapp still to grid?
                let avgGrid = Math.round(avg / grid) * grid
                current.v = avgGrid
        
                result.push(current)
                current = value
                temp = [current.v]
            }
        }
        return result
    }

    getClusterValue(temp) {
        if (this.clusterMergeMode === 'mean') {
            return this.mean(temp)
        }
        return this.mode(temp)

    }

    mode(temp) {
        const counts = {};
        temp.forEach(t => {
            counts[t] = (counts[t] || 0) + 1
        });

        // mode makes only sense, if we have counts > 1!
    
        let modes = [];
        let maxCount = 0;

        for (const number in counts) {
            const count = counts[number];
            if (count > maxCount) {
                maxCount = count;
                modes = [Number(number)];
            } else if (count === maxCount) {
                modes.push(Number(number));
            }
        }
        console.debug('mode', temp, this.mean(modes))

        return this.mean(modes)
    }

    mean(temp) {
       return Math.round(temp.reduce((sum, num) => sum + num, 0) / temp.length)
    }

   


    getTreePositions(element, parent, result = {}) {
        const pos = {
            x: element.x + parent.x,
            y: element.y + parent.y,
            h: element.h,
            w: element.w
        }
        result[element.id] = pos
        if (element.children) {
            element.children.forEach(c => {
                this.getTreePositions(c, pos, result)
            })
        }
        return result
    }

   
    getFlatPositions(element, result = {}) {
        const pos = {
            x: element.x,
            y: element.y,
            h: element.h,
            w: element.w
        }
        result[element.id] = pos
        if (element.children) {
            element.children.forEach(c => {
                this.getFlatPositions(c, result)
            })
        }
        return result
    }



    snappToGrid (refScrn, widgets) {
        Logger.log(-10, 'AutoLayout.snappToGrid() > enter', this.app.grid.w, this.app.grid.h )
        const w = this.app.grid.w
        const h = this.app.grid.h
        const x = refScrn.x
        const y = refScrn.y
        for (let id in widgets) {
            const element = widgets[id]
            this.snapElementToGrid(element, x, y, w, h)
        }
    }

    snapElementToGrid(element, x, y, w, h) {
        element.x = (Math.round((element.x - x) / w) * w) + x
        element.y = (Math.round((element.y -y) / h) * h) + y
        element.w = Math.round(element.w / w) * w
        element.h = Math.round(element.h / h) * h 
    }
    
    getBoxes(selection) {
        const widgets = {}
        for (let id in this.app.widgets) {
            const w = this.app.widgets[id]
            if (selection.indexOf(id) > -1) {
                widgets[id] = structuredClone(w)
            }
        }
        return widgets
    }
}
