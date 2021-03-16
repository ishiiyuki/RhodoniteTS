// **********************************************************
//
// WEB4DV
// rhodonite.js plug-in for 4Dviews volumetric video sequences
// with referenced to THREE.js plug-in for 4Dviews volumetric video sequences
//
//
//
// THREE.js plug-in for 4Dviews volumetric video sequences
//
// Version: 3.0.0
// Release date: 18-December 2020
//
// Copyright: 4D View Solutions SAS
// Authors: M.Adam & T.Groubet
//
//
// **********************************************************
import AudioPlayer from './audioPlayer.js';
import _Rn, {
  Entity,
  CameraComponent,
  Vector3,
  Primitive,
  Material,
  Texture,
  CompositionTypeEnum,
  ComponentTypeEnum,
} from '../../../../dist/esm/index';

// const {ResourceManagerXHR, Decoder4D} = require('./web4dvResource.js');
// const Decoder4D = require('./web4dvResource.js');
import {default as ResourceManagerXHR, Decoder4D} from './web4dvResource.js';

declare const Rn: typeof _Rn;

// 4Dviews variables
// let waiterLoaded = false;

export default class WEB4DS {
  private static resourceManager = new ResourceManagerXHR();

  public __id: string;
  private __urlD: string;
  private __urlM: string;
  private __urlA: string;
  private __position = Rn.MutableVector3.zero();
  private __expression = new Rn.Expression();
  private __gl: WebGLRenderingContext;

  private __renderPass = new Rn.RenderPass();
  private __entity4D?: Entity;
  private __primitive4D?: Primitive;
  private __material4D?: Material;
  private __texture4D: Texture;
  private __isDrawing = false;

  private __audioPlayer = new AudioPlayer();

  private __showPlaceholder = false; // show the only first chunk or not

  private __isLoaded = false;
  private __isPlaying = false;
  private __isAudioPlaying = false;
  private __isDecoding = false;
  private __isMuted = false;

  private __audioStartOffset = 0;
  private __audioStartTime = 0;
  private __audioPassedTime = 0;
  private __audioLevel = 0.5;

  private __playbackLoop?: NodeJS.Timeout;
  private __decodeLoop?: NodeJS.Timeout;
  private __firstChunks = false;
  private __currentMesh?: {
    frame: number;
    GetVertices: () => Float32Array;
    GetFaces: () => Uint32Array;
    GetUVs: () => Float32Array;
    GetNormals: () => Float32Array;
    GetTexture: () => Uint8Array;
    delete: () => void;
  };
  private __currentFrame = 0;
  private __meshesCache = [] as Array<{
    frame: number;
    GetVertices: () => Float32Array;
    GetFaces: () => Uint32Array;
    GetUVs: () => Float32Array;
    GetNormals: () => Float32Array;
    GetTexture: () => Uint8Array;
    delete: () => void;
  }>;

  /**
   * @param id unique id
   * @param urlD url of Desktop format
   * @param urlM url of Mobile format
   * @param urlA url of Audio
   * @param gl return value of setProcessApproachAndCanvas
   */
  constructor(
    id: string,
    urlD: string,
    urlM: string,
    urlA: string,
    gl: WebGLRenderingContext
  ) {
    // properties
    this.__id = id;
    this.__urlD = urlD;
    this.__urlM = urlM;
    this.__urlA = urlA;
    this.__gl = gl;

    // Rhodonite objects
    const entityRepository = Rn.EntityRepository.getInstance();
    const cameraEntity = entityRepository.createEntity([
      Rn.TransformComponent,
      Rn.SceneGraphComponent,
      Rn.CameraComponent,
      Rn.CameraControllerComponent,
    ]);
    const cameraComponent = cameraEntity.getComponent(
      Rn.CameraComponent
    ) as CameraComponent;
    cameraComponent.zNear = 0.1;
    cameraComponent.zFar = 1000.0;
    cameraComponent.setFovyAndChangeFocalLength(50.0);

    this.__renderPass.cameraComponent = cameraComponent;
    this.__expression.addRenderPasses([this.__renderPass]);

    this.__createTargetEntityAndSetTargetOfCameraController(cameraEntity);

    this.__texture4D = new Rn.Texture();
  }

