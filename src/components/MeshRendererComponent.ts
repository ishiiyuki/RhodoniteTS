import ComponentRepository from '../core/ComponentRepository';
import Component from '../core/Component';
import MeshComponent from './MeshComponent';
import WebGLResourceRepository from '../renderer/webgl/WebGLResourceRepository';
import GLSLShader from '../renderer/webgl/GLSLShader';
import { WebGLRenderingPipeline } from '../renderer/webgl/WebGLRenderingPipeline';
import RenderingPipeline from '../renderer/RenderingPipeline';
import Primitive from '../geometry/Primitive';

export default class MeshRendererComponent extends Component {
  __meshComponent?: MeshComponent;
  private __webglResourceRepository: WebGLResourceRepository = WebGLResourceRepository.getInstance();
//  __vertexShaderProgramHandles: Array<CGAPIResourceHandle> = [];
  //private __renderingPipeline: RenderingPipeline = WebGLRenderingPipeline;
  __vertexVaoHandles: Array<{
    vaoHandle: CGAPIResourceHandle, iboHandle?: CGAPIResourceHandle, vboHandles: Array<CGAPIResourceHandle>
  }> = [];
  private static __vertexVaoHandleOfPrimitiveObjectUids: Map<ObjectUID, {
    vaoHandle: CGAPIResourceHandle, iboHandle?: CGAPIResourceHandle, vboHandles: Array<CGAPIResourceHandle>
  }> = new Map();
  static __shaderProgramHandleOfPrimitiveObjectUids: Map<ObjectUID, CGAPIResourceHandle> = new Map()
  private __isVAOSet = false;

  constructor(entityUid: EntityUID, componentSid: ComponentSID) {
    super(entityUid, componentSid);
  }
  static get maxCount() {
    return 1000000;
  }

  static get componentTID(): ComponentTID {
    return 4;
  }

  private __isLoaded(index: Index) {
    if (this.__vertexVaoHandles[index] != null) {
      return true;
    } else {
      return false
    }
  }

  $create() {
    this.__meshComponent = this.__entityRepository.getComponentOfEntity(this.__entityUid, MeshComponent.componentTID) as MeshComponent;
  }

  $load() {

    const primitiveNum = this.__meshComponent!.getPrimitiveNumber();
    for(let i=0; i<primitiveNum; i++) {
      if (this.__isLoaded(i)) {
        continue;
      }
      const primitive = this.__meshComponent!.getPrimitiveAt(i);
      const vertexHandles = this.__webglResourceRepository.createVertexDataResources(primitive);
      this.__vertexVaoHandles[i] = vertexHandles;
      MeshRendererComponent.__vertexVaoHandleOfPrimitiveObjectUids.set(primitive.objectUid, vertexHandles);

      let vertexShader = GLSLShader.vertexShaderWebGL1;
      let fragmentShader = GLSLShader.fragmentShaderWebGL1;
      if (this.__webglResourceRepository.currentWebGLContextWrapper!.isWebGL2) {
        vertexShader = GLSLShader.vertexShaderWebGL2;
        fragmentShader = GLSLShader.fragmentShaderWebGL2;
      }

      const shaderProgramHandle = this.__webglResourceRepository.createShaderProgram(
        vertexShader,
        fragmentShader,
        GLSLShader.attributeNanes,
        GLSLShader.attributeSemantics
      );
      //this.__vertexShaderProgramHandles[i] = shaderProgramHandle;
      MeshRendererComponent.__shaderProgramHandleOfPrimitiveObjectUids.set(primitive.objectUid, shaderProgramHandle);
    }
  }

  $prerender(instanceIDBufferUid: CGAPIResourceHandle) {
  
    const primitiveNum = this.__meshComponent!.getPrimitiveNumber();
    for(let i=0; i<primitiveNum; i++) {
      const primitive = this.__meshComponent!.getPrimitiveAt(i);
      if (this.__isLoaded(i) && this.__isVAOSet) {
        this.__vertexVaoHandles[i] = MeshRendererComponent.__vertexVaoHandleOfPrimitiveObjectUids.get(primitive.objectUid)!;
        //this.__vertexShaderProgramHandles[i] = MeshRendererComponent.__shaderProgramHandleOfPrimitiveObjectUids.get(primitive.objectUid)!;
        continue;
      }
      this.__webglResourceRepository.setVertexDataToPipeline(this.__vertexVaoHandles[i], primitive, instanceIDBufferUid);
        this.__isVAOSet = true;
    }
    
  }

  $render() {
    // const primitiveNum = this.__meshComponent!.getPrimitiveNumber();
    //   for(let i=0; i<primitiveNum; i++) {
    //   const primitive = this.__meshComponent!.getPrimitiveAt(i);
    //   this.__renderingPipeline.render(this.__vertexVaoHandles[i].vaoHandle, this.__vertexShaderProgramHandles[i], primitive);
    // }
  }

}
ComponentRepository.registerComponentClass(MeshRendererComponent.componentTID, MeshRendererComponent);
