/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = getSegmentSchema;
/* harmony export (immutable) */ __webpack_exports__["c"] = isDrawingSegment;
/* harmony export (immutable) */ __webpack_exports__["a"] = createLineSegment;
/* harmony export (immutable) */ __webpack_exports__["d"] = joinSegments;
const segmentSchemas = {
	m: ['x', 'y'],
	z: [],
	l: ['x', 'y'],
	h: ['x'],
	v: ['y'],
	c: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
	s: ['x2', 'y2', 'x', 'y'],
	q: ['x1', 'y1', 'x', 'y'],
	t: ['x', 'y'],
	a: ['rx', 'ry', 'xRotation', 'largeArc', 'sweep', 'x', 'y'],
}

const pointGroups = [
	['x1', 'y1'],
	['x2', 'y2'],
	['x', 'y'],
]
/* harmony export (immutable) */ __webpack_exports__["e"] = pointGroups;


const drawingCmdExpr = /[lhvcsqta]/

function getSegmentSchema(type)
{
	return segmentSchemas[ type.toLowerCase() ]
}

function isDrawingSegment(segment)
{
	return drawingCmdExpr.test(segment.type)
}

function createLineSegment(points)
{
	const segment = { relative: false }

	switch(points.length)
	{
		case 2: { segment.type = 'l' } break
		case 3: { segment.type = 'q' } break
		case 4: { segment.type = 'c' } break
		default: return false
	}

	for(let i = 1; i < points.length; i++)
	{
		const g = (i < points.length - 1 ? i : pointGroups.length) - 1
		const [x, y] = pointGroups[g]

		segment[x] = points[i][0]
		segment[y] = points[i][1]

		if(points[i].length > 2)
		{
			segment.extended = segment.extended || {}
			segment.extended[g] = points[i].slice(2)
		}
	}

	return segment
}

function joinSegments(segmentA, segmentB)
{
	if(segmentA.type === segmentB.type && segmentA.relative === segmentB.relative)
	{
		const { type, relative, x, y } = segmentB
		const bothExtended = !!segmentA.extended && !!segmentB.extended
		const extended = {}
		const segment = { type, relative, x, y, extended }

		function setExtended(pointsA, pointsB, type)
		{
			if(pointsA && pointsB)
			{
				const points = []
				const pointCount = Math.min(pointsA.length, pointsB.length)

				for(let i = 0; i < pointCount; i++)
				{
					points.push((pointsA[i] + pointsB[i]) / 2)
				}

				segment.extended[type] = points
			}
		}

		switch(type)
		{
			case 'l': break
			case 'q':
			{
				segment.x1 = (segmentA.x1 + segmentB.x1) / 2
				segment.y1 = (segmentA.y1 + segmentB.y1) / 2

				if(bothExtended)
				{
					setExtended(segmentA.extended[0], segmentB.extended[0], 0)
				}
			}
			break
			case 'c':
			{
				segment.x1 = (segmentA.x1 + segmentA.x2) / 2
				segment.y1 = (segmentA.y1 + segmentA.y2) / 2
				segment.x2 = (segmentB.x1 + segmentB.x2) / 2
				segment.y2 = (segmentB.y1 + segmentB.y2) / 2

				if(bothExtended)
				{
					setExtended(segmentA.extended[0], segmentA.extended[1], 0)
					setExtended(segmentB.extended[0], segmentB.extended[1], 1)
				}
			}
			break
			default:
			{
				return false
			}
		}

		if(segmentB.extended && segmentB.extended[2])
		{
			extended[2] = segmentB.extended[2]
		}

		return segment
	}

	return false
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = transform;
function transform(path, transformer)
{
	const newPath = []

	for(let i = 0; i < path.length; i++)
	{
		const segment = JSON.parse(JSON.stringify(path[i]))
		const result = transformer(segment, i, path, newPath)

		if(Array.isArray(result))
		{
			newPath.push(...result)
		}
		else if(result)
		{
			newPath.push(result)
		}
	}

	return newPath
}


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = parser;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);


const segmentExpr = /([mzlhvcsqta])([^mzlhvcsqta]*)/ig
const numberExpr = /-?[0-9]*\.?[0-9]+(?:e[-+]?\d+)?/ig

function parser(pathString)
{
	const pathData = []

	let segmentMatch
	segmentExpr.lastIndex = 0
	
	while( (segmentMatch = segmentExpr.exec(pathString)) )
	{
		const type = segmentMatch[1].toLowerCase()
		const numbers = (segmentMatch[2].match(numberExpr) || []).map(parseFloat)
		const relative = (type === segmentMatch[1])

		const schema = Object(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getSegmentSchema */])(type)

		if(numbers.length < schema.length)
		{
			throw new Error(`Malformed path data: type "${type}" has ${numbers.length} arguments, expected ${scheme.length}`)
		}

		if(schema.length > 0)
		{
			if(numbers.length % schema.length !== 0)
			{
				throw new Error(`Malformed path data: type "${type}" has ${numbers.length} arguments, ${numbers.length % schema.length} too many`)
			}

			for(let i = 0; i < numbers.length / schema.length; i++)
			{
				const segmentData = { type, relative }

				for(let j = 0; j < schema.length; j++)
				{
					segmentData[ schema[j] ] = numbers[i * schema.length + j]
				}

				pathData.push(segmentData)
			}
		}
		else
		{
			pathData.push({ type, relative })
		}
	}

	return pathData
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = encoder;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);


