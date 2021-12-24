import { vec3, mat4 } from './lib/gl-matrix-module.js';

export class Physics {

    constructor(scene) {
        this.scene = scene;

        this.staticCollidable = [];
        this.dynamicCollidable = []; // Only check these agains others
        this.interactiveCollidable = [];
        this.gravity = .0001;
        this.friction = .1;

        this.initialize();
    }

    initialize() {
        this.scene.traverse(node => {
            if (node.collidable === "STATIC") {
                this.staticCollidable.push(node);
            } else if (node.collidable === "DYNAMIC") {
                this.dynamicCollidable.push(node);
            }
            else if (node.collidable === "INTERACTIVE") {
                this.interactiveCollidable.push(node);
            }
        });
    }

    update(dt) {
        for(const node of this.dynamicCollidable) {
            //node.translation[2] -= this.gravitiy * dt;
            //vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
            vec3.scale(node.velocity, node.velocity, 1 - this.friction);
            node.updateTransform();
            for(const other of this.staticCollidable) {
                this.resolveCollision(node, other, true);
            }

            for(const other of this.interactiveCollidable) {
                const interact = this.resolveCollision(node, other, false);

                if(interact) other.react();
            }
        }
        /*this.scene.traverse(node => {
            if (node.name === "Car") {
                vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
                node.updateTransform();
                this.scene.traverse(other => {
                    if (node !== other && other.collidable === "STATIC") {
                        this.resolveCollision(node, other);
                    }
                });
            }
        });*/
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollision(a, b, staticB) {
        // Update bounding boxes with global translation.
        const ta = a.matrix;
        const tb = b.matrix;

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        let isColliding, mina, maxa, minb, maxb;

        for(let box1 of a.aabb) {
            mina = vec3.add(vec3.create(), posa, box1.min);
            maxa = vec3.add(vec3.create(), posa, box1.max);
            for(let box2 of b.aabb) {
                minb = vec3.add(vec3.create(), posb, box2.min);
                maxb = vec3.add(vec3.create(), posb, box2.max);

                // Check if there is collision.
                isColliding = this.aabbIntersection({
                    min: mina,
                    max: maxa
                }, {
                    min: minb,
                    max: maxb
                });

                if(isColliding) break;
            }
            if(isColliding) break;
        }

        if (!isColliding) {
            return false;
        }

        // Move node A minimally to avoid collision.
        const diffa = vec3.sub(vec3.create(), maxb, mina);
        const diffb = vec3.sub(vec3.create(), maxa, minb);

        let minDiff = Infinity;
        let minDirection = [0, 0, 0];
        if (diffa[0] >= 0 && diffa[0] < minDiff) {
            minDiff = diffa[0];
            minDirection = [minDiff, 0, 0];
        }
        if (diffa[1] >= 0 && diffa[1] < minDiff) {
            minDiff = diffa[1];
            minDirection = [0, minDiff, 0];
        }
        if (diffa[2] >= 0 && diffa[2] < minDiff) {
            minDiff = diffa[2];
            minDirection = [0, 0, minDiff];
        }
        if (diffb[0] >= 0 && diffb[0] < minDiff) {
            minDiff = diffb[0];
            minDirection = [-minDiff, 0, 0];
        }
        if (diffb[1] >= 0 && diffb[1] < minDiff) {
            minDiff = diffb[1];
            minDirection = [0, -minDiff, 0];
        }
        if (diffb[2] >= 0 && diffb[2] < minDiff) {
            minDiff = diffb[2];
            minDirection = [0, 0, -minDiff];
        }

        vec3.add(a.translation, a.translation, minDirection);

        if(staticB) a.velocity = vec3.fromValues(0,0,0);
        else {
            minDirection[0] *= -1;
            minDirection[2] *= -1;
            //vec3.add(b.translation, b.translation, minDirection);
            //b.updateMatrix();
        }
        a.updateMatrix();

        return true;
    }

}
