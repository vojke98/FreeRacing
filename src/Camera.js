import { mat4 } from './lib/gl-matrix-module.js';

const vec3 = glMatrix.vec3;
const quat = glMatrix.quat;

export class Camera {

    constructor(options = {}) {
        this.node = options.node || null;
        this.matrix = options.matrix ? mat4.clone(options.matrix) : mat4.create();
        this.translation = options.translation ? vec3.clone(options.translation) : vec3.fromValues(0, 0, 0);
        this.rotation = options.rotation ? quat.clone(options.rotation) :  quat.fromValues(0, 0, 0, 1);
        this.scale = options.scale ? vec3.clone(options.scale) : vec3.fromValues(1, 1, 1);
    }
}
