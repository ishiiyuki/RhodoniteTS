import ComponentRepository from '../core/ComponentRepository';
import Component from '../core/Component';
import MeshComponent from './MeshComponent';
import WebGLStrategy from '../../webgl/WebGLStrategy';
import { ProcessApproachEnum } from '../definitions/ProcessApproach';
import { ProcessStage } from '../definitions/ProcessStage';
import EntityRepository from '../core/EntityRepository';
import SceneGraphComponent from './SceneGraphComponent';
import { VertexHandles } from '../../webgl/WebGLResourceRepository';
import { WellKnownComponentTIDs } from './WellKnownComponentTIDs';
import CameraComponent from './CameraComponent';
import RowMajarMatrix44 from '../math/RowMajarMatrix44';
import Matrix44 from '../math/Matrix44';

export default class MeshRendererComponent extends Component {
  private __meshComponent?: MeshComponent;
  __vertexHandles: Array<VertexHandles> = [];
  static __shaderProgramHandleOfPrimitiveObjectUids: Map<ObjectUID, CGAPIResourceHandle> = new Map()
  private __webglRenderingStrategy?: WebGLStrategy;
  private __sceneGraphComponent?: SceneGraphComponent;
  private __cameraComponent?: CameraComponent;

  constructor(entityUid: EntityUID, componentSid: ComponentSID, entityComponent: EntityRepository) {
    super(entityUid, componentSid, entityComponent);
    this.__currentProcessStage = ProcessStage.Create;

    let count = Component.__lengthOfArrayOfProcessStages.get(ProcessStage.Create)!;
    const array: Int32Array = Component.__componentsOfProcessStages.get(ProcessStage.Create)!;
    array[count++] = this.componentSID;
    array[count] = Component.invalidComponentSID;
    Component.__lengthOfArrayOfProcessStages.set(ProcessStage.Create, count)!;

    this.__sceneGraphComponent = this.__entityRepository.getComponentOfEntity(this.__entityUid, SceneGraphComponent.componentTID) as SceneGraphComponent;
    const componentRepository = ComponentRepository.getInstance();
    const cameraComponents  = componentRepository.getComponentsWithType(CameraComponent.componentTID) as CameraComponent[];

    if (cameraComponents) {
      this.__cameraComponent = cameraComponents[0];
    }
  }

  static get componentTID(): ComponentTID {
    return WellKnownComponentTIDs.MeshRendererComponentTID;
  }

  private __isLoaded(index: Index) {
    if (this.__vertexHandles[index] != null) {
      return true;
    } else {
      return false
    }
  }

  $create({strategy}: {
    strategy: WebGLStrategy}
    ) {
    if (this.__meshComponent != null) {
      return;
    }
    this.__meshComponent = this.__entityRepository.getComponentOfEntity(this.__entityUid, MeshComponent.componentTID) as MeshComponent;

    this.__webglRenderingStrategy = strategy;

    this.moveStageTo(ProcessStage.Load);
  }

  $load() {
    this.__webglRenderingStrategy!.$load(this.__meshComponent!);
    this.moveStageTo(ProcessStage.PreRender);
  }

  $prerender(
    {processApproech, instanceIDBufferUid}:{
      processApproech: ProcessApproachEnum,
      instanceIDBufferUid: WebGLResourceHandle
    }) {

    this.__webglRenderingStrategy!.$prerender(this.__meshComponent!, instanceIDBufferUid);

    if (this.__webglRenderingStrategy!.$render != null) {
      this.moveStageTo(ProcessStage.Render);
    }
  }

  $render() {
    if (this.__webglRenderingStrategy!.$render == null) {
      return;
    }

    const primitiveNum = this.__meshComponent!.getPrimitiveNumber();
      for(let i=0; i<primitiveNum; i++) {
      const primitive = this.__meshComponent!.getPrimitiveAt(i);
      this.__webglRenderingStrategy!.$render!(i, primitive, this.__sceneGraphComponent!.worldMatrix, this.__sceneGraphComponent!.normalMatrix);
      }
    }

}
ComponentRepository.registerComponentClass(MeshRendererComponent.componentTID, MeshRendererComponent);