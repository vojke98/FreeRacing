import { vec3, mat4, quat } from './lib/gl-matrix-module.js';

export class Car {

    constructor(node, camera) {
        this.body = node;

        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.keys = {};

        this.r = vec3.fromValues(0, 0, 0);

        this.velocity = vec3.fromValues(0, 0, 0);
        this.maxSpeed = 500;
        this.direction = 0;
        this.friction = .1;
        this.acceleration = 15;
        this.steering = 0.05;
        this.pitch = 90;
        this.yaw = 0;

        this.camera = camera;

        console.log(this.body);
    }

    enable() {
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('mousedown', this.mouseShootHandler);
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }

    disable() {
        document.removeEventListener('mousemove', this.mouseMoveHandler);
        document.removeEventListener('mousedown', this.mouseShootHandler);
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    update(dt) {
        const c = this;

        const angle = c.getEuler(c.body.rotation);

        //const forward = vec3.set(vec3.create(), -Math.sin(this.r[1]), 0, -Math.cos(this.r[1]));
        const forward = vec3.set(vec3.create(), Math.sin(angle[1]), 0, -Math.cos(angle[1]));

        // 1: add movement acceleration
        let acc = vec3.create();
        if (c.keys['KeyW']) {
            vec3.sub(acc, acc, forward);
            vec3.sub(acc, acc, forward);
            c.maxSpeed = 500;
            this.direction = 1;
        }
        if (c.keys['KeyS']) {
            vec3.add(acc, acc, forward);
            c.maxSpeed = 10;
            this.direction = -1;
        }

        const velL = vec3.length(c.velocity);
        const moving = velL > 1;

        if (c.keys['KeyD'] && moving) {
            c.pitch -= velL * this.steering * this.direction;
        }
        if (c.keys['KeyA'] && moving) {
            c.pitch += velL * this.steering * this.direction;
        }

        quat.fromEuler(c.body.rotation, c.yaw, c.pitch * 2, 0);

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!c.keys['KeyW'] && !c.keys['KeyS']) {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }

        // 5: update translation
        vec3.scaleAndAdd(c.body.translation, c.body.translation, c.velocity, dt);

        // 6: update
        this.body.updateMatrix();
        //this.camera.updateMatrix();
    }

    rotationMatrixToEulerAngles(R) {
        //assert(isRotationMatrix(R))

        const sy = Math.sqrt(R[0] * R[0] + R[2] * R[2])

        singular = sy < 1e-6;

        let eAngle = vec3.create();

        if (!singular) {
            x = math.atan2(R[2, 1], R[2, 2])
            y = math.atan2(-R[2, 0], sy)
            z = math.atan2(R[1, 0], R[0, 0])
        } else {
            x = math.atan2(-R[1, 2], R[1, 1])
            y = math.atan2(-R[2, 0], sy)
            z = 0
        }

        return np.array([x, y, z])
    }


    getEuler(q) {
        let vector = vec3.create();
        let x = q[0];
        let y = q[1];
        let z = q[2];
        let w = q[3];
        let x2 = x * x;
        let y2 = y * y;
        let z2 = z * z;
        let w2 = w * w;
        vector[0] = Math.asin(-2 * (y * z + w * x));
        if (Math.cos(vector[0] != 0)) {
            vector[1] = Math.atan2(2 * x * z - 2 * w * y, 1 - 2 * x2 - 2 * y2)
            vector[2] = Math.atan2(x * y - w * z, 1 / 2 - x2 - z2);
        } else {
            vector[1] = Math.atan2(-x * z - w * y, 1 / 2 - y2 - z2)
            vector[2] = 0;
        }
        return vector;
    }

    keyDownHandler(e) {
        this.keys[e.code] = true;
    }

    keyUpHandler(e) {
        this.keys[e.code] = false;
    }

}
