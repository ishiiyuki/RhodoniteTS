import _Rn from '../../../dist/esm/index';
import WEB4DS from './web4dv/web4dvImporter.js';

declare const Rn: typeof _Rn;

(async () => {
  setConfig();

  await Promise.all([
    Rn.ModuleManager.getInstance().loadModule('webgl'),
    Rn.ModuleManager.getInstance().loadModule('pbr'),
  ]);

  Rn.MeshRendererComponent.isViewFrustumCullingEnabled = false;

  const system = Rn.System.getInstance();
  const rnCanvasElem = document.getElementById('world') as HTMLCanvasElement;
  const gl = system.setProcessApproachAndCanvas(
    Rn.ProcessApproach.UniformWebGL1,
    rnCanvasElem
  );

  // to try this sample, you need to prepare 4ds samples data and write the path to them here
  // you can get the sample data from [the official 4D VIEWS website](https://www.4dviews.com/).
  const model4DS = new WEB4DS(
    'id(Arbitrary id)',
    'DESKTOP.4ds (4D Views file for desktop)',
    'MOBILE.4ds (4D Views file for mobile)',
    'AUDIO.wav (audio file of 4D Views. if there is no audio file, you set empty string here)',
    gl
  );
  model4DS.position = new Rn.Vector3(0.45, -0.8, 0.2);

  let clickEventName;
  if ('ontouchstart' in document) {
    clickEventName = 'touchstart';
  } else {
    clickEventName = 'mousedown';
  }

  const buttonElemLoad = document.getElementById('btnLoad') as HTMLElement;
  buttonElemLoad.addEventListener(clickEventName, () => {
    model4DS.destroy(() => {
      model4DS.load(false, true);
    });
  });

  const buttonElemPlay = document.getElementById('btnPlay') as HTMLElement;
  buttonElemPlay.addEventListener(clickEventName, () => {
    model4DS.play();
  });

  const buttonElemPause = document.getElementById('btnPause') as HTMLElement;
  buttonElemPause.addEventListener(clickEventName, () => {
    model4DS.pause();
  });

  const buttonElemMute = document.getElementById('btnMute') as HTMLElement;
  buttonElemMute.addEventListener(clickEventName, () => {
    model4DS.mute();
  });

  const buttonElemUnmute = document.getElementById('btnUnmute') as HTMLElement;
  buttonElemUnmute.addEventListener(clickEventName, () => {
    model4DS.unmute();
  });

  model4DS.load(true, false, draw);

  function setConfig() {
    Rn.Config.maxEntityNumber = 10;
    Rn.Config.maxLightNumberInShader = 1;
    Rn.Config.maxVertexMorphNumberInShader = 1;
    Rn.Config.maxMaterialInstanceForEachType = 2;
    Rn.Config.maxSkeletonNumber = 1;
    Rn.Config.maxCameraNumber = 1;
    Rn.Config.maxSkeletalBoneNumber = 1;
    Rn.Config.dataTextureWidth = Math.pow(2, 3);
    Rn.Config.dataTextureHeight = Math.pow(2, 4);
    Rn.Config.maxMorphTargetNumber = 0;

    Rn.MemoryManager.createInstanceIfNotCreated(1.25, 1, 0);
  }

  function draw() {
    try {
      if (model4DS.isDrawing) {
        system.process([model4DS.expression]);
      }
      requestAnimationFrame(draw);
    } catch (e) {
      alert(e);
    }
  }

})();
