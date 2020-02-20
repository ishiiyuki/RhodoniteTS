import { CompositionTypeEnum } from "../../foundation/definitions/CompositionType";
import { ShaderAttributeOrSemanticsOrString } from "../../foundation/materials/core/AbstractMaterialNode";
import { VertexAttributeEnum } from "../../foundation/definitions/VertexAttribute";
import WebGLResourceRepository from "../WebGLResourceRepository";
export declare type AttributeNames = Array<string>;
export default abstract class GLSLShader {
    static __instance: GLSLShader;
    __webglResourceRepository?: WebGLResourceRepository;
    constructor();
    get glsl_rt0(): "layout(location = 0) out vec4 rt0;\n" | "vec4 rt0;\n";
    get glsl_fragColor(): "" | "gl_FragColor = rt0;\n";
    get glsl_vertex_in(): "in" | "attribute";
    get glsl_fragment_in(): "in" | "varying";
    get glsl_vertex_out(): "varying" | "out";
    get glsl_vertex_centroid_out(): "varying" | "centroid out";
    get glsl_texture(): "texture" | "texture2D";
    get glsl_textureCube(): "texture" | "textureCube";
    get glsl_textureProj(): "textureProj" | "texture2DProj";
    get glsl_versionText(): string;
    get glslPrecision(): string;
    static get glslMainBegin(): string;
    static get glslMainEnd(): string;
    getGlslVertexShaderProperies(str?: string): string;
    get glsl1ShaderTextureLodExt(): "" | "#extension GL_EXT_shader_texture_lod : require";
    get glsl1ShaderDerivativeExt(): "" | "#extension GL_OES_standard_derivatives : require";
    get toNormalMatrix(): string;
    get getSkinMatrix(): string;
    get packing(): string;
    get processGeometryWithSkinningOptionally(): string;
    get prerequisites(): string;
    get mainPrerequisites(): string;
    get pointSprite(): string;
    get pbrUniformDefinition(): string;
    get mipmapLevel(): string;
    get pbrMethodDefinition(): string;
    get simpleMVPPosition(): string;
    static getStringFromShaderAnyDataType(data: ShaderAttributeOrSemanticsOrString): string;
    abstract get attributeNames(): AttributeNames;
    abstract get attributeSemantics(): Array<VertexAttributeEnum>;
    abstract get attributeCompositions(): Array<CompositionTypeEnum>;
}
