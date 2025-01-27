import _Rn, {
  CameraComponent,
  Entity,
  Expression,
  Material,
  MeshRendererComponent,
  RenderPass,
  RenderTargetTexture,
} from '../../../dist/esm/index';

declare const Rn: typeof _Rn;

(async () => {
  // ---parameters---------------------------------------------------------------------------------------------

  const uriGltf =
    '../../../assets/gltf/2.0/AntiqueCamera/glTF/AntiqueCamera.gltf';
  const basePathIBL = '../../../assets/ibl/shanghai_bund';

  // ---main algorithm-----------------------------------------------------------------------------------------

  // load modules
  await loadRnModules(['webgl', 'pbr']);

  // prepare memory
  const system = Rn.System.getInstance();
  const rnCanvasElement = document.getElementById('world') as HTMLCanvasElement;
  system.setProcessApproachAndCanvas(
    Rn.ProcessApproach.FastestWebGL2,
    rnCanvasElement
  );

  // when "ProcessApproach.FastestWebGL2" is specified,
  // we need to specify the following setting in order to avoid the error
  //  "Too many temporary registers required to compile shader".
  Rn.Config.isUboEnabled = false;

  // prepare cameras
  const entityMainCamera = createEntityMainCamera();
  const entityPostEffectCamera = createEntityPostEffectCamera();

  // prepare renderPasses
  const renderPassMain = await createRenderPassMain(
    uriGltf,
    basePathIBL,
    entityMainCamera
  );
  createAndSetFrameBufferAndMSAAFramebuffer(
    renderPassMain,
    rnCanvasElement.width
  );

  const materialGamma = Rn.MaterialHelper.createGammaCorrectionMaterial();
  materialGamma.setTextureParameter(
    Rn.ShaderSemantics.BaseColorTexture,
    renderPassMain.getResolveFramebuffer()
      .colorAttachments[0] as RenderTargetTexture
  );
  const renderPassGamma = createRenderPassPostEffect(
    materialGamma,
    entityPostEffectCamera.getCamera()
  );

  const expression = new Rn.Expression();
  expression.addRenderPasses([renderPassMain, renderPassGamma]);

  // set ibl textures
  setIBLTexture(basePathIBL);

  // draw
  draw([expression], 0);

  // ---functions-----------------------------------------------------------------------------------------

  function loadRnModules(moduleNames: string[]) {
    const promises = [];
    const moduleManagerInstance = Rn.ModuleManager.getInstance();
    for (const moduleName of moduleNames) {
      promises.push(moduleManagerInstance.loadModule(moduleName));
    }
    return Promise.all(promises);
  }

  function createEntityMainCamera() {
    const entityCamera = generateEntity([
      Rn.TransformComponent,
      Rn.SceneGraphComponent,
      Rn.CameraComponent,
      Rn.CameraControllerComponent,
    ]);

    const cameraComponent = entityCamera.getCamera();
    cameraComponent.setFovyAndChangeFocalLength(30);

    return entityCamera;
  }

  function createEntityPostEffectCamera() {
    const entityCamera = generateEntity([
      Rn.TransformComponent,
      Rn.SceneGraphComponent,
      Rn.CameraComponent,
    ]);

    const cameraComponent = entityCamera.getCamera();
    cameraComponent.zNearInner = 0.5;
    cameraComponent.zFarInner = 2.0;

    return entityCamera;
  }

  async function createRenderPassMain(
    uriGltf: string,
    basePathIBL: string,
    entityCamera: Entity
  ) {
    const entityEnvironmentCube = createEntityEnvironmentCube(basePathIBL);
    const entityRootGroup = await createEntityGltf2(uriGltf);

    const renderPass = new Rn.RenderPass();
    renderPass.cameraComponent = entityCamera.getCamera();
    renderPass.addEntities([entityEnvironmentCube, entityRootGroup]);

    const cameraController = entityMainCamera.getCameraController();
    const controller = cameraController.controller;
    controller.setTarget(entityRootGroup);

    return renderPass;
  }

  function createEntityEnvironmentCube(basePathIBL: string) {
    const cubeTextureEnvironment = new Rn.CubeTexture();
    cubeTextureEnvironment.baseUriToLoad =
      basePathIBL + '/environment/environment';
    cubeTextureEnvironment.isNamePosNeg = true;
    cubeTextureEnvironment.hdriFormat = Rn.HdriFormat.HDR_LINEAR;
    cubeTextureEnvironment.mipmapLevelNumber = 1;
    cubeTextureEnvironment.loadTextureImagesAsync();

    const materialSphere = Rn.MaterialHelper.createEnvConstantMaterial({
      makeOutputSrgb: false,
    });
    materialSphere.setParameter(
      Rn.EnvConstantSingleMaterialNode.EnvHdriFormat,
      Rn.HdriFormat.HDR_LINEAR.index
    );
    materialSphere.setTextureParameter(
      Rn.ShaderSemantics.ColorEnvTexture,
      cubeTextureEnvironment
    );

    const primitiveSphere = new Rn.Sphere();
    primitiveSphere.generate({
      radius: 2500,
      widthSegments: 40,
      heightSegments: 40,
      material: materialSphere,
    });
    const meshSphere = new Rn.Mesh();
    meshSphere.addPrimitive(primitiveSphere);

    const entitySphere = generateEntity();
    const meshComponentSphere = entitySphere.getMesh();
    meshComponentSphere.setMesh(meshSphere);

    entitySphere.getTransform().scale = new Rn.Vector3(-1, 1, 1);
    entitySphere.getTransform().translate = new Rn.Vector3(0, 300, 0);

    return entitySphere;
  }

  async function createEntityGltf2(uriGltf: string) {
    const importer = Rn.Gltf2Importer.getInstance();
    const gltf2JSON = await importer.import(uriGltf, {
      defaultMaterialHelperArgumentArray: [{makeOutputSrgb: false}],
    });
    const modelConverter = Rn.ModelConverter.getInstance();
    const entityRootGroup = modelConverter.convertToRhodoniteObject(gltf2JSON);
    return entityRootGroup;
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

  function createRenderPassPostEffect(
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

  function createAndSetFrameBufferAndMSAAFramebuffer(
    renderPass: RenderPass,
    resolutionFramebuffer: number
  ) {
    const framebuffer = Rn.RenderableHelper.createTexturesForRenderTarget(
      resolutionFramebuffer,
      resolutionFramebuffer,
      0,
      {isMSAA: true}
    );
    renderPass.setFramebuffer(framebuffer);

    const framebufferMSAA = Rn.RenderableHelper.createTexturesForRenderTarget(
      resolutionFramebuffer,
      resolutionFramebuffer,
      1,
      {createDepthBuffer: false}
    );
    renderPass.setResolveFramebuffer(framebufferMSAA);
  }

  function setIBLTexture(basePathIBL: string) {
    const cubeTextureSpecular = new Rn.CubeTexture();
    cubeTextureSpecular.baseUriToLoad = basePathIBL + '/specular/specular';
    cubeTextureSpecular.isNamePosNeg = true;
    cubeTextureSpecular.hdriFormat = Rn.HdriFormat.RGBE_PNG;
    cubeTextureSpecular.mipmapLevelNumber = 10;

    const cubeTextureDiffuse = new Rn.CubeTexture();
    cubeTextureDiffuse.baseUriToLoad = basePathIBL + '/diffuse/diffuse';
    cubeTextureDiffuse.hdriFormat = Rn.HdriFormat.RGBE_PNG;
    cubeTextureDiffuse.mipmapLevelNumber = 1;
    cubeTextureDiffuse.isNamePosNeg = true;

    const meshRendererComponents = Rn.ComponentRepository.getInstance().getComponentsWithType(
      Rn.MeshRendererComponent
    ) as MeshRendererComponent[];

    for (const meshRendererComponent of meshRendererComponents) {
      meshRendererComponent.specularCubeMap = cubeTextureSpecular;
      meshRendererComponent.diffuseCubeMap = cubeTextureDiffuse;
    }
  }

  function draw(
    expressions: Expression[],
    loopCount: number,
    pElem?: HTMLElement
  ) {
    // for e2e-test
    if (pElem === undefined && loopCount > 100) {
      pElem = document.createElement('p');
      pElem.setAttribute('id', 'rendered');
      pElem.innerText = 'Rendered.';
      document.body.appendChild(pElem);
    }

    system.process(expressions);
    requestAnimationFrame(draw.bind(null, expressions, loopCount + 1, pElem));
  }
})();