function encoder(pathData, precision=2)
{
	let prevType = false
	let magnitude = 10**precision

	return pathData.map(function(segment)
	{
		const output = []
		const outputType = (segment.relative ? segment.type : segment.type.toUpperCase())
		let first = (prevType !== outputType)

		const schema = Object(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getSegmentSchema */])(segment.type)
		
		if(first)
		{
			output.push(outputType)
			prevType = outputType
		}

		for(let property of schema)
		{
			const value = segment[property]
			let outputValue

			switch(typeof value)
			{
				case 'boolean': { outputValue = value|0 } break
				case 'number': { outputValue = ((value * magnitude)|0) / magnitude } break
				default: throw new Error('Invalid path data')
			}

			if(!first)
			{
				output.push(' ')
			}

			output.push(outputValue)
			first = false
		}

		return output.join('')
		
	}).join('')
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createElement;
/* harmony export (immutable) */ __webpack_exports__["b"] = getProperty;
/* harmony export (immutable) */ __webpack_exports__["c"] = setProperty;
function createElement(tag, attributes={})
{
	const element = document.createElementNS('http://www.w3.org/2000/svg', tag)

	for(let name of Object.keys(attributes))
	{
		setProperty(element, name, attributes[name])
	}

	return element
}

function getProperty(element, property)
{
	if(element[property] instanceof SVGAnimatedLength)
	{
		return element[property].baseVal.value
	}

	return element.getAttribute(property)
}

function setProperty(element, property, value)
{
	element.setAttribute(property, value)
}


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export split */
/* harmony export (immutable) */ __webpack_exports__["b"] = until;
/* harmony export (immutable) */ __webpack_exports__["a"] = euclideanDistance;
function split(p, t=0.5)
{
	const seg0 = []
	const seg1 = []
	const orders = [p]

	while(orders.length < p.length)
	{
		const q = orders[orders.length - 1]
		const r = []

		for(let i = 1; i < q.length; i++)
		{
			const q0 = q[i - 1]
			const q1 = q[i]
			const s = []
			const dim = Math.max(q0.length, q1.length)

			for(let j = 0; j < dim; j++)
			{
				const s0 = q0[j] || 0
				const s1 = q1[j] || 0

				s.push(s0 + (s1 - s0) * t)
			}

			r.push(s)
		}

		orders.push(r)
	}

	for(let i = 0; i < orders.length; i++)
	{
		seg0.push(orders[i][0])
		seg1.push(orders[orders.length - 1 - i][i])
	}

	return [seg0, seg1]
}

function until(points, threshold, deltaFunction=euclideanDistance)
{
	const stack = [points]
	const segments = []

	while(stack.length > 0)
	{
		const currentPoints = stack.pop()

		if(deltaFunction(currentPoints) > threshold)
		{
			const newPoints = split(currentPoints)

			// Add new segments backwards so they end up in correct order
			for(let i = newPoints.length - 1; i >= 0; i--)
			{
				stack.push(newPoints[i])
			}
		}
		else
		{
			segments.push(currentPoints)
		}
	}

	return segments
}

