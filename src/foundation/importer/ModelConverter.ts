import EntityRepository from "../core/EntityRepository";
import TransformComponent from "../components/TransformComponent";
import SceneGraphComponent from "../components/SceneGraphComponent";
import MeshComponent from "../components/MeshComponent";
import Entity from "../core/Entity";
import Vector3 from "../math/Vector3";
import Quaternion from "../math/Quaternion";
import Matrix44 from "../math/Matrix44";
import MeshRendererComponent from "../components/MeshRendererComponent";
import Primitive from "../geometry/Primitive";
import Buffer from "../memory/Buffer";
import { PrimitiveMode } from "../definitions/PrimitiveMode";
import { CompositionType } from "../definitions/CompositionType";
import { ComponentType } from "../definitions/ComponentType";
import { VertexAttribute } from "../definitions/VertexAttribute";
import MutableMatrix44 from "../math/MutableMatrix44";
import ColorRgb from "../math/ColorRgb";
import CameraComponent from "../components/CameraComponent";
import { CameraType } from "../definitions/CameraType";
import Texture from "../textures/Texture";
import Vector4 from "../math/Vector4";
import Vector2_F64 from "../math/Vector2";
import AnimationComponent from "../components/AnimationComponent";
import { AnimationInterpolation } from "../definitions/AnimationInterpolation";
import { MathUtil } from "../math/MathUtil";
import SkeletalComponent from "../components/SkeletalComponent";
import { AlphaMode } from "../definitions/AlphaMode";
import MaterialHelper from "../helpers/MaterialHelper";
import { ShaderSemantics, ShaderSemanticsEnum } from "../definitions/ShaderSemantics";
import Vector2 from "../math/Vector2";
import Material from "../materials/Material";
import { ShadingModel } from "../definitions/ShadingModel";
import Component from "../core/Component";
import { VertexAttributeEnum } from "../../rhodonite";
import Accessor from "../memory/Accessor";
import Mesh from "../geometry/Mesh";
import MutableVector4 from "../math/MutableVector4";
import LightComponent from "../components/LightComponent";
import { LightType } from "../definitions/LightType";
import { Count, Byte, Size, Index } from "../../types/CommonTypes";
import { GltfLoadOption, glTF2, Gltf2Node, Gltf2Buffer, Gltf2Accessor, Gltf2BufferView } from "../../types/glTF";
import Config from "../core/Config";
import { BufferUse } from "../definitions/BufferUse";
import MemoryManager from "../core/MemoryManager";
import ILoaderExtension from "./ILoaderExtension";
import BlendShapeComponent from "../components/BlendShapeComponent";
import GlobalDataRepository from "../core/GlobalDataRepository";
import PbrShadingMaterialNode from "../materials/PbrShadingMaterialNode";
import Scalar from "../math/Scalar";

declare var DracoDecoderModule: any;

/**
 * A converter class from glTF2 model to Rhodonite Native data
 */
export default class ModelConverter {
  private static __instance: ModelConverter;

  private constructor() {
  }

  /**
   * The static method to get singleton instance of this class.
   * @return The singleton instance of ModelConverter class
   */
  static getInstance(): ModelConverter {
    if (!this.__instance) {
      this.__instance = new ModelConverter();
    }
    return this.__instance;
  }

  _getDefaultShader(options: GltfLoadOption) {
    let defaultShader = null;

    // if (options && typeof options.defaultShaderClass !== "undefined") {
    //   if (typeof options.defaultShaderClass === "string") {
    //     defaultShader = GLBoost[options.defaultShaderClass];
    //   } else {
    //     defaultShader = options.defaultShaderClass;
    //   }
    // }

    return defaultShader;
  }

  private __generateEntity(components: typeof Component[], gltfModel: glTF2): Entity {

    const repo = EntityRepository.getInstance();
    const entity = repo.createEntity(components);
    entity.tryToSetTag({ tag: 'SourceType', value: gltfModel.asset.extras!.fileType! });
    entity.tryToSetTag({ tag: 'SourceTypeVersion', value: gltfModel.asset.extras!.version! });

    return entity;
  }

  private __generateGroupEntity(gltfModel: glTF2): Entity {
    const entity = this.__generateEntity([TransformComponent, SceneGraphComponent], gltfModel);
    return entity;
  }

  private __generateMeshEntity(gltfModel: glTF2): Entity {
    const entity = this.__generateEntity([TransformComponent, SceneGraphComponent, MeshComponent, MeshRendererComponent], gltfModel);
    return entity;
  }

  private __generateCameraEntity(gltfModel: glTF2): Entity {
    const entity = this.__generateEntity([TransformComponent, SceneGraphComponent, CameraComponent], gltfModel);
    return entity;
  }

  private __generateLightEntity(gltfModel: glTF2): Entity {
    const entity = this.__generateEntity([TransformComponent, SceneGraphComponent, LightComponent], gltfModel);
    return entity;
  }

  convertToRhodoniteObject(gltfModel: glTF2) {

    (gltfModel.asset.extras as any).rnMeshesAtGltMeshIdx = [];

    const rnBuffers = this.createRnBuffer(gltfModel);

    // Mesh, Camera, Group, ...
    const { rnEntities, rnEntitiesByNames } = this.__setupObjects(gltfModel, rnBuffers);
    gltfModel.asset.extras!.rnEntities = rnEntities;

    // Transform
    this._setupTransform(gltfModel, rnEntities);

    // Skeleton
    this._setupSkeleton(gltfModel, rnEntities);

    // Hierarchy
    this._setupHierarchy(gltfModel, rnEntities);

    // Camera
    //this._setupCamera(gltfModel, groups);

    // Animation
    this._setupAnimation(gltfModel, rnEntities);

    // Root Group
    const rootGroup = this.__generateGroupEntity(gltfModel);
    rootGroup.tryToSetUniqueName('FileRoot', true);
    rootGroup.tryToSetTag({ tag: 'ObjectType', value: 'top' });
    if (gltfModel.scenes[0].nodesIndices) {
      for (let nodesIndex of gltfModel.scenes[0].nodesIndices) {
        rootGroup.getSceneGraph().addChild(rnEntities[nodesIndex].getSceneGraph());
      }
    }

    rootGroup.tryToSetTag({ tag: 'rnEntities', value: rnEntities })
    rootGroup.tryToSetTag({ tag: 'rnEntitiesByNames', value: rnEntitiesByNames })
    rootGroup.tryToSetTag({ tag: 'gltfModel', value: gltfModel })

    return rootGroup;
  }

  _setupCamera(gltfModel: glTF2) {

  }

  private createRnBuffer(gltfModel: glTF2): Buffer[] {
    const rnBuffers = [];
    for (let buffer of gltfModel.buffers) {
      const rnBuffer = new Buffer({
        byteLength: buffer.byteLength,
        buffer: buffer.buffer!,
        name: `gltf2Buffer_0_(${buffer.uri})`
      });
      rnBuffers.push(rnBuffer);
    }
    return rnBuffers;
  }

