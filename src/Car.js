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
        this.handling = .6;
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

        this.throttle = 0;
        this.steer = 0;

        Controller.search();

        this.setController = this.setController.bind(this);
        window.addEventListener('gc.controller.found', this.setController, false);

        this.handleControllerStick = this.handleControllerStick.bind(this);
        window.addEventListener('gc.analog.change', this.handleControllerStick, false);

        this.handleControllerButtonHold = this.handleControllerButtonHold.bind(this);
        window.addEventListener('gc.button.hold', this.handleControllerButtonHold, false);

        this.handleControllerButtonRelease = this.handleControllerButtonRelease.bind(this);
        window.addEventListener('gc.button.release', this.handleControllerButtonRelease, false);
    }

    setController(event) {
        const controller = event.detail.controller;
        console.log("Controller found at index " + controller.index + ".");
        console.log("'" + controller.name + "' is ready!");
        this.controller = controller;

        this.controller.watch();
    }

    handleControllerStick(event) {
        if(event.detail.name == 'LEFT_ANALOG_STICK') {
            this.steer = -event.detail.position.x
            this.keys["LStick"] = true;
        }
    }

    handleControllerButtonHold(event) {
        if(event.detail.name == 'RIGHT_SHOULDER_BOTTOM') this.throttle = event.detail.value;
        if(event.detail.name == 'LEFT_SHOULDER_BOTTOM') this.throttle = -event.detail.value;
    }

    handleControllerButtonRelease(event) {
        if(event.detail.name == 'RIGHT_SHOULDER_BOTTOM') this.throttle = 0;
        if(event.detail.name == 'LEFT_SHOULDER_BOTTOM') this.throttle = 0;
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

        if (this.throttle > 0) {
            this.maxSpeed = 8;
            this.engineSound.pitch.max = 2.2;
            this.engineSound.createPitchStep(.02);

            this.pitch += velocity_len * this.handling * this.steer;
        } else if (this.throttle < 0) {
            this.maxSpeed = 4;
            this.engineSound.pitch.max = 1.2;
            this.engineSound.createPitchStep(.02);

            this.pitch -= velocity_len * this.handling * this.steer;
        } else this.engineSound.createPitchStep(-.04);

        // 1: add movement acceleration
        let acc = vec3.create();

        vec3.scale(forward, forward, this.throttle);
        vec3.add(acc, acc, forward);

        this.speedGauge.setValue(velocity_len * 20);

        // 2: update rotation
        quat.fromEuler(this.body.rotation, this.yaw, this.pitch, 0);

        // 3: update velocity
        vec3.scaleAndAdd(this.body.velocity, this.body.velocity, acc, dt * this.acceleration);

        // 4: limit speed
        if (velocity_len > this.maxSpeed) vec3.scale(this.body.velocity, this.body.velocity, this.maxSpeed / velocity_len);
    }

    updateHandling() {
        let t = 0;
        let s = 0;
        if (this.keys['KeyW']) t = 1;
        else if (this.keys['KeyS']) t = -1;
        if (this.keys['KeyA']) s++;
        if (this.keys['KeyD']) s--;

        this.throttle = t;
        this.steer = s;
    }

    keyDownHandler(e) {
        this.keys[e.code] = true;
        this.updateHandling();
    }

    keyUpHandler(e) {
        this.keys[e.code] = false;
        this.updateHandling();
    }
}