  private __createTargetEntityAndSetTargetOfCameraController(
    cameraEntity: Entity
  ) {
    // create target entity of camera
    const primitiveTarget = new Rn.Sphere();
    primitiveTarget.generate({
      radius: 1.5,
      widthSegments: 3,
      heightSegments: 3,
    });

    const meshTarget = new Rn.Mesh();
    meshTarget.addPrimitive(primitiveTarget);

    const repo = Rn.EntityRepository.getInstance();
    const entityTarget = repo.createEntity([
      Rn.TransformComponent,
      Rn.SceneGraphComponent,
      Rn.MeshComponent,
      Rn.MeshRendererComponent,
    ]);
    const meshComponentTarget = entityTarget.getMesh();
    meshComponentTarget.setMesh(meshTarget);

    // do not render the target entity
    // use this line for debug
    // this.renderPass.addEntities([entityTarget]);

    // set target
    const cameraControllerComponent = cameraEntity.getCameraController();
    const controller = cameraControllerComponent.controller;
    controller.setTarget(entityTarget);
  }

  initSequence() {
    const si = WEB4DS.resourceManager._sequenceInfo;
    const maxVertices = si.MaxVertices;
    const maxTriangles = si.MaxTriangles;

    if (this.__entity4D) {
      return;
    }
    // create 4Dview entity
    this.__material4D = Rn.MaterialHelper.createClassicUberMaterial({
      additionalName: 'mesh4D_' + this.__id,
      isMorphing: false,
      isSkinning: false,
      isLighting: false,
    });

    this.__primitive4D = new Rn.Primitive();
    this.__primitive4D.material = this.__material4D;

    // take accessors
    const positionAccessor = this.createAttributeAccessor(
      new Float32Array(3 * maxVertices).buffer,
      Rn.ComponentType.Float,
      Rn.CompositionType.Vec3,
      'position_' + this.__id
    );
    const normalAccessor = this.createAttributeAccessor(
      new Float32Array(3 * maxVertices).buffer,
      Rn.ComponentType.Float,
      Rn.CompositionType.Vec3,
      'normal_' + this.__id
    );
    const texcoordAccessor = this.createAttributeAccessor(
      new Float32Array(2 * maxVertices).buffer,
      Rn.ComponentType.Float,
      Rn.CompositionType.Vec2,
      'texcoord0_' + this.__id
    );
    const indicesAccessor = this.createAttributeAccessor(
      new Uint32Array(3 * maxTriangles).buffer,
      Rn.ComponentType.UnsignedInt,
      Rn.CompositionType.Scalar,
      'indices_' + this.__id
    );

    const attributeMap = new Map();
    attributeMap.set(Rn.VertexAttribute.Position, positionAccessor);
    attributeMap.set(Rn.VertexAttribute.Normal, normalAccessor);
    attributeMap.set(Rn.VertexAttribute.Texcoord0, texcoordAccessor);
    this.__primitive4D.setData(
      attributeMap,
      Rn.PrimitiveMode.Triangles,
      this.__material4D,
      indicesAccessor
    );

    const mesh4D = new Rn.Mesh();
    mesh4D.addPrimitive(this.__primitive4D);

    const repo = Rn.EntityRepository.getInstance();
    this.__entity4D = repo.createEntity([
      Rn.TransformComponent,
      Rn.SceneGraphComponent,
      Rn.MeshComponent,
      Rn.MeshRendererComponent,
    ]);
    const meshComponent4D = this.__entity4D.getMesh();
    meshComponent4D.setMesh(mesh4D);

    const transformComponent4D = this.__entity4D.getTransform();
    const tmpVec3 = Rn.MutableVector3.zero();
    transformComponent4D.translate = this.__position;
    transformComponent4D.rotate = tmpVec3.setComponents(-Math.PI / 2, 0.0, 0.0);

    this.__renderPass.addEntities([this.__entity4D]);

    this.__material4D.setTextureParameter(
      Rn.ShaderSemantics.DiffuseColorTexture,
      this.__texture4D
    );
  }

