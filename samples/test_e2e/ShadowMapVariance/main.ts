import _Rn, {
  CameraComponent,
  ComponentTypeEnum,
  Entity,
  Expression,
  PixelFormatEnum,
  RenderPass,
  RenderTargetTexture,
  TextureParameterEnum,
} from '../../../dist/esm/index';

declare const Rn: typeof _Rn;

(async () => {
  // ---parameters---------------------------------------------------------------------------------------------

  const gaussianKernelSize = 15;
  const gaussianVariance = 8.0;

  const resolutionDepthCamera = 512;

  // ---main algorithm-----------------------------------------------------------------------------------------

  // load modules
  await loadRnModules(['webgl', 'pbr']);

  // prepare memory
  const system = Rn.System.getInstance();
  const rnCanvasElement = document.getElementById('world') as HTMLCanvasElement;
  system.setProcessApproachAndCanvas(
    Rn.ProcessApproach.FastestWebGL1,
    rnCanvasElement
  );

  // prepare entities
  const entitySphere = createEntitySphereWithEmptyMaterial();
  const entityBoard = createEntityBoardWithEmptyMaterial();
  const entitiesRenderTarget = [entitySphere, entityBoard];

  // prepare cameras
  const cameraComponentDepth = createEntityDepthCamera().getCamera();
  const cameraComponentPostEffect = createEntityPostEffectCamera().getCamera();
  const cameraComponentMain = createEntityMainCamera().getCamera();

  // prepare render passes
  const renderPassesDepth = createRenderPassesDepth(
    cameraComponentDepth,
    cameraComponentPostEffect,
    entitiesRenderTarget,
    false
  );
  const renderPassesSquareDepth = createRenderPassesDepth(
    cameraComponentDepth,
    cameraComponentPostEffect,
    entitiesRenderTarget,
    true
  );

  const renderPassDepthBlurHV = renderPassesDepth[2];
  const renderPassSquareDepthBlurHV = renderPassesSquareDepth[2];
  const renderPassMain = createRenderPassMain(
    cameraComponentMain,
    entitySphere,
    entityBoard,
    cameraComponentDepth,
    renderPassDepthBlurHV,
    renderPassSquareDepthBlurHV
  );

  // prepare expressions
  const expressionDepthBlur = createExpression(renderPassesDepth);
  const expressionSquareDepthBlur = createExpression(renderPassesSquareDepth);
  const expressionMain = createExpression([renderPassMain]);

  const expressions = [
    expressionDepthBlur,
    expressionSquareDepthBlur,
    expressionMain,
  ];

  // draw
  draw(expressions, true);

  // ---functions-----------------------------------------------------------------------------------------

  function loadRnModules(moduleNames: string[]) {
    const promises = [];
    const moduleManagerInstance = Rn.ModuleManager.getInstance();
    for (const moduleName of moduleNames) {
      promises.push(moduleManagerInstance.loadModule(moduleName));
    }
    return Promise.all(promises);
  }

  function createEntityDepthCamera() {
    const entityCamera = generateEntity([
      Rn.TransformComponent,
      Rn.SceneGraphComponent,
      Rn.CameraComponent,
    ]);

    const transformCamera = entityCamera.getTransform();
    transformCamera.translate = new Rn.Vector3(10.0, 15.0, 20.0);

    const cameraComponent = entityCamera.getCamera();
    cameraComponent.setFovyAndChangeFocalLength(120);
    cameraComponent.zFar = 50.0;

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

  function createEntityMainCamera() {
    const entityCamera = generateEntity([
      Rn.TransformComponent,
      Rn.SceneGraphComponent,
      Rn.CameraComponent,
    ]);

    const transformCamera = entityCamera.getTransform();
    transformCamera.translate = new Rn.Vector3(-0.1, -0.1, 10.0);

    return entityCamera;
  }

  function createRenderPassesDepth(
    cameraComponentDepth: CameraComponent,
    cameraComponentPostEffect: CameraComponent,
    entitiesRenderTarget: Entity[],
    isSquareDepth: boolean
  ) {
    const renderPassDepth = createRenderPassDepthEncode(
      cameraComponentDepth,
      entitiesRenderTarget,
      isSquareDepth
    );
    createAndSetFramebuffer(renderPassDepth, resolutionDepthCamera, 1);

    const renderPassDepthBlurH = createRenderPassGaussianBlurForDepth(
      cameraComponentPostEffect,
      renderPassDepth,
      true
    );
    createAndSetFramebuffer(renderPassDepthBlurH, resolutionDepthCamera, 1);

    const renderPassDepthBlurHV = createRenderPassGaussianBlurForDepth(
      cameraComponentPostEffect,
      renderPassDepthBlurH,
      false
    );
    createAndSetFramebuffer(renderPassDepthBlurHV, resolutionDepthCamera, 1);

    return [renderPassDepth, renderPassDepthBlurH, renderPassDepthBlurHV];
  }

  function createRenderPassDepthEncode(
    cameraComponent: CameraComponent,
    entitiesTarget: Entity[],
    isSquareDepth: boolean
  ) {
    const renderPass = new Rn.RenderPass();
    renderPass.toClearColorBuffer = true;
    renderPass.cameraComponent = cameraComponent;
    renderPass.addEntities(entitiesTarget);

    const material = Rn.MaterialHelper.createDepthEncodeMaterial({
      depthPow: isSquareDepth ? 2.0 : 1.0,
    });
    renderPass.setMaterial(material);
    return renderPass;
  }

  function createRenderPassMain(
    cameraComponent: CameraComponent,
    entitySphere: Entity,
    entityBoard: Entity,
    cameraComponentDepth: CameraComponent,
    renderPassDepthBlurHV: RenderPass,
    renderPassSquareDepthBlurHV: RenderPass
  ) {
    const renderPass = new Rn.RenderPass();
    renderPass.toClearColorBuffer = true;
    renderPass.cameraComponent = cameraComponent;
    renderPass.addEntities([entitySphere, entityBoard]);

    // set variance shadow material for sphere primitive in this render pass
    const materialSphere = Rn.MaterialHelper.createVarianceShadowMapDecodeClassicSingleMaterial(
      {depthCameraComponent: cameraComponentDepth},
      [renderPassDepthBlurHV, renderPassSquareDepthBlurHV]
    );
    materialSphere.setParameter(
      Rn.ShaderSemantics.DiffuseColorFactor,
      new Rn.Vector4(0.5, 0.1, 0.4, 1)
    );
    materialSphere.setParameter(
      Rn.VarianceShadowMapDecodeClassicSingleMaterialNode.ShadowColor,
      new Rn.Vector4(0.25, 0.05, 0.2, 1)
    );
    materialSphere.setParameter(
      Rn.VarianceShadowMapDecodeClassicSingleMaterialNode.MinimumVariance,
      new Rn.Scalar(0.01)
    );
    const primitiveSphere = entitySphere.getMesh().mesh.primitives[0];
    renderPass.setMaterialForPrimitive(materialSphere, primitiveSphere);

    // set variance shadow material for board primitive in this render pass
    const materialBoard = Rn.MaterialHelper.createVarianceShadowMapDecodeClassicSingleMaterial(
      {depthCameraComponent: cameraComponentDepth},
      [renderPassDepthBlurHV, renderPassSquareDepthBlurHV]
    );
    materialBoard.setParameter(
      Rn.ShaderSemantics.DiffuseColorFactor,
      new Rn.Vector4(0.1, 0.7, 0.5, 1)
    );
    materialBoard.setParameter(
      Rn.VarianceShadowMapDecodeClassicSingleMaterialNode.ShadowColor,
      new Rn.Vector4(0.05, 0.35, 0.25, 1)
    );
    materialBoard.setParameter(
      Rn.VarianceShadowMapDecodeClassicSingleMaterialNode.MinimumVariance,
      new Rn.Scalar(0.01)
    );
    const primitiveBoard = entityBoard.getMesh().mesh.primitives[0];
    renderPass.setMaterialForPrimitive(materialBoard, primitiveBoard);

    return renderPass;
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

  function createEntitySphereWithEmptyMaterial() {
    const primitive = new Rn.Sphere();
    primitive.generate({
      radius: 10,
      widthSegments: 20,
      heightSegments: 20,
      material: Rn.MaterialHelper.createEmptyMaterial(),
    });

    const entity = generateEntity();
    const meshComponent = entity.getMesh();
    const mesh = new Rn.Mesh();
    mesh.addPrimitive(primitive);
    meshComponent.setMesh(mesh);

    const transform = entity.getTransform();
    transform.scale = new Rn.Vector3(0.1, 0.1, 0.1);
    transform.translate = new Rn.Vector3(0.0, 0.0, 5.0);
    transform.rotate = new Rn.Vector3(0.0, 0.0, 0.0);

    return entity;
  }

  function createEntityBoardWithEmptyMaterial() {
    const primitive = new Rn.Plane();
    primitive.generate({
      width: 20,
      height: 20,
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

    const transform = entity.getTransform();
    transform.scale = new Rn.Vector3(1.0, 1.0, 1.0);
    transform.translate = new Rn.Vector3(0.0, 0.0, -1.5);
    transform.rotate = new Rn.Vector3(Math.PI / 2, 0, 0);

    return entity;
  }

  function createAndSetFramebuffer(
    renderPass: RenderPass,
    resolution: number,
    textureNum: number,
    property: {
      level?: number | undefined;
      internalFormat?: PixelFormatEnum | undefined;
      format?: PixelFormatEnum | undefined;
      type?: ComponentTypeEnum | undefined;
      magFilter?: TextureParameterEnum | undefined;
      minFilter?: TextureParameterEnum | undefined;
      wrapS?: TextureParameterEnum | undefined;
      wrapT?: TextureParameterEnum | undefined;
      createDepthBuffer?: boolean | undefined;
      isMSAA?: boolean | undefined;
    } = {}
  ) {
    const framebuffer = Rn.RenderableHelper.createTexturesForRenderTarget(
      resolution,
      resolution,
      textureNum,
      property
    );
    renderPass.setFramebuffer(framebuffer);
    return framebuffer;
  }

  function createRenderPassGaussianBlurForDepth(
    cameraComponent: CameraComponent,
    renderPassBlurTarget: RenderPass,
    isHorizontal: boolean
  ) {
    const material = Rn.MaterialHelper.createGaussianBlurForEncodedDepthMaterial();

    const gaussianDistributionRatio = Rn.MathUtil.computeGaussianDistributionRatioWhoseSumIsOne(
      {
        kernelSize: gaussianKernelSize,
        variance: gaussianVariance,
      }
    );
    material.setParameter(
      Rn.GaussianBlurForEncodedDepthSingleMaterialNode.GaussianKernelSize,
      gaussianKernelSize
    );
    material.setParameter(
      Rn.GaussianBlurForEncodedDepthSingleMaterialNode.GaussianRatio,
      gaussianDistributionRatio
    );

    if (isHorizontal === false) {
      material.setParameter(
        Rn.GaussianBlurForEncodedDepthSingleMaterialNode.IsHorizontal,
        false
      );
    }

    const framebufferTarget = renderPassBlurTarget.getFramebuffer();
    const TextureTarget = framebufferTarget
      .colorAttachments[0] as RenderTargetTexture;
    material.setTextureParameter(
      Rn.ShaderSemantics.BaseColorTexture,
      TextureTarget
    );

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

  function createExpression(renderPasses: RenderPass[]) {
    const expression = new Rn.Expression();
    expression.addRenderPasses(renderPasses);
    return expression;
  }

  function draw(
    expressions: Expression[],
    isFirstLoop: Boolean,
    pElem?: HTMLElement
  ) {
    // for e2e-test
    if (pElem === undefined && !isFirstLoop) {
      pElem = document.createElement('p');
      pElem.setAttribute('id', 'rendered');
      pElem.innerText = 'Rendered.';
      document.body.appendChild(pElem);
    }

    system.process(expressions);
    requestAnimationFrame(draw.bind(null, expressions, false, pElem));
  }
})();
