import CameraComponent from '../../../dist/esm/foundation/components/CameraComponent';
import _Rn, {Material} from '../../../dist/esm/index';
import {OrbitCameraController} from '../../../dist/esm/index';

let p: any;

declare const window: any;
declare const Rn: typeof _Rn;

(async () => {
  await Promise.all([
    Rn.ModuleManager.getInstance().loadModule('webgl'),
    Rn.ModuleManager.getInstance().loadModule('pbr'),
  ]);

  // Note: The length of one side of texture must be less than Math.pow(2, 12)
  // This is the limit of iOS13.3 (iPhone 6S)
  Rn.Config.dataTextureWidth = Math.pow(2, 8);
  Rn.Config.dataTextureHeight = Math.pow(2, 9);

  // Note: We cannot take too large memory on the iOS
  Rn.MemoryManager.createInstanceIfNotCreated(1.3, 0.6, 0.0);

  const system = Rn.System.getInstance();
  system.setProcessApproachAndCanvas(
    Rn.ProcessApproach.FastestWebGL1,
    document.getElementById('world') as HTMLCanvasElement
  );

  const entityRepository = Rn.EntityRepository.getInstance();
  const gltfImporter = Rn.GltfImporter.getInstance();

  // params

  const displayResolution = 800;
  const vrmModelRotation = new Rn.Vector3(0, (3 / 4) * Math.PI, 0.0);

  // camera
  const cameraEntity = entityRepository.createEntity([
    Rn.TransformComponent,
    Rn.SceneGraphComponent,
    Rn.CameraComponent,
    Rn.CameraControllerComponent,
  ]);
  const cameraComponent = cameraEntity.getCamera();
  cameraComponent.zNear = 0.1;
  cameraComponent.zFar = 1000.0;
  cameraComponent.setFovyAndChangeFocalLength(30.0);
  cameraComponent.aspect = 1.0;

  // expresions
  const expressions = [];

  // vrm
  const vrmExpression = await gltfImporter.import(
    '../../../assets/vrm/test.vrm',
    {
      defaultMaterialHelperArgumentArray: [
        {
          isSkinning: false,
          isMorphing: false,
          makeOutputSrgb: false,
        },
      ],
      autoResizeTexture: true,
      cameraComponent: cameraComponent,
    }
  );
  expressions.push(vrmExpression);

  const vrmMainRenderPass = vrmExpression.renderPasses[0];
  const vrmRootEntity =
    vrmMainRenderPass.sceneTopLevelGraphComponents[0].entity;
  vrmRootEntity.getTransform().rotate = vrmModelRotation;

  // post effects
  const expressionPostEffect = new Rn.Expression();
  expressions.push(expressionPostEffect);

  // gamma correction
  const gammaTargetFramebuffer = Rn.RenderableHelper.createTexturesForRenderTarget(
    displayResolution,
    displayResolution,
    1,
    {}
  );
  for (const renderPass of vrmExpression.renderPasses) {
    renderPass.setFramebuffer(gammaTargetFramebuffer);
    renderPass.toClearColorBuffer = false;
    renderPass.toClearDepthBuffer = false;
  }
  vrmExpression.renderPasses[0].toClearColorBuffer = true;
  vrmExpression.renderPasses[0].toClearDepthBuffer = true;

  const postEffectCameraEntity = createPostEffectCameraEntity();
  const postEffectCameraComponent = postEffectCameraEntity.getCamera();

  const gammaCorrectionMaterial = Rn.MaterialHelper.createGammaCorrectionMaterial();
  const gammaCorrectionRenderPass = createPostEffectRenderPass(
    gammaCorrectionMaterial,
    postEffectCameraComponent
  );

  setTextureParameterForMeshComponents(
    gammaCorrectionRenderPass.meshComponents,
    Rn.ShaderSemantics.BaseColorTexture,
    gammaTargetFramebuffer.getColorAttachedRenderTargetTexture(0)
  );

  // fxaa
  const fxaaTargetFramebuffer = Rn.RenderableHelper.createTexturesForRenderTarget(
    displayResolution,
    displayResolution,
    1,
    {}
  );
  gammaCorrectionRenderPass.setFramebuffer(fxaaTargetFramebuffer);

  const fxaaRenderPass = createRenderPassSharingEntitiesAndCamera(
    gammaCorrectionRenderPass
  );
  const fxaaMaterial = Rn.MaterialHelper.createFXAA3QualityMaterial();
  fxaaMaterial.setParameter(
    Rn.ShaderSemantics.ScreenInfo,
    new Rn.Vector2(displayResolution, displayResolution)
  );
  fxaaMaterial.setTextureParameter(
    Rn.ShaderSemantics.BaseColorTexture,
    fxaaTargetFramebuffer.getColorAttachedRenderTargetTexture(0)
  );
  fxaaRenderPass.setMaterial(fxaaMaterial);

  expressionPostEffect.addRenderPasses([
    gammaCorrectionRenderPass,
    fxaaRenderPass,
  ]);

  //set default camera
  Rn.CameraComponent.main = 0;

  // cameraController
  const vrmMainCameraComponent = vrmMainRenderPass.cameraComponent;
  const vrmMainCameraEntity = vrmMainCameraComponent.entity;
  const vrmMainCameraControllerComponent = vrmMainCameraEntity.getCameraController();
  const controller = vrmMainCameraControllerComponent.controller as OrbitCameraController;
  controller.dolly = 0.8;
  controller.setTarget(
    vrmMainRenderPass.sceneTopLevelGraphComponents[0].entity
  );

  // Lights
  const lightEntity = entityRepository.createEntity([
    Rn.TransformComponent,
    Rn.SceneGraphComponent,
    Rn.LightComponent,
  ]);
  const lightComponent = lightEntity.getLight();
  lightComponent.type = Rn.LightType.Directional;
  lightComponent.intensity = new Rn.Vector3(1.0, 1.0, 1.0);
  lightEntity.getTransform().rotate = new Rn.Vector3(0.0, 0.0, Math.PI / 8);

  let count = 0;
  let startTime = Date.now();
  const draw = function () {
    if (p == null && count > 0) {
      p = document.createElement('p');
      p.setAttribute('id', 'rendered');
      p.innerText = 'Rendered.';
      document.body.appendChild(p);
    }

    if (window.isAnimating) {
      // const date = new Date();
      const date = new Date();
      const rotation = 0.001 * (date.getTime() - startTime);
      //rotationVec3._v[0] = 0.1;
      //rotationVec3._v[1] = rotation;
      //rotationVec3._v[2] = 0.1;
      const time = (date.getTime() - startTime) / 1000;
      Rn.AnimationComponent.globalTime = time;
      if (time > Rn.AnimationComponent.endInputValue) {
        startTime = date.getTime();
      }
    }

    system.process(expressions);

    count++;

    requestAnimationFrame(draw);
  };

  draw();
})();

