var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var p = null;
    var expressionWithFXAA = new Rn.Expression();
    var expressionWithOutFXAA = new Rn.Expression();
    var expression;
    var framebuffer;
    var renderPassMain;
    var load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var importer, system, canvas, gl, entityRepository, renderPassFxaa, startTime, rotationVec3, count, draw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Rn.ModuleManager.getInstance().loadModule('webgl')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Rn.ModuleManager.getInstance().loadModule('pbr')];
                    case 2:
                        _a.sent();
                        importer = Rn.Gltf1Importer.getInstance();
                        system = Rn.System.getInstance();
                        canvas = document.getElementById('world');
                        gl = system.setProcessApproachAndCanvas(Rn.ProcessApproach.UniformWebGL1, canvas, 1, { antialias: false });
                        entityRepository = Rn.EntityRepository.getInstance();
                        return [4 /*yield*/, setupRenderPassMain(entityRepository)];
                    case 3:
                        renderPassMain = _a.sent();
                        framebuffer = Rn.RenderableHelper.createTexturesForRenderTarget(canvas.clientWidth, canvas.clientHeight, 1, {});
                        renderPassMain.setFramebuffer(framebuffer);
                        return [4 /*yield*/, setupRenderPassFxaa(entityRepository, framebuffer.colorAttachments[0], canvas.clientWidth, canvas.clientHeight)];
                    case 4:
                        renderPassFxaa = _a.sent();
                        // expression
                        expressionWithFXAA.addRenderPasses([renderPassMain, renderPassFxaa]);
                        expressionWithOutFXAA.addRenderPasses([renderPassMain]);
                        expression = expressionWithFXAA;
                        Rn.CameraComponent.main = 0;
                        startTime = Date.now();
                        rotationVec3 = Rn.MutableVector3.one();
                        count = 0;
                        draw = function () {
                            if (p == null && count > 0) {
                                p = document.createElement('p');
                                p.setAttribute("id", "rendered");
                                p.innerText = 'Rendered.';
                                document.body.appendChild(p);
                            }
                            if (window.isAnimating) {
                                var date = new Date();
                                var rotation = 0.001 * (date.getTime() - startTime);
                                //rotationVec3.v[0] = 0.1;
                                //rotationVec3.v[1] = rotation;
                                //rotationVec3.v[2] = 0.1;
                                var time = (date.getTime() - startTime) / 1000;
                                Rn.AnimationComponent.globalTime = time;
                                if (time > Rn.AnimationComponent.endInputValue) {
                                    startTime = date.getTime();
                                }
                                //console.log(time);
                                //      rootGroup.getTransform().scale = rotationVec3;
                                //rootGroup.getTransform().translate = rootGroup.getTransform().translate;
                            }
                            system.process([expression]);
                            count++;
                            requestAnimationFrame(draw);
                        };
                        draw();
                        return [2 /*return*/];
                }
            });
        });
    };
    load();
    function setupRenderPassMain(entityRepository) {
        return __awaiter(this, void 0, void 0, function () {
            var modelMaterial, planeEntity, planePrimitive, planeMeshComponent, planeMesh, sphereEntity, spherePrimitive, sphereMaterial, environmentCubeTexture, response, buffer, uint8Array, sphereMeshComponent, sphereMesh, cameraEntity, cameraComponent, cameraControllerComponent, controller, renderPass;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelMaterial = Rn.MaterialHelper.createClassicUberMaterial();
                        planeEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.MeshComponent, Rn.MeshRendererComponent]);
                        planePrimitive = new Rn.Plane();
                        planePrimitive.generate({ width: 2, height: 2, uSpan: 1, vSpan: 1, isUVRepeat: false, material: modelMaterial });
                        planeMeshComponent = planeEntity.getMesh();
                        planeMesh = new Rn.Mesh();
                        planeMesh.addPrimitive(planePrimitive);
                        planeMeshComponent.setMesh(planeMesh);
                        planeEntity.getTransform().rotate = new Rn.Vector3(Math.PI / 2, 0, Math.PI / 3);
                        sphereEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.MeshComponent, Rn.MeshRendererComponent]);
                        spherePrimitive = new Rn.Sphere();
                        sphereMaterial = Rn.MaterialHelper.createEnvConstantMaterial();
                        spherePrimitive.generate({ radius: 100, widthSegments: 40, heightSegments: 40, material: sphereMaterial });
                        environmentCubeTexture = new Rn.CubeTexture();
                        return [4 /*yield*/, fetch('../../../assets/images/cubemap_test.basis')];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.arrayBuffer()];
                    case 2:
                        buffer = _a.sent();
                        uint8Array = new Uint8Array(buffer);
                        environmentCubeTexture.loadTextureImagesFromBasis(uint8Array);
                        sphereMaterial.setTextureParameter(Rn.ShaderSemantics.ColorEnvTexture, environmentCubeTexture);
                        sphereMeshComponent = sphereEntity.getMesh();
                        sphereMesh = new Rn.Mesh();
                        sphereMesh.addPrimitive(spherePrimitive);
                        sphereMeshComponent.setMesh(sphereMesh);
                        cameraEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.CameraComponent, Rn.CameraControllerComponent]);
                        cameraComponent = cameraEntity.getCamera();
                        //cameraComponent.type = Rn.CameraTyp]e.Orthographic;
                        cameraComponent.zNear = 0.1;
                        cameraComponent.zFar = 1000;
                        cameraComponent.setFovyAndChangeFocalLength(90);
                        cameraComponent.aspect = 1;
                        cameraEntity.getTransform().translate = new Rn.Vector3(0.0, 0, 0.5);
                        cameraControllerComponent = cameraEntity.getCameraController();
                        controller = cameraControllerComponent.controller;
                        controller.setTarget(planeEntity);
                        controller.zFarAdjustingFactorBasedOnAABB = 1000;
                        renderPass = new Rn.RenderPass();
                        renderPass.toClearColorBuffer = true;
                        renderPass.addEntities([planeEntity, sphereEntity]);
                        return [2 /*return*/, renderPass];
                }
            });
        });
    }
    function setupRenderPassFxaa(entityRepository, renderable, width, height) {
        var renderPassFxaa = new Rn.RenderPass();
        var entityFxaa = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.MeshComponent, Rn.MeshRendererComponent]);
        var primitiveFxaa = new Rn.Plane();
        primitiveFxaa.generate({ width: 2, height: 2, uSpan: 1, vSpan: 1, isUVRepeat: false });
        primitiveFxaa.material = Rn.MaterialHelper.createFXAA3QualityMaterial();
        primitiveFxaa.material.setTextureParameter(Rn.ShaderSemantics.BaseColorTexture, renderable);
        primitiveFxaa.material.setParameter(Rn.ShaderSemantics.ScreenInfo, new Rn.Vector2(width, height));
        var meshComponentFxaa = entityFxaa.getComponent(Rn.MeshComponent);
        var meshFxaa = new Rn.Mesh();
        meshFxaa.addPrimitive(primitiveFxaa);
        meshComponentFxaa.setMesh(meshFxaa);
        entityFxaa.getTransform().rotate = new Rn.Vector3(-Math.PI / 2, 0, 0);
        renderPassFxaa.addEntities([entityFxaa]);
        var cameraEntityFxaa = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.CameraComponent]);
        var cameraComponentFxaa = cameraEntityFxaa.getComponent(Rn.CameraComponent);
        cameraEntityFxaa.getTransform().translate = new Rn.Vector3(0.0, 0.0, 1.0);
        cameraComponentFxaa.type = Rn.CameraType.Orthographic;
        renderPassFxaa.cameraComponent = cameraComponentFxaa;
        return renderPassFxaa;
    }
    window.toggleFXAA = function () {
        var toggleButton = document.getElementById('toggleFXAAButton');
        if (expression === expressionWithFXAA) {
            expression = expressionWithOutFXAA;
            renderPassMain.setFramebuffer(undefined);
            toggleButton.firstChild.textContent = 'Now FXAA Off';
        }
        else {
            expression = expressionWithFXAA;
            renderPassMain.setFramebuffer(framebuffer);
            toggleButton.firstChild.textContent = 'Now FXAA On';
        }
    };
});