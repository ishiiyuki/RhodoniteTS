
import { RnType } from '../../../dist/rhodonite'
import CameraComponent from '../../../dist/foundation/components/CameraComponent';
import CameraControllerComponent from '../../../dist/foundation/components/CameraControllerComponent';
import Entity from '../../../dist/foundation/core/Entity';
import LightComponent from '../../../dist/foundation/components/LightComponent';
import Vector4 from '../../../dist/foundation/math/Vector4';
import { RnWebGL } from '../../../dist/webgl/main';
import OrbitCameraController from '../../../dist/foundation/cameras/OrbitCameraController';
import EntityRepository from '../../../dist/foundation/core/EntityRepository';
import AbstractTexture from '../../../dist/foundation/textures/AbstractTexture';
import RenderPass from '../../../dist/foundation/renderer/RenderPass';
import MeshComponent from '../../../dist/foundation/components/MeshComponent';
import Expression from '../../../dist/foundation/renderer/Expression';
import FrameBuffer from '../../../dist/foundation/renderer/FrameBuffer';

let p = null;

declare const window: any;
declare const Rn: RnType;
declare const RnWebGL: RnWebGL

const expressionWithFXAA = new Rn.Expression();
const expressionWithOutFXAA = new Rn.Expression();
let expression: Expression|undefined;
let framebuffer: FrameBuffer|undefined;
let renderPassMain: RenderPass|undefined;
const load = async function () {
  await Rn.ModuleManager.getInstance().loadModule('webgl');
  await Rn.ModuleManager.getInstance().loadModule('pbr');
  const importer = Rn.Gltf1Importer.getInstance();
  const system = Rn.System.getInstance();
  const canvas = document.getElementById('world') as HTMLCanvasElement;
  const gl = system.setProcessApproachAndCanvas(Rn.ProcessApproach.UniformWebGL1, canvas, 1, { antialias: false });

  const entityRepository = Rn.EntityRepository.getInstance();


  renderPassMain = await setupRenderPassMain(entityRepository);
  framebuffer = Rn.RenderableHelper.createTexturesForRenderTarget(canvas!.clientWidth, canvas!.clientHeight, 1, {})
  renderPassMain.setFramebuffer(framebuffer);

  const renderPassFxaa = await setupRenderPassFxaa(entityRepository, framebuffer.colorAttachments[0] as any, canvas!.clientWidth, canvas!.clientHeight);

  // expression
  expressionWithFXAA.addRenderPasses([renderPassMain, renderPassFxaa]);
  expressionWithOutFXAA.addRenderPasses([renderPassMain]);
  expression = expressionWithFXAA;


  Rn.CameraComponent.main = 0;
  let startTime = Date.now();
  const rotationVec3 = Rn.MutableVector3.one();
  let count = 0;
  const draw = function () {

    if (p == null && count > 0) {

      p = document.createElement('p');
      p.setAttribute("id", "rendered");
      p.innerText = 'Rendered.';
      document.body.appendChild(p);

    }

    if (window.isAnimating) {
      const date = new Date();
      const rotation = 0.001 * (date.getTime() - startTime);
      //rotationVec3.v[0] = 0.1;
      //rotationVec3.v[1] = rotation;
      //rotationVec3.v[2] = 0.1;
      const time = (date.getTime() - startTime) / 1000;
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
  }

  draw();
}

load();

async function setupRenderPassMain(entityRepository: EntityRepository) {
  const modelMaterial = Rn.MaterialHelper.createClassicUberMaterial();
  const planeEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.MeshComponent, Rn.MeshRendererComponent]);
  const planePrimitive = new Rn.Plane();
  planePrimitive.generate({ width: 2, height: 2, uSpan: 1, vSpan: 1, isUVRepeat: false, material: modelMaterial });
  const planeMeshComponent = planeEntity.getMesh();
  const planeMesh = new Rn.Mesh();
  planeMesh.addPrimitive(planePrimitive);
  planeMeshComponent.setMesh(planeMesh);
  planeEntity.getTransform().rotate = new Rn.Vector3(Math.PI / 2, 0, Math.PI / 3);
  const sphereEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.MeshComponent, Rn.MeshRendererComponent]);
  const spherePrimitive = new Rn.Sphere();
  const sphereMaterial = Rn.MaterialHelper.createEnvConstantMaterial();
  spherePrimitive.generate({ radius: 100, widthSegments: 40, heightSegments: 40, material: sphereMaterial });
  const environmentCubeTexture = new Rn.CubeTexture();
  {
    const response = await fetch('../../../assets/images/cubemap_test.basis');
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    environmentCubeTexture.loadTextureImagesFromBasis(uint8Array);
  }
  sphereMaterial.setTextureParameter(Rn.ShaderSemantics.ColorEnvTexture, environmentCubeTexture);
  const sphereMeshComponent = sphereEntity.getMesh();
  const sphereMesh = new Rn.Mesh();
  sphereMesh.addPrimitive(spherePrimitive);
  sphereMeshComponent.setMesh(sphereMesh);
  // Camera
  const cameraEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.CameraComponent, Rn.CameraControllerComponent]);
  const cameraComponent = cameraEntity.getCamera();
  //cameraComponent.type = Rn.CameraTyp]e.Orthographic;
  cameraComponent.zNear = 0.1;
  cameraComponent.zFar = 1000;
  cameraComponent.setFovyAndChangeFocalLength(90);
  cameraComponent.aspect = 1;
  cameraEntity.getTransform().translate = new Rn.Vector3(0.0, 0, 0.5);
  // CameraComponent
  const cameraControllerComponent = cameraEntity.getCameraController();
  const controller = cameraControllerComponent.controller as OrbitCameraController;
  controller.setTarget(planeEntity);
  controller.zFarAdjustingFactorBasedOnAABB = 1000;
  // renderPass
  const renderPass = new Rn.RenderPass();
  renderPass.toClearColorBuffer = true;
  renderPass.addEntities([planeEntity, sphereEntity]);
  return renderPass;
}

