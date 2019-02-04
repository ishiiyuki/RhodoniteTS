(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["effekseer"],{

/***/ "./src/effekseer/EffekseerComponent.ts":
/*!*********************************************!*\
  !*** ./src/effekseer/EffekseerComponent.ts ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _foundation_core_Component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../foundation/core/Component */ \"./src/foundation/core/Component.ts\");\n/* harmony import */ var _foundation_components_SceneGraphComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../foundation/components/SceneGraphComponent */ \"./src/foundation/components/SceneGraphComponent.ts\");\n/* harmony import */ var _foundation_definitions_ProcessStage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../foundation/definitions/ProcessStage */ \"./src/foundation/definitions/ProcessStage.ts\");\n/* harmony import */ var _foundation_math_Matrix44__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../foundation/math/Matrix44 */ \"./src/foundation/math/Matrix44.ts\");\n/* harmony import */ var _foundation_components_TransformComponent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../foundation/components/TransformComponent */ \"./src/foundation/components/TransformComponent.ts\");\n/* harmony import */ var _foundation_components_CameraComponent__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../foundation/components/CameraComponent */ \"./src/foundation/components/CameraComponent.ts\");\n/* harmony import */ var _foundation_core_ComponentRepository__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../foundation/core/ComponentRepository */ \"./src/foundation/core/ComponentRepository.ts\");\n/* harmony import */ var _foundation_system_ModuleManager__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../foundation/system/ModuleManager */ \"./src/foundation/system/ModuleManager.ts\");\nvar __extends = (undefined && undefined.__extends) || (function () {\n    var extendStatics = function (d, b) {\n        extendStatics = Object.setPrototypeOf ||\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\n        return extendStatics(d, b);\n    };\n    return function (d, b) {\n        extendStatics(d, b);\n        function __() { this.constructor = d; }\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n    };\n})();\n\n\n\n\n\n\n\n\nvar EffekseerComponent = /** @class */ (function (_super) {\n    __extends(EffekseerComponent, _super);\n    function EffekseerComponent(entityUid, componentSid, entityRepository) {\n        var _this = _super.call(this, entityUid, componentSid, entityRepository) || this;\n        _this.__speed = 1;\n        _this.playJustAfterLoaded = false;\n        _this.isLoop = false;\n        return _this;\n    }\n    EffekseerComponent.prototype.$create = function () {\n        this.__sceneGraphComponent = this.__entityRepository.getComponentOfEntity(this.__entityUid, _foundation_components_SceneGraphComponent__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\n        this.__transformComponent = this.__entityRepository.getComponentOfEntity(this.__entityUid, _foundation_components_TransformComponent__WEBPACK_IMPORTED_MODULE_4__[\"default\"]);\n        this.moveStageTo(_foundation_definitions_ProcessStage__WEBPACK_IMPORTED_MODULE_2__[\"ProcessStage\"].Load);\n    };\n    EffekseerComponent.common_$load = function () {\n        if (EffekseerComponent.__isInitialized) {\n            return;\n        }\n        var moduleManager = _foundation_system_ModuleManager__WEBPACK_IMPORTED_MODULE_7__[\"default\"].getInstance();\n        var moduleName = 'webgl';\n        var webglModule = moduleManager.getModule(moduleName);\n        var glw = webglModule.WebGLResourceRepository.getInstance().currentWebGLContextWrapper;\n        if (glw) {\n            effekseer.init(glw.getRawContext());\n            EffekseerComponent.__isInitialized = true;\n        }\n    };\n    EffekseerComponent.prototype.$load = function () {\n        var _this = this;\n        if (this.__effect == null) {\n            this.__effect = effekseer.loadEffect(this.uri, function () {\n                if (_this.playJustAfterLoaded) {\n                    if (_this.isLoop) {\n                        _this.__timer = setInterval(function () { _this.play(); }, 500);\n                    }\n                    else {\n                        _this.play();\n                    }\n                }\n            });\n        }\n        this.moveStageTo(_foundation_definitions_ProcessStage__WEBPACK_IMPORTED_MODULE_2__[\"ProcessStage\"].PreRender);\n    };\n    EffekseerComponent.prototype.cancelLoop = function () {\n        clearInterval(this.__timer);\n    };\n    EffekseerComponent.prototype.play = function () {\n        var _this = this;\n        var __play = function () {\n            // Play the loaded effect\n            _this.__handle = effekseer.play(_this.__effect);\n        };\n        if (this.isLoop) {\n            this.__timer = setInterval(__play, 200);\n        }\n        else {\n            __play();\n        }\n    };\n    EffekseerComponent.common_$logic = function () {\n        effekseer.update();\n    };\n    EffekseerComponent.prototype.$prerender = function () {\n        if (this.__handle != null) {\n            var worldMatrix = new _foundation_math_Matrix44__WEBPACK_IMPORTED_MODULE_3__[\"default\"](this.__sceneGraphComponent.worldMatrixInner);\n            this.__handle.setMatrix(worldMatrix.v);\n            this.__handle.setSpeed(this.__speed);\n        }\n    };\n    EffekseerComponent.common_$render = function () {\n        var cameraComponent = _foundation_core_ComponentRepository__WEBPACK_IMPORTED_MODULE_6__[\"default\"].getInstance().getComponent(_foundation_components_CameraComponent__WEBPACK_IMPORTED_MODULE_5__[\"default\"], _foundation_components_CameraComponent__WEBPACK_IMPORTED_MODULE_5__[\"default\"].main);\n        var viewMatrix = EffekseerComponent.__tmp_indentityMatrix;\n        var projectionMatrix = EffekseerComponent.__tmp_indentityMatrix;\n        if (cameraComponent) {\n            viewMatrix = cameraComponent.viewMatrix;\n            projectionMatrix = cameraComponent.projectionMatrix;\n        }\n        effekseer.setProjectionMatrix(projectionMatrix.v);\n        effekseer.setCameraMatrix(viewMatrix.v);\n        effekseer.draw();\n    };\n    Object.defineProperty(EffekseerComponent.prototype, \"playSpeed\", {\n        get: function () {\n            return this.__speed;\n        },\n        set: function (val) {\n            if (this.__handle) {\n                this.__handle.setSpeed(val);\n            }\n            this.__speed = val;\n        },\n        enumerable: true,\n        configurable: true\n    });\n    Object.defineProperty(EffekseerComponent.prototype, \"translate\", {\n        get: function () {\n            return this.__transformComponent.translate;\n        },\n        set: function (vec) {\n            if (this.__handle) {\n                this.__handle.setLocation(vec.x, vec.y, vec.z);\n            }\n            this.__transformComponent.translate = vec;\n        },\n        enumerable: true,\n        configurable: true\n    });\n    Object.defineProperty(EffekseerComponent.prototype, \"rotate\", {\n        get: function () {\n            return this.__transformComponent.rotate;\n        },\n        set: function (vec) {\n            if (this.__handle) {\n                this.__handle.setRotation(vec.x, vec.y, vec.z);\n            }\n            this.__transformComponent.rotate = vec;\n        },\n        enumerable: true,\n        configurable: true\n    });\n    Object.defineProperty(EffekseerComponent.prototype, \"scale\", {\n        get: function () {\n            return this.__transformComponent.scale;\n        },\n        set: function (vec) {\n            if (this.__handle) {\n                this.__handle.setScale(vec.x, vec.y, vec.z);\n            }\n            this.__transformComponent.scale = vec;\n        },\n        enumerable: true,\n        configurable: true\n    });\n    EffekseerComponent.__isInitialized = false;\n    EffekseerComponent.__tmp_indentityMatrix = _foundation_math_Matrix44__WEBPACK_IMPORTED_MODULE_3__[\"default\"].identity();\n    return EffekseerComponent;\n}(_foundation_core_Component__WEBPACK_IMPORTED_MODULE_0__[\"default\"]));\n/* harmony default export */ __webpack_exports__[\"default\"] = (EffekseerComponent);\n_foundation_core_ComponentRepository__WEBPACK_IMPORTED_MODULE_6__[\"default\"].registerComponentClass(EffekseerComponent);\n\n\n//# sourceURL=webpack:///./src/effekseer/EffekseerComponent.ts?");

/***/ }),

