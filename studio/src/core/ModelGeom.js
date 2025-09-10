
/**
 * A class that should in the long run contain all the geometric functions
 * that are somehow scattered around, Core.js and Util.vue
 */
class ModelGeom {


    getBoundingBox (ids, model) {
        const result = { x: 100000000, y: 100000000, w: 0, h: 0 , isBoundingBox: true, ids: ids};
     
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const box = this.getBoxById(id, model);
            if (box) {
                result.x = Math.min(result.x, box.x);
                result.y = Math.min(result.y, box.y);
                result.w = Math.max(result.w, box.x + box.w);
                result.h = Math.max(result.h, box.y + box.h);
            } else {
                console.warn("getBoundingBox() > No box with id", id);
            }
        }
        result.h -= result.y;
        result.w -= result.x;
        return result;
    }

    getBoundingBoxByBoxes (boxes) {
        const result = { x: 100000000, y: 100000000, w: 0, h: 0, isBoundingBox: true};

        for (let i = 0; i < boxes.length; i++) {
            const box = boxes[i];
            result.x = Math.min(result.x, box.x);
            result.y = Math.min(result.y, box.y);
            result.w = Math.max(result.w, box.x + box.w);
            result.h = Math.max(result.h, box.y + box.h);
        }

        result.h -= result.y;
        result.w -= result.x;

        return result;
    }

    getMinZValueByIDs(ids, model) {
        let min = 100000;
        let l = 0;
        ids.forEach(id => {
            const w = model.widgets[id];
            if (w) {
                min = Math.min(w.z, min);
                l++;
            } else {
                console.debug('getMinZValueByIDs() > cannot find', id)
            }
        })
        if (l > 0) {
            return min;
        } else {
            return 0;
        }
    }

    getBoxById (id, model) {
        if (model.widgets[id]) {
            return model.widgets[id];
        }

        if (model.screens[id]) {
            return model.screens[id];
        }

        if (model.templates && model.templates[id]) {
            return model.templates[id];
        }

        /**
         * Ok, there seems to be an inherited model id???
         */
        if (!id || !id.split) {
            console.debug("getBoxById() > ID is wrong: " + id);
            return null;
        }
        const parts = id.split("@");
        if (parts.length == 2) {
            const widgetID = parts[0];
            const screenID = parts[1];

            const screen = model.screens[screenID];
            const parentWidget = model.widgets[widgetID];
            if (screen && parentWidget) {
                /**
                 * Would getParentScreen() also work???
                 */
                const parentScreen = this.getParentScreen(parentWidget, model) //this.getHoverScreen(parentWidget, model, currentPage);

                if (parentScreen) {

                    const difX = parentScreen.x - screen.x;
                    const difY = parentScreen.y - screen.y;

                    const copiedParentWidget = this.clone(parentWidget);

                    /**
                     * Super important the ID mapping!!
                     */
                    copiedParentWidget.id = id;
                    copiedParentWidget.inherited = parentWidget.id;
                    copiedParentWidget.inheritedOrder = 1;

                    /**
                     * Now lets also put it at the right position!
                     */
                    copiedParentWidget.x -= difX;
                    copiedParentWidget.y -= difY;

                    return copiedParentWidget;
                } else {
                    console.warn('ModelGeom.getBoxById() > No parent Screen', id)
                }
            } else {
                console.warn("ModelGeom.getBoxById() > No screen or widget for inherited id ",id);
            }
        }
        return null;
    }

    getParentScreen (widget, model) {
        for (let id in model.screens) {
            const screen = model.screens[id];
            const i = screen.children.indexOf(widget.id);
            if (i > -1) {
                return screen;
            }
        }
        return null;
    }

    isResponsiveModel(model) {
        return model.type === 'responsive'
    }

    getHoverScreen (box, model, currentPage) {
        const isRsponsive = this.isResponsiveModel(model) 
        if (!currentPage && isRsponsive) {
            console.trace()
        }
        if (!box.w) {
            box.w = 0;
        }
        if (!box.h) {
            box.h = 0;
        }
        if (isRsponsive && currentPage) {
            for (let id in model.screens) {
                const scrn = model.screens[id];
                if (scrn.p === currentPage) {
                    if (this._isBoxChild(box, scrn)) {
                        return scrn;
                    }
                }
            }
        } else {
            for (let id in model.screens) {
                const scrn = model.screens[id];
                if (this._isBoxChild(box, scrn)) {
                    return scrn;
                }
            }
        }
        return null;
    }

    _isBoxChild (obj, parent) {
        if (
            obj.x + obj.w < parent.x ||
            parent.x + parent.w < obj.x ||
            obj.y + obj.h < parent.y ||
            parent.y + parent.h < obj.y
        ) {
            return false;
        }
        return true;
    }

    clone (obj) {
        if (!obj) {
            return null
        }
        let _s = JSON.stringify(obj)
        return JSON.parse(_s)
    }
}

export default new ModelGeom()