  // methods
  load(showPlaceholder: boolean, playOnload: boolean, callback?: Function) {
    if (!this.__isLoaded) {
      this.__showPlaceholder = showPlaceholder;

      const supportASTC = this.__gl.getExtension(
        'WEBGL_compressed_texture_astc'
      );

      if (supportASTC) {
        WEB4DS.resourceManager.set4DSFile(this.__urlM);
        Decoder4D.SetInputTextureEncoding(164);
      } else {
        WEB4DS.resourceManager.set4DSFile(this.__urlD);
        Decoder4D.SetInputTextureEncoding(100);
      }

      WEB4DS.resourceManager.Open(() => {
        this.initSequence(); // Get sequence information

        this.Decode(); // Start decoding, downloading

        this.loadAudio(this.__urlA);

        const waiter = setInterval(() => {
          if (this.__meshesCache.length >= Decoder4D._maxCacheSize) {
            clearInterval(waiter); // Stop the waiter loop

            // if (this.waiterElem) // Hide Waiter
            //   waiterHtml.style.display = 'none';

            if (showPlaceholder === true) {
              // Placeholder equals frame 0
              WEB4DS.resourceManager.seek(0);

              // Display the frame 0
              const placeholder = this.__meshesCache.shift();
              if (placeholder !== undefined) {
                this.updateSequenceMesh(
                  placeholder.GetVertices(),
                  placeholder.GetFaces(),
                  placeholder.GetUVs(),
                  placeholder.GetNormals(),
                  placeholder.GetTexture()
                );
              } else {
                console.error('mesh is undefined');
              }
            } else {
              // Else, play sequence
              if (playOnload) {
                this.play();
              } else {
                const message =
                  'sequence is ready | showPlaceholder: ' +
                  this.__showPlaceholder +
                  ' | playOnload: ' +
                  playOnload;

                console.log(message);
              }
            }
            const btnElem = document.getElementById(
              'btnLoad'
            ) as HTMLButtonElement;
            btnElem.disabled = false;
          }
        }, 0.1);

        this.__isLoaded = true;
        if (callback) {
          callback();
        }
      });
    } else {
      alert('A sequence is already loaded. One sequence at a time.');
    }
  }

  updateSequenceMesh(
    posBuffer: Float32Array,
    indexBuffer: Uint32Array,
    UVBuffer: Float32Array,
    normalBuffer: Float32Array,
    textureBuffer: Uint8Array
  ) {
    /* update the buffers */
    const positionAccessor = this.createAttributeAccessor(
      new Float32Array(posBuffer).buffer,
      Rn.ComponentType.Float,
      Rn.CompositionType.Vec3,
      'position_' + this.__id
    );
    const normalAccessor = this.createAttributeAccessor(
      new Float32Array(normalBuffer).buffer,
      Rn.ComponentType.Float,
      Rn.CompositionType.Vec3,
      'normal_' + this.__id
    );
    const texcoordAccessor = this.createAttributeAccessor(
      new Float32Array(UVBuffer).buffer,
      Rn.ComponentType.Float,
      Rn.CompositionType.Vec2,
      'texcoord0_' + this.__id
    );
    const indicesAccessor = this.createAttributeAccessor(
      new Uint32Array(indexBuffer).buffer,
      Rn.ComponentType.UnsignedInt,
      Rn.CompositionType.Scalar,
      'indices_' + this.__id
    );

    console.log(arguments);

    const attributeMap = new Map();
    attributeMap.set(Rn.VertexAttribute.Position, positionAccessor);
    attributeMap.set(Rn.VertexAttribute.Normal, normalAccessor);
    attributeMap.set(Rn.VertexAttribute.Texcoord0, texcoordAccessor);
    (this.__primitive4D as Primitive).setData(
      attributeMap,
      Rn.PrimitiveMode.Triangles,
      this.__material4D,
      indicesAccessor
    );

    this.__isDrawing = true;

    /* update the texture */
    const si = WEB4DS.resourceManager._sequenceInfo;
    if (si.TextureEncoding === 164) {
      // astc
      this.__texture4D.generateCompressedTextureFromTypedArray(
        textureBuffer,
        si.TextureSizeX,
        si.TextureSizeY,
        Rn.CompressionTextureType.ASTC_RGBA_8x8
      );
    } else if (si.TextureEncoding === 100) {
      // dxt
      this.__texture4D.generateCompressedTextureFromTypedArray(
        textureBuffer,
        si.TextureSizeX,
        si.TextureSizeY,
        Rn.CompressionTextureType.S3TC_RGB_DXT1
      );
    } else {
      // rgba
      this.__texture4D.generateTextureFromTypedArray(textureBuffer);
    }
  }

  createAttributeAccessor(
    arrayBuffer: ArrayBuffer,
    componentType: ComponentTypeEnum,
    compositionType: CompositionTypeEnum,
    bufferName: string
  ) {
    const accessorCount =
      arrayBuffer.byteLength /
      (compositionType.getNumberOfComponents() *
        componentType.getSizeInBytes());

    const attributeBuffer = new Rn.Buffer({
      byteLength: arrayBuffer.byteLength,
      buffer: arrayBuffer,
      name: bufferName,
      byteAlign: 4,
    });
    const attributeBufferView = attributeBuffer.takeBufferView({
      byteLengthToNeed: arrayBuffer.byteLength,
      byteStride: 0,
      isAoS: false,
    });
    const attributeAccessor = attributeBufferView.takeAccessor({
      compositionType,
      componentType,
      count: accessorCount,
    });

    return attributeAccessor;
  }

