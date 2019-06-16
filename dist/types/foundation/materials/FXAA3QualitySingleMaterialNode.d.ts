import AbstractMaterialNode from "./AbstractMaterialNode";
export default class FXAA3QualitySingleMaterialNode extends AbstractMaterialNode {
    private static __dummyWhiteTextureUid;
    private static __dummyBlackTextureUid;
    private static __dummyBlackCubeTextureUid;
    private static __pbrCookTorranceBrdfLutDataUrlUid;
    constructor();
    static initDefaultTextures(): Promise<void>;
}