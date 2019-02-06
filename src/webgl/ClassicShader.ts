import { VertexAttributeEnum, VertexAttribute } from "../foundation/definitions/VertexAttribute";
import WebGLResourceRepository from "./WebGLResourceRepository";
import GLSLShader from "./GLSLShader";

export type AttributeNames = Array<string>;

export default class ClassicShader extends GLSLShader {
  static __instance: ClassicShader;
  private constructor() {
    super();
  }

  static getInstance(): ClassicShader {
    if (!this.__instance) {
      this.__instance = new ClassicShader();
    }
    return this.__instance;
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
${_in} vec2 a_texcoord;
${_in} vec4 a_joint;
${_in} vec4 a_weight;
${_out} vec3 v_color;
${_out} vec3 v_normal_inWorld;
${_out} vec4 v_position_inWorld;
${_out} vec3 v_lightDirection;
${_out} vec2 v_texcoord;
uniform mat4 u_boneMatrices[100];

${this.toNormalMatrix}

${this.getSkinMatrix}

`;

  };

  vertexShaderBody:string = `

void main ()
{
  mat4 worldMatrix = getMatrix(a_instanceID);
  mat4 viewMatrix = getViewMatrix(a_instanceID);
  mat4 projectionMatrix = getProjectionMatrix(a_instanceID);
  mat3 normalMatrix = getNormalMatrix(a_instanceID);

  v_position_inWorld = worldMatrix * vec4(a_position, 1.0);

  gl_Position = projectionMatrix * viewMatrix * v_position_inWorld;
  v_color = a_color;
  v_normal_inWorld = normalMatrix * a_normal;
  v_texcoord = a_texcoord;

  // Light
  vec3 lightPosition = vec3(10000.0, 100000.0, 100000.0);
  v_lightDirection = normalize(lightPosition - v_position_inWorld.xyz);

  // Skeletal
  ${this.processSkinningIfNeed}


//  v_color = vec3(u_boneMatrices[int(a_joint.x)][1].xyz);
}
  `;

  get fragmentShaderSimple() {
    const _version = this.glsl_versionText;
    const _in = this.glsl_fragment_in;
    const _def_rt0 = this.glsl_rt0;
    const _def_fragColor = this.glsl_fragColor;
    const _texture = this.glsl_texture;

    return `${_version}
precision highp float;

struct Material {
  vec4 baseColorFactor;
  sampler2D baseColorTexture;
};

uniform Material u_material;

${_in} vec3 v_color;
${_in} vec3 v_normal_inWorld;
${_in} vec4 v_position_inWorld;
${_in} vec3 v_lightDirection;
${_in} vec2 v_texcoord;
${_def_rt0}
void main ()
{
  // Light
  //vec3 lightPosition = vec3(0.0, 0.0, 50000.0);

  // Normal
  vec3 normal_inWorld = normalize(v_normal_inWorld);

  // baseColor
  vec3 color = vec3(0.0, 0.0, 0.0);
  if (v_color != color && u_material.baseColorFactor.rgb != color) {
    color = v_color * u_material.baseColorFactor.rgb;
  } else if (v_color == color) {
    color = u_material.baseColorFactor.rgb;
  } else if (u_material.baseColorFactor.rgb == color) {
    color = v_color;
  } else {
    color = vec3(1.0, 1.0, 1.0);
  }
  //color = v_color;

  // baseColorTexture
  vec4 textureColor = ${_texture}(u_material.baseColorTexture, v_texcoord);
  if (textureColor.r > 0.05) {
    color *= textureColor.rgb;
  }

  // Lighting
  if (length(v_normal_inWorld) > 0.02) {
    vec3 lightDirection = normalize(v_lightDirection);
    float diffuse = 1.0 * max(0.0, dot(normal_inWorld, lightDirection));
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

  static attributeNames: AttributeNames = ['a_position', 'a_color', 'a_normal', 'a_texcoord', 'a_joint', 'a_weight', 'a_instanceID'];
  static attributeSemantics: Array<VertexAttributeEnum> = [VertexAttribute.Position, VertexAttribute.Color0,
    VertexAttribute.Normal, VertexAttribute.Texcoord0, VertexAttribute.Joints0, VertexAttribute.Weights0, VertexAttribute.Instance];
}