  // Decode 4D Sequence
  Decode() {
    const decodeLoopTime =
      1000.0 / (WEB4DS.resourceManager._sequenceInfo.FrameRate * 3);

    const isValidChunksLength =
      Decoder4D._chunks4D?.length <
      WEB4DS.resourceManager?._sequenceInfo?.NbFrames * 2;

    /* Download a first pack of chunks at sequence init, bigger than the next ones */
    if (this.__firstChunks === false) {
      if (Decoder4D._keepChunksInCache === false && isValidChunksLength) {
        if (this.__showPlaceholder === true) {
          // 2 Mo (1 frame 2880p)
          WEB4DS.resourceManager._internalCacheSize = 2000000;
          Decoder4D._maxCacheSize = 1; // 1 frame
        } else {
          // 20 Mo
          WEB4DS.resourceManager._internalCacheSize = 20000000;
          Decoder4D._maxCacheSize = 20; // 20 frames
        }

        WEB4DS.resourceManager.getBunchOfChunks();
        console.log('downloading first chunks');
      }

      this.__firstChunks = true;
    }

    /* Decoding loop, 3*fps */
    this.__decodeLoop = setInterval(() => {
      /* Do not decode if enough meshes in cache */
      const sequenceLength = WEB4DS.resourceManager._sequenceInfo.NbFrames;
      if (
        Decoder4D._keepChunksInCache === true &&
        this.__meshesCache.length >= sequenceLength
      ) {
        return;
      } else if (this.__meshesCache.length >= Decoder4D._maxCacheSize) {
        return;
      }

      /* Decode chunk */
      const newMesh = Decoder4D.DecodeChunk();

      /* If a few chunks, download more */
      if (
        Decoder4D._chunks4D.length < 300 ||
        (Decoder4D._keepChunksInCache === true && isValidChunksLength)
      ) {
        // 6 Mo
        WEB4DS.resourceManager._internalCacheSize = 6000000;

        if (this.__showPlaceholder === false) {
          WEB4DS.resourceManager.getBunchOfChunks();
        }
      }

      /* If mesh is decoded, we stock it */
      if (newMesh) {
        this.__meshesCache.push(newMesh);
      }
    }, decodeLoopTime);

    this.__isDecoding = true;
  }

  // For now, will pause any WEB4DV object created (function is generic)
  pause() {
    this.__isPlaying = false;
    this.__isDrawing = false;

    clearInterval((this.__playbackLoop as unknown) as number);

    if (this.__meshesCache.length >= Decoder4D._maxCacheSize) {
      clearInterval((this.__decodeLoop as unknown) as number);
      this.__isDecoding = false;
    }

    this.pauseAudio();
  }

  // For now, will play any WEB4DV object created (function is generic)
  play() {
    if (this.__isPlaying) {
      // If sequence is already playing, do nothing
      return;
    }

    if (!this.__isDecoding) {
      // If not decoding, decode
      this.Decode();
    }

    const dt = 1000.0 / WEB4DS.resourceManager._sequenceInfo.FrameRate;

    this.__playbackLoop = setInterval(() => {
      // get first mesh from cache
      const mesh = this.__meshesCache.shift();
      if (mesh) {
        /* update buffers for rendering */
        this.updateSequenceMesh(
          mesh.GetVertices(),
          mesh.GetFaces(),
          mesh.GetUVs(),
          mesh.GetNormals(),
          mesh.GetTexture()
        );

        if (this.__currentMesh) {
          this.__currentMesh.delete();
        }

        this.__currentMesh = mesh;

        if (!this.__isMuted) {
          if (this.__audioPlayer.isLoaded) {
            if (mesh.frame === 0) {
              this.restartAudio();
            }

            const audioCurrentTime =
              (this.__audioStartOffset + this.__audioPassedTime) %
              this.__audioPlayer.duration;

            const audioEndTime =
              mesh.frame / WEB4DS.resourceManager._sequenceInfo.FrameRate;
            if (audioCurrentTime > audioEndTime) {
              this.pauseAudio();
            } else {
              this.playAudio();
              this.__audioPassedTime =
                this.__audioPlayer.currentTime - this.__audioStartTime;
            }
          }
        }

        this.__currentFrame = mesh.frame;
      } else if (!this.__isMuted) {
        /* There is no mesh to be displayed YET, pause audio */
        this.pauseAudio();
      }
    }, dt);

    this.__isPlaying = true;
    this.__isDrawing = true;
  }

