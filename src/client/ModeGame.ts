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

    private currY: number;
    private nextBoxY: number;
    private nextBoxDx: number;
    private myDx: number;
    private yRate: number;
    private frameCount: number;
    private song: HTMLAudioElement;
    private container: JQuery;
    private points: number;

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
        this.points = 0;
        this.container = container;
        this.currY = 0;
        this.nextBoxY = 100;
        this.nextBoxDx = this.getRandTrack();
        this.myDx = 1;
        this.yRate = 0.1;
        this.frameCount = 0;
        this.song = (<HTMLAudioElement>$("#gameSong")[0]);

        this.song.loop = true;
        this.song.play();

        container.on("touchend", eo => {
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
        if (this.frameCount % 500 == 0)
            this.yRate += 0.01;

        var boxDst = this.nextBoxY - this.currY;

        if (this.myDx == this.nextBoxDx) {
            if (boxDst < 0) { // HIT! -> gameover
                alert("Game over: " + this.points);
                this.container.children().remove();
                this.init(this.container); 
            } else {
                this.song.volume = Math.min(boxDst / 100, 1);
            }
        } else {
            if (boxDst < 0) {
                this.points++;
                this.nextBoxDx = this.getRandTrack();
                this.nextBoxY = this.currY + 100 * (0.1 + Math.random());
            }
            this.song.volume = 1;
        }
    }

    public getTitle(): string
    {
        return "game"
    }
}