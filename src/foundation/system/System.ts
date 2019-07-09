import { ProcessStageEnum, ProcessStage } from "../definitions/ProcessStage";
import ComponentRepository from "../core/ComponentRepository";
import { ProcessApproachEnum, ProcessApproach } from "../definitions/ProcessApproach";
import ModuleManager from "./ModuleManager";
import CGAPIResourceRepository from "../renderer/CGAPIResourceRepository";
import WebGLStrategy from "../../webgl/WebGLStrategy";
import Component from "../core/Component";
import Expression from "../renderer/Expression";
import RenderPass from "../renderer/RenderPass";
import MeshRendererComponent from "../components/MeshRendererComponent";
import EntityRepository from "../core/EntityRepository";
import { ComponentType } from "../definitions/ComponentType";
import CameraComponent from "../components/CameraComponent";
import MemoryManager from "../core/MemoryManager";

export default class System {
  private static __instance: System;
  private __processStages: Array<ProcessStageEnum> = [
    ProcessStage.Create,
    ProcessStage.Load,
    ProcessStage.Mount,
    ProcessStage.Logic,
    ProcessStage.PreRender,
    ProcessStage.Render,
    ProcessStage.Unmount,
    ProcessStage.Discard
  ];
  private __componentRepository: ComponentRepository = ComponentRepository.getInstance();
  private __entityRepository: EntityRepository = EntityRepository.getInstance();
  private __processApproach: ProcessApproachEnum = ProcessApproach.None;
  private __webglResourceRepository = CGAPIResourceRepository.getWebGLResourceRepository();
  private __webglStrategy?: WebGLStrategy;
  private __localExpression = new Expression();
  private __localRenderPass = new RenderPass();
  private __lastEntitiesNumber = -1;
  private __renderPassTickCount = 0;

  private constructor() {
    this.__localExpression.addRenderPasses([this.__localRenderPass]);
  }

  process(expression?: Expression) {
    if (this.__processApproach === ProcessApproach.None) {
      throw new Error('Choose a process approach first.');
    }

    let exp = (expression != null) ? expression : this.__localExpression;
    if (exp === this.__localExpression && this.__entityRepository.getEntitiesNumber() !== this.__lastEntitiesNumber) {
      this.__localRenderPass.clearEntities();
      this.__localRenderPass.addEntities(this.__entityRepository._getEntities());

      this.__lastEntitiesNumber = this.__entityRepository.getEntitiesNumber();
    }


    for (let stage of this.__processStages) {
      const methodName = stage.getMethodName();
      const commonMethodName = 'common_'+methodName;
      const componentTids = this.__componentRepository.getComponentTIDs();
      for (let componentTid of componentTids) {

        let loopN = 1;
        let renderPass;
        if (componentTid === MeshRendererComponent.componentTID) {
          loopN = exp!.renderPasses.length;
        }

        for (let i=0; i<loopN; i++) {
          renderPass = exp!.renderPasses[i];
          if (componentTid === MeshRendererComponent.componentTID && (stage == ProcessStage.Render)) {
            this.__webglResourceRepository.bindFramebuffer(renderPass.getFramebuffer());
            this.__webglResourceRepository.setViewport(renderPass.getViewport());
            this.__webglResourceRepository.setDrawTargets(renderPass.getFramebuffer());
            this.__webglResourceRepository.clearFrameBuffer(renderPass);
          }

          const componentClass: typeof Component = ComponentRepository.getComponentClass(componentTid)!;
          const componentClass_commonMethod = (componentClass as any)[commonMethodName];
          if (componentClass_commonMethod) {
            componentClass_commonMethod({processApproach: this.__processApproach, renderPass: renderPass});
          }

          componentClass.updateComponentsOfEachProcessStage(componentClass, stage, this.__componentRepository, renderPass);
          componentClass.process({
            componentType: componentClass,
            processStage:stage,
            processApproach:this.__processApproach,
            componentRepository: this.__componentRepository,
            strategy: this.__webglStrategy!,
            renderPass: renderPass,
            renderPassTickCount: this.__renderPassTickCount
          });

          this.__renderPassTickCount++;
        }
      }
    }
  }

  setProcessApproachAndCanvas(approach: ProcessApproachEnum, canvas: HTMLCanvasElement, memoryUsageOrder: number = 1) {
    const moduleManager = ModuleManager.getInstance();
    const moduleName = 'webgl';
    const webglModule = (moduleManager.getModule(moduleName)! as any);
    this.__webglStrategy = webglModule.getRenderingStrategy(approach);
    const repo = webglModule.WebGLResourceRepository.getInstance();

    let gl;
    if (approach === ProcessApproach.DataTextureWebGL2 ||
       approach === ProcessApproach.UBOWebGL2 ||
       approach === ProcessApproach.TransformFeedbackWebGL2 ||
       approach === ProcessApproach.UniformWebGL2
       ) {
      gl = canvas.getContext('webgl2');
    } else {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    }

    MemoryManager.createInstanceIfNotCreated(1 * memoryUsageOrder, 1 * memoryUsageOrder, 0.1 * memoryUsageOrder, 0.5 * memoryUsageOrder);

    repo.addWebGLContext(gl!, canvas, true);
    this.__processApproach = approach;

    return gl;
  }

  get processApproach() {
    return this.__processApproach;
  }

  static getInstance() {
    if (!this.__instance) {
     this.__instance = new System();
    }

    return this.__instance;
  }
}
