import { vec3, mat4, quat } from './lib/gl-matrix-module.js';

export class Node {

    constructor(options = {}) {
        this.name = options.name ? options.name : null;
        if(options.extras) {
            if(options.extras.collidable) {
                this.collidable = options.extras.collidable;
                if(this.collidable == "STATIC") {
                    this.mass = 1;
                } else {
                    this.mass = .5;
                }
            }

            if(options.extras.sound) {
                this.sound = new Audio("./res/audio/" + options.extras.sound);
                this.sound.volume = .3;
            }
        }
        this.translation = options.translation ? vec3.clone(options.translation) : vec3.fromValues(0, 0, 0);
        this.rotation = options.rotation ? quat.clone(options.rotation) : quat.fromValues(0, 0, 0, 1);
        this.scale = options.scale ? vec3.clone(options.scale) : vec3.fromValues(1, 1, 1);
        this.matrix = options.matrix ? mat4.clone(options.matrix) : mat4.create();

        this.camera = options.camera || null;
        this.mesh = options.mesh || null;

        this.children = [...(options.children || [])];
        for (const child of this.children) {
            child.parent = this;
        }

        this.aabb = [];

        if(this.mesh)
        for(const primitive of this.mesh.primitives) {
            const pos = primitive.attributes.POSITION;
            const min = vec3.fromValues(pos.min[0], pos.min[1], pos.min[2]);
            const max = vec3.fromValues(pos.max[0], pos.max[1], pos.max[2]);
            this.aabb.push({"min": min, "max": max});
        }

        this.parent = null;

        this.velocity = vec3.fromValues(0, 0, 0);

        if (options.matrix) {
            this.updateTransform();
        } else if (options.translation || options.rotation || options.scale) {
            this.updateMatrix();
        }
    }

    updateTransform() {
        mat4.getRotation(this.rotation, this.matrix);
        mat4.getTranslation(this.translation, this.matrix);
        mat4.getScaling(this.scale, this.matrix);
    }

    updateMatrix() {
        mat4.fromRotationTranslationScale(
            this.matrix,
            this.rotation,
            this.translation,
            this.scale);
    }

    addChild(node) {
        this.children.push(node);
        node.parent = this;
    }

    removeChild(node) {
        const index = this.children.indexOf(node);
        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
        }
    }

    getChildByName(name) {
        for(const child of this.children) {
            if(child.name === name) return child;
        }
        return null;
    }

    clone() {
        return new Node({
            ...this,
            children: this.children.map(child => child.clone()),
        });
    }

    getForward() {
        const x = this.rotation[0];
        const y = this.rotation[1];
        const z = this.rotation[2];
        const w = this.rotation[3];

        const fw = vec3.create();

        fw[0] = 2 * (x*z + w*y)
        fw[1] = 2 * (y*z - w*x)
        fw[2] = 1 - 2 * (x*x + y*y)
        return fw;
    }

    getUp() {
        const x = this.rotation[0];
        const y = this.rotation[1];
        const z = this.rotation[2];
        const w = this.rotation[3];

        const fw = vec3.create();

        fw[0] = 2 * (x*y - w*z)
        fw[1] = 1 - 2 * (x*x + z*z)
        fw[2] = 2 * (y*z + w*x)
        return fw;
    }

    follow(that) {
        this.translation[0] = that.translation[0];
        this.translation[2] = that.translation[2];

        quat.fromEuler(this.rotation, -90, 0, 0);
    }

    react() {
        if(this.sound) this.sound.play();
    }

}