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
	
	private sensitivity: number;
	
	public init(container: JQuery): void
	{
		super.init(container);
		this.sensitivity = 0.5;
		container.click(eo => this.sensitivity = eo.pageX / container.width());
	}

	public processImage(imageData: ImageData)
	{
		var time = getTimeMs();
		var pulse = time / 300 % 2 < 1 ? 1 : 0; // Math.abs((time / 300) % 2 - 1); // [0..1]
	
		var raw = imageData.data;
        
        // var avgR: number = 0;
        // var avgG: number = 0;
        // var avgB: number = 0;
		// for (var y = 0, i = 0; y < imageData.height; ++y)
		// 	for (var x = 0; x < imageData.width; ++x, i += 4)
        //     {
		// 		avgR += raw[i + 0];
		// 		avgG += raw[i + 1];
		// 		avgB += raw[i + 2];
        //     }
        // avgR /= imageData.width * imageData.height;
        // avgG /= imageData.width * imageData.height;
        // avgB /= imageData.width * imageData.height;
        // $("body").css("background", `rgb(${avgR | 0}, ${avgG | 0}, ${avgB | 0})`);

		for (var y = 0, i = 0; y < imageData.height; ++y)
			for (var x = 0; x < imageData.width; ++x, i += 4)
			{
				var r = raw[i + 0];
				var g = raw[i + 1];
				var b = raw[i + 2];
				
				var notRed = Math.max(g, b / 2);
				var redness = saturate((r - notRed - 20) / (r + 1)) * this.sensitivity;
                
				r *= 1 + (pulse - 0.5) * 3.7 * redness;
				g *= 1 - pulse * 0.9 * redness;
				b *= 1 - pulse * 0.9 * redness;
				
				raw[i + 0] = r;
				raw[i + 1] = g;
				raw[i + 2] = b;
			}
	}
	
	public getTitle(): string
	{
		return "red enhancement";
	}
}