  loadAudio(audioFile: string) {
    this.__audioPlayer.volume = 0.5;
    if (audioFile !== '') {
      console.log(`loading audio file: ${audioFile}`);
      this.__audioPlayer.loadPromise(audioFile);
    } else if (
      Array.isArray(WEB4DS.resourceManager._audioTrack) &&
      WEB4DS.resourceManager._audioTrack.length > 0
    ) {
      console.warn('Does not support internal audio currently');
      // this.__audioPlayer.audioContext.decodeAudioData(
      //   WEB4DS.resourceManager._audioTrack,
      //   audioBuffer => {
      //     this.__audioPlayer.audioBuffer = audioBuffer;
      //   });
    }
  }

  playAudio() {
    if (this.__isAudioPlaying === false) {
      this.__audioStartOffset =
        this.__currentFrame / WEB4DS.resourceManager._sequenceInfo.FrameRate;
      this.__audioPlayer.startAt(this.__audioStartOffset);
      console.log(
        `start audio at time ${this.__audioStartOffset} ; ${this.__audioPlayer.currentTime}`
      );
      this.__isAudioPlaying = true;
      this.__audioStartTime = this.__audioPlayer.currentTime;
    }
  }

  pauseAudio() {
    if (this.__isAudioPlaying === true) {
      this.__audioPlayer.stop();
      this.__isAudioPlaying = false;
    }
  }

  restartAudio() {
    console.log('restart audio playback');
    this.__isAudioPlaying = false;
    this.__audioPassedTime = 0;

    this.__audioPlayer.stop();
    this.playAudio();
  }

  // For now, will mute any WEB4DV object created (function is generic)
  mute() {
    this.__audioLevel = this.__audioPlayer.volume;
    console.log(`volume will be set back at:${this.__audioLevel}`);

    this.__audioPlayer.volume = 0;
    this.__isMuted = true;
  }

  // For now, will unmute any WEB4DV object created (function is generic)
  unmute() {
    this.__isMuted = false;

    if (this.__audioLevel) {
      this.__audioPlayer.volume = this.__audioLevel;
    } else {
      this.__audioPlayer.volume = 0.5;
    }
  }

  keepsChunksInCache(booleanVal: boolean) {
    Decoder4D._keepChunksInCache = booleanVal;
  }

  destroy(callback: Function) {
    const loadButtonElem = document.getElementById(
      'btnLoad'
    ) as HTMLButtonElement;
    loadButtonElem.disabled = true;

    clearInterval((this.__playbackLoop as unknown) as number);
    clearInterval((this.__decodeLoop as unknown) as number);
    // clearInterval(renderLoop); // No more needed: renderLoop is managed outside

    if (this.__audioPlayer) {
      this.__audioPlayer.stop();
      this.__audioPlayer.audioBuffer = undefined;

      this.__audioStartTime = 0;
      this.__audioStartOffset = 0;
      this.__audioPassedTime = 0;
    }

    WEB4DS.resourceManager.reinitResources();

    this.__isLoaded = false;
    this.__isPlaying = false;
    this.__isDecoding = false;
    this.__isAudioPlaying = false;
    this.__firstChunks = false;

    this.__currentMesh = null;

    Decoder4D._chunks4D.forEach(element => {
      element.delete();
    });
    this.__meshesCache.forEach(element => {
      element.delete();
    });

    this.__meshesCache = [];
    Decoder4D._chunks4D = [];

    // Decoder4D.Destroy(); //No more needed: there is always an instance running

    // Reset Sequence Infos
    this.__currentFrame = 0;
    Decoder4D._decodedFrames = [];

    // Callback
    if (callback) {
      callback();
    }
  }

  get expression() {
    return this.__expression;
  }

  get isDrawing() {
    return this.__isDrawing;
  }

  // position of 4D Views model
  set position(vec3: Vector3) {
    this.__position.copyComponents(vec3);

    if (this.__entity4D) {
      const transformComponent = this.__entity4D.getTransform();
      transformComponent.translate = vec3;
    }
  }
}