  _setupTransform(gltfModel: glTF2, groups: Entity[]) {
    for (let node_i in gltfModel.nodes) {
      let group = groups[node_i];
      let nodeJson = gltfModel.nodes[node_i];

      if (nodeJson.translation) {
        group.getTransform().translate = new Vector3(nodeJson.translation[0], nodeJson.translation[1], nodeJson.translation[2]);
      }
      if (nodeJson.scale) {
        group.getTransform().scale = new Vector3(nodeJson.scale[0], nodeJson.scale[1], nodeJson.scale[2]);
      }
      if (nodeJson.rotation) {
        group.getTransform().quaternion = new Quaternion(nodeJson.rotation[0], nodeJson.rotation[1], nodeJson.rotation[2], nodeJson.rotation[3]);
      }
      if (nodeJson.matrix) {
        group.getTransform().matrix = new Matrix44(nodeJson.matrix, true);
      }
    }
  }

  _setupHierarchy(gltfModel: glTF2, rnEntities: Entity[]) {
    const groupSceneComponents = rnEntities.map(group => { return group.getSceneGraph(); });

    for (let node_i in gltfModel.nodes) {
      const parentNode_i = parseInt(node_i);
      let node = gltfModel.nodes[parentNode_i];
      if (node.childrenIndices) {
        let parentGroup = groupSceneComponents[parentNode_i];
        for (let childNode_i of node.childrenIndices) {
          let childGroup = groupSceneComponents[childNode_i];
          parentGroup.addChild(childGroup);
        }
      }
    }
  }

  /**
   * @private
   */
  _setupAnimation(gltfModel: glTF2, rnEntities: Entity[]) {
    if (gltfModel.animations) {

      for (let animation of gltfModel.animations) {
        for (let sampler of animation.samplers) {
          this._accessBinaryWithAccessor(sampler.input);
          this._accessBinaryWithAccessor(sampler.output);
        }
      }
    }

    const entityRepository = EntityRepository.getInstance();

    if (gltfModel.animations) {
      for (let animation of gltfModel.animations) {

        for (let channel of animation.channels) {
          const animInputArray = channel.sampler.input.extras.typedDataArray;
          const animOutputArray = channel.sampler.output.extras.typedDataArray;
          const interpolation = (channel.sampler.interpolation != null) ? channel.sampler.interpolation : 'LINEAR';

          let animationAttributeName = '';
          if (channel.target.path === 'translation') {
            animationAttributeName = 'translate';
          } else if (channel.target.path === 'rotation') {
            animationAttributeName = 'quaternion';
          } else {
            animationAttributeName = channel.target.path;
          }

          let rnEntity = rnEntities[channel.target.nodeIndex!];
          if (rnEntity) {
            entityRepository.addComponentsToEntity([AnimationComponent], rnEntity.entityUID);
            const animationComponent = rnEntity.getComponent(AnimationComponent) as AnimationComponent;
            if (animationComponent) {
              animationComponent.setAnimation(animationAttributeName, animInputArray, animOutputArray, AnimationInterpolation.fromString(interpolation));
            }
          }
        }
      }
    }
  }

  _setupSkeleton(gltfModel: glTF2, rnEntities: Entity[]) {
    if (gltfModel.skins == null) {
      return;
    }

    const globalDataRepository = GlobalDataRepository.getInstance();
    const entityRepository = EntityRepository.getInstance();
    for (let skin of gltfModel.skins) {
      // globalDataRepository.takeOne(ShaderSemantics.BoneQuaternion);
      // globalDataRepository.takeOne(ShaderSemantics.BoneTranslateScale);

      if (skin.inverseBindMatrices) {
        this._accessBinaryWithAccessor(skin.inverseBindMatrices);
      }
    }

    for (let node_i in gltfModel.nodes) {
      let node = gltfModel.nodes[node_i];
      let sg = rnEntities[node_i].getSceneGraph();
      let skeletalComponent: SkeletalComponent;
      if (node.skin != null) {
        let rnEntity = rnEntities[node_i];
        entityRepository.addComponentsToEntity([SkeletalComponent], rnEntity.entityUID);
        skeletalComponent = rnEntity.getComponent(SkeletalComponent) as SkeletalComponent;

        //        skeletalComponent.isSkinning = false;

        skeletalComponent._jointIndices = node.skin.jointsIndices;
        if (node.skin.bindShapeMatrix != null) {
          skeletalComponent._bindShapeMatrix = new Matrix44(node.skin.bindShapeMatrix);
        }
      }

      if (node.skin && node.skin.skeleton) {
        sg.isRootJoint = true;
        // if (node.meshes) {
        //   // let rnEntity = rnEntities[node_i];
        //   // entityRepository
        //   // for (let mesh of node.meshes) {
        //   //   mesh
        //   //   const entity = this.__generateMeshEntity() {

        //   //   }
        //   // }
        //   // skeletalComponent!.jointsHierarchy = rnEntities[node.skin.skeletonIndex].getSceneGraph();
        // } else 
        if (node.mesh) {
          const joints = [];
          for (let i of node.skin.jointsIndices) {
            joints.push(rnEntities[i].getSceneGraph());
          }
          skeletalComponent!.joints = joints;
          if (node.skin.skeletonIndex != null) {
            skeletalComponent!.jointsHierarchy = rnEntities[node.skin.skeletonIndex].getSceneGraph();
          } else {
            skeletalComponent!.jointsHierarchy = joints[0];
          }
        }
      }

      if (node.skin && node.skin.joints) {
        for (let joint_i of node.skin.jointsIndices) {
          let sg = rnEntities[joint_i].getSceneGraph();
          sg.jointIndex = joint_i;
        }
      }
      if (node.skin && node.skin.inverseBindMatrices != null) {
        skeletalComponent!._inverseBindMatrices = node.skin.inverseBindMatrices.extras.typedDataArray;
      }
    }
  }


  __setupObjects(gltfModel: glTF2, rnBuffers: Buffer[]) {
    const rnEntities: Entity[] = [];
    const rnEntitiesByNames: Map<String, Entity> = new Map();

    for (let node_i in gltfModel.nodes) {
      let node = gltfModel.nodes[parseInt(node_i)] as Gltf2Node;
      let entity;
      if (node.mesh != null) {
        let meshIdxOrName: any = node.meshIndex;
        if (meshIdxOrName == null) {
          meshIdxOrName = node.meshNames![0];
        }
        const meshEntity = this.__setupMesh(node, node.mesh, meshIdxOrName, rnBuffers, gltfModel);
        if (node.name) {
          meshEntity.tryToSetUniqueName(node.name, true);
        }
        if (node.mesh.name) {
          const meshComponent = meshEntity.getComponent(MeshComponent)!;
          meshComponent.tryToSetUniqueName(node.mesh.name, true);
        }
        entity = meshEntity;
      } else if (node.camera != null) {
        const cameraEntity = this.__setupCamera(node.camera, gltfModel);
        if (node.name) {
          cameraEntity.tryToSetUniqueName(node.name, true);
        }
        entity = cameraEntity;
      } else if (node.extensions && node.extensions.KHR_lights_punctual) {
        const lightEntity = this.__setupLight(node.extensions.KHR_lights_punctual.light, gltfModel);
        entity = lightEntity;
      } else {
        const group = this.__generateGroupEntity(gltfModel);
        if (node.name) {
          group.tryToSetUniqueName(node.name, true);
        }
        entity = group;
      }

      entity.tryToSetTag({ tag: 'gltf_node_index', value: '' + node_i });

      rnEntities.push(entity);
      rnEntitiesByNames.set(node.name!, entity);

      if (this.__hasBlendShapes(node)) {
        let weights: number[];
        if (node.weights) {
          weights = node.weights;
        } else if (node.mesh.weights) {
          weights = node.mesh.weights;
        } else {
          weights = new Array(node.mesh.primitives[0].targets.length);
          for (let i = 0; i < weights.length; i++) {
            weights[i] = 0;
          }
        }
        const entityRepository = EntityRepository.getInstance();
        entityRepository.addComponentsToEntity([BlendShapeComponent], entity.entityUID);
        const blendShapeComponent = entity.getComponent(BlendShapeComponent) as BlendShapeComponent;
        blendShapeComponent.weights = weights;
        if (node.mesh.primitives[0].extras && node.mesh.primitives[0].extras.targetNames) {
          blendShapeComponent.targetNames = node.mesh.primitives[0].extras.targetNames;
        }

      }
    }

    return { rnEntities, rnEntitiesByNames };
  }

