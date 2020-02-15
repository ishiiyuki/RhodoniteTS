import RnObject from "../../core/RnObject";
import { ShaderSemanticsInfo, ShaderSemanticsEnum, ShaderSemanticsStr } from "../../definitions/ShaderSemantics";
import { CompositionTypeEnum } from "../../definitions/CompositionType";
import { ComponentTypeEnum } from "../../definitions/ComponentType";
import GLSLShader from "../../../webgl/shaders/GLSLShader";
import Matrix44 from "../../math/Matrix44";
import WebGLResourceRepository from "../../../webgl/WebGLResourceRepository";
import Texture from "../../textures/Texture";
import CubeTexture from "../../textures/CubeTexture";
import LightComponent from "../../components/LightComponent";
import CameraComponent from "../../components/CameraComponent";
import SkeletalComponent from "../../components/SkeletalComponent";
import Material from "./Material";
import MutableVector2 from "../../math/MutableVector2";
import MutableVector4 from "../../math/MutableVector4";
import MeshComponent from "../../components/MeshComponent";
import Primitive from "../../geometry/Primitive";
import { VertexAttributeEnum } from "../../definitions/VertexAttribute";
import BlendShapeComponent from "../../components/BlendShapeComponent";
import { ShaderityObject } from "shaderity";
export declare type ShaderAttributeOrSemanticsOrString = string | VertexAttributeEnum | ShaderSemanticsEnum;
export declare type ShaderSocket = {
    compositionType: CompositionTypeEnum;
    componentType: ComponentTypeEnum;
    name: ShaderAttributeOrSemanticsOrString;
    isImmediateValue: boolean;
    immediateValue?: string;
};
declare type MaterialNodeTypeName = string;
declare type MaterialNodeUID = number;
declare type InputConnectionType = {
    materialNodeUid: number;
    outputNameOfPrev: string;
    inputNameOfThis: string;
};
export default abstract class AbstractMaterialNode extends RnObject {
    protected __semantics: ShaderSemanticsInfo[];
    protected static __semanticsMap: Map<MaterialNodeTypeName, Map<ShaderSemanticsStr, ShaderSemanticsInfo>>;
    private __shaderNode;
    protected __vertexInputs: ShaderSocket[];
    protected __pixelInputs: ShaderSocket[];
    protected __vertexOutputs: ShaderSocket[];
    protected __pixelOutputs: ShaderSocket[];
    private static readonly __invalidMaterialNodeUid;
    private static __invalidMaterialNodeCount;
    private __materialNodeUid;
    protected __vertexInputConnections: InputConnectionType[];
    protected __pixelInputConnections: InputConnectionType[];
    static materialNodes: AbstractMaterialNode[];
    readonly shader: GLSLShader | null;
    readonly shaderFunctionName: string;
    isSingleOperation: boolean;
    protected __definitions: string;
    protected __webglResourceRepository: WebGLResourceRepository;
    protected static __gl?: WebGLRenderingContext;
    private static __transposedMatrix44;
    protected static __dummyWhiteTexture: Texture;
    protected static __dummyBlueTexture: Texture;
    protected static __dummyBlackTexture: Texture;
    protected static __dummyBlackCubeTexture: CubeTexture;
    protected static __tmp_vector4: MutableVector4;
    protected static __tmp_vector2: MutableVector2;
    private __isMorphing;
    private __isSkinning;
    private __isLighting;
    private static __lightPositions;
    private static __lightDirections;
    private static __lightIntensities;
    protected __vertexShaderityObject?: ShaderityObject;
    protected __pixelShaderityObject?: ShaderityObject;
    constructor(shader: GLSLShader | null, shaderFunctionName: string, { isMorphing, isSkinning, isLighting }?: {
        isMorphing?: boolean | undefined;
        isSkinning?: boolean | undefined;
        isLighting?: boolean | undefined;
    }, vertexShaderityObject?: ShaderityObject, pixelShaderityObject?: ShaderityObject);
    get vertexShaderityObject(): ShaderityObject | undefined;
    get pixelShaderityObject(): ShaderityObject | undefined;
    get definitions(): string;
    static getMaterialNode(materialNodeUid: MaterialNodeUID): AbstractMaterialNode;
    get materialNodeUid(): number;
    get _semanticsInfoArray(): ShaderSemanticsInfo[];
    get isSkinning(): boolean;
    get isMorphing(): boolean;
    get isLighting(): boolean;
    setShaderSemanticsInfoArray(shaderSemanticsInfoArray: ShaderSemanticsInfo[]): void;
    getShaderSemanticInfoFromName(name: string): ShaderSemanticsInfo | undefined;
    addVertexInputConnection(materialNode: AbstractMaterialNode, outputNameOfPrev: string, inputNameOfThis: string): void;
    addPixelInputConnection(materialNode: AbstractMaterialNode, outputNameOfPrev: string, inputNameOfThis: string): void;
    get vertexInputConnections(): InputConnectionType[];
    get pixelInputConnections(): InputConnectionType[];
    getVertexInput(name: string): ShaderSocket | undefined;
    getVertexOutput(name: string): ShaderSocket | undefined;
    getPixelInput(name: string): ShaderSocket | undefined;
    getPixelOutput(name: string): ShaderSocket | undefined;
    static initDefaultTextures(): void;
    static get dummyWhiteTexture(): Texture;
    static get dummyBlackTexture(): Texture;
    static get dummyBlueTexture(): Texture;
    static get dummyBlackCubeTexture(): Texture;
    protected setWorldMatrix(shaderProgram: WebGLProgram, worldMatrix: Matrix44): void;
    protected setNormalMatrix(shaderProgram: WebGLProgram, normalMatrix: Matrix44): void;
    protected setViewInfo(shaderProgram: WebGLProgram, cameraComponent: CameraComponent, material: Material, setUniform: boolean): void;
    protected setProjection(shaderProgram: WebGLProgram, cameraComponent: CameraComponent, material: Material, setUniform: boolean): void;
    protected setSkinning(shaderProgram: WebGLProgram, skeletalComponent: SkeletalComponent, setUniform: boolean): void;
    protected setLightsInfo(shaderProgram: WebGLProgram, lightComponents: LightComponent[], material: Material, setUniform: boolean): void;
    setMorphInfo(shaderProgram: WebGLProgram, meshComponent: MeshComponent, blendShapeComponent: BlendShapeComponent, primitive: Primitive): void;
    setParametersForGPU({ material, shaderProgram, firstTime, args }: {
        material: Material;
        shaderProgram: WebGLProgram;
        firstTime: boolean;
        args?: any;
    }): void;
}
export {};