function euclideanDistance(points)
{
	const startPoint = points[0]
	const endPoint = points[points.length - 1]
	let d2 = 0

	for(let i = 0; i < startPoint.length; i++)
	{
		const d = endPoint[i] - startPoint[i]
		d2 += d**2
	}

	return Math.sqrt(d2)
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(7);

__webpack_require__(12);

var _typekit = __webpack_require__(24);

(0, _typekit.loadTypekit)('nzi3xge');

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(10)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js??ref--1-1!../../node_modules/sass-loader/lib/loader.js!./main.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js??ref--1-1!../../node_modules/sass-loader/lib/loader.js!./main.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(9)(undefined);
// imports


// module
exports.push([module.i, "/*! Starlight 0.3.8 | MIT License */\n/*! normalize.css v3.0.3 | MIT License | github.com/necolas/normalize.css */html{font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section,summary{display:block}audio,canvas,progress,video{display:inline-block;vertical-align:baseline}audio:not([controls]){display:none;height:0}[hidden],template{display:none}a{background-color:transparent}a:active,a:hover{outline:0}abbr[title]{border-bottom:1px dotted}b,strong{font-weight:700}dfn{font-style:italic}h1{font-size:2em;margin:.67em 0}mark{background:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}img{border:0}svg:not(:root){overflow:hidden}figure{margin:1em 40px}hr{box-sizing:content-box;height:0}pre{overflow:auto}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}button,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0}button{overflow:visible}button,select{text-transform:none}button,html input[type=button],input[type=reset],input[type=submit]{-webkit-appearance:button;cursor:pointer}button[disabled],html input[disabled]{cursor:default}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}input{line-height:normal}input[type=checkbox],input[type=radio]{box-sizing:border-box;padding:0}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{height:auto}input[type=search]{-webkit-appearance:textfield;box-sizing:content-box}input[type=search]::-webkit-search-cancel-button,input[type=search]::-webkit-search-decoration{-webkit-appearance:none}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{border:0;padding:0}textarea{overflow:auto}optgroup{font-weight:700}table{border-collapse:collapse;border-spacing:0}td,th{padding:0}*,:after,:before{-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box}*{-webkit-tap-highlight-color:transparent}html{font-size:100%}button,input,select,textarea{font-family:inherit;font-size:inherit;line-height:inherit;border-radius:0}textarea{resize:vertical}a,button,input{-ms-touch-action:none}audio,canvas,img,svg,video{vertical-align:middle}button,html,input,select,textarea{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}body{overflow-x:hidden}body,html{overflow-x:hidden!important}html{background-color:#fff;color:#000}body{font-family:europa,sans-serif;font-weight:400;font-size:16px;line-height:1;letter-spacing:0;text-transform:none}blockquote,h1,h2,h3,h4,h5,h6,ol,p,ul{margin:0}address,cite{font-style:inherit}iframe{border:0}a:focus,button:focus{outline:2px solid rgba(0,251,209,.5)}a:active,button:active{outline:0}a{color:inherit;text-decoration:inherit}::selection{background-color:hsla(0,0%,40%,.2)}.hero{display:flex;height:100vh;align-items:center;justify-content:center}.hero_cursor{pointer-events:none;position:absolute;top:0;left:0;margin-top:-.5em;margin-left:-.5em;width:1em;height:1em;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.2) 0,transparent 100%);transition:opacity .3s}.hero_cursor.-hidden{opacity:0}.hero_content{width:100%;max-width:310px;text-align:center}svg.hero_logo{overflow:visible}.hero_logo_circle,.hero_logo_square,.hero_logo_triangle{mix-blend-mode:multiply}.hero_logo_circle{fill:#00fbd1}.hero_logo_triangle{fill:#fffa2a}.hero_logo_square{fill:#d867ff}.hero_title{font-family:europa,sans-serif;font-weight:700;letter-spacing:0;text-transform:none;margin-top:24px;color:#000}@media (min-width:0em){.hero_title{font-size:1.875em;line-height:1.13333}}@media (min-width:40em){.hero_title{font-size:2.625em;line-height:1.04762}}@media (min-width:67.5em){.hero_title{font-size:4em;line-height:1}}.hero_title_warp{font-weight:700}.hero_title_js{font-weight:300}.hero_tagline{font-family:europa,sans-serif;font-weight:400;letter-spacing:0;text-transform:none;margin-top:24px;color:#666}@media (min-width:0em){.hero_tagline{font-size:1em;line-height:1.5}}@media (min-width:40em){.hero_tagline{font-size:1.25em;line-height:1.5}}.hero_button{font-family:europa,sans-serif;font-weight:700;letter-spacing:.2em;text-transform:uppercase;display:inline-block;vertical-align:middle;font-size:.9375em;padding:18px 30px;border-width:0;border-style:solid;line-height:1;overflow:hidden;height:51px;height:calc(36px + 1em);white-space:nowrap;text-overflow:ellipsis;cursor:pointer;border-radius:0;-webkit-appearance:none;-moz-appearance:none;appearance:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-user-drag:none;margin-top:48px;border-radius:9999px;background:#000 linear-gradient(60deg,#fffa2a,#fffa2a 33.33%,#00fbd1 44.44%,#d867ff 55.55%,#000 66.66%,#000);background-size:334.33333% 100%;background-position-x:100%;color:#fff;transition-delay:0s,.2s,0s;transition:box-shadow .3s,transform .3s,color .3s,background-position-x .6s}.hero_button:hover{background-position-x:0;color:#000;box-shadow:0 3px 10px rgba(0,0,0,.2);transform:translateY(-2px)}", ""]);

// exports


/***/ }),
/* 9 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			var styleTarget = fn.call(this, selector);
			// Special case to return head of iframe instead of iframe itself
			if (styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[selector] = styleTarget;
		}
		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(11);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 11 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _Warp = __webpack_require__(13);

var _Warp2 = _interopRequireDefault(_Warp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $hero = document.getElementById('hero');
var $cursor = document.getElementById('hero-cursor');
var $logo = document.getElementById('hero-logo');

var smudgeRadius = 100;
var smudgeStrength = 0.33;

var mouseX = 0;
var mouseY = 0;
var lastMouseX = 0;
var lastMouseY = 0;

window.addEventListener('mousemove', function (e) {
	lastMouseX = mouseX;
	lastMouseY = mouseY;
	mouseX = e.clientX;
	mouseY = e.clientY;
});

window.addEventListener('mouseover', function (e) {
	var hideCursor = e.target.tagName.toLowerCase() === 'a';
	$cursor.classList.toggle('-hidden', hideCursor);
});

function positionCursor() {
	$cursor.style.transform = 'translate(' + mouseX + 'px, ' + mouseY + 'px)';
	$cursor.style.fontSize = smudgeRadius + 'px';

	requestAnimationFrame(positionCursor);
}

positionCursor();

function smudgeFactory(startX, startY, endX, endY, radius, strength) {
	var deltaX = endX - startX;
	var deltaY = endY - startY;

	return function smudge(_ref) {
		var _ref2 = _slicedToArray(_ref, 2),
		    x = _ref2[0],
		    y = _ref2[1];

		var distX = endX - x;
		var distY = endY - y;
		var dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

		if (dist <= radius) {
			x += strength * deltaX * (radius - dist) / radius;
			y += strength * deltaY * (radius - dist) / radius;
		}

		return [x, y];
	};
}

var warp = new _Warp2.default($logo);
warp.interpolate(3);

window.addEventListener('mousemove', function () {
	return requestAnimationFrame(function () {
		var origin = $logo.getBoundingClientRect();

		warp.transform(smudgeFactory(lastMouseX - origin.x, lastMouseY - origin.y, mouseX - origin.x, mouseY - origin.y, smudgeRadius, smudgeStrength));
	});
});

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__svg_normalize__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__svg_utils__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__path_parser__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__path_encoder__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__path_interpolate__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__warp_transform__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__warp_interpolate__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__warp_extrapolate__ = __webpack_require__(23);









class Warp
{
	constructor(element, curveType='q')
	{
		this.element = element

		Object(__WEBPACK_IMPORTED_MODULE_0__svg_normalize__["b" /* shapesToPaths */])(element)
		Object(__WEBPACK_IMPORTED_MODULE_0__svg_normalize__["a" /* preparePaths */])(element, curveType)

		const pathElements = Array.from(element.querySelectorAll('path'))

		this.paths = pathElements.map(pathElement =>
		{
			const pathString = Object(__WEBPACK_IMPORTED_MODULE_1__svg_utils__["b" /* getProperty */])(pathElement, 'd')
			const pathData = Object(__WEBPACK_IMPORTED_MODULE_2__path_parser__["a" /* default */])(pathString)

			return { pathElement, pathData }
		})
	}

	update()
	{
		for (let { pathElement, pathData } of this.paths)
		{
			const pathString = Object(__WEBPACK_IMPORTED_MODULE_3__path_encoder__["a" /* default */])(pathData)
			Object(__WEBPACK_IMPORTED_MODULE_1__svg_utils__["c" /* setProperty */])(pathElement, 'd', pathString)
		}
	}

	transform(transformers)
	{
		transformers = Array.isArray(transformers) ? transformers : [ transformers ]

		for (let path of this.paths)
		{
			path.pathData = Object(__WEBPACK_IMPORTED_MODULE_5__warp_transform__["a" /* default */])(path.pathData, transformers)
		}

		this.update()
	}

	interpolate(threshold)
	{
		let didWork = false

		function deltaFunction(points)
		{
			const linearPoints = [
				points[0].slice(0, 2),
				points[points.length - 1].slice(0, 2),
			]

			const delta = Object(__WEBPACK_IMPORTED_MODULE_4__path_interpolate__["a" /* euclideanDistance */])(linearPoints)
			didWork = didWork || (delta > threshold)

			return delta
		}

		for (let path of this.paths)
		{
			path.pathData = Object(__WEBPACK_IMPORTED_MODULE_6__warp_interpolate__["a" /* default */])(path.pathData, threshold, deltaFunction)
		}

		return didWork
	}

	extrapolate(threshold)
	{
		let didWork = false

		function deltaFunction(points)
		{
			const linearPoints = [
				points[0].slice(0, 2),
				points[points.length - 1].slice(0, 2),
			]

			const delta = Object(__WEBPACK_IMPORTED_MODULE_4__path_interpolate__["a" /* euclideanDistance */])(linearPoints)
			didWork = didWork || (delta <= threshold)

			return delta
		}

		for (let path of this.paths)
		{
			path.pathData = Object(__WEBPACK_IMPORTED_MODULE_7__warp_extrapolate__["a" /* default */])(path.pathData, threshold, deltaFunction)
		}

		return didWork
	}

	preInterpolate(transformer, threshold)
	{
		let didWork = false

		function deltaFunction(points)
		{
			const linearPoints = [
				points[0].slice(0, 2),
				points[points.length - 1].slice(0, 2),
			]

			const delta = Object(__WEBPACK_IMPORTED_MODULE_4__path_interpolate__["a" /* euclideanDistance */])(linearPoints)
			didWork = didWork || (delta > threshold)

			return delta
		}

		for (let path of this.paths)
		{
			const transformed = Object(__WEBPACK_IMPORTED_MODULE_5__warp_transform__["a" /* default */])(path.pathData, function(points)
			{
				const newPoints = transformer(points.slice(0, 2))
				newPoints.push(...points)

				return newPoints
			})

			const interpolated = Object(__WEBPACK_IMPORTED_MODULE_6__warp_interpolate__["a" /* default */])(transformed, threshold, deltaFunction)

			path.pathData = Object(__WEBPACK_IMPORTED_MODULE_5__warp_transform__["a" /* default */])(interpolated, points => points.slice(2))
		}

		return didWork
	}

	preExtrapolate(transformer, threshold)
	{
		let didWork = false

		function deltaFunction(points)
		{
			const linearPoints = [
				points[0].slice(0, 2),
				points[points.length - 1].slice(0, 2),
			]
			
			const delta = Object(__WEBPACK_IMPORTED_MODULE_4__path_interpolate__["a" /* euclideanDistance */])(linearPoints)
			didWork = didWork || (delta <= threshold)

			return delta
		}

		for (let path of this.paths)
		{
			const transformed = Object(__WEBPACK_IMPORTED_MODULE_5__warp_transform__["a" /* default */])(path.pathData, function(points)
			{
				const newPoints = transformer(points.slice(0, 2))
				newPoints.push(...points)

				return newPoints
			})

			const extrapolated = Object(__WEBPACK_IMPORTED_MODULE_7__warp_extrapolate__["a" /* default */])(transformed, threshold, deltaFunction)

			path.pathData = Object(__WEBPACK_IMPORTED_MODULE_5__warp_transform__["a" /* default */])(extrapolated, points => points.slice(2))
		}

		return didWork
	}
}
/* harmony export (immutable) */ __webpack_exports__["default"] = Warp;