  private __hasBlendShapes(node: any) {
    return node.mesh != null && node.mesh.primitives[0].targets != null;
  }

  private __setupLight(light: any, gltfModel: glTF2) {
    const lightEntity = this.__generateLightEntity(gltfModel);
    const lightComponent = lightEntity.getComponent(LightComponent)! as LightComponent;
    if (light.name != null) {
      lightComponent.tryToSetUniqueName(light.name, true);
      lightComponent.type = LightType.fromString(light.type);
      let color = new Vector3(1, 1, 1);
      let intensity = 1;
      if (light.color != null) {
        color = new Vector3(light.color);
      }
      if (light.intensity != null) {
        intensity = light.intensity;
      }
      lightComponent.intensity = Vector3.multiply(color, intensity);
      if (light.range != null) {
        lightComponent.range = light.range;
      }
    }
    return lightEntity;
  }

  private __setupCamera(camera: any, gltfModel: glTF2) {
    const cameraEntity = this.__generateCameraEntity(gltfModel);
    const cameraComponent = cameraEntity.getComponent(CameraComponent)! as CameraComponent;
    cameraComponent.direction = new Vector3(0, 0, -1);
    if (gltfModel.asset && (gltfModel.asset as any).LastSaved_ApplicationVendor) {
      // For an old exporter compatibility
      cameraComponent.direction = new Vector3(1, 0, 0);
      cameraComponent.directionInner = new Vector3(1, 0, 0);
    }
    cameraComponent.up = new Vector3(0, 1, 0);
    cameraComponent.type = CameraType.fromString(camera.type);
    if (cameraComponent.type === CameraType.Perspective) {
      cameraComponent.aspect = camera.perspective.aspectRatio ? camera.perspective.aspectRatio : 1;
      cameraComponent.setFovyAndChangeFocalLength(MathUtil.radianToDegree(camera.perspective.yfov));
      cameraComponent.zNear = camera.perspective.znear;
      cameraComponent.zFar = camera.perspective.zfar ? camera.perspective.zfar : 100000;
    } else if (cameraComponent.type === CameraType.Orthographic) {
      cameraComponent.xMag = camera.orthographic.zmag;
      cameraComponent.yMag = camera.orthographic.ymag;
      cameraComponent.zNear = camera.orthographic.znear;
      cameraComponent.zFar = camera.orthographic.zfar;
    }
    return cameraEntity;
  }

  private __setupMesh(node: any, mesh: any, meshIndex: Index, rnBuffers: Buffer[], gltfModel: glTF2) {
    const meshEntity = this.__generateMeshEntity(gltfModel);
    const existingRnMesh = (gltfModel.asset.extras as any).rnMeshesAtGltMeshIdx[meshIndex];
    let rnPrimitiveMode = PrimitiveMode.Triangles;
    const meshComponent = meshEntity.getMesh();
    const rnMesh = new Mesh();

    const rnLoaderOptions = gltfModel.asset.extras!.rnLoaderOptions;
    if (rnLoaderOptions && rnLoaderOptions.tangentCalculationMode != null) {
      rnMesh.tangentCalculationMode = rnLoaderOptions.tangentCalculationMode;
    }
    if (rnLoaderOptions && rnLoaderOptions.isPreComputeForRayCastPickingEnable != null) {
      rnMesh.isPreComputeForRayCastPickingEnable = rnLoaderOptions.isPreComputeForRayCastPickingEnable;
    }

    let originalRnMesh = rnMesh;
    if (existingRnMesh != null) {
      rnMesh.setOriginalMesh(existingRnMesh);
      originalRnMesh = existingRnMesh;
    } else {
      for (let i in mesh.primitives) {
        let primitive = mesh.primitives[i];
        if (primitive.mode != null) {
          rnPrimitiveMode = PrimitiveMode.from(primitive.mode)!;
        }

        const rnPrimitive = new Primitive();
        const material = this.__setupMaterial(rnPrimitive, node, gltfModel, primitive, primitive.material);

        if (material.isEmptyMaterial() === false) {
          ModelConverter.setDefaultTextures(material, gltfModel);
        }

        // indices
        let indicesRnAccessor;
        const map: Map<VertexAttributeEnum, Accessor> = new Map();
        if (primitive.extensions && primitive.extensions.KHR_draco_mesh_compression) {
          indicesRnAccessor = this.__decodeDraco(primitive, rnBuffers, gltfModel, map);

          if (indicesRnAccessor == null) {
            break;
          }
        } else {
          // attributes
          if (primitive.indices) {
            indicesRnAccessor = this.__getRnAccessor(primitive.indices, rnBuffers[((primitive.indices as Gltf2Accessor).bufferView as Gltf2BufferView).bufferIndex!]);
          }
          for (let attributeName in primitive.attributes) {
            let attributeAccessor = primitive.attributes[attributeName] as Gltf2Accessor;
            const attributeRnAccessor = this.__getRnAccessor(attributeAccessor, rnBuffers[(attributeAccessor.bufferView as Gltf2BufferView).bufferIndex!]);
            map.set(VertexAttribute.fromString(attributeAccessor.extras.attributeName), attributeRnAccessor);
          }
        }

        rnPrimitive.setData(map, rnPrimitiveMode, material, indicesRnAccessor);

        // morph targets
        if (primitive.targets != null) {

          // set default number
          let maxMorphTargetNumber = 4;
          if (rnLoaderOptions != null && rnLoaderOptions.maxMorphTargetNumber != null) {
            maxMorphTargetNumber = rnLoaderOptions.maxMorphTargetNumber;
          }

          const targets: Array<Map<VertexAttributeEnum, Accessor>> = [];
          for (let i = 0; i < primitive.targets.length; i++) {
            if (i >= maxMorphTargetNumber) {
              break;
            }

            const target = primitive.targets[i];
            const targetMap: Map<VertexAttributeEnum, Accessor> = new Map();
            for (let attributeName in target) {
              let attributeAccessor = target[attributeName] as Gltf2Accessor;
              const attributeRnAccessor = this.__getRnAccessor(attributeAccessor, rnBuffers[(attributeAccessor.bufferView as Gltf2BufferView).bufferIndex!]);
              const attributeRnAccessorInGPUInstanceData = this.__copyRnAccessorAndBufferView(attributeRnAccessor, primitive);
              targetMap.set(VertexAttribute.fromString(attributeName), attributeRnAccessorInGPUInstanceData);
            }
            targets.push(targetMap);
          }

          rnPrimitive.setTargets(targets);
        }

        rnMesh.addPrimitive(rnPrimitive);
      }

      if (mesh.weights) {
        rnMesh.weights = mesh.weights;
      }
    }

    meshComponent.setMesh(rnMesh);

    (gltfModel.asset.extras as any).rnMeshesAtGltMeshIdx[meshIndex] = originalRnMesh;

    return meshEntity;
  }

