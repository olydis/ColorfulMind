/// <reference path="../decls/jquery.d.ts" />
/// <reference path="Environment.ts" />

import Environment = require("Environment");
type Environment = Environment.Environment;

import ModeVideoFilterTS = require("ModeVideoFilter");
type ModeVideoFilter = ModeVideoFilterTS.ModeVideoFilter;
var ModeVideoFilter = ModeVideoFilterTS.ModeVideoFilter;

export class ModeVideoFilterSimRG extends ModeVideoFilter
{
	public constructor(env: Environment)
	{
		super(env);
	}

	public processImage(imageData: ImageData)
	{
		var raw = imageData.data;
		for (var i = 0; i < raw.length; i += 4)
		{
			var r = raw[i + 0];
			var g = raw[i + 1];
			var b = raw[i + 2];
			
			r = g = (r + g) / 2;
			
			raw[i + 0] = r;
			raw[i + 1] = g;
			raw[i + 2] = b;
		}
	}
	
	public getTitle(): string
	{
		return "simulate red-green blindness";
	}
}