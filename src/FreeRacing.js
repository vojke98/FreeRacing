import { Application } from './engine/Application.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';
import { Playlist } from './Playlist.js';
import { Physics } from './Physics.js';
import { Car } from './Car.js';
import { Light } from './Light.js';

class App extends Application {

    async start() {
        this.loader = new GLTFLoader();
        await this.loader.load('./res/models/scene.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        this.camera = await this.loader.loadNode('Camera');

        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        if (!this.camera.camera) {
            throw new Error('Camera node does not contain a camera reference');
        }

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();

        this.initialize();

        this.physics = new Physics(this.scene);
        this.zoom = 20;
        this.mouseWheelHandler = this.mouseWheelHandler.bind(this);
    }

    mouseWheelHandler(e) {
        this.zoom -= e.deltaY * 0.02;
        this.zoom = Math.min(Math.max(-10, this.zoom), 40);
        this.camera.translation[1] = 20 - this.zoom;
    }

    async initialize() {
        this.btnStart = document.getElementById("start");
        this.menu = document.getElementById("menu");
        this.timeLbl = document.getElementById("timeLbl");
        this.btnStart.addEventListener('click', () => this.play());
        this.btnStart.innerText = "Resume game";

        const sun = await this.loader.loadNode('Sun');
        this.light = new Light(sun);

        const car_body = await this.loader.loadNode("Car.001");
        this.car = new Car(car_body);
        this.pointerLockChangeHandler = this.pointerLockChangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerLockChangeHandler);

        this.playlist = new Playlist();
        this.playlist.shuffle();

        this.run = false;
    }

    update() {
        this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if (this.scene) {
            if (this.car && this.run)  this.car.update(dt);

            if (this.camera) {
                this.camera.follow(this.car.body);
                this.camera.updateMatrix();
            }

            if (this.physics && this.run) this.physics.update(dt);
        }
    }

    play() {
        if (this.gameover) {
            this.start();
        } else {
            this.run = true;
            this.canvas.requestPointerLock();
            this.menu.style.visibility = "hidden";
            this.car.enable();
            document.addEventListener('wheel', this.mouseWheelHandler);
            this.playlist.play();
            this.car.start();
        }
    }

    pause() {
        this.run = false;
        this.menu.style.visibility = "visible";
        if (this.playlist) this.playlist.pause();
        if (this.car) this.car.stop();
    }

    gameOver() {
        this.gameover = true;
        this.btnStart.innerText = "New game";
        this.pause();
    }

    increaseTime() {
        if (this.run) this.playingTime++;
        this.timeLbl.innerText = "Running: " + this.playingTime + " sec";
    }

    pointerLockChangeHandler() {
        if (document.pointerLockElement != this.canvas) this.pause();
    }

    render() {
        if (this.renderer) this.renderer.render(this.scene, this.camera, this.light);
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.camera) {
            this.camera.camera.aspect = aspectRatio;
            this.camera.camera.updateMatrix();
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
});