import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import win from 'dojo/_base/win'
import on from 'dojo/on'
import has from 'dojo/has'
import touch from 'dojo/touch'
import domGeom from 'dojo/domGeom'
import topic from 'dojo/topic'
import Logger from 'common/Logger'
import Evented from 'dojo/Evented'

var _vommondCurrentDialog = null

export default class Dialog extends Evented {

	static getCurrentDialog () {
		return _vommondCurrentDialog
	}

	constructor(params) {
		super()
		this.autoClose = true;
		this.wrapperClass = "";
		this.overflow = false;
		this.isFullScreen = false;
		this.hasCSSAnimation = true;
		this.hasHandle = false;
		if (params && params.overflow) {
			this.overflow = params.overflow;
		}
		if (params && params.hasCSSAnimation){
			this.hasCSSAnimation = params.hasCSSAnimation;
		}
		if (params && params.title) {
			this.title = params.title;
		}
		if (params && params.helper) {
			this.helper = params.helper;
		}
		if (params && params.buttons) {
			this.buttons = params.buttons;
		}
		this.log = new Logger("Dialog");
	}

	destroy () {
		this.log.info('destroy', 'enter')
		_vommondCurrentDialog = null
		this.cleanUpEvented()
	}

	addIcon(domNode) {
		this.icon = domNode
	}

	setFullScreen (callback) {
		this.hasFullScreen = true
		this.fullScreenListener = callback
	}

	popup (node, parent, clazz) {
		this.log.log(1, "popup", "enter");

		_vommondCurrentDialog = this

		topic.publish("vommond/dialog/open", {});

		/**
		 * FIXME: We could somehow try to make the transition still a little smoother.
		 */
		const background = document.createElement("div");
		css.add(background, "VommondDialogBackground VommondDialogHidden VommondDialogContentHidden");

		if (this.hasFullScreen) {
			const fullscreen = document.createElement("span");
			css.add(fullscreen, "VommondDialogFullScreen mdi mdi-fullscreen");
			background.appendChild(fullscreen);
			this.own(on(fullscreen, touch.press, lang.hitch(this, "toggleFullScreen", fullscreen)))
		}

		const container = document.createElement("div");
		css.add(container, "VommondDialogContainer");
		background.appendChild(container);

		const wrapper = document.createElement("div");
		css.add(wrapper, "VommondDialogWrapper");
		if (this.overflow) {
			css.add(wrapper, "VommondDialogWrapperOverflow");
		}
		if (clazz) {
			css.add(wrapper, clazz)
		}
		css.add(wrapper, this.wrapperClass);
		container.appendChild(wrapper);	

		const content = document.createElement("div");
		css.add(content, "VommondDialogContent");
		if (has('mobile')){
			css.add(content, 'VommondDialogContentMobile')
			css.add(wrapper, 'VommondDialogWrapperMobile');
		}
		wrapper.appendChild(content);

		if (this.hasHandle) {
			const resizeBack = document.createElement("div");
			css.add(resizeBack, "VommondDialogResizeBack");
			wrapper.appendChild(resizeBack);

			const handle = document.createElement("div");
			css.add(handle, "VommondDialogResizeHandle");
			wrapper.appendChild(handle);

			this.own(on(handle, "mousedown", (e) => this.onResizeStart(e)))
		}

		content.appendChild(node);
		win.body().appendChild(background);

		/**
		 * TODO: try to block scroll in the body. Does not work perfectly
		 */
		this.own(on(background, "onmousewheel", lang.hitch(this, "stopScroll")));
		this.own(on(background, "mousewheel", lang.hitch(this, "stopScroll")));
		this.own(on(background, "DOMMouseScroll", lang.hitch(this, "stopScroll")));
		
		/**
		 * Close on ESC
		 */
		this.own(topic.subscribe("matc/canvas/esc", lang.hitch(this,"close")));
			

		const startPos = this.getStartPos(parent);
		const endPos = domGeom.position(wrapper);
		const backPos = domGeom.position(background);

		if (this.autoClose) {
			this.own(on(background, touch.press, lang.hitch(this, "onBackClick")));
		}

		wrapper.style.top = startPos.y + "px";
		wrapper.style.height = startPos.h + "px";
		wrapper.style.width = startPos.w + "px";
		wrapper.style.left = startPos.x + "px";

		if (this.hasCSSAnimation) {
			var ratioW = startPos.w / endPos.w;
			var ratioH = startPos.h / endPos.h;
			var transform = " scale(" + ratioW + "," + ratioH + ")"
			wrapper.style.transform = transform;
		}
		

		// add here a css transform to make the calling smoother
		// 
		/**
		 * fade in
		 */
		setTimeout(() => {
			css.remove(background, "VommondDialogHidden");
		}, 1);

		/**
		 * fade in
		 */
		setTimeout(() => {
			css.remove(background, "VommondDialogContentHidden");
		}, 350);

		setTimeout(() => {
			// reset scale
			if (this.hasCSSAnimation) {
				wrapper.style.transform = "scale(1,1)";
			}
			wrapper.style.top = Math.round((backPos.h - endPos.h) / 2) + "px";
			wrapper.style.height = endPos.h + "px";
			wrapper.style.width = endPos.w + "px";
			wrapper.style.left = Math.round((backPos.w - endPos.w) / 2) + "px";
		}, 100);

		/**
		 * 2.1.9 Fix to allow fixed elements in simulator
		 */
		if (this.hasCSSAnimation) {
			setTimeout(() => {
				wrapper.style.transform = "";
			}, 500);
		}

		/**
		 * Since 4.0.34 we have an an onOpen listener
		 */
		setTimeout(() => this.emitOpen(), 500)


		this._dialogBackground = background;
		this.node = node;
		this.wrapper = wrapper;
		this.defaultPos = endPos
	}