/***/ "./src/effekseer/main.ts":
/*!*******************************!*\
  !*** ./src/effekseer/main.ts ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _EffekseerComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EffekseerComponent */ \"./src/effekseer/EffekseerComponent.ts\");\n/* harmony import */ var _foundation_core_EntityRepository__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../foundation/core/EntityRepository */ \"./src/foundation/core/EntityRepository.ts\");\n/* harmony import */ var _foundation_components_TransformComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../foundation/components/TransformComponent */ \"./src/foundation/components/TransformComponent.ts\");\n/* harmony import */ var _foundation_components_SceneGraphComponent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../foundation/components/SceneGraphComponent */ \"./src/foundation/components/SceneGraphComponent.ts\");\n\n\n\n\nvar createEffekseerEntity = function () {\n    var entityRepository = _foundation_core_EntityRepository__WEBPACK_IMPORTED_MODULE_1__[\"default\"].getInstance();\n    var entity = entityRepository.createEntity([_foundation_components_TransformComponent__WEBPACK_IMPORTED_MODULE_2__[\"default\"], _foundation_components_SceneGraphComponent__WEBPACK_IMPORTED_MODULE_3__[\"default\"], _EffekseerComponent__WEBPACK_IMPORTED_MODULE_0__[\"default\"]]);\n    return entity;\n};\nvar Effekseer = Object.freeze({\n    EffekseerComponent: _EffekseerComponent__WEBPACK_IMPORTED_MODULE_0__[\"default\"],\n    createEffekseerEntity: createEffekseerEntity\n});\n/* harmony default export */ __webpack_exports__[\"default\"] = (Effekseer);\n\n\n//# sourceURL=webpack:///./src/effekseer/main.ts?");

/***/ })

}]);