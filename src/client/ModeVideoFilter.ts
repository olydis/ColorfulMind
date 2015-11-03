/// <reference path="../decls/jquery.d.ts" />
/// <reference path="Environment.ts" />

import Environment = require("Environment");
type Environment = Environment.Environment;

import ModeTS = require("Mode");
type Mode = ModeTS.Mode;
var Mode = ModeTS.Mode;

export abstract class ModeVideoFilter extends Mode
{
	private context: CanvasRenderingContext2D;
	
	public constructor(env: Environment)
	{
		super(env);
	}
	
	public init(container: JQuery): void
	{
		var canvas = <HTMLCanvasElement>$("<canvas>").appendTo(container)[0];
		canvas.width = this.env.size.x;
		canvas.height = this.env.size.y;
		this.context = canvas.getContext("2d");
	}
	
	public update(): void
	{
		if (!this.env.videoInput) return;

		var context = this.context;
		
        context.drawImage(this.env.videoInput, 0, 0, this.env.size.x, this.env.size.y);
        var imageData = context.getImageData(0, 0, this.env.size.x, this.env.size.y);
        this.processImage(imageData);
        context.putImageData(imageData, 0, 0);
	}
	
	public abstract processImage(imageData: ImageData);
}