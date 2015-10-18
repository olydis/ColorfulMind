/// <reference path="../decls/jquery.d.ts" />
/// <reference path="Environment.ts" />

import Environment = require("Environment");
type Environment = Environment.Environment;

import ModeTS = require("Mode");
type Mode = ModeTS.Mode;
var Mode = ModeTS.Mode;

function saturate(x: number): number { return x < 0 ? 0 : (x > 1 ? 1 : x); }

export class ModeDanger extends Mode
{
	private detectors: { description: string; dangerLevel: () => number }[] = [];
	
	public constructor(env: Environment)
	{
		super(env);
		this.detectors.push({
			description: "suspicious acceleration",
			dangerLevel: () => env.getAccelDanger()
		});
		this.detectors.push({
			description: "suspicious sounds",
			dangerLevel: () => 
			{ 
				var freqs = this.env.getAudioFrequencies(); 
				var sum = freqs.reduce((a,b) => a+b, 0);
				var high = freqs.slice(freqs.length / 2).reduce((a,b) => a + (b / 50 | 0), 0);
				return (sum > 10000 ? 0.5 : 0) + (high > 5 ? 0.5 : 0);
			}
		});
		this.detectors.push({
			description: "suspicious movement",
			dangerLevel: () => {
				var danger: Vector2D = { x: 8.6506698, y: 53.1681188 };
				var loc: Vector2D = this.env.latLong;
				var delta = { x: danger.x - loc.x, y: danger.y - loc.y };
				return 1 - (delta.x * delta.x + delta.y * delta.y) * 10000;
			}
		});
		this.detectors.push({
			description: "SOS button",
			dangerLevel: () => 0
		});
	}

	public init(container: JQuery): void
	{
		this.detectors.forEach((detector, i) =>
		{
			var panel = $("<p>").addClass("detectorPanel");
			panel.css("height", ((100 / this.detectors.length) | 0) + "%");
			panel.text(detector.description);
			container.append(panel);
			
			if (i == 3)
			{
				panel.click(() => 
				{
					var level = 1 - detector.dangerLevel();
					detector.dangerLevel = () => level;
				});
			}
		});
	}
	
	public update(): void
	{
		var totalDanger: number = 0;
		this.detectors.forEach((detector, i) =>
		{
			var level = detector.dangerLevel();
			totalDanger += level;
			var x = $("p.detectorPanel").eq(i);
			x
				.css("background-color", "rgb(" + (saturate(level * 2) * 85 | 0) + ", " + (saturate(2 - level * 2) * 85 | 0) + ", 0)")
				.css("line-height", x.height() + "px");
				
			if (i == 1)
				x.css("font-family", "monospace").css("font-size", "10px").text(this.env.getAudioFrequencies().reduce((a, b) => a + b, 0) + " : " + this.env.getAudioFrequencies().reduce((a,b) => a + String.fromCharCode((b / 50 | 0) + 65), ""));
			if (i == 2)
				x.css("font-family", "monospace").css("font-size", "10px").text(JSON.stringify(this.env.latLong));
		});
		if (totalDanger > 1.9)
			this.env.vibrate(50);
	}

	public getTitle(): string
	{
		return "danger analysis"
	}
}