  static setDefaultTextures(material: Material, gltfModel: glTF2): void {
    if (gltfModel.asset.extras == null ||
      gltfModel.asset.extras.rnLoaderOptions == null ||
      gltfModel.asset.extras.rnLoaderOptions.defaultTextures == null) {
      return;
    }

    const options = gltfModel.asset.extras.rnLoaderOptions;

    const defaultTextures = gltfModel.asset.extras.rnLoaderOptions.defaultTextures;
    const basePath = defaultTextures.basePath;
    const textureInfos = defaultTextures.textureInfos;

    for (let textureInfo of textureInfos) {
      const rnTexture = new Texture();

      //options
      rnTexture.autoDetectTransparency = options.autoDetectTextureTransparency === true;
      rnTexture.autoResize = options.autoResizeTexture === true;

      const fileName = textureInfo.fileName;
      const uri = basePath + fileName;
      rnTexture.name = uri;

      const image = textureInfo.image;
      if (image && image.image) {
        rnTexture.generateTextureFromImage(image.image);
      } else if (image && image.basis) {
        rnTexture.generateTextureFromBasis(image.basis);
      } else {
        console.warn("default image not found");
        continue;
      }

      const shaderSemantics = textureInfo.shaderSemantics;
      material.setTextureParameter(shaderSemantics, rnTexture);
    }
  }

  private __setMorphingAndSkinningArgument(node: any, argumentOfMaterialHelper: any, isMorphingOriginal: boolean, isSkinningOriginal: boolean): void {
    if (isMorphingOriginal) {
      argumentOfMaterialHelper.isMorphing = this.__hasBlendShapes(node);
    }

    if (isSkinningOriginal) {
      const existSkin = node.skin != null;
      argumentOfMaterialHelper.isSkinning = existSkin;
      argumentOfMaterialHelper.additionalName = existSkin ? "skin${(node.skinIndex != null ? node.skinIndex : node.skinName)}" : "";
    }
  }

  private __setVRMMaterial(rnPrimitive: Primitive, node: any, gltfModel: glTF2, primitive: any, argumentArray: any): Material | undefined {
    const VRMProperties = gltfModel.extensions.VRM;

    const shaderName = VRMProperties.materialProperties[primitive.materialIndex].shader;
    if (shaderName === "VRM/MToon") {
      // argument
      const argumentOfMaterialHelper = argumentArray[0];
      const rnExtension = VRMProperties.rnExtension;

      const isMorphingOriginal = argumentOfMaterialHelper.isMorphing;
      const isSkinningOriginal = argumentOfMaterialHelper.isSkinning;

      this.__setMorphingAndSkinningArgument(node, argumentOfMaterialHelper, isMorphingOriginal, isSkinningOriginal);

      const materialProperties = gltfModel.extensions.VRM.materialProperties[primitive.materialIndex];
      argumentOfMaterialHelper.materialProperties = materialProperties;

      // outline
      let renderPassOutline;
      if (rnExtension) {
        renderPassOutline = rnExtension.renderPassOutline;
      }

      //exist outline
      if (renderPassOutline != null) {
        let outlineMaterial: Material;
        if (materialProperties.floatProperties._OutlineWidthMode !== 0) {
          argumentOfMaterialHelper.isOutline = true;
          outlineMaterial = MaterialHelper.createMToonMaterial(argumentOfMaterialHelper);
          argumentOfMaterialHelper.isOutline = false;
        } else {
          outlineMaterial = MaterialHelper.createEmptyMaterial();
        }

        renderPassOutline.setMaterialForPrimitive(outlineMaterial, rnPrimitive);
      }

      const material = MaterialHelper.createMToonMaterial(argumentOfMaterialHelper);

      argumentOfMaterialHelper.isMorphing = isMorphingOriginal;
      argumentOfMaterialHelper.isSkinning = isSkinningOriginal;

      return material;

    } else if (argumentArray[0].isOutline) {
      return MaterialHelper.createEmptyMaterial();;
    }

    // use another material
    return undefined;
  }

  private __generateAppropriateMaterial(rnPrimitive: Primitive, node: any, gltfModel: glTF2, primitive: any, materialJson: any): Material {

    if (gltfModel.asset.extras != null && gltfModel.asset.extras.rnLoaderOptions != null) {
      const rnLoaderOptions = gltfModel.asset.extras.rnLoaderOptions;

      if (rnLoaderOptions.loaderExtension &&
        rnLoaderOptions.loaderExtension.isNeededToUseThisMaterial(gltfModel)) {
        const loaderExtension = gltfModel.asset.extras!.rnLoaderOptions!.loaderExtension;
        return loaderExtension.generateMaterial();
      }

      const argumentArray = rnLoaderOptions.defaultMaterialHelperArgumentArray;

      if (rnLoaderOptions.isImportVRM) {
        const material = this.__setVRMMaterial(rnPrimitive, node, gltfModel, primitive, argumentArray);
        if (material != null) return material;
      }

      const materialHelperName = rnLoaderOptions.defaultMaterialHelperName;
      if (materialHelperName != null) {
        return (MaterialHelper as any)[materialHelperName].apply(this, argumentArray);
      }
    }

    let maxMaterialInstanceNumber: number = Config.maxMaterialInstanceForEachType
    if (gltfModel.meshes.length > Config.maxMaterialInstanceForEachType) {
      maxMaterialInstanceNumber = gltfModel.meshes.length + Config.maxMaterialInstanceForEachType / 2;
    }
    const isMorphing = this.__hasBlendShapes(node);
    const isSkinning = (node.skin != null) ? true : false;
    const additionalName = (node.skin != null) ? `skin${(node.skinIndex != null ? node.skinIndex : node.skinName)}` : void 0;
    if (materialJson != null && materialJson.pbrMetallicRoughness) {
      return MaterialHelper.createPbrUberMaterial({ isMorphing: isMorphing, isSkinning: isSkinning, isLighting: true, additionalName, maxInstancesNumber: maxMaterialInstanceNumber });
    } else {
      return MaterialHelper.createClassicUberMaterial({ isSkinning: isSkinning, isLighting: true, additionalName, maxInstancesNumber: maxMaterialInstanceNumber });
    }
  }