/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = shapesToPaths;
/* harmony export (immutable) */ __webpack_exports__["a"] = preparePaths;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__path_parser__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__path_encoder__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__path_transform__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__path_transformers_absolute__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__path_transformers_short_to_long__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__path_transformers_hvz_to_line__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__path_transformers_line_to_curve__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__path_transformers_arc_to_curve__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__path_shape__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__utils__ = __webpack_require__(4);











function shapesToPaths(element)
{
	const shapeMap = {

		line(shapeElement)
		{
			return __WEBPACK_IMPORTED_MODULE_8__path_shape__["c" /* line */](
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'x1'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'y1'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'x2'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'y2')
			)
		},

		polyline(shapeElement)
		{
			return __WEBPACK_IMPORTED_MODULE_8__path_shape__["e" /* polyline */](...shapeElement.points)
		},

		polygon(shapeElement)
		{
			return __WEBPACK_IMPORTED_MODULE_8__path_shape__["d" /* polygon */](...shapeElement.points)
		},

		rect(shapeElement)
		{
			return __WEBPACK_IMPORTED_MODULE_8__path_shape__["f" /* rectangle */](
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'x'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'y'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'width'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'height'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'rx'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'ry')
			)
		},

		ellipse(shapeElement)
		{
			return __WEBPACK_IMPORTED_MODULE_8__path_shape__["b" /* ellipse */](
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'cx'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'cy'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'rx'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'ry')
			)
		},

		circle(shapeElement)
		{
			return __WEBPACK_IMPORTED_MODULE_8__path_shape__["a" /* circle */](
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'cx'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'cy'),
				Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(shapeElement, 'r')
			)
		},
	}

	const shapeElements = element.querySelectorAll(Object.keys(shapeMap).join(','))

	for (let shapeElement of shapeElements)
	{
		const shapeName = shapeElement.tagName.toLowerCase()

		if (shapeName in shapeMap)
		{
			const path = shapeMap[shapeName](shapeElement)
			const pathString = Object(__WEBPACK_IMPORTED_MODULE_1__path_encoder__["a" /* default */])(path)
			const attributes = { d: pathString }

			for(let attribute of shapeElement.attributes)
			{
				const name = attribute.nodeName
				const value = attribute.nodeValue

				// Avoid dimensional properties
				if(!/^(x|y|x1|y1|x2|y2|width|height|r|rx|ry|cx|cy|points|d)$/.test(name))
				{
					attributes[name] = value
				}
			}

			const pathElement = Object(__WEBPACK_IMPORTED_MODULE_9__utils__["a" /* createElement */])('path', attributes)
			shapeElement.parentNode.replaceChild(pathElement, shapeElement)
		}
	}
}

