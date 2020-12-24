uniform float u_materialSID; // skipProcess=true
uniform sampler2D u_dataTexture; // skipProcess=true
/* shaderity: @{widthOfDataTexture} */
/* shaderity: @{heightOfDataTexture} */

#if defined(GLSL_ES3) && defined(RN_IS_FASTEST_MODE)
/* shaderity: @{dataUBOVec4Size} */
/* shaderity: @{dataUBODefinition} */
#endif


highp vec4 fetchElement(highp sampler2D tex, int vec4_idx, int texWidth, int texHeight) {
#if defined(GLSL_ES3) && defined(RN_IS_FASTEST_MODE)
  if (vec4_idx < dataUBOVec4Size) {
    return fetchVec4FromVec4Block(vec4_idx);
  } else {
    int idxOnDataTex = vec4_idx - dataUBOVec4Size;
    highp ivec2 uv = ivec2(idxOnDataTex % texWidth, idxOnDataTex / texWidth);
    return texelFetch( tex, uv, 0 );
  }
#elif defined(GLSL_ES3)
  highp ivec2 uv = ivec2(vec4_idx % texWidth, vec4_idx / texWidth);
  return texelFetch( tex, uv, 0 );
#else
  // This idea from https://qiita.com/YVT/items/c695ab4b3cf7faa93885
  highp vec2 invSize = vec2(1.0/float(texWidth), 1.0/float(texHeight));
  highp float t = (float(vec4_idx) + 0.5) * invSize.x;
  highp float x = fract(t);
  highp float y = (floor(t) + 0.5) * invSize.y;
  #ifdef GLSL_ES3
  return texture( tex, vec2(x, y));
  #else
  return texture2D( tex, vec2(x, y));
  #endif
#endif
}


vec4 fetchVec4(highp sampler2D tex, int vec4_idx, int texWidth, int texHeight) {
  vec4 val = fetchElement(u_dataTexture, vec4_idx, texWidth, texHeight);

  return val;
}

mat2 fetchMat2(highp sampler2D tex, int vec4_idx, int texWidth, int texHeight) {
  vec4 col0 = fetchElement(u_dataTexture, vec4_idx, texWidth, texHeight);

  mat2 val = mat2(
    col0.x, col0.y,
    col0.z, col0.w
    );

  return val;
}

mat3 fetchMat3(highp sampler2D tex, int vec4_idx, int texWidth, int texHeight) {
  vec4 col0 = fetchElement(u_dataTexture, vec4_idx, texWidth, texHeight);
  vec4 col1 = fetchElement(u_dataTexture, vec4_idx + 1, texWidth, texHeight);
  vec4 col2 = fetchElement(u_dataTexture, vec4_idx + 2, texWidth, texHeight);

  mat3 val = mat3(
    col0.x, col0.y, col0.z,
    col0.w, col1.x, col1.y,
    col1.z, col1.w, col2.x
    );

  return val;
}

mat4 fetchMat4(highp sampler2D tex, int vec4_idx, int texWidth, int texHeight) {
  vec4 col0 = fetchElement(u_dataTexture, vec4_idx, texWidth, texHeight);
  vec4 col1 = fetchElement(u_dataTexture, vec4_idx + 1, texWidth, texHeight);
  vec4 col2 = fetchElement(u_dataTexture, vec4_idx + 2, texWidth, texHeight);
  vec4 col3 = fetchElement(u_dataTexture, vec4_idx + 3, texWidth, texHeight);

  mat4 val = mat4(
    col0.x, col0.y, col0.z, col0.w,
    col1.x, col1.y, col1.z, col1.w,
    col2.x, col2.y, col2.z, col2.w,
    col3.x, col3.y, col3.z, col3.w
    );

  return val;
}

float rand(const vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 descramble(vec3 v) {
  float seed = 0.0;
  v.x -= sin(fract(v.y*20.0));
  v.z -= cos(fract(-v.y*10.0));
  return v;
}

