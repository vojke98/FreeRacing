import { vec3, vec4, mat4, quat } from './lib/gl-matrix-module.js';

export class Checkpoint {
    constructor(node, location, rotation) {
        this.node = node;
        this.node.translation = location;
        quat.fromEuler(this.node.rotation, rotation[0], rotation[1], rotation[2]);
        this.node.updateMatrix();

        this.pitch = 0;
    }

    spin() {
        this.pitch += .2;
        quat.fromEuler(this.node.rotation, 0, this.pitch, 0);
        this.node.updateMatrix();
    }
}