  private __setupMaterial(rnPrimitive: Primitive, node: any, gltfModel: any, primitive: any, materialJson: any): Material {
    const material: Material = this.__generateAppropriateMaterial(rnPrimitive, node, gltfModel, primitive, materialJson);

    // avoid unexpected initialization
    if (!this.__needParameterInitialization(materialJson, material.materialTypeName)) return material;

    const pbrMetallicRoughness = materialJson.pbrMetallicRoughness;
    if (pbrMetallicRoughness != null) {

      const baseColorFactor = pbrMetallicRoughness.baseColorFactor;
      if (baseColorFactor != null) {
        material.setParameter(ShaderSemantics.BaseColorFactor, new Vector4(baseColorFactor));
      }

      const baseColorTexture = pbrMetallicRoughness.baseColorTexture;
      if (baseColorTexture != null) {
        const rnTexture = ModelConverter._createTexture(baseColorTexture, gltfModel)
        material.setTextureParameter(ShaderSemantics.BaseColorTexture, rnTexture);
      }
      ModelConverter._setupTextureTransform(baseColorTexture, material, PbrShadingMaterialNode.baseColorTextureTransform, PbrShadingMaterialNode.baseColorTextureRotation);

      const occlusionTexture = materialJson.occlusionTexture;
      if (occlusionTexture != null) {
        const rnTexture = ModelConverter._createTexture(occlusionTexture, gltfModel)
        material.setTextureParameter(ShaderSemantics.OcclusionTexture, rnTexture);
      }

      let metallicFactor = pbrMetallicRoughness.metallicFactor;
      metallicFactor = (metallicFactor != null) ? metallicFactor : 1;
      let roughnessFactor = pbrMetallicRoughness.roughnessFactor;
      roughnessFactor = (roughnessFactor != null) ? roughnessFactor : 1;
      material.setParameter(ShaderSemantics.MetallicRoughnessFactor, new Vector2(metallicFactor, roughnessFactor));

      const metallicRoughnessTexture = pbrMetallicRoughness.metallicRoughnessTexture;
      if (metallicRoughnessTexture != null) {
        const rnTexture = ModelConverter._createTexture(metallicRoughnessTexture, gltfModel)
        material.setTextureParameter(ShaderSemantics.MetallicRoughnessTexture, rnTexture);
      }
      ModelConverter._setupTextureTransform(metallicRoughnessTexture, material, PbrShadingMaterialNode.metallicRoughnessTextureTransform, PbrShadingMaterialNode.metallicRoughnessTextureRotation);

    } else {
      let param: Index = ShadingModel.Phong.index;
      if (materialJson.extras && materialJson.extras.technique) {
        switch (materialJson.extras.technique) {
          case ShadingModel.Constant.str: param = ShadingModel.Constant.index; break;
          case ShadingModel.Lambert.str: param = ShadingModel.Lambert.index; break;
          case ShadingModel.BlinnPhong.str: param = ShadingModel.BlinnPhong.index; break;
          case ShadingModel.Phong.str: param = ShadingModel.Phong.index; break;
        }
        material.setParameter(ShaderSemantics.ShadingModel, new Scalar(param));
      }
    }

    const emissiveTexture = materialJson.emissiveTexture;
    if (emissiveTexture != null) {
      const rnTexture = ModelConverter._createTexture(emissiveTexture, gltfModel)
      material.setTextureParameter(ShaderSemantics.EmissiveTexture, rnTexture);
    }

    const options = gltfModel.asset.extras.rnLoaderOptions;
    let alphaMode = materialJson.alphaMode;
    if (options != null && options.alphaMode) {
      alphaMode = options.alphaMode;
    }
    if (alphaMode != null) {
      material.alphaMode = AlphaMode.fromString(alphaMode)!;
    }

    // For glTF1.0
    const diffuseColorTexture = materialJson.diffuseColorTexture;
    if (diffuseColorTexture != null) {
      const rnTexture = ModelConverter._createTexture(diffuseColorTexture, gltfModel)
      material.setTextureParameter(ShaderSemantics.DiffuseColorTexture, rnTexture);

      if (this._checkRnGltfLoaderOptionsExist(gltfModel) && gltfModel.asset.extras.rnLoaderOptions.loaderExtension) {
        const loaderExtension = gltfModel.asset.extras.rnLoaderOptions.loaderExtension as ILoaderExtension;
        if (loaderExtension.setUVTransformToTexture) {
          loaderExtension.setUVTransformToTexture(material, diffuseColorTexture.texture.sampler);
        }
      }
    }
    const diffuseColorFactor = materialJson.diffuseColorFactor;
    if (diffuseColorFactor != null) {
      material.setParameter(ShaderSemantics.DiffuseColorFactor, new Vector4(diffuseColorFactor));
    }

    const normalTexture = materialJson.normalTexture;
    if (normalTexture != null) {
      const rnTexture = ModelConverter._createTexture(normalTexture, gltfModel)
      material.setTextureParameter(ShaderSemantics.NormalTexture, rnTexture);
    }
    ModelConverter._setupTextureTransform(normalTexture, material, PbrShadingMaterialNode.normalTextureTransform, PbrShadingMaterialNode.normalTextureRotation);


    // ModelConverter._setupTextureTransform(normalTexture, material, 'normalTextureTransform', 'normalTextureRotation')

    // For Extension
    if (this._checkRnGltfLoaderOptionsExist(gltfModel) && gltfModel.asset.extras.rnLoaderOptions.loaderExtension) {
      const loaderExtension = gltfModel.asset.extras.rnLoaderOptions.loaderExtension;
      loaderExtension.setupMaterial(gltfModel, materialJson, material);
    }

    return material;
  }

  static _createTexture(textureType: any, gltfModel: glTF2) {
    const options = (gltfModel.asset.extras) ? gltfModel.asset.extras.rnLoaderOptions : undefined;
    const rnTexture = new Texture();
    rnTexture.autoDetectTransparency = (options && options.autoDetectTextureTransparency === true) ? true : false;
    rnTexture.autoResize = (options && options.autoResizeTexture === true) ? true : false;
    const texture = textureType.texture;
    if (texture.image.image) {
      const image = texture.image.image;
      rnTexture.generateTextureFromImage(image);
      if (texture.image.uri) {
        rnTexture.name = texture.image.url;
      } else {
        const ext = texture.image.mimeType.split('/')[1];
        rnTexture.name = texture.image.name + `.${ext}`;
      }
    } else if (texture.image.basis) {
      rnTexture.generateTextureFromBasis(texture.image.basis);
      if (texture.image.uri) {
        rnTexture.name = texture.image.url;
      } else {
        const ext = texture.image.mimeType.split('/')[1];
        rnTexture.name = texture.image.name + `.${ext}`;
      }
    }

    return rnTexture;
  }


  private __needParameterInitialization(materialJson: any, materialTypeName: string): boolean {
    if (materialJson == null) return false;

    if (
      materialTypeName.match(/PbrUber/) != null ||
      materialTypeName.match(/ClassicUber/) != null
    ) {
      return true;
    } else {
      return false;
    }

  }

  private _checkRnGltfLoaderOptionsExist(gltfModel: glTF2) {
    if (gltfModel.asset.extras && gltfModel.asset.extras.rnLoaderOptions) {
      return true;
    } else {
      return false;
    }
  }

  _adjustByteAlign(typedArrayClass: any, uint8Array: Uint8Array, alignSize: Size, byteOffset: Byte, length: Size) {
    if ((byteOffset % alignSize) != 0) {
      return new typedArrayClass(uint8Array.buffer.slice(byteOffset + uint8Array.byteOffset), 0, length);
    } else {
      return new typedArrayClass(uint8Array.buffer, byteOffset + uint8Array.byteOffset, length);
    }
  }

