
#ifdef RN_IS_SKINNING

highp mat4 createMatrixFromQuaternionTransformUniformScale( highp vec4 quaternion, highp vec4 translationScale ) {
  highp vec4 q = quaternion;
  highp vec3 t = translationScale.xyz;
  highp float scale = translationScale.w;

  highp float sx = q.x * q.x;
  highp float sy = q.y * q.y;
  highp float sz = q.z * q.z;
  highp float cx = q.y * q.z;
  highp float cy = q.x * q.z;
  highp float cz = q.x * q.y;
  highp float wx = q.w * q.x;
  highp float wy = q.w * q.y;
  highp float wz = q.w * q.z;

  highp mat4 mat = mat4(
    1.0 - 2.0 * (sy + sz), 2.0 * (cz + wz), 2.0 * (cy - wy), 0.0,
    2.0 * (cz - wz), 1.0 - 2.0 * (sx + sz), 2.0 * (cx + wx), 0.0,
    2.0 * (cy + wy), 2.0 * (cx - wx), 1.0 - 2.0 * (sx + sy), 0.0,
    t.x, t.y, t.z, 1.0
  );

  highp mat4 uniformScaleMat = mat4(
    scale, 0.0, 0.0, 0.0,
    0.0, scale, 0.0, 0.0,
    0.0, 0.0, scale, 0.0,
    0.0, 0.0, 0.0, 1.0
  );

  return mat*uniformScaleMat;
}

highp vec4 unpackedVec2ToNormalizedVec4(highp vec2 vec_xy, highp float criteria){

  highp float r;
  highp float g;
  highp float b;
  highp float a;

  highp float ix = floor(vec_xy.x * criteria);
  highp float v1x = ix / criteria;
  highp float v1y = ix - floor(v1x) * criteria;

  r = ( v1x + 1.0 ) / (criteria-1.0);
  g = ( v1y + 1.0 ) / (criteria-1.0);

  highp float iy = floor( vec_xy.y * criteria);
  highp float v2x = iy / criteria;
  highp float v2y = iy - floor(v2x) * criteria;

  b = ( v2x + 1.0 ) / (criteria-1.0);
  a = ( v2y + 1.0 ) / (criteria-1.0);

  r -= 1.0/criteria;
  g -= 1.0/criteria;
  b -= 1.0/criteria;
  a -= 1.0/criteria;

  r = r*2.0-1.0;
  g = g*2.0-1.0;
  b = b*2.0-1.0;
  a = a*2.0-1.0;

  return vec4(r, g, b, a);
}

mat4 getSkinMatrix(float skeletalComponentSID) {
  highp vec2 criteria = vec2(4096.0, 4096.0);
  highp mat4 skinMat = a_weight.x * createMatrixFromQuaternionTransformUniformScale(
    get_boneQuaternion(skeletalComponentSID, int(a_joint.x)),
    get_boneTranslateScale(skeletalComponentSID, int(a_joint.x)));
  skinMat += a_weight.y * createMatrixFromQuaternionTransformUniformScale(
    get_boneQuaternion(skeletalComponentSID, int(a_joint.y)),
    get_boneTranslateScale(skeletalComponentSID, int(a_joint.y)));
  skinMat += a_weight.z * createMatrixFromQuaternionTransformUniformScale(
    get_boneQuaternion(skeletalComponentSID, int(a_joint.z)),
    get_boneTranslateScale(skeletalComponentSID, int(a_joint.z)));
  skinMat += a_weight.w * createMatrixFromQuaternionTransformUniformScale(
    get_boneQuaternion(skeletalComponentSID, int(a_joint.w)),
    get_boneTranslateScale(skeletalComponentSID, int(a_joint.w)));

  // mat4 skinMat = a_weight.x * u_boneMatrices[int(a_joint.x)];
  // skinMat += a_weight.y * u_boneMatrices[int(a_joint.y)];
  // skinMat += a_weight.z * u_boneMatrices[int(a_joint.z)];
  // skinMat += a_weight.w * u_boneMatrices[int(a_joint.w)];

  return skinMat;
}
#endif