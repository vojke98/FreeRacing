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

        this.body.velocity = vec3.fromValues(0, 0, 0);
        this.maxSpeed = 8;
        this.acceleration = 50;
        this.steering = .6;
        this.pitch = -90;
        this.yaw = 0;

        this.engineSound = new CarEngine();

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

        for (let key in this.keys) this.keys[key] = false;
    }

    stop() { if (this.engineSound) this.engineSound.stop(); }

    start() { if (this.engineSound) this.engineSound.start(); }

    update(dt) {

        const forward = this.body.getForward();
        const velocity_len = vec3.len(this.body.velocity);

        // 1: add movement acceleration
        let acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
            this.maxSpeed = 8;
            this.engineSound.pitch.max = 2.2;
            this.engineSound.createPitchStep(.02);

            if (this.keys['KeyD']) this.pitch -= velocity_len * this.steering;
            if (this.keys['KeyA']) this.pitch += velocity_len * this.steering;

        } else if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
            this.maxSpeed = 4;
            this.engineSound.pitch.max = 1.2;
            this.engineSound.createPitchStep(.02);

            if (this.keys['KeyD']) this.pitch += velocity_len * this.steering;
            if (this.keys['KeyA']) this.pitch -= velocity_len * this.steering;

        } else this.engineSound.createPitchStep(-.04);

        this.speedGauge.setValue(velocity_len * 20);

        // 2: update rotation
        quat.fromEuler(this.body.rotation, this.yaw, this.pitch, 0);

        // 3: update velocity
        vec3.scaleAndAdd(this.body.velocity, this.body.velocity, acc, dt * this.acceleration);

        // 4: limit speed
        if (velocity_len > this.maxSpeed) vec3.scale(this.body.velocity, this.body.velocity, this.maxSpeed / velocity_len);
    }

    keyDownHandler(e) {
        this.keys[e.code] = true;
    }

    keyUpHandler(e) {
        this.keys[e.code] = false;
    }
}