  _checkBytesPerComponent(accessor: any) {

    var bytesPerComponent = 0;
    switch (accessor.componentType) {
      case 5120: // gl.BYTE
        bytesPerComponent = 1;
        break;
      case 5121: // gl.UNSIGNED_BYTE
        bytesPerComponent = 1;
        break;
      case 5122: // gl.SHORT
        bytesPerComponent = 2;
        break;
      case 5123: // gl.UNSIGNED_SHORT
        bytesPerComponent = 2;
        break;
      case 5124: // gl.INT
        bytesPerComponent = 4;
        break;
      case 5125: // gl.UNSIGNED_INT
        bytesPerComponent = 4;
        break;
      case 5126: // gl.FLOAT
        bytesPerComponent = 4;
        break;
      default:
        break;
    }
    return bytesPerComponent;
  }

  _checkComponentNumber(accessor: any) {

    var componentN = 0;
    switch (accessor.type) {
      case 'SCALAR':
        componentN = 1;
        break;
      case 'VEC2':
        componentN = 2;
        break;
      case 'VEC3':
        componentN = 3;
        break;
      case 'VEC4':
        componentN = 4;
        break;
      case 'MAT4':
        componentN = 16;
        break;
    }

    return componentN;
  }

  _checkDataViewMethod(accessor: any) {
    var dataViewMethod = '';
    switch (accessor.componentType) {
      case 5120: // gl.BYTE
        dataViewMethod = 'getInt8';
        break;
      case 5121: // gl.UNSIGNED_BYTE
        dataViewMethod = 'getUint8';
        break;
      case 5122: // gl.SHORT
        dataViewMethod = 'getInt16';
        break;
      case 5123: // gl.UNSIGNED_SHORT
        dataViewMethod = 'getUint16';
        break;
      case 5124: // gl.INT
        dataViewMethod = 'getInt32';
        break;
      case 5125: // gl.UNSIGNED_INT
        dataViewMethod = 'getUint32';
        break;
      case 5126: // gl.FLOAT
        dataViewMethod = 'getFloat32';
        break;
      default:
        break;
    }
    return dataViewMethod;
  }

  static _isSystemLittleEndian() {
    return !!(new Uint8Array((new Uint16Array([0x00ff])).buffer))[0];
  }

  _accessBinaryWithAccessor(accessor: any) {
    var bufferView = accessor.bufferView;
    const byteOffset = bufferView.byteOffset + (accessor.byteOffset !== void 0 ? accessor.byteOffset : 0);
    var buffer = bufferView.buffer;
    var uint8Array: Uint8Array = buffer.buffer;

    let componentN = this._checkComponentNumber(accessor);
    let componentBytes = this._checkBytesPerComponent(accessor);
    let dataViewMethod = this._checkDataViewMethod(accessor);
    if (accessor.extras === void 0) {
      accessor.extras = {};
    }

    accessor.extras.componentN = componentN;
    accessor.extras.componentBytes = componentBytes;
    accessor.extras.dataViewMethod = dataViewMethod;

    var byteLength = componentBytes * componentN * accessor.count;

    var typedDataArray: any = [];

    if (accessor.extras && accessor.extras.toGetAsTypedArray) {
      if (ModelConverter._isSystemLittleEndian()) {
        if (dataViewMethod === 'getFloat32') {
          typedDataArray = this._adjustByteAlign(Float32Array, uint8Array, 4, byteOffset, byteLength / componentBytes);
        } else if (dataViewMethod === 'getInt8') {
          typedDataArray = new Int8Array(uint8Array, byteOffset, byteLength / componentBytes);
        } else if (dataViewMethod === 'getUint8') {
          typedDataArray = new Uint8Array(uint8Array, byteOffset, byteLength / componentBytes);
        } else if (dataViewMethod === 'getInt16') {
          typedDataArray = this._adjustByteAlign(Int16Array, uint8Array, 2, byteOffset, byteLength / componentBytes);
        } else if (dataViewMethod === 'getUint16') {
          typedDataArray = this._adjustByteAlign(Uint16Array, uint8Array, 2, byteOffset, byteLength / componentBytes);
        } else if (dataViewMethod === 'getInt32') {
          typedDataArray = this._adjustByteAlign(Int32Array, uint8Array, 4, byteOffset, byteLength / componentBytes);
        } else if (dataViewMethod === 'getUint32') {
          typedDataArray = this._adjustByteAlign(Uint32Array, uint8Array, 4, byteOffset, byteLength / componentBytes);
        }

      } else {
        let dataView: any = new DataView(uint8Array.buffer, byteOffset + uint8Array.byteOffset, byteLength);
        let byteDelta = componentBytes * componentN;
        let littleEndian = true;
        for (let pos = 0; pos < byteLength; pos += byteDelta) {
          switch (accessor.type) {
            case 'SCALAR':
              typedDataArray.push(dataView[dataViewMethod](pos, littleEndian));
              break;
            case 'VEC2':
              typedDataArray.push(dataView[dataViewMethod](pos, littleEndian));
              typedDataArray.push(dataView[dataViewMethod](pos + componentBytes, littleEndian));
              break;
            case 'VEC3':
              typedDataArray.push(dataView[dataViewMethod](pos, littleEndian));
              typedDataArray.push(dataView[dataViewMethod](pos + componentBytes, littleEndian));
              typedDataArray.push(dataView[dataViewMethod](pos + componentBytes * 2, littleEndian));
              break;
            case 'VEC4':
              typedDataArray.push(dataView[dataViewMethod](pos, littleEndian));
              typedDataArray.push(dataView[dataViewMethod](pos + componentBytes, littleEndian));
              typedDataArray.push(dataView[dataViewMethod](pos + componentBytes * 2, littleEndian));
              typedDataArray.push(dataView[dataViewMethod](pos + componentBytes * 3, littleEndian));
              break;
          }
        }
        if (dataViewMethod === 'getInt8') {
          typedDataArray = new Int8Array(typedDataArray);
        } else if (dataViewMethod === 'getUint8') {
          typedDataArray = new Uint8Array(typedDataArray);
        } else if (dataViewMethod === 'getInt16') {
          typedDataArray = new Int16Array(typedDataArray);
        } else if (dataViewMethod === 'getUint16') {
          typedDataArray = new Uint16Array(typedDataArray);
        } else if (dataViewMethod === 'getInt32') {
          typedDataArray = new Int32Array(typedDataArray);
        } else if (dataViewMethod === 'getUint32') {
          typedDataArray = new Uint32Array(typedDataArray);
        } else if (dataViewMethod === 'getFloat32') {
          typedDataArray = new Float32Array(typedDataArray);
        }
      }
    } else {
      let dataView: any = new DataView(uint8Array.buffer, byteOffset + uint8Array.byteOffset, byteLength);
      let byteDelta = componentBytes * componentN;
      if (accessor.extras && accessor.extras.weightCount) {
        byteDelta = componentBytes * componentN * accessor.extras.weightCount;
      }
      let littleEndian = true;
      for (let pos = 0; pos < byteLength; pos += byteDelta) {

        switch (accessor.type) {
          case 'SCALAR':
            if (accessor.extras && accessor.extras.weightCount) {
              const array = [];
              for (let i = 0; i < accessor.extras.weightCount; i++) {
                array.push(dataView[dataViewMethod](pos + componentBytes * i, littleEndian));
              }
              typedDataArray.push(array);
            } else {
              typedDataArray.push(dataView[dataViewMethod](pos, littleEndian));
            }
            break;
          case 'VEC2':
            typedDataArray.push(new Vector2(
              dataView[dataViewMethod](pos, littleEndian),
              dataView[dataViewMethod](pos + componentBytes, littleEndian)
            ));
            break;
          case 'VEC3':
            typedDataArray.push(new Vector3(
              dataView[dataViewMethod](pos, littleEndian),
              dataView[dataViewMethod](pos + componentBytes, littleEndian),
              dataView[dataViewMethod](pos + componentBytes * 2, littleEndian)
            ));
            break;
          case 'VEC4':
            if (accessor.extras && accessor.extras.quaternionIfVec4) {
              typedDataArray.push(new Quaternion(
                dataView[dataViewMethod](pos, littleEndian),
                dataView[dataViewMethod](pos + componentBytes, littleEndian),
                dataView[dataViewMethod](pos + componentBytes * 2, littleEndian),
                dataView[dataViewMethod](pos + componentBytes * 3, littleEndian)
              ));
            } else {
              typedDataArray.push(new Vector4(
                dataView[dataViewMethod](pos, littleEndian),
                dataView[dataViewMethod](pos + componentBytes, littleEndian),
                dataView[dataViewMethod](pos + componentBytes * 2, littleEndian),
                dataView[dataViewMethod](pos + componentBytes * 3, littleEndian)
              ));
            }
            break;
          case 'MAT4':
            let matrixComponents = [];
            for (let i = 0; i < 16; i++) {
              matrixComponents[i] = dataView[dataViewMethod](pos + componentBytes * i, littleEndian);
            }
            typedDataArray.push(new Matrix44(matrixComponents, true));
            break;
        }

      }
    }

    accessor.extras.typedDataArray = typedDataArray;

    return typedDataArray;
  }

