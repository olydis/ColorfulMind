/// <reference path="../decls/jquery.d.ts" />
/// <reference path="Environment.ts" />

import Environment = require("Environment");
type Environment = Environment.Environment;

import ModeVideoFilterTS = require("ModeVideoFilter");
type ModeVideoFilter = ModeVideoFilterTS.ModeVideoFilter;
var ModeVideoFilter = ModeVideoFilterTS.ModeVideoFilter;

// HELPERS
function getTimeMs(): number { return Date.now(); }
function saturate(x: number): number { return x < 0 ? 0 : (x > 1 ? 1 : x); }

export class ModeVideoFilterRedFlash extends ModeVideoFilter
{
	public constructor(env: Environment)
	{
		super(env);
	}

	public processImage(imageData: ImageData)
	{
		var time = getTimeMs();
		var pulse = Math.abs((time / 300) % 2 - 1); // [0..1] continuously
	
		var raw = imageData.data;
		for (var y = 0, i = 0; y < imageData.height; ++y)
			for (var x = 0; x < imageData.width; ++x, i += 4)
			{
				var r = raw[i + 0];
				var g = raw[i + 1];
				var b = raw[i + 2];
				
				var notRed = Math.max(g, b / 2);
				var redness = saturate((r - notRed - 40) / (r + 1));
				var flashFactor = 1 + (pulse - 0.5) * 1.7 * redness;
				r *= flashFactor;
				g *= flashFactor;
				b *= flashFactor;
				
				raw[i + 0] = r;
				raw[i + 1] = g;
				raw[i + 2] = b;
			}
	}
	
	public getTitle(): string
	{
		return "red flash";
	}
}