function setupRenderPassFxaa(entityRepository: EntityRepository, renderable: AbstractTexture, width: number, height: number) {
  const renderPassFxaa = new Rn.RenderPass();
  const entityFxaa = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.MeshComponent, Rn.MeshRendererComponent])
  const primitiveFxaa = new Rn.Plane()
  primitiveFxaa.generate({ width: 2, height: 2, uSpan: 1, vSpan: 1, isUVRepeat: false })
  primitiveFxaa.material = Rn.MaterialHelper.createFXAA3QualityMaterial()
  primitiveFxaa.material.setTextureParameter(Rn.ShaderSemantics.BaseColorTexture, renderable)
  primitiveFxaa.material.setParameter(Rn.ShaderSemantics.ScreenInfo, new Rn.Vector2(width, height))
  const meshComponentFxaa = entityFxaa.getComponent(Rn.MeshComponent) as MeshComponent
  const meshFxaa = new Rn.Mesh()
  meshFxaa.addPrimitive(primitiveFxaa)
  meshComponentFxaa.setMesh(meshFxaa)
  entityFxaa.getTransform().rotate = new Rn.Vector3(-Math.PI / 2, 0, 0)
  renderPassFxaa.addEntities([entityFxaa])
  const cameraEntityFxaa = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.CameraComponent])
  const cameraComponentFxaa = cameraEntityFxaa.getComponent(Rn.CameraComponent) as CameraComponent
  cameraEntityFxaa.getTransform().translate = new Rn.Vector3(0.0, 0.0, 1.0)
  cameraComponentFxaa.type = Rn.CameraType.Orthographic
  renderPassFxaa.cameraComponent = cameraComponentFxaa

  return renderPassFxaa
}

window.toggleFXAA = function() {
  const toggleButton = document.getElementById('toggleFXAAButton');
  if (expression === expressionWithFXAA) {
    expression = expressionWithOutFXAA;
    renderPassMain.setFramebuffer(undefined);
    toggleButton.firstChild.textContent = 'Now FXAA Off';
  } else {
    expression = expressionWithFXAA;
    renderPassMain.setFramebuffer(framebuffer);
    toggleButton.firstChild.textContent = 'Now FXAA On';
  }
}