function preparePaths(element, curveType='q')
{
	const pathElements = element.querySelectorAll('path')

	for (let pathElement of pathElements)
	{
		let pathString = Object(__WEBPACK_IMPORTED_MODULE_9__utils__["b" /* getProperty */])(pathElement, 'd')
		let path = Object(__WEBPACK_IMPORTED_MODULE_0__path_parser__["a" /* default */])(pathString)

		path = Object(__WEBPACK_IMPORTED_MODULE_2__path_transform__["a" /* default */])(path, Object(__WEBPACK_IMPORTED_MODULE_3__path_transformers_absolute__["a" /* default */])())
		path = Object(__WEBPACK_IMPORTED_MODULE_2__path_transform__["a" /* default */])(path, Object(__WEBPACK_IMPORTED_MODULE_4__path_transformers_short_to_long__["a" /* default */])())
		path = Object(__WEBPACK_IMPORTED_MODULE_2__path_transform__["a" /* default */])(path, Object(__WEBPACK_IMPORTED_MODULE_5__path_transformers_hvz_to_line__["a" /* default */])())
		path = Object(__WEBPACK_IMPORTED_MODULE_2__path_transform__["a" /* default */])(path, Object(__WEBPACK_IMPORTED_MODULE_6__path_transformers_line_to_curve__["a" /* default */])(curveType))
		path = Object(__WEBPACK_IMPORTED_MODULE_2__path_transform__["a" /* default */])(path, Object(__WEBPACK_IMPORTED_MODULE_7__path_transformers_arc_to_curve__["a" /* default */])())
		
		pathString = Object(__WEBPACK_IMPORTED_MODULE_1__path_encoder__["a" /* default */])(path)

		Object(__WEBPACK_IMPORTED_MODULE_9__utils__["c" /* setProperty */])(pathElement, 'd', pathString)
	}
}


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = absoluteGenerator;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);


function absoluteGenerator()
{
	const xProps = ['x', 'x1', 'x2']
	const yProps = ['y', 'y1', 'y2']
	const drawingCmdExpr = /[lhvcsqta]/

	let prevX = 0
	let prevY = 0
	let pathStartX = NaN
	let pathStartY = NaN

	return function absolute(segment)
	{
		if(isNaN(pathStartX) && Object(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* isDrawingSegment */])(segment))
		{
			pathStartX = prevX
			pathStartY = prevY
		}

		if(segment.type === 'z' && !isNaN(pathStartX))
		{
			prevX = pathStartX
			prevY = pathStartY
			pathStartX = NaN
			pathStartY = NaN
		}

		if(segment.relative)
		{
			for(let x of xProps)
			{
				if(x in segment)
				{
					segment[x] += prevX
				}
			}

			for(let y of yProps)
			{
				if(y in segment)
				{
					segment[y] += prevY
				}
			}

			segment.relative = false
		}
		
		prevX = ('x' in segment ? segment.x : prevX)
		prevY = ('y' in segment ? segment.y : prevY)

		if(segment.type === 'm')
		{
			pathStartX = prevX
			pathStartY = prevY
		}

		return segment
	}
}


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = shortToLongGenerator;
function shortToLongGenerator()
{
	let prevX = 0
	let prevY = 0
	let pathStartX = NaN
	let pathStartY = NaN
	let prevCurveC2X = NaN
	let prevCurveC2Y = NaN
	let prevQuadCX = NaN
	let prevQuadCY = NaN

	return function shortToLong(segment)
	{
		if(isNaN(pathStartX) && segment.type !== 'm')
		{
			throw new Error(`Transform path error: path must start with "moveto"`)
		}
		
		if(segment.type === 's')
		{
			prevCurveC2X = isNaN(prevCurveC2X) ? prevX : prevCurveC2X
			prevCurveC2Y = isNaN(prevCurveC2Y) ? prevY : prevCurveC2Y

			segment.type = 'c'
			segment.x1 = (segment.relative ? 1 : 2) * prevX - prevCurveC2X
			segment.y1 = (segment.relative ? 1 : 2) * prevY - prevCurveC2Y
		}

		if(segment.type === 'c')
		{
			prevCurveC2X = (segment.relative ? prevX : 0) + segment.x2
			prevCurveC2Y = (segment.relative ? prevY : 0) + segment.y2
		}
		else
		{
			prevCurveC2X = NaN
			prevCurveC2Y = NaN
		}

		if(segment.type === 't')
		{
			prevQuadCX = isNaN(prevQuadCX) ? prevX : prevQuadCX
			prevQuadCY = isNaN(prevQuadCY) ? prevY : prevQuadCY

			segment.type = 'q'
			segment.x1 = (segment.relative ? 1 : 2) * prevX - prevQuadCX
			segment.y1 = (segment.relative ? 1 : 2) * prevY - prevQuadCY
		}

		if(segment.type === 'q')
		{
			prevQuadCX = (segment.relative ? prevX : 0) + segment.x1
			prevQuadCY = (segment.relative ? prevY : 0) + segment.y1
		}
		else
		{
			prevQuadCX = NaN
			prevQuadCY = NaN
		}

		if(segment.type === 'z')
		{
			prevX = pathStartX
			prevY = pathStartY
		}

		prevX = ('x' in segment ? (segment.relative ? prevX : 0) + segment.x : prevX)
		prevY = ('y' in segment ? (segment.relative ? prevY : 0) + segment.y : prevY)

		if(segment.type === 'm')
		{
			pathStartX = prevX
			pathStartY = prevY
		}

		return segment
	}
}


