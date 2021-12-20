const vertex = `#version 300 es

layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;

uniform mat4 uMvpMatrix;

out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uMvpMatrix * aPosition;
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform mediump sampler2D uTexture;

in vec2 vTexCoord;

out vec4 oColor;

void main() {
    oColor = texture(uTexture, vTexCoord);
}
`;

//##############################################################

const vs = `#version 300 es
layout (location = 0) in vec4 aPosition;
layout (location = 1) in vec2 aTexCoord;
layout (location = 2) in vec3 aNormal;

uniform mat4 uMvpMatrix;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

out vec3 vNormal;
out vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    gl_Position = uMvpMatrix * aPosition, 1;
    vNormal = (uMvpMatrix * vec4(aNormal, 0)).xyz;
}
`;
const fs = `#version 300 es
precision mediump float;

uniform vec3 uLightDirection;

uniform mediump sampler2D uTexture;

in vec3 vNormal;
in vec2 vTexCoord;
out vec4 oColor;

void main() {
    vec4 uColor = texture(uTexture, vTexCoord);
    vec3 norm = normalize(vNormal);
    float light = dot(uLightDirection, norm) * .5 + .5;
    oColor = vec4(uColor.rgb * light, uColor.a);
}
`;

export const shaders = {
    simple: { vertex, fragment },
    lighting: { vs, fs }
};
