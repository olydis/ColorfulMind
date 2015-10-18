/// <reference path="../decls/jquery.d.ts" />
/// <reference path="Environment.ts" />

import Environment = require("Environment");
type Environment = Environment.Environment;

import ModeTS = require("Mode");
type Mode = ModeTS.Mode;
var Mode = ModeTS.Mode;

export class ModeGame extends Mode
{
    private context: CanvasRenderingContext2D;

    private currY: number = 0;
    private nextBoxY: number = 100;
    private nextBoxDx: number = 1;
    private myDx: number = 1;
    private yRate: number = 1;
    private frameCount: number = 0;
    private song: HTMLAudioElement;

    public constructor(env: Environment)
    {
        super(env);
    }

    private getRandTrack(): number
    {
        return Math.floor(Math.random()*3);
    }
    
    public init(container: JQuery): void
    {
        this.currY = 0;
        this.nextBoxY = 100;
        this.nextBoxDx = this.getRandTrack();
        this.myDx = 1;
        this.yRate = 1;
        this.frameCount = 0;
        this.song = (<HTMLAudioElement>$("#gameSong")[0]);

        this.song.loop = true;
        this.song.play();

        container.on("mousedown touchstart", eo => {
            var startX = eo.pageX || (<any>eo.originalEvent).changedTouches[0].pageX;
            startX -= container.offset().left;

            if (startX < container.width()/2) this.myDx--;
            else this.myDx++;

            if (this.myDx == 3) {
                this.myDx = 2;
                this.env.vibrate(100);
            }
            if (this.myDx == -1) {
                this.myDx = 0;
                this.env.vibrate(100);
            }
        });
    }
    
    public update(): void
    {
        this.frameCount++;
        this.currY += this.yRate;
        if (this.frameCount % 500)
            this.yRate += 0.1;

        var boxDst = this.nextBoxY - this.currY;

        if (this.myDx == this.nextBoxDx) {
            if (boxDst < 0) { // HIT! -> gameover
                while(1){};
            } else {
                (<HTMLAudioElement>$("#gameSong")[0]).volume = Math.min(boxDst / 100, 1);
            }
        } else {
            if (boxDst < 0) {
                this.nextBoxDx = this.getRandTrack();
                this.nextBoxY = this.currY + 100 * (0.1 + Math.random());
            }
            (<HTMLAudioElement>$("#gameSong")[0]).volume = 1;
        }
    }
    
    public processImage(imageData: ImageData)
    {
        throw "VIRTUAL";
    }
}