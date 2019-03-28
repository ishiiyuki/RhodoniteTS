import { ComponentType } from "../../foundation/definitions/ComponentType";
import { CompositionType } from "../../foundation/definitions/CompositionType";
import GetVarsMaterialNode from "./GetVarsMaterialNode";
import Material from "./Material";
import EndMaterialNode from "./EndMaterialNode";
import { VertexAttribute } from "../definitions/VertexAttribute";
import AddMaterialNode from "./AddMaterialNode";
import { ShaderSemantics } from "../definitions/ShaderSemantics";

test('Material works correctly', () => {

  const material = new Material([]);

  const getVarsMaterialNode = new GetVarsMaterialNode();
  getVarsMaterialNode.addVertexInputAndOutput(
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'hoge',
      isImmediateValue: true,
      immediateValue: 'vec4(1.0, 0.0, 0.0, 1.0)'
    },
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'position_inLocal',
      isImmediateValue: false
    }
  );
  getVarsMaterialNode.addVertexInputAndOutput(
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'Muda',
      isImmediateValue: true,
      immediateValue: 'vec4(0.0, 0.0, 1.0, 1.0)'
    },
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'normal_inLocal',
      isImmediateValue: false
    }
  );
  getVarsMaterialNode.addVertexInputAndOutput(
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'huga',
      isImmediateValue: true,
      immediateValue: 'vec4(0.0, 0.2, 0.0, 1.0)'
    },
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'baseColor',
      isImmediateValue: false
    }
  );
  getVarsMaterialNode.addVertexInputAndOutput(
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'huga2',
      isImmediateValue: true,
      immediateValue: 'vec4(0.0, 0.5, 0.0, 1.0)'
    },
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'specularColor',
      isImmediateValue: false
    }
  );
  getVarsMaterialNode.addPixelInputAndOutput(
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'redColor',
      isImmediateValue: true,
      immediateValue: 'vec4(1.0, 0.0, 0.0, 1.0)'
    },
    {
      compositionType: CompositionType.Vec4,
      componentType: ComponentType.Float,
      name: 'outColor',
      isImmediateValue: false
    }
  );

  const addMaterialNode = new AddMaterialNode();
  addMaterialNode.addVertexInputConnection(getVarsMaterialNode, 'position_inLocal', 'lhs');
  addMaterialNode.addVertexInputConnection(getVarsMaterialNode, 'normal_inLocal', 'rhs');

  const addMaterialNode2 = new AddMaterialNode();
  addMaterialNode2.addVertexInputConnection(getVarsMaterialNode, 'baseColor', 'lhs');
  addMaterialNode2.addVertexInputConnection(getVarsMaterialNode, 'specularColor', 'rhs');

  const addMaterialNode3 = new AddMaterialNode();
  addMaterialNode3.addVertexInputConnection(addMaterialNode, 'outValue', 'lhs');
  addMaterialNode3.addVertexInputConnection(addMaterialNode2, 'outValue', 'rhs');

  const endMaterialNode = new EndMaterialNode();
  endMaterialNode.addVertexInputConnection(addMaterialNode3, 'outValue', 'inPosition');
  endMaterialNode.addPixelInputConnection(getVarsMaterialNode, 'outColor', 'inColor');

  // nodes are intentionally made the order random
  material.setMaterialNodes([endMaterialNode, addMaterialNode2, addMaterialNode3, addMaterialNode, getVarsMaterialNode]);

  console.log(material.createProgramString());

 expect(material.createProgramString()).toEqual(``)
});