  private __addOffsetToIndices(meshComponent: MeshComponent) {
    const primitiveNumber = meshComponent.mesh!.getPrimitiveNumber();
    let offsetSum = 0;
    for (let i = 0; i < primitiveNumber; i++) {
      const primitive = meshComponent.mesh!.getPrimitiveAt(i);
      const indicesAccessor = primitive.indicesAccessor;
      if (indicesAccessor) {
        const elementNumber = indicesAccessor.elementCount;
        for (let j = 0; j < elementNumber; j++) {
          const index = indicesAccessor.getScalar(j, {});
          indicesAccessor.setScalar(j, index + offsetSum, {});
        }
        offsetSum += elementNumber;
      }
    }
  }

  private __getRnAccessor(accessor: any, rnBuffer: Buffer) {
    const bufferView = accessor.bufferView;
    const rnBufferView = rnBuffer.takeBufferViewWithByteOffset({
      byteLengthToNeed: bufferView.byteLength,
      byteStride: (bufferView.byteStride != null) ? bufferView.byteStride : 0,
      byteOffset: (bufferView.byteOffset != null) ? bufferView.byteOffset : 0,
      isAoS: false
    });

    let rnAccessor;
    if (accessor.byteStride != null) {
      rnAccessor = rnBufferView.takeFlexibleAccessorWithByteOffset({
        compositionType: CompositionType.fromString(accessor.type),
        componentType: ComponentType.from(accessor.componentType),
        count: accessor.count,
        byteStride: accessor.byteStride,
        byteOffset: (accessor.byteOffset != null) ? accessor.byteOffset : 0,
        max: accessor.max,
        min: accessor.min
      });
    } else {
      rnAccessor = rnBufferView.takeAccessorWithByteOffset({
        compositionType: CompositionType.fromString(accessor.type),
        componentType: ComponentType.from(accessor.componentType),
        count: accessor.count,
        byteOffset: (accessor.byteOffset != null) ? accessor.byteOffset : 0,
        max: accessor.max,
        min: accessor.min
      });
    }

    return rnAccessor;
  }

  private __copyRnAccessorAndBufferView(srcRnAccessor: Accessor, primitive: Primitive) {
    const byteSize = srcRnAccessor.elementCount * 4 /* vec4 */ * 4 /* bytes */;
    const dstRnBuffer = MemoryManager.getInstance().getBuffer(BufferUse.GPUVertexData);
    const dstRnBufferView = dstRnBuffer.takeBufferView({
      byteLengthToNeed: byteSize,
      byteStride: 4 /* vec4 */ * 4 /* bytes */,
      isAoS: false
    });

    const dstRnAccessor = dstRnBufferView.takeAccessor({
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      count: srcRnAccessor.elementCount,
      max: srcRnAccessor.max,
      min: srcRnAccessor.min
    });
    for (let i = 0; i < srcRnAccessor.elementCount; i++) {
      dstRnAccessor.setElementFromAccessor(i, srcRnAccessor);
    }

    return dstRnAccessor;
  }

  private __createRnAccessor(accessor: any, numOfAttributes: Count, compositionNum: Count, rnBuffer: Buffer) {
    const rnBufferView = rnBuffer.takeBufferView({
      byteLengthToNeed: numOfAttributes * compositionNum * 4,
      byteStride: 0,
      isAoS: false
    });

    let rnAccessor;
    if (accessor.byteStride != null) {
      rnAccessor = rnBufferView.takeFlexibleAccessorWithByteOffset({
        compositionType: CompositionType.fromString(accessor.type),
        componentType: ComponentType.from(accessor.componentType),
        count: numOfAttributes,
        byteStride: accessor.byteStride,
        byteOffset: (accessor.byteOffset != null) ? accessor.byteOffset : 0,
        max: accessor.max,
        min: accessor.min
      });
    } else {
      rnAccessor = rnBufferView.takeAccessorWithByteOffset({
        compositionType: CompositionType.fromString(accessor.type),
        componentType: ComponentType.from(accessor.componentType),
        count: numOfAttributes,
        byteOffset: (accessor.byteOffset != null) ? accessor.byteOffset : 0,
        max: accessor.max,
        min: accessor.min
      });
    }

    return rnAccessor;
  }



  private __getRnBufferView(bufferView: any, rnBuffer: Buffer) {
    const rnBufferView = rnBuffer.takeBufferViewWithByteOffset({
      byteLengthToNeed: bufferView.byteLength,
      byteStride: (bufferView.byteStride != null) ? bufferView.byteStride : 0,
      byteOffset: (bufferView.byteOffset != null) ? bufferView.byteOffset : 0,
      isAoS: false
    });

    return rnBufferView;
  }

  private __getGeometryFromDracoBuffer(draco: any, decoder: any, arrayBuffer: ArrayBuffer) {
    const buffer = new draco.DecoderBuffer();
    buffer.Init(new Int8Array(arrayBuffer), arrayBuffer.byteLength);
    const geometryType = decoder.GetEncodedGeometryType(buffer);
    let dracoGeometry;
    let decodingStatus;
    if (geometryType === draco.TRIANGULAR_MESH) {
      dracoGeometry = new draco.Mesh();
      decodingStatus = decoder.DecodeBufferToMesh(buffer, dracoGeometry);
    } else if (geometryType == draco.POINT_CLOUD) {
      dracoGeometry = new draco.PointCloud();
      decodingStatus = decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
    } else {
      const errorMsg = 'Unknown geometry type.';
      console.error(errorMsg);
    }

    dracoGeometry.geometryType = geometryType; // store

    if (!decodingStatus.ok() || dracoGeometry.ptr == 0) {
      let errorMsg = 'Decoding failed: ';
      errorMsg += decodingStatus.error_msg();
      console.error(errorMsg);
      draco.destroy(decoder);
      draco.destroy(dracoGeometry);
      return void 0;
    }
    draco.destroy(buffer);

    return dracoGeometry;
  }

