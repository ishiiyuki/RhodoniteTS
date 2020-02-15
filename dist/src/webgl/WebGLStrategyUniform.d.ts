import WebGLStrategy from "./WebGLStrategy";
import MeshComponent from "../foundation/components/MeshComponent";
import WebGLContextWrapper from "./WebGLContextWrapper";
import Primitive from "../foundation/geometry/Primitive";
import Matrix44 from "../foundation/math/Matrix44";
import Matrix33 from "../foundation/math/Matrix33";
import Entity from "../foundation/core/Entity";
import { ShaderSemanticsInfo } from "../foundation/definitions/ShaderSemantics";
import CubeTexture from "../foundation/textures/CubeTexture";
import MeshRendererComponent from "../foundation/components/MeshRendererComponent";
import Material from "../foundation/materials/Material";
import RenderPass from "../foundation/renderer/RenderPass";
import Mesh from "../foundation/geometry/Mesh";
import { WebGLResourceHandle, Index, Count } from "../types/CommonTypes";
export default class WebGLStrategyUniform implements WebGLStrategy {
    private static __instance;
    private __webglResourceRepository;
    private __dataTextureUid;
    private __lastShader;
    private __lastMaterial?;
    private __lastRenderPassTickCount;
    private __lightComponents?;
    private static __globalDataRepository;
    private static __vertexShaderMethodDefinitions_uniform;
    private constructor();
    setupShaderProgram(meshComponent: MeshComponent): void;
    setupDefaultShaderSemantics(material: Material, isPointSprite: boolean): void;
    static setupMaterial(material: Material, args?: ShaderSemanticsInfo[]): void;
    $load(meshComponent: MeshComponent): Promise<void>;
    $prerender(meshComponent: MeshComponent, meshRendererComponent: MeshRendererComponent, instanceIDBufferUid: WebGLResourceHandle): void;
    common_$prerender(): void;
    attachGPUData(primitive: Primitive): void;
    attachShaderProgram(material: Material): void;
    attachVertexData(i: number, primitive: Primitive, glw: WebGLContextWrapper, instanceIDBufferUid: WebGLResourceHandle): void;
    attachVertexDataInner(mesh: Mesh, primitive: Primitive, primitiveIndex: Index, glw: WebGLContextWrapper, instanceIDBufferUid: WebGLResourceHandle): void;
    dettachVertexData(glw: WebGLContextWrapper): void;
    static getInstance(): WebGLStrategyUniform;
    common_$render(meshComponentSids: Int32Array, meshComponents: MeshComponent[], viewMatrix: Matrix44, projectionMatrix: Matrix44, renderPass: RenderPass): boolean;
    $render(idx: Index, meshComponent: MeshComponent, worldMatrix: Matrix44, normalMatrix: Matrix33, entity: Entity, renderPass: RenderPass, renderPassTickCount: Count, diffuseCube?: CubeTexture, specularCube?: CubeTexture): void;
    setCamera(renderPass: RenderPass): void;
}