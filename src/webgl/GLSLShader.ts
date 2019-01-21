import { VertexAttributeEnum, VertexAttribute } from "../foundation/definitions/VertexAttribute";
import WebGLResourceRepository from "./WebGLResourceRepository";

export type AttributeNames = Array<string>;

export default class GLSLShader {
  private static __instance: GLSLShader;
  private __webglResourceRepository?: WebGLResourceRepository = WebGLResourceRepository.getInstance();
  private constructor() {}

  static getInstance(): GLSLShader {
    if (!this.__instance) {
      this.__instance = new GLSLShader();
    }
    return this.__instance;
  }

  get glsl_rt0() {
    const repo = this.__webglResourceRepository!;
    if (repo.currentWebGLContextWrapper!.isWebGL2) {
      return 'layout(location = 0) out vec4 rt0;\n';
    } else {
      return 'vec4 rt0;\n';
    }
  }

  get glsl_fragColor() {
    const repo = this.__webglResourceRepository!;
    if (repo.currentWebGLContextWrapper!.isWebGL2) {
      return '';
    } else {
      return 'gl_FragColor = rt0;\n';
    }
  }

  get glsl_vertex_in() {
    const repo = this.__webglResourceRepository!;
    if (repo.currentWebGLContextWrapper!.isWebGL2) {
      return 'in';
    } else {
      return 'attribute';
    }
  }

  get glsl_fragment_in() {
    const repo = this.__webglResourceRepository!;
    if (repo.currentWebGLContextWrapper!.isWebGL2) {
      return 'in';
    } else {
      return 'varying';
    }
  }

  get glsl_vertex_out() {
    const repo = this.__webglResourceRepository!;
    if (repo.currentWebGLContextWrapper!.isWebGL2) {
      return 'out';
    } else {
      return 'varying';
    }
  }

  get glsl_texture() {
    const repo = this.__webglResourceRepository!;
    if (repo.currentWebGLContextWrapper!.isWebGL2) {
      return 'texture';
    } else {
      return 'texture2D';
    }
  }

  get glsl_versionText() {
    const repo = this.__webglResourceRepository!;
    if (repo.currentWebGLContextWrapper!.isWebGL2) {
      return '#version 300 es\n'
    } else {
      return '';
    }
   }

  get vertexShaderVariableDefinitions() {
    const _version = this.glsl_versionText;
    const _in = this.glsl_vertex_in;
    const _out = this.glsl_vertex_out;

    return `${_version}
precision highp float;
${_in} vec3 a_position;
${_in} vec3 a_color;
${_in} vec3 a_normal;
${_in} float a_instanceID;
${_out} vec3 v_color;
${_out} vec3 v_normal_inWorld;
${_out} vec4 v_position_inWorld;
`;

  };

  vertexShaderBody:string = `

void main ()
{
  mat4 worldMatrix = getMatrix(a_instanceID);
  mat4 viewMatrix = getViewMatrix(a_instanceID);
  mat4 projectionMatrix = getProjectionMatrix(a_instanceID);
  mat3 normalMatrix = getNormalMatrix(a_instanceID);

  gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(a_position, 1.0);

  v_color = a_color;

  v_normal_inWorld = normalMatrix * a_normal;
  //v_normal_inWorld = a_normal;

  v_position_inWorld = worldMatrix * vec4(a_position, 1.0);
}
  `;

  get fragmentShaderSimple() {
    const _version = this.glsl_versionText;
    const _in = this.glsl_fragment_in;
    const _def_rt0 = this.glsl_rt0;
    const _def_fragColor = this.glsl_fragColor;

    return `${_version}
precision highp float;

struct Material {
  vec4 baseColor;
};

uniform Material uMaterial;

${_in} vec3 v_color;
${_in} vec3 v_normal_inWorld;
${_in} vec4 v_position_inWorld;
${_def_rt0}
void main ()
{

  vec3 lightPosition = vec3(10000.0, 10000.0, 10000.0);
  vec3 normal_inWorld = normalize(v_normal_inWorld);
  vec3 color = vec3(0.0, 0.0, 0.0);
  if (v_color != color && uMaterial.baseColor.rgb != color) {
    color = v_color * uMaterial.baseColor.rgb;
  } else if (v_color == color) {
    color = uMaterial.baseColor.rgb;
  } else if (uMaterial.baseColor.rgb == color) {
    color = v_color;
  } else {
    color = vec3(1.0, 1.0, 1.0);
  }

  if (length(v_normal_inWorld) > 0.5) {
    vec3 lightDirection = normalize(lightPosition - v_position_inWorld.xyz);
    float diffuse = 1.0 * dot(normal_inWorld, lightDirection);
    color *= diffuse;
  }

  rt0 = vec4(color, 1.0);


  ${_def_fragColor}
}
`;
  }


  get fragmentShader() {
    return this.fragmentShaderSimple;
  }

  static attributeNames: AttributeNames = ['a_position', 'a_color', 'a_normal', 'a_instanceID'];
  static attributeSemantics: Array<VertexAttributeEnum> = [VertexAttribute.Position, VertexAttribute.Color0, VertexAttribute.Normal, VertexAttribute.Instance];
}