  __getIndicesFromDraco(draco: any, decoder: any, dracoGeometry: any, triangleStripDrawMode: boolean) {
    // For mesh, we need to generate the faces.
    const geometryType = dracoGeometry.geometryType;
    if (geometryType !== draco.TRIANGULAR_MESH) {
      return void 0;
    }

    let indices;

    if (triangleStripDrawMode) {
      const stripsArray = new draco.DracoInt32Array();
      decoder.GetTriangleStripsFromMesh(dracoGeometry, stripsArray);
      indices = new Uint32Array(stripsArray.size());
      for (var i = 0; i < stripsArray.size(); ++i) {
        indices[i] = stripsArray.GetValue(i);
      }
      draco.destroy(stripsArray);
    } else { // TRIANGLES
      const numFaces = dracoGeometry.num_faces();
      const numIndices = numFaces * 3;
      indices = new Uint32Array(numIndices);
      const ia = new draco.DracoInt32Array();
      for (let i = 0; i < numFaces; ++i) {
        decoder.GetFaceFromMesh(dracoGeometry, i, ia);
        var index = i * 3;
        indices[index] = ia.GetValue(0);
        indices[index + 1] = ia.GetValue(1);
        indices[index + 2] = ia.GetValue(2);
      }
      draco.destroy(ia);
    }
    return indices;
  }

  private __decodeDraco(primitive: any, rnBuffers: Buffer[], gltfModel: glTF2, map: Map<VertexAttributeEnum, Accessor>) {
    const bufferView = gltfModel.bufferViews[primitive.extensions.KHR_draco_mesh_compression.bufferView];
    const rnBufferView = this.__getRnBufferView(bufferView, rnBuffers[bufferView.bufferIndex!]);
    const arraybufferOfBufferView = new Uint8Array(rnBufferView.getUint8Array()).buffer;

    const draco = new DracoDecoderModule();
    const decoder = new draco.Decoder();
    const dracoGeometry = this.__getGeometryFromDracoBuffer(draco, decoder, arraybufferOfBufferView);
    if (dracoGeometry == null) {
      draco.destroy(dracoGeometry);
      draco.destroy(decoder);
      return void 0;
    }
    const numPoints = dracoGeometry.num_points();

    const posAttId = decoder.GetAttributeId(dracoGeometry, draco.POSITION);
    if (posAttId == -1) {
      const errorMsg = 'Position attribute not found in draco.';
      console.error(errorMsg);
      draco.destroy(dracoGeometry);
      draco.destroy(decoder);
      return void 0;
    }

    let lengthOfRnBufferForDraco = 0;
    if (primitive.indices) {
      const count = primitive.indices.count;
      lengthOfRnBufferForDraco += count * 4;
    }
    for (let attributeName in primitive.attributes) {
      const accessor = primitive.attributes[attributeName];
      const compositionNum = CompositionType.fromString(accessor.type).getNumberOfComponents();
      const attributeByteLength = numPoints * compositionNum * 4;
      lengthOfRnBufferForDraco += attributeByteLength;
    }

    const rnDracoBuffer = new Buffer({
      byteLength: lengthOfRnBufferForDraco,
      buffer: new ArrayBuffer(lengthOfRnBufferForDraco),
      name: 'Draco'
    });

    const primitiveMode = PrimitiveMode.from(primitive.mode);
    let isTriangleStrip = false;
    if (primitiveMode === PrimitiveMode.TriangleStrip) {
      isTriangleStrip = true;
    }

    const indices = this.__getIndicesFromDraco(draco, decoder, dracoGeometry, isTriangleStrip)!;
    const indicesDracoAccessor = this.__createRnAccessor(primitive.indices, indices.length, 1, rnDracoBuffer);
    for (let i = 0; i < indices.length; i++) {
      indicesDracoAccessor.setScalar(i, indices[i], {});
    }

    for (let attributeName in primitive.attributes) {
      const attributeAccessor = primitive.attributes[attributeName];

      const compositionNum = CompositionType.fromString(attributeAccessor.type).getNumberOfComponents();
      const attributeRnDracoAccessor = this.__createRnAccessor(attributeAccessor, numPoints, compositionNum, rnDracoBuffer);

      let dracoAttributeName = attributeName;
      if (attributeName === 'TEXCOORD_0') {
        dracoAttributeName = 'TEX_COORD';
      } else if (attributeName === 'TANGENT') {
        dracoAttributeName = 'GENERIC';
      }

      const attId = decoder.GetAttributeId(dracoGeometry, draco[dracoAttributeName]);
      if (attId === -1) {
        const errorMsg = attributeName + 'attribute not found in draco.';
        console.error(errorMsg);
        continue;
      }

      const attribute = decoder.GetAttribute(dracoGeometry, attId);
      const attributeData = new draco.DracoFloat32Array();
      decoder.GetAttributeFloatForAllPoints(dracoGeometry, attribute, attributeData);

      for (let i = 0; i < numPoints; i++) {
        if (compositionNum === 1) {
          attributeRnDracoAccessor.setScalar(i, attributeData.GetValue(i * compositionNum), {});
        } else if (compositionNum === 2) {
          attributeRnDracoAccessor.setVec2(i, attributeData.GetValue(i * compositionNum), attributeData.GetValue(i * compositionNum + 1), {});
        } else if (compositionNum === 3) {
          attributeRnDracoAccessor.setVec3(i, attributeData.GetValue(i * compositionNum), attributeData.GetValue(i * compositionNum + 1), attributeData.GetValue(i * compositionNum + 2), {});
        } else if (compositionNum === 4) {
          attributeRnDracoAccessor.setVec4(i, attributeData.GetValue(i * compositionNum), attributeData.GetValue(i * compositionNum + 1), attributeData.GetValue(i * compositionNum + 2), attributeData.GetValue(i * compositionNum + 3), {});
        }
      }

      draco.destroy(attributeData);
      map.set(VertexAttribute.fromString(attributeAccessor.extras.attributeName), attributeRnDracoAccessor);
    }
    draco.destroy(dracoGeometry);
    draco.destroy(decoder);

    return indicesDracoAccessor;
  }

  static _setupTextureTransform(textureJson: any, rnMaterial: Material, textureTransformShaderSemantic: ShaderSemanticsEnum, textureRotationShaderSemantic: ShaderSemanticsEnum) {
    if (textureJson && textureJson.extensions && textureJson.extensions.KHR_texture_transform) {
      let transform = MutableVector4.zero();
      let rotation = 0;

      const transformJson = textureJson.extensions.KHR_texture_transform;
      if (transformJson.scale != null) {
        transform.x = transformJson.scale[0];
        transform.y = transformJson.scale[1];
      }
      if (transformJson.offset != null) {
        transform.z = transformJson.offset[0];
        transform.w = transformJson.offset[1];
      }
      if (transformJson.rotation != null) {
        rotation = transformJson.rotation;
      }

      rnMaterial.setParameter(textureTransformShaderSemantic, transform);
      rnMaterial.setParameter(textureRotationShaderSemantic, rotation);
    }
  }
}
