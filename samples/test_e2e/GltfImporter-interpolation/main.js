const p = document.createElement('p');
document.body.appendChild(p);

const load = async function () {
  await Rn.ModuleManager.getInstance().loadModule('webgl');
  await Rn.ModuleManager.getInstance().loadModule('pbr');
  const system = Rn.System.getInstance();
  system.setProcessApproachAndCanvas(Rn.ProcessApproach.UniformWebGL1, document.getElementById('world'));

  // camera
  const entityRepository = Rn.EntityRepository.getInstance();
  const cameraEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.CameraComponent]);
  const cameraComponent = cameraEntity.getComponent(Rn.CameraComponent);
  cameraComponent.zNear = 0.1;
  cameraComponent.zFar = 1000.0;
  cameraComponent.setFovyAndChangeFocalLength(30.0);
  cameraComponent.aspect = 1.0;

  const cameraTransform = cameraEntity.getTransform();
  cameraTransform.translate = new Rn.Vector3(0, 4.2, 25);

  // gltf
  const gltfImporter = Rn.GltfImporter.getInstance();
  const expression = await gltfImporter.import('../../../assets/gltf/2.0/InterpolationTest/glTF-Binary/InterpolationTest.glb', {
    cameraComponent: cameraComponent
  });

  // Lights
  const lightEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.LightComponent])
  lightEntity.getComponent(Rn.LightComponent).intensity = new Rn.Vector3(0.9, 0.9, 0.9);
  lightEntity.getTransform().translate = new Rn.Vector3(0.0, 10.0, 10.0);

  let count = 0;
  Rn.AnimationComponent.globalTime = 0.33;

  const draw = function () {
    if (count > 0) {
      p.id = 'rendered';
      p.innerText = 'Rendered.';
    }

    if (window.isAnimating) {
      Rn.AnimationComponent.globalTime += 0.016;
      if (Rn.AnimationComponent.globalTime > Rn.AnimationComponent.endInputValue) {
        Rn.AnimationComponent.globalTime -= Rn.AnimationComponent.endInputValue - Rn.AnimationComponent.startInputValue;
      }
    }

    system.process([expression]);

    count++;

    requestAnimationFrame(draw);
  };

  draw();

}

document.body.onload = load;