	onResizeStart (e) {
		this.stopEvent(e)
		this.onResizeEnd(e)
		this.resizeStartPos = this.getMouse(e);
		this.moveListener = on(win.body(), "mousemove", lang.hitch(this, "onResizeMove"));
		this.releaseListener = on(win.body(), "mouseup",lang.hitch(this, "onResizeEnd"));
		css.add(this.wrapper, "VommondDialogWrapperResizing");
	}

	onResizeMove (e) {
		this.stopEvent(e)
		const pos = this.getMouse(e);
		const dif = pos.x - this.resizeStartPos.x
		this.newPos = {
			w: Math.max(300, this.defaultPos.w + (dif * 2)),
			h: this.defaultPos.h
		}
		requestAnimationFrame(() => {
			if (this.newPos) {
				this.resize(this.newPos)
				this.node.style.width = this.newPos.w + 'px'
			}
			delete this.newPos
		})
	}

	onResizeEnd(e) {
		if (e && this.resizeStartPos) {
			this.stopEvent(e)
			const pos = this.getMouse(e);
			const dif = pos.x - this.resizeStartPos.x
			this.defaultPos.w = Math.max(300, this.defaultPos.w + (dif * 2))
		}
		css.remove(this.wrapper, "VommondDialogWrapperResizing");
		if (this.moveListener) {
			this.moveListener.remove()
		}
		if (this.releaseListener) {
			this.releaseListener.remove()
		}
		delete this.resizeStartPos
		delete this.moveListener
		delete this.releaseListener
	}

	getMouse (e) {	
		if (e) {
		   var result = {};
		   if (e.touches && e.touches.length > 0) {
			 e = e.touches[0]
			 result.x = e.clientX;
			 result.y = e.clientY;
		   } else if (e.changedTouches && e.changedTouches.length > 0 ) {
			 e = e.changedTouches[0]
			 result.x = e.clientX;
			 result.y = e.clientY;
		   } else {
			 result.x = e.pageX;
			 result.y = e.pageY;
		   }
		   return result;
		 }
		 return {x: 0, y: 0};
	   }

	   
	onOpen (callback) {
		this._onOpenCallback = callback
	}

	emitOpen() {
		if (this._onOpenCallback) {
			this._onOpenCallback()
		}

		if (this.icon) {
			this._dialogBackground.appendChild(this.icon)
		}
	}

	getStartPos(parent) {
		if (!parent) {
			var pos = domGeom.position(win.body());
			return {
				w: 0,
				h: 0,
				x: pos.w / 2,
				y: pos.h / 2
			};
		} else {
			return domGeom.position(parent);
		}
	}

	move(offsetX) {
		this.wrapper.style.transform = `translateX(${offsetX}px) `
	}

	resize(endPos) {
		const wrapper = this.wrapper;
		const background = this._dialogBackground;
		/**
		 * check of pos of node was passed
		 */
		if (endPos.appendChild) {
			endPos = domGeom.position(endPos, true);
		}
		const backPos = domGeom.position(background);
		wrapper.style.top = Math.round((backPos.h - endPos.h) / 2) + "px";
		wrapper.style.height = endPos.h + "px";
		wrapper.style.width = endPos.w + "px";
		wrapper.style.left = Math.round((backPos.w - endPos.w) / 2) + "px";
	}

	stopScroll(e) {
		/**
		 * FIXME: This work like shity shit... The detction should be somehow much better... but well.
		 */
		if (this._dialogBackground == e.target) {
			this.stopEvent(e);
			return false;
		}
	}

	onBackClick(e) {

		var target = e.target;
		if (target == this._dialogBackground) {
			this.stopEvent(e);
			css.add(this._dialogBackground, " VommondDialogHidden");
			setTimeout(lang.hitch(this, "close"), 300);
		}
	}

	shake() {

		var pos = domGeom.position(this.wrapper);
		css.add(this.wrapper, "VommondDialogWrapperShake");

		var wrapper = this.wrapper;
		setTimeout(function () {
			wrapper.style.left = (pos.x + 50) + "px";
		}, 1);

		setTimeout(function () {
			wrapper.style.left = (pos.x - 50) + "px";
		}, 51);

		setTimeout(function () {
			wrapper.style.left = (pos.x + 50) + "px";
		}, 101);

		setTimeout(function () {
			wrapper.style.left = (pos.x - 50) + "px";
		}, 151);

		setTimeout(function () {
			wrapper.style.left = (pos.x) + "px";
			css.remove(wrapper, "VommondDialogWrapperShake");
		}, 201);

	}

	toggleFullScreen (node) {
		this.isFullScreen = !this.isFullScreen
		if (this.fullScreenListener) {
			this.fullScreenListener(this.isFullScreen)
		}
		if (this.isFullScreen) {
			css.remove(node, 'mdi-fullscreen')
			css.add(node, 'mdi-fullscreen-exit')
		} else {
			css.add(node, 'mdi-fullscreen')
			css.remove(node, 'mdi-fullscreen-exit')
		}
	}

	hide() {
		this.close();
	}

	close() {
		this.emit("close", {});
		if (this._dialogBackground) {
			win.body().removeChild(this._dialogBackground);
		}
		this.onResizeEnd()
		this.destroy();
	}
}