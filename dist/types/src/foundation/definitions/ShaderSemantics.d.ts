import { EnumClass, EnumIO } from "../misc/EnumIO";
import { CompositionTypeEnum, ComponentTypeEnum } from "../main";
import { ShaderVariableUpdateIntervalEnum } from "./ShaderVariableUpdateInterval";
import { ShaderTypeEnum } from "./ShaderType";
export interface ShaderSemanticsEnum extends EnumIO {
    singularStr: string;
    pluralStr: string;
}
export declare class ShaderSemanticsClass extends EnumClass implements ShaderSemanticsEnum {
    readonly pluralStr: string;
    constructor({ index, singularStr, pluralStr }: {
        index: number;
        singularStr: string;
        pluralStr: string;
    });
    readonly singularStr: string;
}
declare function from(index: number): ShaderSemanticsEnum;
declare function fromString(str: string): ShaderSemanticsEnum;
declare type UpdateFunc = ({ shaderProgram, firstTime, propertyName, value, args }: {
    shaderProgram: WebGLProgram;
    firstTime: boolean;
    propertyName: string;
    value: any;
    args?: Object;
}) => void;
export declare type ShaderSemanticsInfo = {
    semantic?: ShaderSemanticsEnum;
    isPlural?: boolean;
    prefix?: string;
    semanticStr?: string;
    index?: Count;
    maxIndex?: Count;
    compositionType: CompositionTypeEnum;
    componentType: ComponentTypeEnum;
    min: number;
    max: number;
    valueStep?: number;
    isSystem: boolean;
    initialValue?: any;
    updateFunc?: UpdateFunc;
    updateInteval?: ShaderVariableUpdateIntervalEnum;
    stage: ShaderTypeEnum;
    xName?: string;
    yName?: string;
    zName?: string;
    wName?: string;
    soloDatum?: boolean;
};
declare function infoToString(semanticInfo: ShaderSemanticsInfo): string | undefined;
declare function fullSemanticStr(info: ShaderSemanticsInfo): string;
declare function fullSemanticPluralStr(info: ShaderSemanticsInfo): string;
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
    infoToString: typeof infoToString;
    fullSemanticStr: typeof fullSemanticStr;
    fullSemanticPluralStr: typeof fullSemanticPluralStr;
    getShaderProperty: (materialTypeName: string, info: ShaderSemanticsInfo, memberName: string) => string;
    EntityUID: ShaderSemanticsEnum;
}>;
export {};
