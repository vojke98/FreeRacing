export class Race {
    constructor(scene, checkpoints) {
        this.scene = scene;
        this.checkpoints = checkpoints;
        this.currentCheckpoint = 0;

        this.scene.addNode(this.checkpoints[0].node);
        this.finished = false;

        this.time = 0;
        this.interval = null;
        this.timer = this.timer.bind(this);

        this.timeLbl = document.getElementById("timeLbl");
    }

    getCheckpoint() {
        return this.checkpoints[this.currentCheckpoint];
    }

    timer() {
        this.time += .1;
        this.timeLbl.innerText = "Time: " + this.time.toFixed(2) + " sec";
    }

    start() {
        this.timeLbl.style.visibility = "visible";
        this.interval = setInterval(this.timer, 100);

        this.check();
    }

    pause() {
        clearInterval(this.interval);
    }

    continue() {
        this.interval = setInterval(this.timer, 100);
    }

    check() {
        this.scene.removeNode(this.checkpoints[this.currentCheckpoint++].node);

        if(this.currentCheckpoint < this.checkpoints.length) this.scene.addNode(this.checkpoints[this.currentCheckpoint].node);
        else this.finish();
    }

    finish() {
        setTimeout(() => {
            this.timeLbl.style.visibility = "hidden";
            this.time = 0;
        }, 5000);
        this.finished = true;

        this.currentCheckpoint = 0;
        this.scene.addNode(this.checkpoints[0].node);

        clearInterval(this.interval);
    }
}