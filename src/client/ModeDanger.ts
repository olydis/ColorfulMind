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
			dangerLevel: () => Math.random()
		});
		this.detectors.push({
			description: "suspicious movement",
			dangerLevel: () => Math.random()
		});
	}

	public init(container: JQuery): void
	{
		this.detectors.forEach(detector =>
		{
			var panel = $("<p>").addClass("detectorPanel");
			panel.css("height", ((100 / this.detectors.length) | 0) + "%");
			panel.text(detector.description);
			container.append(panel);
		});
	}
	
	public update(): void
	{
		this.detectors.forEach((detector, i) =>
		{
			var level = detector.dangerLevel();
			var x = $("p.detectorPanel").eq(i);
			x
				.css("background-color", "rgb(" + (saturate(level * 2) * 85 | 0) + ", " + (saturate(2 - level * 2) * 85 | 0) + ", 0)")
				.css("line-height", x.height() + "px")
				.text("" + detector.dangerLevel().toFixed(5));
		});
	}

	public getTitle(): string
	{
		return "danger analysis"
	}
}