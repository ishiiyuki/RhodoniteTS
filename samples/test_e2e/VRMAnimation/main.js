
let p = null;

const load = async function (time) {
  await Rn.ModuleManager.getInstance().loadModule('webgl');
  await Rn.ModuleManager.getInstance().loadModule('pbr');
  const system = Rn.System.getInstance();
  system.setProcessApproachAndCanvas(Rn.ProcessApproach.FastestWebGL1, document.getElementById('world'));

  const entityRepository = Rn.EntityRepository.getInstance();
  const gltfImporter = Rn.GltfImporter.getInstance();
  const gltf2Importer = Rn.Gltf2Importer.getInstance();


  // params

  const displayResolution = 800;
  const vrmModelRotation = new Rn.Vector3(0, Math.PI, 0.0);


  // expresions
  const expressions = [];

  // vrm
  const animGltf2ModelPromise = gltf2Importer.import('../../../assets/vrm/test.glb');
  const vrmModelPromise = gltfImporter.importJsonOfVRM('../../../assets/vrm/test.vrm');
  const vrmExpressionPromise = gltfImporter.import('../../../assets/vrm/test.vrm', {
    gltfOptions: {
      defaultMaterialHelperArgumentArray: [{
        isSkinning: true,
        isMorphing: true,
      }],
      autoResizeTexture: true
    }
  });

  const [animGltf2Model, vrmModel, vrmExpression] = await Promise.all([animGltf2ModelPromise, vrmModelPromise, vrmExpressionPromise]);
  expressions.push(vrmExpression);

  const vrmMainRenderPass = vrmExpression.renderPasses[0];
  const vrmRootEntity = vrmMainRenderPass.sceneTopLevelGraphComponents[0].entity;
  vrmRootEntity.getTransform().rotate = vrmModelRotation;

  // animation
  const animationAssigner = Rn.AnimationAssigner.getInstance();
  animationAssigner.assignAnimation(vrmRootEntity, animGltf2Model, vrmModel);

  // camera
  const vrmMainCameraComponent = vrmMainRenderPass.cameraComponent;
  const vrmMainCameraEntity = vrmMainCameraComponent.entity;
  const vrmMainCameraControllerComponent = vrmMainCameraEntity.getComponent(Rn.CameraControllerComponent);
  const controller = vrmMainCameraControllerComponent.controller;
  controller.dolly = 0.65;


  // post effects
  const expressionPostEffect = new Rn.Expression();
  expressions.push(expressionPostEffect);

  // gamma correction (and super sampling)
  const gammaTargetFramebuffer = Rn.RenderableHelper.createTexturesForRenderTarget(displayResolution * 2, displayResolution * 2, 1, {});
  for (let renderPass of vrmExpression.renderPasses) {
    renderPass.setFramebuffer(gammaTargetFramebuffer);
    renderPass.toClearColorBuffer = false;
    renderPass.toClearDepthBuffer = false;
  }
  vrmExpression.renderPasses[0].toClearColorBuffer = true;
  vrmExpression.renderPasses[0].toClearDepthBuffer = true;

  const gammaRenderPass = createPostEffectRenderPass('createGammaCorrectionMaterial');
  setTextureParameterForMeshComponents(gammaRenderPass.meshComponents, Rn.ShaderSemantics.BaseColorTexture, gammaTargetFramebuffer.colorAttachments[0]);

  // fxaa
  const fxaaTargetFramebuffer = Rn.RenderableHelper.createTexturesForRenderTarget(displayResolution, displayResolution, 1, {});
  gammaRenderPass.setFramebuffer(fxaaTargetFramebuffer);

  const fxaaRenderPass = createRenderPassSharingEntitiesAndCamera(gammaRenderPass);
  const fxaaMaterial = Rn.MaterialHelper.createFXAA3QualityMaterial();
  fxaaMaterial.setParameter(Rn.ShaderSemantics.ScreenInfo, new Rn.Vector2(displayResolution, displayResolution));
  fxaaMaterial.setTextureParameter(Rn.ShaderSemantics.BaseColorTexture, fxaaTargetFramebuffer.colorAttachments[0]);
  fxaaRenderPass.setMaterial(fxaaMaterial);

  expressionPostEffect.addRenderPasses([gammaRenderPass, fxaaRenderPass]);


  //set default camera
  Rn.CameraComponent.main = 0;


  // Lights
  const lightEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.LightComponent])
  const lightComponent = lightEntity.getComponent(Rn.LightComponent);
  lightComponent.type = Rn.LightType.Directional;
  lightComponent.intensity = new Rn.Vector3(1.0, 1.0, 1.0);
  lightEntity.getTransform().rotate = new Rn.Vector3(0.0, 0.0, Math.PI / 8);


  let count = 0;
  let startTime = Date.now();
  const draw = function (time) {
    if (p == null && count > 0) {
      p = document.createElement('p');
      p.setAttribute('id', 'rendered');
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
    }

    system.process(expressions);

    count++;

    requestAnimationFrame(draw);
  };

  draw();

}

document.body.onload = load;

function exportGltf2() {
  const exporter = Rn.Gltf2Exporter.getInstance();
  exporter.export('Rhodonite');
}

function createPostEffectRenderPass(materialHelperFunctionStr, arrayOfHelperFunctionArgument = []) {
  const boardPrimitive = new Rn.Plane();
  boardPrimitive.generate({
    width: 1, height: 1, uSpan: 1, vSpan: 1, isUVRepeat: false,
    material: Rn.MaterialHelper[materialHelperFunctionStr].apply(this, arrayOfHelperFunctionArgument)
  });

  const boardEntity = generateEntity();
  boardEntity.getTransform().rotate = new Rn.Vector3(-Math.PI / 2, 0.0, 0.0);
  boardEntity.getTransform().translate = new Rn.Vector3(0.0, 0.0, -0.5);

  const boardMesh = new Rn.Mesh();
  boardMesh.addPrimitive(boardPrimitive);
  const boardMeshComponent = boardEntity.getComponent(Rn.MeshComponent);
  boardMeshComponent.setMesh(boardMesh);

  if (createPostEffectRenderPass.cameraComponent == null) {
    const entityRepository = Rn.EntityRepository.getInstance();
    const cameraEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.CameraComponent]);
    const cameraComponent = cameraEntity.getComponent(Rn.CameraComponent);
    cameraComponent.zFarInner = 1.0;
    createPostEffectRenderPass.cameraComponent = cameraComponent;
  }

  const renderPass = new Rn.RenderPass();
  renderPass.toClearColorBuffer = true;
  renderPass.clearColor = new Rn.Vector4(0.0, 0.0, 0.0, 1.0);
  renderPass.cameraComponent = createPostEffectRenderPass.cameraComponent;
  renderPass.addEntities([boardEntity]);

  return renderPass;
}

function createRenderPassSharingEntitiesAndCamera(originalRenderPass) {
  const renderPass = new Rn.RenderPass();
  renderPass.addEntities(originalRenderPass.entities);
  renderPass.cameraComponent = originalRenderPass.cameraComponent;

  return renderPass;
}

function generateEntity() {
  const repo = Rn.EntityRepository.getInstance();
  const entity = repo.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.MeshComponent, Rn.MeshRendererComponent]);
  return entity;
}

function setTextureParameterForMeshComponents(meshComponents, shaderSemantic, value) {
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

