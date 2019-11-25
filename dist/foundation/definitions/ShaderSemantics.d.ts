import { EnumClass, EnumIO } from "../misc/EnumIO";
import { CompositionTypeEnum, ComponentTypeEnum } from "../../rhodonite";
import { ShaderVariableUpdateIntervalEnum } from "./ShaderVariableUpdateInterval";
import { ShaderTypeEnum } from "./ShaderType";
import { Count, Index } from "../../types/CommonTypes";
export declare type ShaderSemanticsIndex = number;
export interface ShaderSemanticsEnum extends EnumIO {
    str: string;
}
export declare class ShaderSemanticsClass extends EnumClass implements ShaderSemanticsEnum {
    private static __indexCount;
    static readonly _scale = 10000;
    private static __classes;
    constructor({ str }: {
        index?: number;
        str: string;
    });
    static getShaderSemanticByIndex(index: Index): ShaderSemanticsClass;
    static isNonArrayShaderSemanticIndex(index: Index): boolean;
    static isArrayAndZeroIndexShaderSemanticIndex(index: Index): boolean;
    static isArrayAndNonZeroIndexShaderSemanticIndex(index: Index): boolean;
}
declare function from(index: number): ShaderSemanticsEnum;
declare function fromString(str: string): ShaderSemanticsEnum;
export declare type ShaderSemanticsInfo = {
    semantic: ShaderSemanticsEnum;
    prefix?: string;
    index?: Count;
    maxIndex?: Count;
    setEach?: boolean;
    compositionType: CompositionTypeEnum;
    componentType: ComponentTypeEnum;
    min: number;
    max: number;
    valueStep?: number;
    isSystem: boolean;
    initialValue?: any;
    updateInteval?: ShaderVariableUpdateIntervalEnum;
    stage: ShaderTypeEnum;
    xName?: string;
    yName?: string;
    zName?: string;
    wName?: string;
    soloDatum?: boolean;
    isComponentData?: boolean;
    noControlUi?: boolean;
    needUniformInFastest?: boolean;
};
declare function fullSemanticStr(info: ShaderSemanticsInfo): string;
export declare const ShaderSemantics: Readonly<{
    WorldMatrix: ShaderSemanticsEnum;
    ViewMatrix: ShaderSemanticsEnum;
    ProjectionMatrix: ShaderSemanticsEnum;
    NormalMatrix: ShaderSemanticsEnum;
    BoneMatrix: ShaderSemanticsEnum;
    BaseColorFactor: ShaderSemanticsEnum;
    BaseColorTexture: ShaderSemanticsEnum;
    NormalTexture: ShaderSemanticsEnum;
    MetallicRoughnessTexture: ShaderSemanticsEnum;
    OcclusionTexture: ShaderSemanticsEnum;
    EmissiveTexture: ShaderSemanticsEnum;
    LightNumber: ShaderSemanticsEnum;
    LightPosition: ShaderSemanticsEnum;
    LightDirection: ShaderSemanticsEnum;
    LightIntensity: ShaderSemanticsEnum;
    MetallicRoughnessFactor: ShaderSemanticsEnum;
    BrdfLutTexture: ShaderSemanticsEnum;
    DiffuseEnvTexture: ShaderSemanticsEnum;
    SpecularEnvTexture: ShaderSemanticsEnum;
    IBLParameter: ShaderSemanticsEnum;
    ViewPosition: ShaderSemanticsEnum;
    Wireframe: ShaderSemanticsEnum;
    DiffuseColorFactor: ShaderSemanticsEnum;
    DiffuseColorTexture: ShaderSemanticsEnum;
    SpecularColorFactor: ShaderSemanticsEnum;
    SpecularColorTexture: ShaderSemanticsEnum;
    Shininess: ShaderSemanticsEnum;
    ShadingModel: ShaderSemanticsEnum;
    SkinningMode: ShaderSemanticsEnum;
    GeneralTexture: ShaderSemanticsEnum;
    VertexAttributesExistenceArray: ShaderSemanticsEnum;
    BoneQuaternion: ShaderSemanticsEnum;
    BoneTranslateScale: ShaderSemanticsEnum;
    BoneCompressedChank: ShaderSemanticsEnum;
    BoneCompressedInfo: ShaderSemanticsEnum;
    PointSize: ShaderSemanticsEnum;
    ColorEnvTexture: ShaderSemanticsEnum;
    PointDistanceAttenuation: ShaderSemanticsEnum;
    HDRIFormat: ShaderSemanticsEnum;
    ScreenInfo: ShaderSemanticsEnum;
    DepthTexture: ShaderSemanticsEnum;
    LightViewProjectionMatrix: ShaderSemanticsEnum;
    Anisotropy: ShaderSemanticsEnum;
    ClearCoatParameter: ShaderSemanticsEnum;
    SheenParameter: ShaderSemanticsEnum;
    SpecularGlossinessFactor: ShaderSemanticsEnum;
    SpecularGlossinessTexture: ShaderSemanticsEnum;
    from: typeof from;
    fromString: typeof fromString;
    fullSemanticStr: typeof fullSemanticStr;
    getShaderProperty: (materialTypeName: string, info: ShaderSemanticsInfo, propertyIndex: number, isGlobalData: boolean) => string;
    EntityUID: ShaderSemanticsEnum;
    MorphTargetNumber: ShaderSemanticsEnum;
    DataTextureMorphOffsetPosition: ShaderSemanticsEnum;
    MorphWeights: ShaderSemanticsEnum;
    CurrentComponentSIDs: ShaderSemanticsEnum;
}>;
export {};