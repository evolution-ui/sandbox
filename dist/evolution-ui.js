/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__("./index.js");


/***/ }),

/***/ "./index.js":
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _documentReady = __webpack_require__("./libs/document-ready.js");

	var _documentReady2 = _interopRequireDefault(_documentReady);

	var _myComponent = __webpack_require__("../../components/my-component/index.js");

	var _myComponent2 = _interopRequireDefault(_myComponent);

	var _myOtherComponent = __webpack_require__("../../components/my-other-component/index.js");

	var _myOtherComponent2 = _interopRequireDefault(_myOtherComponent);

	var _curtain = __webpack_require__("../../components/curtain/index.js");

	var _curtain2 = _interopRequireDefault(_curtain);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	(0, _documentReady2.default)(_myComponent2.default, _myOtherComponent2.default, _curtain2.default);

/***/ }),

/***/ "./libs/document-ready.js":
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var documentReady = function documentReady() {
	  for (var _len = arguments.length, callbacks = Array(_len), _key = 0; _key < _len; _key++) {
	    callbacks[_key] = arguments[_key];
	  }

	  if (document.readyState === 'interactive' || document.readyState === 'complete') {
	    callbacks.forEach(function (cb) {
	      return cb();
	    });
	  } else {
	    callbacks.forEach(function (cb) {
	      return document.addEventListener('DOMContentLoaded', cb);
	    });
	  }
	};

	exports.default = documentReady;

/***/ }),

/***/ "../../components/my-component/index.js":
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var myComponent = function myComponent() {
	  console.log('MY-COMPONENT.JS HAS BEEN LOADED');
	};

	exports.default = myComponent;

/***/ }),

/***/ "../../components/my-other-component/index.js":
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var myOtherComponent = function myOtherComponent() {
	  console.log('MY-OTHER-COMPONENT.JS HAS LOADED.');
	};

	exports.default = myOtherComponent;

/***/ }),

/***/ "../../components/curtain/index.js":
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var showCurtain = function showCurtain(event) {
	  var curtain = event.currentTarget.nextElementSibling;
	  if (curtain) {
	    var timeout = Number(curtain.getAttribute('data-timeout'));

	    curtain.classList.add('evo_c-curtain--js-animate', 'evo_c-curtain--show');
	    setTimeout(function () {
	      curtain.classList.remove('evo_c-curtain--show');
	      setTimeout(function () {
	        curtain.classList.add('evo_c-curtain--js-animate');
	      }, 1000);
	    }, timeout);
	  }
	};

	var showGifCurtain = function showGifCurtain(event) {
	  var curtain = event.currentTarget.nextElementSibling;
	  if (curtain) {
	    var timeout = Number(curtain.getAttribute('data-timeout'));

	    curtain.classList.add('evo_c-curtain--show');

	    var xhr = new XMLHttpRequest();

	    xhr.onload = function () {
	      if (xhr.status === 200) {
	        console.log(xhr);
	        curtain.querySelector('.evo_c-curtain__error').style.display = 'none';
	        var img = curtain.querySelector('img') || document.createElement('IMG');
	        img.setAttribute('src', xhr.data.url);
	        img.style.display = 'inline-block';
	      }
	    };

	    xhr.onerror = function () {
	      console.log(xhr);
	      console.log(xhr.error);
	      curtain.querySelector('img').style.display = 'none';
	      curtain.querySelector('.evo_c-curtain__error').style.display = 'block';
	    };

	    xhr.open('GET', 'https://freemusicarchive.org/api/get/albums.json?api_key=TBHJ7JH66M2F468E');
	    xhr.send();

	    setTimeout(function () {
	      curtain.classList.remove('evo_c-curtain--show');
	    }, timeout);
	  }
	};

	exports.default = function () {
	  var brainstormButton = document.getElementById('evo_c-curtain-brainstorm-button');
	  brainstormButton && brainstormButton.addEventListener('click', showCurtain);
	  var gifButton = document.getElementById('evo_c-curtain-gif-button');
	  gifButton && gifButton.addEventListener('click', showGifCurtain);
	};

/***/ })

/******/ });