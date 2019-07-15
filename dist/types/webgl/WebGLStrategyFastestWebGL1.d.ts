import WebGLStrategy from "./WebGLStrategy";
import MeshComponent from "../foundation/components/MeshComponent";
import Primitive from "../foundation/geometry/Primitive";
import WebGLContextWrapper from "./WebGLContextWrapper";
import Matrix44 from "../foundation/math/Matrix44";
import Material from "../foundation/materials/Material";
import Mesh from "../foundation/geometry/Mesh";
import MeshRendererComponent from "../foundation/components/MeshRendererComponent";
import RenderPass from "../foundation/renderer/RenderPass";
import { WebGLResourceHandle, Index } from "../types/CommonTypes";
export default class WebGLStrategyFastestWebGL1 implements WebGLStrategy {
    private static __instance;
    private __webglResourceRepository;
    private __dataTextureUid;
    private __lastShader;
    private static __shaderProgram;
    private __materialSIDLocation?;
    private __lightComponents?;
    private constructor();
    readonly vertexShaderMethodDefinitions_dataTexture: string;
    setupShaderProgram(meshComponent: MeshComponent): void;
    private __isLoaded;
    $load(meshComponent: MeshComponent): void;
    $prerender(meshComponent: MeshComponent, meshRendererComponent: MeshRendererComponent, instanceIDBufferUid: WebGLResourceHandle): void;
    common_$prerender(): void;
    attachGPUData(primitive: Primitive): void;
    attachGPUDataInner(gl: WebGLRenderingContext, shaderProgram: WebGLProgram): void;
    attatchShaderProgram(material: Material): void;
    attachVertexData(i: number, primitive: Primitive, glw: WebGLContextWrapper, instanceIDBufferUid: WebGLResourceHandle): void;
    attachVertexDataInner(mesh: Mesh, primitive: Primitive, primitiveIndex: Index, glw: WebGLContextWrapper, instanceIDBufferUid: WebGLResourceHandle): void;
    static getInstance(): WebGLStrategyFastestWebGL1;
    private __setupMaterial;
    private __setupMaterialEveryFrame;
    common_$render(primitive_: Primitive, viewMatrix: Matrix44, projectionMatrix: Matrix44, renderPass: RenderPass): boolean;
}
