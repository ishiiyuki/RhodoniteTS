import _Rn, {
  CameraComponent,
  Entity,
  Expression,
  MutableVector3,
  RenderPass,
  Vector3,
} from '../../../dist/esm/index';

declare const Rn: typeof _Rn;

(async () => {
  // ---parameters---------------------------------------------------------------------------------------------

  const lightPosition = new Rn.MutableVector3(0.0, 3.0, 5.0);
  const zFarDepthCamera = 10.0;

  const resolutionDepthCamera = 512;

  const diffuseColorFactorSmallBoard = new Rn.Vector4(0.5, 0.1, 0.4, 1);
  const diffuseColorFactorLargeBoard = new Rn.Vector4(0.1, 0.7, 0.5, 1);

  const shadowColorFactorLargeBoard = new Rn.Vector4(0.05, 0.35, 0.25, 1);

  // ---main algorithm-----------------------------------------------------------------------------------------

  // load modules
  await Promise.all([
    Rn.ModuleManager.getInstance().loadModule('webgl'),
    Rn.ModuleManager.getInstance().loadModule('pbr'),
  ]);

  // prepare memory
  const system = Rn.System.getInstance();
  const rnCanvasElement = document.getElementById('world') as HTMLCanvasElement;
  system.setProcessApproachAndCanvas(
    Rn.ProcessApproach.UniformWebGL1,
    rnCanvasElement
  );

  // prepare entities
  const entitySmallBoard = createEntityBoardWithEmptyMaterial();
  setTransformParameterToEntity(
    entitySmallBoard,
    new Rn.Vector3(0.2, 0.2, 0.2),
    new Rn.Vector3(0.0, 0.0, -1.0),
    new Rn.Vector3(Math.PI / 2, 0, 0)
  );

  const entityLargeBoard = createEntityBoardWithEmptyMaterial();
  setTransformParameterToEntity(
    entityLargeBoard,
    new Rn.Vector3(1.0, 1.0, 1.0),
    new Rn.Vector3(0.0, 0.0, -1.5),
    new Rn.Vector3(Math.PI / 2, 0, 0)
  );

  const entitiesRenderTarget = [entitySmallBoard, entityLargeBoard];

  // prepare cameras
  const directionLight = Rn.MutableVector3.multiply(
    lightPosition,
    -1
  ).normalize();
  const cameraComponentDepth = createEntityDepthCamera(
    directionLight
  ).getCamera();
  const cameraComponentMain = createEntityMainCamera().getCamera();
  const cameraControllerComponent = cameraComponentMain.entity.getCameraController();
  const controller = cameraControllerComponent.controller;
  controller.setTarget(entityLargeBoard);
  controller.unregisterEventListeners();
  controller.registerEventListeners(document.getElementById('world'));

  // prepare render passes
  const renderPassDepth = createRenderPassDepth(
    cameraComponentDepth,
    entitiesRenderTarget
  );
  const framebufferDepth = Rn.RenderableHelper.createTexturesForRenderTarget(
    resolutionDepthCamera,
    resolutionDepthCamera,
    1,
    {}
  );
  renderPassDepth.setFramebuffer(framebufferDepth);

  const renderPassMain = createRenderPassMain(
    cameraComponentMain,
    renderPassDepth,
    entitySmallBoard,
    entityLargeBoard
  );

  // prepare expressions
  const expression = new Rn.Expression();
  expression.addRenderPasses([renderPassDepth, renderPassMain]);

  // draw
  draw([expression], cameraComponentDepth.entity, directionLight);

  // ---functions-----------------------------------------------------------------------------------------

  function createEntityDepthCamera(directionLight: MutableVector3) {
    const entityCamera = generateEntity([
      Rn.TransformComponent,
      Rn.SceneGraphComponent,
      Rn.CameraComponent,
    ]);

    const transformCamera = entityCamera.getTransform();
    transformCamera.translate = lightPosition;

    const cameraComponent = entityCamera.getCamera();
    cameraComponent.zNear = zFarDepthCamera / 100;
    cameraComponent.zFar = zFarDepthCamera;
    cameraComponent.type = Rn.CameraType.Orthographic;
    cameraComponent.direction = directionLight;

    return entityCamera;
  }

  function createEntityMainCamera() {
    const entityCamera = generateEntity([
      Rn.TransformComponent,
      Rn.SceneGraphComponent,
      Rn.CameraComponent,
      Rn.CameraControllerComponent,
    ]);
    return entityCamera;
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

  function createRenderPassDepth(
    cameraComponentDepth: CameraComponent,
    entitiesRenderTarget: Entity[]
  ) {
    const renderPass = new Rn.RenderPass();
    renderPass.toClearColorBuffer = true;
    renderPass.cameraComponent = cameraComponentDepth;
    renderPass.addEntities(entitiesRenderTarget);

    const material = Rn.MaterialHelper.createDepthEncodeMaterial();
    renderPass.setMaterial(material);
    return renderPass;
  }

  function createRenderPassMain(
    cameraComponent: CameraComponent,
    renderPassDepth: RenderPass,
    entitySmallBoard: Entity,
    entityLargeBoard: Entity
  ) {
    const renderPass = new Rn.RenderPass();
    renderPass.toClearColorBuffer = true;
    renderPass.cameraComponent = cameraComponent;
    renderPass.addEntities([entitySmallBoard, entityLargeBoard]);

    const materialSmallBoard = Rn.MaterialHelper.createShadowMapDecodeClassicSingleMaterial(
      {},
      renderPassDepth
    );
    materialSmallBoard.setParameter(
      Rn.ShaderSemantics.DiffuseColorFactor,
      diffuseColorFactorSmallBoard
    );

    const meshComponentSmallBoard = entitySmallBoard.getMesh();
    const meshSmallBoard = meshComponentSmallBoard.mesh;
    const primitiveSmallBoard = meshSmallBoard.primitives[0];
    renderPass.setMaterialForPrimitive(materialSmallBoard, primitiveSmallBoard);

    const materialLargeBoard = Rn.MaterialHelper.createShadowMapDecodeClassicSingleMaterial(
      {},
      renderPassDepth
    );
    materialLargeBoard.setParameter(
      Rn.ShaderSemantics.DiffuseColorFactor,
      diffuseColorFactorLargeBoard
    );
    materialLargeBoard.setParameter(
      Rn.ShadowMapDecodeClassicSingleMaterialNode.ShadowColorFactor,
      shadowColorFactorLargeBoard
    );

    const meshComponentLargeBoard = entityLargeBoard.getMesh();
    const meshLargeBoard = meshComponentLargeBoard.mesh;
    const primitiveLargeBoard = meshLargeBoard.primitives[0];
    renderPass.setMaterialForPrimitive(materialLargeBoard, primitiveLargeBoard);

    return renderPass;
  }

  function createEntityBoardWithEmptyMaterial() {
    const primitive = new Rn.Plane();
    primitive.generate({
      width: 1,
      height: 1,
      uSpan: 1,
      vSpan: 1,
      isUVRepeat: false,
      material: Rn.MaterialHelper.createEmptyMaterial(),
    });

    const entity = generateEntity();
    const meshComponent = entity.getMesh();
    const mesh = new Rn.Mesh();
    mesh.addPrimitive(primitive);
    meshComponent.setMesh(mesh);

    return entity;
  }

  function setTransformParameterToEntity(
    entity: Entity,
    scale: Vector3,
    translate: Vector3,
    rotate: Vector3
  ) {
    const transform = entity.getTransform();
    transform.scale = scale;
    transform.translate = translate;
    transform.rotate = rotate;
  }

  function draw(
    expressions: Expression[],
    entityDepthCamera: Entity,
    directionLight: MutableVector3
  ) {
    const inputElem = document.getElementById('light_pos') as HTMLInputElement;
    const inputValue = parseFloat(inputElem.value) / 200;
    lightPosition.x = inputValue;
    entityDepthCamera.getTransform().translate = lightPosition;
    Rn.MutableVector3.multiplyTo(lightPosition, -1, directionLight).normalize();
    entityDepthCamera.getCamera().direction = directionLight;

    system.process(expressions);
    requestAnimationFrame(
      draw.bind(null, expressions, entityDepthCamera, directionLight)
    );
  }
})();
