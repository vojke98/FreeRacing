import { vec3, vec4, mat4, quat } from './lib/gl-matrix-module.js';
import { CarEngine } from './CarEngine.js';

export class Car {

    constructor(node) {
        this.body = node;
        this.body.fl_wheel = this.body.getChildByName("front_left_wheel");
        this.body.fr_wheel = this.body.getChildByName("front_right_wheel");
        this.body.rl_wheel = this.body.getChildByName("rear_left_wheel");
        this.body.rr_wheel = this.body.getChildByName("rear_right_wheel");
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.keys = {};

        this.r = vec3.fromValues(0, 0, 0);

        this.body.velocity = vec3.fromValues(0, 0, 0);
        this.mass = 1;
        this.maxSpeed = 80;
        this.direction = 0;
        this.friction = .05;
        this.acceleration = 50;
        this.steering = .3;
        this.pitch = 0;
        this.yaw = 0;

        this.engineSound = new CarEngine();
        this.engineSound.RPM = 0;

        this.speedGauge = Gauge(
            document.getElementById("speed-gauge"),
            {
                max: 250,
                dialStartAngle: 180,
                dialEndAngle: -90,
                viewBox: "0 0 57 57",
                value: 0
            }
        );
    }

    enable() {
        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }

    disable() {
        document.removeEventListener('mousemove', this.mouseMoveHandler);
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    stop() {
        if (this.engineSound) {
            this.engineSound.stop();
        }
    }

    start() {
        if (this.engineSound) {
            this.engineSound.start();
        }
    }

    update(dt) {
        const c = this;

        const forward = c.body.getForward();

        // 1: add movement acceleration
        let acc = vec3.create();
        if (c.keys['KeyW']) {
            vec3.sub(acc, acc, forward);
            c.maxSpeed = 50;
            this.direction = 1;
            this.engineSound.pitch.max = 2.2;
            this.engineSound.createPitchStep(.02);
        }
        if (c.keys['KeyS']) {
            vec3.add(acc, acc, forward);
            c.maxSpeed = 15;
            this.direction = -1;
            this.engineSound.pitch.max = 1.5;
            this.engineSound.createPitchStep(.02);
        }

        const velocity_len = vec3.len(c.body.velocity);
        this.engineSound.RPM = velocity_len / 10;

        this.speedGauge.setValue(velocity_len * 10);

        if (c.keys['KeyD']) {
            c.pitch -= velocity_len * this.steering * this.direction;
        }
        if (c.keys['KeyA']) {
            c.pitch += velocity_len * this.steering * this.direction;
        }

        quat.fromEuler(c.body.rotation, c.yaw, c.pitch, 0);

        // 2: update velocity
        vec3.scaleAndAdd(c.body.velocity, c.body.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!c.keys['KeyW'] && !c.keys['KeyS']) {
            //vec3.scale(c.body.velocity, c.body.velocity, 1 - c.friction);
            this.engineSound.createPitchStep(-.04);
        }

        // APPLY FRICTION (SHOULD FIX TO APPLY ON SIDES ONLY !!!)
        vec3.scale(c.body.velocity, c.body.velocity, 1 - c.friction);

        // 4: limit speed
        if (velocity_len > c.maxSpeed) {
            vec3.scale(c.body.velocity, c.body.velocity, c.maxSpeed / velocity_len);
        }

        // 5: update translation
        vec3.scaleAndAdd(c.body.translation, c.body.translation, c.body.velocity, dt);

        // 6: update
        this.body.updateMatrix();
    }

    keyDownHandler(e) {
        this.keys[e.code] = true;
    }

    keyUpHandler(e) {
        this.keys[e.code] = false;
    }

}
