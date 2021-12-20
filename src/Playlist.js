export class Playlist {
    constructor() {
        this.order = [...Array(Playlist.songs.length).keys()];
        this.playing = 0;
        this.songNameLbl = document.getElementById("song-name");

        this.audio = new Audio();
        this.audio.addEventListener("ended", () => this.onFinish());
        this.maxVolume = 0.1;
        this.volumeStep = this.maxVolume/100;

        this.animateTime = this.maxVolume/this.volumeStep;

        this.seeker = null;

        this.shuffle();
        this.setSrc();
    }

    shuffle() {
        for (let i = this.order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.order[i], this.order[j]] = [this.order[j], this.order[i]];
        }
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    getFileName() {
        const index = this.order[this.playing];
        return Playlist.songs[index];
    }

    play() {
        const fileName = this.getFileName().replace(/\.[^/.]+$/, "");
        this.songNameLbl.innerHTML = fileName;
        $(document).ready(function () {
			$('.toast').toast('show');
		});
        if(this.audio) {
            this.audio.play();
            this.seeker = setInterval(() => {
                if(this.duration - this.audio.currentTime <= this.animateTime) {
                    this.animateVolume(-this.volumeStep, this.maxVolume);
                }
            }, 1000);
            this.animateVolume(this.volumeStep, this.maxVolume);
        }
    }

    pause() {
        if(this.audio) {
            this.audio.pause();
            this.audio.volume = 0;
            clearInterval(this.seeker)
        }
    }

    setSrc() {
        this.audio.src = "./res/audio/playlist/" + this.getFileName();
        this.duration = this.audio.duration;
        this.audio.volume = 0;
    }

    onFinish() {
        this.next();
        this.play();
    }

    animateVolume(value, desired) {
        let i = setInterval(() => {
            if(this.audio.volume + value <= 1) this.audio.volume += value;
            if(Math.abs(this.audio.volume - desired) <= value || this.audio.paused) {
                clearInterval(i);
            }
        }, 100);
    }

    next() {
        this.playing = (this.playing + 1) % this.order.length;
        this.setSrc();
    }

    prev() {
        this.playing = (this.order.length + this.playing - 1) % this.order.length;
        this.setSrc();
    }
}

Playlist.songs = [
    "2nd Life - Broken [Copyright Free Trap Music].mp3",
    "2nd Life - Night [No Copyright].mp3",
    "2Scratch - MONEY (feat. M.I.M.E).mp3",
    "3rd Prototype - After the Storm [NCS Release].mp3",
    "4ЯR - Hide.mp3",
    "A.T. - The Smoke [Copyright Free Trap Music].mp3",
    "Alter. - Dancing With The Devil.mp3",
    "Angst - God Tier.mp3",
    "Anikdote - Turn It Up (No Copyright Music).mp3",
    "ASKA - Ghost.mp3",
    "Atheris - Delusion [Copyright Free Trap Music].mp3",
    "Audiovista - Kick It [Copyright Free Trap Music].mp3",
    "Audiovista - Kick It.mp3",
    "Aywy. & EphRem - Adderall.mp3",
    "Azide & Sushii Boiis - Sushii JP Performance.mp3",
    "Beatmount - All I Want.mp3",
    "DAZZ - Masterpiece.mp3",
    "DNOZO - Take Me [Copyright Free Trap Music].mp3",
    "Dustin Que ft. Buffalo Stille - I'm Just Rocking [Copyright Free Trap Music].mp3",
    "E.P.O - Turn Up [Copyright Free Music].mp3",
    "EPIC COVER _ ''Zombie'' by Damned Anthem (The Cranberries Cover).mp3",
    "Ericovich - Lagoon [Copyright Free Trap Music].mp3",
    "Far Out - Apex.mp3",
    "Fizzy Daequan - GODFATHER [Copyright Free Trap Music].mp3",
    "Fizzy Daequan - Thug [Copyright Free Trap Music].mp3",
    "forest - BOOM.mp3",
    "GTA San Andreas (PedroDJDaddy Trap Remix).mp3",
    "Hahlweg - Eye For An Eye (feat. AERYN).mp3",
    "Hippie Sabotage - Devil Eyes.mp3",
    "Hoober & Coopex - Sacrament.mp3",
    "HOPEX - Chaos [No Copyright].mp3",
    "HOPEX - Conquer [Copyright Free Trap Music].mp3",
    "HOPEX - Conquer.mp3",
    "HOPEX - Found.mp3",
    "HOPEX - Fuego.mp3",
    "HOPEX - Movie [Copyright Free Trap Music].mp3",
    "HOPEX - Warrior [Copyright Free Trap Music].mp3",
    "Junona Boys - Faded.mp3",
    "KHVLIF - ROUGH [Copyright Free Trap Music].mp3",
    "KRAK'N - Lean [Copyright Free Trap Music].mp3",
    "Legna Zeg -Take On The World [No Copyright].mp3",
    "Lenka - Blue Skies (REVOKE Remix).mp3",
    "Lindsey Stirling - Shatter Me ( Trap Xenno ).mp3",
    "Melanie Martinez - Mad Hatter (KXA Remix).mp3",
    "Moldavite - I Need You [No Copyright].mp3",
    "MOLDΛVITE - Dreams Kill (everybody) [Copyright Free Trap Music].mp3",
    "MOLDΛVITE - Untouchable [Copyright Free Trap Music].mp3",
    "N i G H T S - Tequila.mp3",
    "Nirvana - Come As You Are (Evokings Remix).mp3",
    "Onur Ormen x BIOJECT - Pursuit [Copyright Free Trap Music].mp3",
    "PatrickReza - Tip Toe.mp3",
    "Prødigy - Drop [Free Trap].mp3",
    "Satara - Airstrike [Copyright Free Trap Music].mp3",
    "Satara - Eclipse [Copyright Free Trap Music].mp3",
    "Satara - Execution [Copyright Free Trap Music].mp3",
    "SickDope - Middle Fingers [Copyright Free Trap Music].mp3",
    "Sloth Syndrome & Brevis - Give U [Copyright Free Trap Music].mp3",
    "SpikedGrin - You & Me [Copyright Free Trap Music].mp3",
    "Sweepz - Apollo.mp3",
    "Sweepz - Blinq.mp3",
    "T-Mass - Who Am I.mp3",
    "t.A.T.u.- All The Things She Said (HBz Remix) (Bass Boosted).mp3",
    "Thomas Gresen - Alive [No Copyright].mp3",
    "Tomsize & Simeon - Jump (SKAN Remix).mp3",
    "TroyBoi - No Games.mp3",
    "TRPZN - Pull Up [Copyright Free Trap Music].mp3",
    "TRPZN - Spread Your Wings [Copyright Free Trap Music].mp3",
    "Turbo - Bandit [Copyright Free Trap Music].mp3",
    "TWERL - Feel No Pain (feat. Tima Dee).mp3",
    "Virtus - Dark Prince Rising.mp3",
    "WATEVA - Ber Zer Ker [NCS Release].mp3",
    "yasu - faith [Copyright Free Trap Music].mp3",
    "YESTER - Ignite [Copyright Free Trap Music].mp3",
    "ZERO X EDMUR QUINN - 'KILOS' FREE TRAP BEAT [Copyright Free Trap Music].mp3"
];