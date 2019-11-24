import Accessor from "../foundation/memory/Accessor";
import CGAPIResourceRepository from "../foundation/renderer/CGAPIResourceRepository";
import Primitive from "../foundation/geometry/Primitive";
import { AttributeNames } from "./shaders/GLSLShader";
import { VertexAttributeEnum } from "../foundation/definitions/VertexAttribute";
import { TextureParameterEnum } from "../foundation/definitions/TextureParameter";
import { PixelFormatEnum } from "../foundation/definitions/PixelFormat";
import { ComponentTypeEnum } from "../foundation/definitions/ComponentType";
import WebGLContextWrapper from "./WebGLContextWrapper";
import { ShaderSemanticsInfo } from "../foundation/definitions/ShaderSemantics";
import IRenderable from "../foundation/textures/IRenderable";
import FrameBuffer from "../foundation/renderer/FrameBuffer";
import { HdriFormatEnum } from "../foundation/definitions/HdriFormat";
import Vector4 from "../foundation/math/Vector4";
import RenderPass from "../foundation/renderer/RenderPass";
import { WebGLResourceHandle, TypedArray, Index, Size, Count, CGAPIResourceHandle } from "../types/CommonTypes";
export declare type VertexHandles = {
    vaoHandle: CGAPIResourceHandle;
    iboHandle?: CGAPIResourceHandle;
    vboHandles: Array<CGAPIResourceHandle>;
    attributesFlags: Array<boolean>;
    setComplete: boolean;
};
declare type DirectTextureData = TypedArray | HTMLImageElement | HTMLCanvasElement;
export default class WebGLResourceRepository extends CGAPIResourceRepository {
    private static __instance;
    private __webglContexts;
    private __glw?;
    private __resourceCounter;
    private __webglResources;
    private constructor();
    static getInstance(): WebGLResourceRepository;
    addWebGLContext(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, asCurrent: boolean, isDebug: boolean): void;
    get currentWebGLContextWrapper(): WebGLContextWrapper | undefined;
    private getResourceNumber;
    getWebGLResource(WebGLResourceHandle: WebGLResourceHandle): WebGLObject | null;
    createIndexBuffer(accsessor: Accessor): number;
    createVertexBuffer(accessor: Accessor): number;
    createVertexBufferFromTypedArray(typedArray: TypedArray): number;
    resendVertexBuffer(primitive: Primitive, vboHandles: Array<WebGLResourceHandle>): void;
    createVertexArray(): number;
    bindTexture2D(textureSlotIndex: Index, textureUid: CGAPIResourceHandle): void;
    bindTextureCube(textureSlotIndex: Index, textureUid: CGAPIResourceHandle): void;
    createVertexDataResources(primitive: Primitive): VertexHandles;
    createVertexBufferAndIndexBuffer(primitive: Primitive): VertexHandles;
    createShaderProgram({ materialTypeName, vertexShaderStr, fragmentShaderStr, attributeNames, attributeSemantics }: {
        materialTypeName: string;
        vertexShaderStr: string;
        fragmentShaderStr: string;
        attributeNames: AttributeNames;
        attributeSemantics: Array<VertexAttributeEnum>;
    }): number;
    private __addLineNumber;
    private __checkShaderCompileStatus;
    private __checkShaderProgramLinkStatus;
    setupUniformLocations(shaderProgramUid: WebGLResourceHandle, dataArray: ShaderSemanticsInfo[]): WebGLProgram;
    private __isUniformValueDirty;
    setUniformValue(shaderProgram: WebGLProgram, semanticStr: string, firstTime: boolean, value: any, index?: Index): boolean;
    setUniformValueInner(shaderProgram: WebGLProgram, semanticStr: string, info: ShaderSemanticsInfo, isMatrix: boolean, componentNumber: number, isVector: boolean, { x, y, z, w }: {
        x: number | TypedArray | Array<number> | Array<boolean> | boolean;
        y?: number | boolean;
        z?: number | boolean;
        w?: number | boolean;
    }, { firstTime, delta }: {
        firstTime?: boolean;
        delta?: number;
    }, index?: Count): boolean;
    setVertexDataToPipeline({ vaoHandle, iboHandle, vboHandles }: {
        vaoHandle: WebGLResourceHandle;
        iboHandle?: WebGLResourceHandle;
        vboHandles: Array<WebGLResourceHandle>;
    }, primitive: Primitive, instanceIDBufferUid?: WebGLResourceHandle): void;
    createTexture(data: DirectTextureData, { level, internalFormat, width, height, border, format, type, magFilter, minFilter, wrapS, wrapT, generateMipmap, anisotropy }: {
        level: Index;
        internalFormat: TextureParameterEnum | PixelFormatEnum;
        width: Size;
        height: Size;
        border: Size;
        format: PixelFormatEnum;
        type: ComponentTypeEnum;
        magFilter: TextureParameterEnum;
        minFilter: TextureParameterEnum;
        wrapS: TextureParameterEnum;
        wrapT: TextureParameterEnum;
        generateMipmap: boolean;
        anisotropy: boolean;
    }): WebGLResourceHandle;
    createAtfTexture(atf: any, { level, internalFormat, width, height, border, format, type, magFilter, minFilter, wrapS, wrapT, generateMipmap, anisotropy }: {
        level: Index;
        internalFormat: TextureParameterEnum | PixelFormatEnum;
        width: Size;
        height: Size;
        border: Size;
        format: PixelFormatEnum;
        type: ComponentTypeEnum;
        magFilter: TextureParameterEnum;
        minFilter: TextureParameterEnum;
        wrapS: TextureParameterEnum;
        wrapT: TextureParameterEnum;
        generateMipmap: boolean;
        anisotropy: boolean;
    }): WebGLResourceHandle;
    createFrameBufferObject(): number;
    attachColorBufferToFrameBufferObject(framebuffer: FrameBuffer, index: Index, renderable: IRenderable): void;
    attachDepthBufferToFrameBufferObject(framebuffer: FrameBuffer, renderable: IRenderable): void;
    attachStencilBufferToFrameBufferObject(framebuffer: FrameBuffer, renderable: IRenderable): void;
    attachDepthStencilBufferToFrameBufferObject(framebuffer: FrameBuffer, renderable: IRenderable): void;
    private __attachDepthOrStencilBufferToFrameBufferObject;
    createRenderBuffer(width: Size, height: Size, internalFormat: TextureParameterEnum): number;
    setDrawTargets(framebuffer?: FrameBuffer): void;
    bindFramebuffer(framebuffer?: FrameBuffer): void;
    unbindFramebuffer(): void;
    createRenderTargetTexture({ width, height, level, internalFormat, format, type, magFilter, minFilter, wrapS, wrapT }: {
        width: Size;
        height: Size;
        level: Index;
        internalFormat: TextureParameterEnum | PixelFormatEnum;
        format: PixelFormatEnum;
        type: ComponentTypeEnum;
        magFilter: TextureParameterEnum;
        minFilter: TextureParameterEnum;
        wrapS: TextureParameterEnum;
        wrapT: TextureParameterEnum;
    }): number;
    createCubeTexture(mipLevelCount: Count, images: Array<{
        posX: DirectTextureData;
        negX: DirectTextureData;
        posY: DirectTextureData;
        negY: DirectTextureData;
        posZ: DirectTextureData;
        negZ: DirectTextureData;
    }>, width?: Size, height?: Size): number;
    /**
     * Create Cube Texture from image files.
     * @param baseUri the base uri to load images;
     * @param mipLevelCount the number of mip levels (include root level). if no mipmap, the value should be 1;
     * @returns the WebGLResourceHandle for the generated Cube Texture
     */
    createCubeTextureFromFiles(baseUri: string, mipLevelCount: Count, isNamePosNeg: boolean, hdriFormat: HdriFormatEnum): Promise<number>;
    createDummyBlackCubeTexture(): number;
    createDummyCubeTexture(rgbaStr?: string): number;
    createTextureFromDataUri(dataUri: string, { level, internalFormat, border, format, type, magFilter, minFilter, wrapS, wrapT, generateMipmap, anisotropy }: {
        level: Index;
        internalFormat: TextureParameterEnum | PixelFormatEnum;
        border: Size;
        format: PixelFormatEnum;
        type: ComponentTypeEnum;
        magFilter: TextureParameterEnum;
        minFilter: TextureParameterEnum;
        wrapS: TextureParameterEnum;
        wrapT: TextureParameterEnum;
        generateMipmap: boolean;
        anisotropy: boolean;
    }): Promise<WebGLResourceHandle>;
    updateTexture(textureUid: WebGLResourceHandle, typedArray: TypedArray, { level, xoffset, yoffset, width, height, format, type }: {
        level: Index;
        xoffset: Size;
        yoffset: Size;
        width: Size;
        height: Size;
        format: PixelFormatEnum;
        type: ComponentTypeEnum;
    }): void;
    deleteFrameBufferObject(frameBufferObjectHandle: WebGLResourceHandle): void;
    deleteRenderBuffer(renderBufferUid: WebGLResourceHandle): void;
    deleteTexture(textureHandle: WebGLResourceHandle): void;
    createDummyTexture(rgbaStr?: string): number;
    createDummyBlackTexture(): number;
    createDummyWhiteTexture(): number;
    createDummyNormalTexture(): number;
    __createDummyTextureInner(base64: string): number;
    createUniformBuffer(bufferView: TypedArray | DataView): number;
    updateUniformBuffer(uboUid: WebGLResourceHandle, bufferView: TypedArray | DataView): void;
    bindUniformBlock(shaderProgramUid: WebGLResourceHandle, blockName: string, blockIndex: Index): void;
    bindUniformBufferBase(blockIndex: Index, uboUid: WebGLResourceHandle): void;
    deleteUniformBuffer(uboUid: WebGLResourceHandle): void;
    createTransformFeedback(): number;
    deleteTransformFeedback(transformFeedbackUid: WebGLResourceHandle): void;
    setViewport(viewport?: Vector4): void;
    clearFrameBuffer(renderPass: RenderPass): void;
    deleteVertexDataResources(vertexHandles: VertexHandles): void;
    deleteVertexArray(vaoHandle: WebGLResourceHandle): void;
    deleteVertexBuffer(vboUid: WebGLResourceHandle): void;
}
export {};