function exportGltf2() {
  const exporter = Rn.Gltf2Exporter.getInstance();
  exporter.export('Rhodonite');
}

function createPostEffectRenderPass(
  material: Material,
  cameraComponent: CameraComponent
) {
  const boardPrimitive = new Rn.Plane();
  boardPrimitive.generate({
    width: 1,
    height: 1,
    uSpan: 1,
    vSpan: 1,
    isUVRepeat: false,
    material,
  });

  const boardMesh = new Rn.Mesh();
  boardMesh.addPrimitive(boardPrimitive);

  const boardEntity = generateEntity();
  boardEntity.getTransform().rotate = new Rn.Vector3(Math.PI / 2, 0.0, 0.0);
  boardEntity.getTransform().translate = new Rn.Vector3(0.0, 0.0, -0.5);
  const boardMeshComponent = boardEntity.getMesh();
  boardMeshComponent.setMesh(boardMesh);

  const renderPass = new Rn.RenderPass();
  renderPass.toClearColorBuffer = false;
  renderPass.cameraComponent = cameraComponent;
  renderPass.addEntities([boardEntity]);

  return renderPass;
}

function createPostEffectCameraEntity() {
  const cameraEntity = generateEntity([
    Rn.TransformComponent,
    Rn.SceneGraphComponent,
    Rn.CameraComponent,
  ]);
  const cameraComponent = cameraEntity.getCamera();
  cameraComponent.zNearInner = 0.5;
  cameraComponent.zFarInner = 2.0;
  return cameraEntity;
}

function generateEntity(
  componentArray = [
    Rn.TransformComponent,
    Rn.SceneGraphComponent,
    Rn.MeshComponent,
    Rn.MeshRendererComponent,
  ] as Array<typeof Rn.Component>
) {
  const repo = Rn.EntityRepository.getInstance();
  const entity = repo.createEntity(componentArray);
  return entity;
}

function createRenderPassSharingEntitiesAndCamera(originalRenderPass) {
  const renderPass = new Rn.RenderPass();
  renderPass.addEntities(originalRenderPass.entities);
  renderPass.cameraComponent = originalRenderPass.cameraComponent;

  return renderPass;
}

function setTextureParameterForMeshComponents(
  meshComponents,
  shaderSemantic,
  value
) {
  for (let i = 0; i < meshComponents.length; i++) {
    const mesh = meshComponents[i].mesh;
    if (!mesh) continue;

    const primitiveNumber = mesh.getPrimitiveNumber();
    for (let j = 0; j < primitiveNumber; j++) {
      const primitive = mesh.getPrimitiveAt(j);
      primitive.material.setTextureParameter(shaderSemantic, value);
    }
  }
}
