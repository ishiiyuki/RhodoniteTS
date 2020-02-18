import EntityRepository from './foundation/core/EntityRepository';
import ComponentRepository from './foundation/core/ComponentRepository';
import TransformComponent from './foundation/components/TransformComponent';
import SceneGraphComponent from './foundation/components/SceneGraphComponent';
import MeshComponent from './foundation/components/MeshComponent';
import MeshRendererComponent from './foundation/components/MeshRendererComponent';
import Primitive from './foundation/geometry/Primitive';
import { PrimitiveModeEnum as primitiveModeEnum } from './foundation/definitions/PrimitiveMode';
import { VertexAttributeEnum as vertexAttributeEnum } from './foundation/definitions/VertexAttribute';
import { CompositionTypeEnum as compositionTypeEnum } from './foundation/definitions/CompositionType';
import { ComponentTypeEnum as componentTypeEnum } from './foundation/definitions/ComponentType';
import { CameraControllerTypeEnum as cameraControllerTypeEnum } from './foundation/definitions/CameraControllerType';
import System from './foundation/system/System';
import Scalar from './foundation/math/Scalar';
import Vector2 from './foundation/math/Vector2';
import Vector3 from './foundation/math/Vector3';
import Vector4 from './foundation/math/Vector4';
import MutableVector2 from './foundation/math/MutableVector2';
import MutableVector3 from './foundation/math/MutableVector3';
import MutableVector4 from './foundation/math/MutableVector4';
import Matrix22 from './foundation/math/Matrix22';
import Matrix33 from './foundation/math/Matrix33';
import Matrix44 from './foundation/math/Matrix44';
import MutableMatrix22 from './foundation/math/MutableMatrix22';
import MutableMatrix33 from './foundation/math/MutableMatrix33';
import MutableMatrix44 from './foundation/math/MutableMatrix44';
import Gltf1Importer from './foundation/importer/Gltf1Importer';
import Gltf2Importer from './foundation/importer/Gltf2Importer';
import DrcPointCloudImporter from './foundation/importer/DrcPointCloudImporter';
import GltfImporter from './foundation/importer/GltfImporter';
import Gltf2Exporter from './foundation/exporter/Gltf2Exporter';
import ModelConverter from './foundation/importer/ModelConverter';
import ModuleManager from './foundation/system/ModuleManager';
import MemoryManager from './foundation/core/MemoryManager';
import CameraComponent from './foundation/components/CameraComponent';
import AnimationComponent from './foundation/components/AnimationComponent';
import LightComponent from './foundation/components/LightComponent';
import CubeTexture from './foundation/textures/CubeTexture';
import CameraControllerComponent from './foundation/components/CameraControllerComponent';
import detectFormat from './foundation/importer/FormatDetector';
import Plane from './foundation/geometry/Plane';
import Sphere from './foundation/geometry/Sphere';
import Material from './foundation/materials/core/Material';
import RenderPass from './foundation/renderer/RenderPass';
import FrameBuffer from './foundation/renderer/FrameBuffer';
import Expression from './foundation/renderer/Expression';
import RenderTargetTexture from './foundation/textures/RenderTargetTexture';
import RenderBuffer from './foundation/textures/RenderBuffer';
import Texture from './foundation/textures/Texture';
import MathClassUtil from './foundation/math/MathClassUtil';
import Mesh from './foundation/geometry/Mesh';
import Component from './foundation/core/Component';
import EnvConstantSingleMaterialNode from './foundation/materials/singles/EnvConstantSingleMaterialNode';
import RnObject from './foundation/core/RnObject';
import VRMImporter from './foundation/importer/VRMImporter';
import BlendShapeComponent from './foundation/components/BlendShapeComponent';
import AnimationAssigner from './foundation/importer/AnimationAssigner';
import OrbitCameraController from './foundation/cameras/OrbitCameraController';
import WalkThroughCameraController from './foundation/cameras/WalkThroughCameraController';
import ShaderityUtility from './foundation/materials/core/ShaderityUtility';
import AbstractMaterialNode from './foundation/materials/core/AbstractMaterialNode';
import ConstantVariableMaterialNode from './foundation/materials/nodes/ConstantVariableMaterialNode';
import AddMaterialNode from './foundation/materials/nodes/AddMaterialNode';
import DotProductMaterialNode from './foundation/materials/nodes/DotProductMaterialNode';
import MultiplyMaterialNode from './foundation/materials/nodes/MultiplyMaterialNode';
import EndMaterialNode from './foundation/materials/nodes/EndMaterialNode';
import ScalarToVector4MaterialNode from './foundation/materials/nodes/ScalarToVector4MaterialNode';
import Vector3AndScalarToVector4MaterialNode from './foundation/materials/nodes/Vector3AndScalarToVector4MaterialNode';
import AttributePositionMaterialNode from './foundation/materials/nodes/AttributePositionMaterialNode';
import AttributeNormalMaterialNode from './foundation/materials/nodes/AttributeNormalMaterialNode';
import WorldMatrixMaterialNode from './foundation/materials/nodes/WorldMatrixMaterialNode';
import ViewMatrixMaterialNode from './foundation/materials/nodes/ViewMatrixMaterialNode';
import NormalMatrixMaterialNode from './foundation/materials/nodes/NormalMatrixMaterialNode';
import ProjectionMatrixMaterialNode from './foundation/materials/nodes/ProjectionMatrixMaterialNode';
import VaryingVariableMaterialNode from './foundation/materials/nodes/VaryingVariableMaterialNode';
import UniformDataMaterialNode from './foundation/materials/nodes/UniformDataMaterialNode';
import NormalizeMaterialNode from './foundation/materials/nodes/NormalizeMaterialNode';
declare let Rn: {
    EntityRepository: typeof EntityRepository;
    ComponentRepository: typeof ComponentRepository;
    TransformComponent: typeof TransformComponent;
    SceneGraphComponent: typeof SceneGraphComponent;
    MeshComponent: typeof MeshComponent;
    MeshRendererComponent: typeof MeshRendererComponent;
    Primitive: typeof Primitive;
    CompositionType: Readonly<{
        Unknown: compositionTypeEnum;
        Scalar: compositionTypeEnum;
        Vec2: compositionTypeEnum;
        Vec3: compositionTypeEnum;
        Vec4: compositionTypeEnum;
        Mat2: compositionTypeEnum;
        Mat3: compositionTypeEnum;
        Mat4: compositionTypeEnum;
        Texture2D: compositionTypeEnum;
        TextureCube: compositionTypeEnum;
        ScalarArray: compositionTypeEnum;
        Vec2Array: compositionTypeEnum;
        Vec3Array: compositionTypeEnum;
        Vec4Array: compositionTypeEnum;
        Mat4Array: compositionTypeEnum;
        from: (index: number) => compositionTypeEnum;
        fromString: (str: string) => compositionTypeEnum;
        fromGlslString: (str_: string) => compositionTypeEnum;
        isArray: (compositionType: compositionTypeEnum) => boolean;
    }>;
    ComponentType: Readonly<{
        Unknown: componentTypeEnum;
        Byte: componentTypeEnum;
        UnsignedByte: componentTypeEnum;
        Short: componentTypeEnum;
        UnsignedShort: componentTypeEnum;
        Int: componentTypeEnum;
        UnsignedInt: componentTypeEnum;
        Float: componentTypeEnum;
        Double: componentTypeEnum;
        Bool: componentTypeEnum;
        HalfFloat: componentTypeEnum;
        from: (index: number) => componentTypeEnum;
        fromTypedArray: (typedArray: import("./commontypes/CommonTypes").TypedArray) => componentTypeEnum;
        fromString: (str: string) => componentTypeEnum;
        fromGlslString: (str_: string) => componentTypeEnum;
    }>;
    VertexAttribute: Readonly<{
        Unknown: vertexAttributeEnum;
        Position: vertexAttributeEnum;
        Normal: vertexAttributeEnum;
        Tangent: vertexAttributeEnum;
        Texcoord0: vertexAttributeEnum;
        Texcoord1: vertexAttributeEnum;
        Color0: vertexAttributeEnum;
        Joints0: vertexAttributeEnum;
        Weights0: vertexAttributeEnum;
        Instance: vertexAttributeEnum;
        FaceNormal: vertexAttributeEnum;
        BaryCentricCoord: vertexAttributeEnum;
        AttributeTypeNumber: number;
        from: (index: number) => vertexAttributeEnum;
        fromString: (str: string) => vertexAttributeEnum;
    }>;
    PrimitiveMode: Readonly<{
        Unknown: primitiveModeEnum;
        Points: primitiveModeEnum;
        Lines: primitiveModeEnum;
        LineLoop: primitiveModeEnum;
        LineStrip: primitiveModeEnum;
        Triangles: primitiveModeEnum;
        TriangleStrip: primitiveModeEnum;
        TriangleFan: primitiveModeEnum;
        from: (index: number) => primitiveModeEnum | undefined;
    }>;
    System: typeof System;
    Scalar: typeof Scalar;
    Vector2: typeof Vector2;
    Vector3: typeof Vector3;
    Vector4: typeof Vector4;
    MutableVector2: typeof MutableVector2;
    MutableVector3: typeof MutableVector3;
    MutableVector4: typeof MutableVector4;
    Matrix22: typeof Matrix22;
    Matrix33: typeof Matrix33;
    Matrix44: typeof Matrix44;
    MutableMatrix22: typeof MutableMatrix22;
    MutableMatrix33: typeof MutableMatrix33;
    MutableMatrix44: typeof MutableMatrix44;
    ProcessApproach: Readonly<{
        None: import("./foundation/definitions/ProcessApproach").ProcessApproachEnum;
        UniformWebGL1: import("./foundation/definitions/ProcessApproach").ProcessApproachEnum;
        UniformWebGL2: import("./foundation/definitions/ProcessApproach").ProcessApproachEnum;
        DataTextureWebGL1: import("./foundation/definitions/ProcessApproach").ProcessApproachEnum;
        DataTextureWebGL2: import("./foundation/definitions/ProcessApproach").ProcessApproachEnum;
        UBOWebGL2: import("./foundation/definitions/ProcessApproach").ProcessApproachEnum;
        TransformFeedbackWebGL2: import("./foundation/definitions/ProcessApproach").ProcessApproachEnum;
        FastestWebGL1: import("./foundation/definitions/ProcessApproach").ProcessApproachEnum;
    }>;
    Gltf1Importer: typeof Gltf1Importer;
    Gltf2Importer: typeof Gltf2Importer;
    DrcPointCloudImporter: typeof DrcPointCloudImporter;
    GltfImporter: typeof GltfImporter;
    ModelConverter: typeof ModelConverter;
    ModuleManager: typeof ModuleManager;
    MemoryManager: typeof MemoryManager;
    CameraComponent: typeof CameraComponent;
    CameraType: Readonly<{
        Perspective: import("./foundation/definitions/CameraType").CameraTypeEnum;
        Orthographic: import("./foundation/definitions/CameraType").CameraTypeEnum;
        Frustom: import("./foundation/definitions/CameraType").CameraTypeEnum;
        from: (index: number) => import("./foundation/definitions/CameraType").CameraTypeEnum;
        fromString: (str: string) => import("./foundation/definitions/CameraType").CameraTypeEnum;
    }>;
    AnimationComponent: typeof AnimationComponent;
    LightComponent: typeof LightComponent;
    LightType: Readonly<{
        Point: import("./foundation/definitions/LightType").LightTypeEnum;
        Directional: import("./foundation/definitions/LightType").LightTypeEnum;
        Spot: import("./foundation/definitions/LightType").LightTypeEnum;
        Ambient: import("./foundation/definitions/LightType").LightTypeEnum;
        from: (index: number) => import("./foundation/definitions/LightType").LightTypeEnum;
        fromString: (str: string) => import("./foundation/definitions/LightType").LightTypeEnum;
    }>;
    CubeTexture: typeof CubeTexture;
    CameraControllerComponent: typeof CameraControllerComponent;
    CameraControllerType: Readonly<{
        Orbit: cameraControllerTypeEnum;
        WalkThrough: cameraControllerTypeEnum;
        from: (index: number) => cameraControllerTypeEnum;
        fromString: (str: string) => cameraControllerTypeEnum;
    }>;
    AlphaMode: Readonly<{
        Opaque: import("./foundation/definitions/AlphaMode").AlphaModeEnum;
        Mask: import("./foundation/definitions/AlphaMode").AlphaModeEnum;
        Blend: import("./foundation/definitions/AlphaMode").AlphaModeEnum;
        from: (index: number) => import("./foundation/definitions/AlphaMode").AlphaModeEnum | undefined;
        fromString: (str: string) => import("./foundation/definitions/AlphaMode").AlphaModeEnum | undefined;
    }>;
    Gltf2Exporter: typeof Gltf2Exporter;
    detectFormat: typeof detectFormat;
    Config: {
        maxEntityNumber: number;
        maxLightNumberInShader: number;
        maxVertexMorphNumberInShader: number;
        maxMaterialInstanceForEachType: number;
        boneDataType: import("./foundation/definitions/BoneDataType").BoneDataTypeEnum;
        maxSkeletonNumber: number;
        maxCameraNumber: number;
        maxSizeLimitOfNonCompressedTexture: number;
        maxSkeletalBoneNumber: number;
        dataTextureWidth: number;
        dataTextureHeight: number;
        noWebGLTex2DStateCache: boolean;
    };
    Plane: typeof Plane;
    Sphere: typeof Sphere;
    Material: typeof Material;
    MaterialHelper: Readonly<{
        createMaterial: (materialName: string, materialNodes?: AbstractMaterialNode[] | undefined, maxInstancesNumber?: number | undefined) => Material;
        recreateMaterial: (materialName: string, materialNodes?: AbstractMaterialNode[] | undefined, maxInstancesNumber?: number | undefined) => Material;
        recreateCustomMaterial: (vertexShaderStr: string, pixelShaderStr: string, { additionalName, isSkinning, isLighting, isMorphing, maxInstancesNumber }?: {
            additionalName?: string | undefined;
            isSkinning?: boolean | undefined;
            isLighting?: boolean | undefined;
            isMorphing?: boolean | undefined;
            maxInstancesNumber?: number | undefined;
        }) => Material;
        createEmptyMaterial: () => Material;
        createClassicUberMaterial: ({ additionalName, isSkinning, isLighting, isMorphing, maxInstancesNumber }?: {
            additionalName?: string | undefined;
            isSkinning?: boolean | undefined;
            isLighting?: boolean | undefined;
            isMorphing?: boolean | undefined;
            maxInstancesNumber?: number | undefined;
        }) => Material;
        createPbrUberMaterial: ({ additionalName, isMorphing, isSkinning, isLighting, maxInstancesNumber }?: {
            additionalName?: string | undefined;
            isMorphing?: boolean | undefined;
            isSkinning?: boolean | undefined;
            isLighting?: boolean | undefined;
            maxInstancesNumber?: number | undefined;
        }) => Material;
        createEnvConstantMaterial: ({ additionalName, maxInstancesNumber }?: {
            additionalName?: string | undefined;
            maxInstancesNumber?: number | undefined;
        }) => Material;
        createFXAA3QualityMaterial: ({ additionalName, maxInstancesNumber }?: {
            additionalName?: string | undefined;
            maxInstancesNumber?: number | undefined;
        }) => Material;
        createDepthEncodeMaterial: ({ additionalName, isSkinning, maxInstancesNumber }?: {
            additionalName?: string | undefined;
            isSkinning?: boolean | undefined;
            maxInstancesNumber?: number | undefined;
        }) => Material;
        createShadowMapDecodeClassicSingleMaterial: (depthEncodeRenderPass: RenderPass, { additionalName, isMorphing, isSkinning, isLighting, colorAttachmentsNumber, maxInstancesNumber }?: {
            additionalName?: string | undefined;
            isMorphing?: boolean | undefined;
            isSkinning?: boolean | undefined;
            isLighting?: boolean | undefined;
            colorAttachmentsNumber?: number | undefined;
            maxInstancesNumber?: number | undefined;
        }) => Material;
        createGammaCorrectionMaterial: ({ additionalName, maxInstancesNumber }?: {
            additionalName?: string | undefined;
            maxInstancesNumber?: number | undefined;
        }) => Material;
        createEntityUIDOutputMaterial: ({ additionalName, maxInstancesNumber }?: {
            additionalName?: string | undefined;
            maxInstancesNumber?: number | undefined;
        }) => Material;
        createMToonMaterial: ({ additionalName, isMorphing, isSkinning, isLighting, isOutline, materialProperties, textures, debugMode, maxInstancesNumber }?: {
            additionalName?: string | undefined;
            isMorphing?: boolean | undefined;
            isSkinning?: boolean | undefined;
            isLighting?: boolean | undefined;
            isOutline?: boolean | undefined;
            materialProperties?: undefined;
            textures?: undefined;
            debugMode?: undefined;
            maxInstancesNumber?: number | undefined;
        }) => Material;
        changeMaterial: (entity: import("./foundation/core/Entity").default, primitive: Primitive, material: Material) => void;
    }>;
    ShaderSemantics: Readonly<{
        from: (index: number) => import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        fromString: (str: string) => import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        fromStringCaseSensitively: (str: string) => import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        WorldMatrix: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        ViewMatrix: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        ProjectionMatrix: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        NormalMatrix: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        BoneMatrix: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        BaseColorFactor: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        BaseColorTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        NormalTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        MetallicRoughnessTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        OcclusionTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        EmissiveTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        LightNumber: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        LightPosition: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        LightDirection: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        LightIntensity: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        MetallicRoughnessFactor: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        BrdfLutTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        DiffuseEnvTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        SpecularEnvTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        IBLParameter: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        ViewPosition: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        Wireframe: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        DiffuseColorFactor: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        DiffuseColorTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        SpecularColorFactor: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        SpecularColorTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        Shininess: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        ShadingModel: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        SkinningMode: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        GeneralTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        VertexAttributesExistenceArray: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        BoneQuaternion: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        BoneTranslateScale: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        BoneCompressedChunk: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        BoneCompressedInfo: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        PointSize: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        ColorEnvTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        PointDistanceAttenuation: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        HDRIFormat: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        ScreenInfo: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        DepthTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        LightViewProjectionMatrix: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        Anisotropy: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        ClearCoatParameter: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        SheenParameter: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        SpecularGlossinessFactor: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        SpecularGlossinessTexture: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        fullSemanticStr: (info: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsInfo) => string;
        getShaderProperty: (materialTypeName: string, info: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsInfo, propertyIndex: number, isGlobalData: boolean) => string;
        EntityUID: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        MorphTargetNumber: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        DataTextureMorphOffsetPosition: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        MorphWeights: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
        CurrentComponentSIDs: import("./foundation/definitions/ShaderSemantics").ShaderSemanticsEnum;
    }>;
    RenderPass: typeof RenderPass;
    FrameBuffer: typeof FrameBuffer;
    Expression: typeof Expression;
    HdriFormat: Readonly<{
        LDR_SRGB: import("./foundation/definitions/HdriFormat").HdriFormatEnum;
        LDR_LINEAR: import("./foundation/definitions/HdriFormat").HdriFormatEnum;
        HDR: import("./foundation/definitions/HdriFormat").HdriFormatEnum;
        RGBE_PNG: import("./foundation/definitions/HdriFormat").HdriFormatEnum;
        RGB9_E5_PNG: import("./foundation/definitions/HdriFormat").HdriFormatEnum;
        OpenEXR: import("./foundation/definitions/HdriFormat").HdriFormatEnum;
    }>;
    ShaderType: Readonly<{
        VertexShader: import("./foundation/definitions/ShaderType").ShaderTypeEnum;
        PixelShader: import("./foundation/definitions/ShaderType").ShaderTypeEnum;
        VertexAndPixelShader: import("./foundation/definitions/ShaderType").ShaderTypeEnum;
        ComputeShader: import("./foundation/definitions/ShaderType").ShaderTypeEnum;
        from: (index: number) => import("./foundation/definitions/ShaderType").ShaderTypeEnum;
        fromString: (str: string) => import("./foundation/definitions/ShaderType").ShaderTypeEnum;
    }>;
    RenderTargetTexture: typeof RenderTargetTexture;
    RenderBuffer: typeof RenderBuffer;
    TextureParameter: Readonly<{
        Nearest: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        Linear: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        LinearMipmapLinear: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        TextureMagFilter: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        TextureMinFilter: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        TextureWrapS: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        TextureWrapT: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        Texture2D: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        Texture: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        Texture0: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        Texture1: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        ActiveTexture: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        Repeat: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        ClampToEdge: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        RGB8: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        RGBA8: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        RGB10_A2: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        RGB16F: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        RGB32F: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        RGBA16F: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        RGBA32F: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        Depth16: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        Depth24: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        Depth32F: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        Depth24Stencil8: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
        Depth32FStencil8: import("./foundation/definitions/TextureParameter").TextureParameterEnum;
    }>;
    RenderableHelper: Readonly<{
        createTexturesForRenderTarget: (width: number, height: number, textureNum: number, { level, internalFormat, format, type, magFilter, minFilter, wrapS, wrapT }: {
            level?: number | undefined;
            internalFormat?: import("./foundation/definitions/PixelFormat").PixelFormatEnum | undefined;
            format?: import("./foundation/definitions/PixelFormat").PixelFormatEnum | undefined;
            type?: componentTypeEnum | undefined;
            magFilter?: import("./foundation/definitions/TextureParameter").TextureParameterEnum | undefined;
            minFilter?: import("./foundation/definitions/TextureParameter").TextureParameterEnum | undefined;
            wrapS?: import("./foundation/definitions/TextureParameter").TextureParameterEnum | undefined;
            wrapT?: import("./foundation/definitions/TextureParameter").TextureParameterEnum | undefined;
        }) => FrameBuffer;
    }>;
    Texture: typeof Texture;
    EntityHelper: Readonly<{
        createGroupEntity: () => import("./foundation/core/Entity").default;
        createMeshEntity: () => import("./foundation/core/Entity").default;
        createCameraEntity: () => import("./foundation/core/Entity").default;
        createCameraWithControllerEntity: () => import("./foundation/core/Entity").default;
    }>;
    MathClassUtil: typeof MathClassUtil;
    Mesh: typeof Mesh;
    MathUtil: Readonly<{
        radianToDegree: (rad: number) => number;
        degreeToRadian: (deg: number) => number;
        toHalfFloat: (val: number) => number;
        isPowerOfTwo: (x: number) => boolean;
        isPowerOfTwoTexture: (width: number, height: number) => boolean;
        packNormalizedVec4ToVec2: (x: number, y: number, z: number, w: number, criteria: number) => number[];
        convertToStringAsGLSLFloat: (value: number) => string;
    }>;
    Component: typeof Component;
    EnvConstantSingleMaterialNode: typeof EnvConstantSingleMaterialNode;
    RnObject: typeof RnObject;
    VRMImporter: typeof VRMImporter;
    BlendShapeComponent: typeof BlendShapeComponent;
    AnimationAssigner: typeof AnimationAssigner;
    MiscUtil: Readonly<{
        isMobile: () => boolean;
        preventDefaultForDesktopOnly: (e: Event) => void;
        isObject: (o: any) => boolean;
        fillTemplate: (templateString: string, templateVars: string) => any;
        isNode: () => boolean;
        concatArrayBuffers: (segments: ArrayBuffer[], sizes: number[], paddingSize: number) => ArrayBuffer | SharedArrayBuffer;
    }>;
    OrbitCameraController: typeof OrbitCameraController;
    WalkThroughCameraController: typeof WalkThroughCameraController;
    BoneDataType: Readonly<{
        Mat4x4: import("./foundation/definitions/BoneDataType").BoneDataTypeEnum;
        Vec4x2: import("./foundation/definitions/BoneDataType").BoneDataTypeEnum;
        Vec4x1: import("./foundation/definitions/BoneDataType").BoneDataTypeEnum;
        from: (index: number) => import("./foundation/definitions/BoneDataType").BoneDataTypeEnum;
        fromString: (str: string) => import("./foundation/definitions/BoneDataType").BoneDataTypeEnum;
    }>;
    ShaderityUtility: typeof ShaderityUtility;
    AbstractMaterialNode: typeof AbstractMaterialNode;
    PixelFormat: Readonly<{
        DepthComponent: import("./foundation/definitions/PixelFormat").PixelFormatEnum;
        Alpha: import("./foundation/definitions/PixelFormat").PixelFormatEnum;
        RGB: import("./foundation/definitions/PixelFormat").PixelFormatEnum;
        RGBA: import("./foundation/definitions/PixelFormat").PixelFormatEnum;
        Luminance: import("./foundation/definitions/PixelFormat").PixelFormatEnum;
        LuminanceAlpha: import("./foundation/definitions/PixelFormat").PixelFormatEnum;
    }>;
    ConstantVariableMaterialNode: typeof ConstantVariableMaterialNode;
    AddMaterialNode: typeof AddMaterialNode;
    DotProductMaterialNode: typeof DotProductMaterialNode;
    MultiplyMaterialNode: typeof MultiplyMaterialNode;
    EndMaterialNode: typeof EndMaterialNode;
    ScalarToVector4MaterialNode: typeof ScalarToVector4MaterialNode;
    Vector3AndScalarToVector4MaterialNode: typeof Vector3AndScalarToVector4MaterialNode;
    AttributePositionMaterialNode: typeof AttributePositionMaterialNode;
    AttributeNormalMaterialNode: typeof AttributeNormalMaterialNode;
    WorldMatrixMaterialNode: typeof WorldMatrixMaterialNode;
    ViewMatrixMaterialNode: typeof ViewMatrixMaterialNode;
    ProjectionMatrixMaterialNode: typeof ProjectionMatrixMaterialNode;
    VaryingVariableMaterialNode: typeof VaryingVariableMaterialNode;
    NormalMatrixMaterialNode: typeof NormalMatrixMaterialNode;
    UniformDataMaterialNode: typeof UniformDataMaterialNode;
    NormalizeMaterialNode: typeof NormalizeMaterialNode;
};
export declare type RnType = typeof Rn;
export declare type CompositionTypeEnum = compositionTypeEnum;
export declare type ComponentTypeEnum = componentTypeEnum;
export declare type VertexAttributeEnum = vertexAttributeEnum;
export declare type PrimitiveModeEnum = primitiveModeEnum;
export declare type CameraControllerTypeEnum = cameraControllerTypeEnum;
export {};
