import { vec3, mat4, quat } from './lib/gl-matrix-module.js';
import { Camera } from './Camera.js';

export class PerspectiveCamera extends Camera {

    constructor(options = {}) {
        super(options);

        this.aspect = options.aspect || 1.5;
        this.fov = options.fov || 1.5;
        this.near = options.near || 1;
        this.far = options.far || Infinity;

        this.zoom = 1;

        this.mouseWheelHandler = this.mouseWheelHandler.bind(this);

        this.updateMatrix();
    }

    updateMatrix() {
        mat4.perspective(this.matrix,
            this.fov, this.aspect,
            this.near, this.far);
    }

    mouseWheelHandler(e) {
        this.zoom += e.deltaY * 0.0005;
        this.zoom = Math.min(Math.max(0, this.zoom), 1);
        this.node.translation[0] = this.initialZ * this.zoom;
        console.log(this.node.translation[2]);
    }

    enable() {
        document.addEventListener('wheel', this.mouseWheelHandler);
    }

    disable() {
        document.removeEventListener('wheel', this.mouseWheelHandler);
    }


}