/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = hvzToLineGenerator;
function hvzToLineGenerator()
{
	let prevX = 0
	let prevY = 0
	let pathStartX = NaN
	let pathStartY = NaN

	return function hvzToLine(segment)
	{
		if(isNaN(pathStartX) && segment.type !== 'm')
		{
			throw new Error(`Transform path error: path must start with "moveto"`)
		}
		
		switch(segment.type)
		{
			case 'h':
			{
				segment.type = 'l'
				segment.y = (segment.relative ? 0 : prevY)
			}
			break
			case 'v':
			{
				segment.type = 'l'
				segment.x = (segment.relative ? 0 : prevX)
			}
			break
			case 'z':
			{
				segment.type = 'l'
				segment.x = pathStartX - (segment.relative ? prevX : 0)
				segment.y = pathStartY - (segment.relative ? prevY : 0)
			}
			break
			case 'a':
			{
				if(segment.rx === 0 || segment.ry === 0)
				{
					segment.type = 'l'

					delete segment.rx
					delete segment.ry
					delete segment.xRotation
					delete segment.largeArc
					delete segment.sweep
				}
			}
			break
		}

		prevX = (segment.relative ? prevX : 0) + segment.x
		prevY = (segment.relative ? prevY : 0) + segment.y

		if(segment.type === 'm')
		{
			pathStartX = prevX
			pathStartY = prevY
		}

		return segment
	}
}


/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = lineToCurveGenerator;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);


function lineToCurveGenerator(curveType='q')
{
	let prevX = 0
	let prevY = 0
	let pathStartX = NaN
	let pathStartY = NaN

	return function lineToCurve(segment)
	{
		if(isNaN(pathStartX) && Object(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* isDrawingSegment */])(segment.type))
		{
			pathStartX = prevX
			pathStartY = prevY
		}

		if(segment.type === 'z' && !isNaN(pathStartX))
		{
			prevX = pathStartX
			prevY = pathStartY
			pathStartX = NaN
			pathStartY = NaN
		}

		if(segment.type === 'l')
		{
			const startX = (segment.relative ? 0 : prevX)
			const startY = (segment.relative ? 0 : prevY)

			segment.type = curveType

			switch(curveType)
			{
				case 'q':
				{
					segment.x1 = (startX + segment.x) / 2
					segment.y1 = (startY + segment.y) / 2
				}
				break
				case 'c':
				{
					const offsetX = (segment.x - startX) / 3
					const offsetY = (segment.y - startY) / 3

					segment.x1 = startX + offsetX
					segment.y1 = startY + offsetY
					segment.x2 = startX + 2 * offsetX
					segment.y2 = startY + 2 * offsetY
				}
				break
				default:
				{
					throw new Error(`Invalid curve type "${curveType}"`)
				}
			}
		}

		prevX = ('x' in segment ? (segment.relative ? prevX : 0) + segment.x : prevX)
		prevY = ('y' in segment ? (segment.relative ? prevY : 0) + segment.y : prevY)

		if(segment.type === 'm')
		{
			pathStartX = prevX
			pathStartY = prevY
		}

		return segment
	}
}


/***/ }),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = arcToCurveGenerator;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);


function arcToCurveGenerator()
{
	let prevX = 0
	let prevY = 0
	let pathStartX = NaN
	let pathStartY = NaN

	return function arcToCurve(segment)
	{
		let segments = segment

		if(isNaN(pathStartX) && Object(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* isDrawingSegment */])(segment.type))
		{
			pathStartX = prevX
			pathStartY = prevY
		}

		if(segment.type === 'z' && !isNaN(pathStartX))
		{
			prevX = pathStartX
			prevY = pathStartY
			pathStartX = NaN
			pathStartY = NaN
		}

		if(segment.type === 'a')
		{
			const startX = (segment.relative ? 0 : prevX)
			const startY = (segment.relative ? 0 : prevY)
			const { rx, ry, xRotation, largeArc, sweep, x, y } = segment
			const curveSegments = converter(startX, startY, rx, ry, xRotation, largeArc, sweep, x, y)
			
			let prevCurveX = 0
			let prevCurveY = 0

			for(let curveSegment of curveSegments)
			{
				curveSegment.relative = segment.relative

				if(segment.relative && curveSegment.type === 'c')
				{
					curveSegment.x -= prevCurveX
					curveSegment.x1 -= prevCurveX
					curveSegment.x2 -= prevCurveX
					curveSegment.y -= prevCurveY
					curveSegment.y1 -= prevCurveY
					curveSegment.y2 -= prevCurveY
				}

				prevCurveX = curveSegment.x
				prevCurveY = curveSegment.y
			}

			segments = curveSegments
		}

		prevX = ('x' in segment ? (segment.relative ? prevX : 0) + segment.x : prevX)
		prevY = ('y' in segment ? (segment.relative ? prevY : 0) + segment.y : prevY)

		if(segment.type === 'm')
		{
			pathStartX = prevX
			pathStartY = prevY
		}

		return segments
	}
}

