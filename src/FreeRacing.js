import { Application } from './engine/Application.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';
import { Playlist } from './Playlist.js';
import { Physics } from './Physics.js';
import { Car } from './Car.js';
import { Light } from './Light.js';
import { Race } from './Race.js';
import { Checkpoint } from './Checkpoint.js';

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

        const races = await this.createRaces();
        this.physics = new Physics(this.scene, races);
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
        this.btnStart.addEventListener('click', () => this.play());
        this.btnStart.innerText = "Resume game";

        const sun = await this.loader.loadNode('Sun');
        this.light = new Light(sun);

        const car_body = await this.loader.loadNode("Car.001");
        this.car = new Car(car_body);
        this.pointerLockChangeHandler = this.pointerLockChangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerLockChangeHandler);
        this.handleControllerButtonPress = this.handleControllerButtonPress.bind(this);
        window.addEventListener('gc.button.press', this.handleControllerButtonPress, false);

        this.playlist = new Playlist();
        this.playlist.shuffle();

        this.run = false;
    }

    handleControllerButtonPress(event) {
        if(event.detail.name == 'HOME') {
            if(this.run) this.pause();
            else this.play();
        }
    }

    async createRaces() {
        const start = await this.loader.loadNode("Start");
        const checkpoint = await this.loader.loadNode("Checkpoint");
        const finish = await this.loader.loadNode("Finish");

        const checkpoints = [];

        checkpoints.push(new Checkpoint(start.clone(), [12, 0, -23], [0, 0, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [12, 0, -33], [0, 0, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [12, 0, -43], [0, 0, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [12, 0, -53], [0, 45, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [2, 0, -53], [0, 90, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [-8, 0, -53], [0, 90, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [-18, 0, -53], [0, 90, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [-28, 0, -53], [0, 135, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [-28, 0, -43], [0, 0, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [-28, 0, -33], [0, 0, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [-28, 0, -23], [0, 0, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [-28, 0, -13], [0, 0, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [-28, 0, -3], [0, 0, 0]));
        checkpoints.push(new Checkpoint(checkpoint.clone(), [-18, 0, 1], [0, 90, 0]));
        checkpoints.push(new Checkpoint(finish.clone(), [-12, 0, -7], [0, 0, 0]));

        const races = [];
        races.push(new Race(this.scene, checkpoints));

        return races;
    }

    update() {
        this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if (this.scene) {
            if (this.car && this.run) this.car.update(dt);

            if (this.camera) {
                this.camera.follow(this.car.body);
                this.camera.updateMatrix();
            }

            if (this.physics && this.run) this.physics.update(dt);
        }
    }

    play() {
        this.run = true;
        this.canvas.requestPointerLock();
        this.menu.style.visibility = "hidden";
        this.car.enable();
        document.addEventListener('wheel', this.mouseWheelHandler);
        this.playlist.play();
        this.car.start();
        if (this.physics.activeRace) this.physics.activeRace.continue();
    }

    pause() {
        this.run = false;
        this.menu.style.visibility = "visible";
        if (this.playlist) this.playlist.pause();
        if (this.car) this.car.stop();
        if (this.physics.activeRace) this.physics.activeRace.pause();
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