function converter(sx, sy, rx, ry, angle, large, sweep, x, y)
{
	if(sx === x && sy === y)
	{
		return []
	}

	if(!rx && !ry)
	{
		return [ { type: 'l', x, y } ]
	}

	const sinPhi = Math.sin(angle * Math.PI / 180)
	const cosPhi = Math.cos(angle * Math.PI / 180)

	const xd =  cosPhi * (sx - x) / 2 + sinPhi * (sy - y) / 2
	const yd = -sinPhi * (sx - x) / 2 + cosPhi * (sy - y) / 2

	const rx2 = rx * rx
	const ry2 = ry * ry

	const xd2 = xd * xd
	const yd2 = yd * yd

	let root = 0
	const numerator = rx2 * ry2 - rx2 * yd2 - ry2 * xd2

	if(numerator < 0)
	{
		const s = Math.sqrt(1 - numerator / (rx2 * ry2))

		rx *= s
		ry *= s
	}
	else
	{
		root = ((large && sweep) || (!large && !sweep) ? -1 : 1) * Math.sqrt(numerator / (rx2 * yd2 + ry2 * xd2))
	}

	const cxd =  root * rx * yd / ry
	const cyd = -root * ry * xd / rx

	const cx = cosPhi * cxd - sinPhi * cyd + (sx + x) / 2
	const cy = sinPhi * cxd + cosPhi * cyd + (sy + y) / 2

	let theta1 = angleBetween(1, 0, (xd - cxd) / rx, (yd - cyd) / ry)
	let dtheta = angleBetween((xd - cxd) / rx, (yd - cyd) / ry, (-xd - cxd) / rx, (-yd - cyd) / ry)

	if(!sweep && dtheta > 0)
	{
		dtheta -= Math.PI * 2
	}
	else if(sweep && dtheta < 0)
	{
		dtheta += Math.PI * 2
	}

	const segments = []
	const numSegs = Math.ceil(Math.abs(dtheta / (Math.PI / 2)))
	const delta = dtheta / numSegs
	const t = 8 / 3 * Math.sin(delta / 4) * Math.sin(delta / 4) / Math.sin(delta / 2)

	for(let i = 0; i < numSegs; i++)
	{
		const cosTheta1 = Math.cos(theta1)
		const sinTheta1 = Math.sin(theta1)
		const theta2 = theta1 + delta
		const cosTheta2 = Math.cos(theta2)
		const sinTheta2 = Math.sin(theta2)

		const epx = cosPhi * rx * cosTheta2 - sinPhi * ry * sinTheta2 + cx
		const epy = sinPhi * rx * cosTheta2 + cosPhi * ry * sinTheta2 + cy

		const dx = t * (-cosPhi * rx * sinTheta1 - sinPhi * ry * cosTheta1)
		const dy = t * (-sinPhi * rx * sinTheta1 + cosPhi * ry * cosTheta1)

		const dxe = t * (cosPhi * rx * sinTheta2 + sinPhi * ry * cosTheta2)
		const dye = t * (sinPhi * rx * sinTheta2 - cosPhi * ry * cosTheta2)

		segments.push({
			type: 'c',
			x: epx,
			y: epy,
			x1: sx + dx,
			y1: sy + dy,
			x2: epx + dxe,
			y2: epy + dye,
		})

		theta1 = theta2
		sx = epx
		sy = epy
	}

	return segments
}

function angleBetween(ux, uy, vx, vy)
{
	const ta = Math.atan2(uy, ux)
	const tb = Math.atan2(vy, vx)

	if(tb >= ta)
	{
		return tb - ta
	}

	return Math.PI * 2 - (ta - tb)
}


/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["c"] = line;
/* harmony export (immutable) */ __webpack_exports__["e"] = polyline;
/* harmony export (immutable) */ __webpack_exports__["d"] = polygon;
/* harmony export (immutable) */ __webpack_exports__["f"] = rectangle;
/* harmony export (immutable) */ __webpack_exports__["b"] = ellipse;
/* harmony export (immutable) */ __webpack_exports__["a"] = circle;
function line(x1, y1, x2, y2)
{
	const relative = false

	return [
		{ type: 'm', relative, x: x1, y: y1 },
		{ type: 'l', relative, x: x2, y: y2 },
	]
}

function polyline(...points)
{
	return points.map((p, i) => ({
		type: i === 0 ? 'm' : 'l',
		relative: false,
		x: p.x || p[0],
		y: p.y || p[1],
	}))
}

function polygon(...points)
{
	const path = polyline(...points)
	path.append({ type: 'z', relative: false })

	return path
}

function rectangle(x, y, width, height, rx=0, ry=0)
{
	const relative = false
	let path

	if(rx > 0 || ry > 0)
	{
		// If one of the properties is not defined or zero, then it's just given the value of the other
		rx = rx || ry
		ry = ry || rx

		const xRotation = 0
		const largeArc = false
		const sweep = true

		path = [
			{ type: 'm', relative, x: x + rx, y },
			{ type: 'h', relative, x: x + width - rx },
			{ type: 'a', relative, rx, ry, xRotation, largeArc, sweep, x: x + width, y: y + ry },
			{ type: 'v', relative, y: y + height - ry },
			{ type: 'a', relative, rx, ry, xRotation, largeArc, sweep, x: x + width - rx, y: y + height },
			{ type: 'h', relative, x: x + rx },
			{ type: 'a', relative, rx, ry, xRotation, largeArc, sweep, x, y: y + height - ry },
			{ type: 'v', relative, y: y + ry },
			{ type: 'a', relative, rx, ry, xRotation, largeArc, sweep, x: x + rx, y },
		]
	}
	else
	{
		path = [
			{ type: 'm', relative, x, y },
			{ type: 'h', relative, x: x + width },
			{ type: 'v', relative, y: y + height },
			{ type: 'h', relative, x },
			{ type: 'v', relative, y },
		]
	}

	return path
}

function ellipse(cx, cy, rx, ry)
{
	const relative = false
	const xRotation = 0
	const largeArc = false
	const sweep = true

	return [
		{ type: 'm', relative, x: cx, y: cy - ry },
		{ type: 'a', relative, rx, ry, xRotation, largeArc, sweep, x: cx, y: cy + ry },
		{ type: 'a', relative, rx, ry, xRotation, largeArc, sweep, x: cx, y: cy - ry },
	]
}

function circle(cx, cy, r)
{
	return ellipse(cx, cy, r, r)
}


/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = transform;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__path_transform__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__path_utils__ = __webpack_require__(0);



function transform(path, transformers)
{
	return Object(__WEBPACK_IMPORTED_MODULE_0__path_transform__["a" /* default */])(path, (segment) =>
	{
		for (let i = 0; i < __WEBPACK_IMPORTED_MODULE_1__path_utils__["e" /* pointGroups */].length; i++)
		{
			const [ x, y ] = __WEBPACK_IMPORTED_MODULE_1__path_utils__["e" /* pointGroups */][i]

			if (x in segment && y in segment)
			{
				const extendedPoints = (segment.extended ? segment.extended[i] : null) || []
				const oldPoints = [ segment[x], segment[y], ...extendedPoints ]
				const newPoints = transformers.reduce((points, transformer) => transformer(points), oldPoints)

				if (newPoints.length < 2)
				{
					throw new Error(`Transformer must return at least 2 points`)
				}

				segment[x] = newPoints[0]
				segment[y] = newPoints[1]

				if (newPoints.length > 2)
				{
					segment.extended = segment.extended || {}
					segment.extended[i] = newPoints.slice(2)
				}
			}
		}

		return segment
	})
}


/***/ }),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = interpolate;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__path_transform__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__path_interpolate__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__path_utils__ = __webpack_require__(0);




const interpolationTypesExpr = /[lqc]/

function interpolate(path, threshold, deltaFunction)
{
	let prevPoints = []

	return Object(__WEBPACK_IMPORTED_MODULE_0__path_transform__["a" /* default */])(path, function(segment)
	{
		let segments = segment

		if(interpolationTypesExpr.test(segment.type))
		{
			const points = [prevPoints]

			for(let j = 0; j < __WEBPACK_IMPORTED_MODULE_2__path_utils__["e" /* pointGroups */].length; j++)
			{
				const [x, y] = __WEBPACK_IMPORTED_MODULE_2__path_utils__["e" /* pointGroups */][j]

				if(x in segment && y in segment)
				{
					const extendedPoints = (segment.extended ? segment.extended[j] : null) || []
					const pointList = [segment[x], segment[y], ...extendedPoints]

					points.push(pointList)
				}
			}

			const rawSegments = Object(__WEBPACK_IMPORTED_MODULE_1__path_interpolate__["b" /* until */])(points, threshold, deltaFunction)

			if(rawSegments.length > 1)
			{
				segments = rawSegments.map(rawSegment => Object(__WEBPACK_IMPORTED_MODULE_2__path_utils__["a" /* createLineSegment */])(rawSegment))
			}
		}

		if('x' in segment && 'y' in segment)
		{
			const extendedPoints = (segment.extended ? segment.extended[2] : null) || []
			const pointList = [segment.x, segment.y, ...extendedPoints]

			prevPoints = pointList
		}

		return segments
	})
}


/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = extrapolate;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__path_transform__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__path_utils__ = __webpack_require__(0);



const extrapolationTypesExpr = /[lqc]/

function extrapolate(path, threshold, deltaFunction)
{
	return Object(__WEBPACK_IMPORTED_MODULE_0__path_transform__["a" /* default */])(path, function(segment, i, oldPath, newPath)
	{
		if(i > 1)
		{
			const prevSegment = newPath[newPath.length - 1]
			const prevSegment2 = newPath[newPath.length - 2]

			if(extrapolationTypesExpr.test(segment.type) && prevSegment.type === segment.type)
			{
				const points = [
					[prevSegment2.x, prevSegment2.y],
					[segment.x, segment.y],
				]

				if(deltaFunction(points) <= threshold)
				{
					const newSegment = Object(__WEBPACK_IMPORTED_MODULE_1__path_utils__["d" /* joinSegments */])(prevSegment, segment)

					if(newSegment)
					{
						newPath[newPath.length - 1] = newSegment

						return false
					}
				}
			}
		}

		return segment
	})
}


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.loadTypekit = loadTypekit;
function loadTypekit(id) {
	var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3000;

	var docEl = document.documentElement;
	var scriptEl = document.createElement('script');

	docEl.classList.add('wf-loading');

	var inactivateTimeout = setTimeout(function () {
		docEl.classList.remove('wf-loading');
		docEl.classList.add('wf-inactive');
	}, timeout);

	var loadedFlag = false;
	scriptEl.src = 'https://use.typekit.net/' + id + '.js';
	scriptEl.async = true;
	scriptEl.onload = scriptEl.onreadystatechange = function () {
		var loadedState = this.readyState || 'complete';

		if (!loadedFlag && (loadedState === 'complete' || loadedState === 'loaded')) {
			loadedFlag = true;
			clearTimeout(inactivateTimeout);
			try {
				Typekit.load({
					kitId: id,
					scriptTimeout: timeout,
					async: true
				});
			} catch (e) {}
		}
	};

	document.head.append(scriptEl);
}

/***/ })
/******/ ]);
//# sourceMappingURL=main.js.map