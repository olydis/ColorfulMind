/// <reference path="../decls/jquery.d.ts" />
/// <reference path="Environment.ts" />

import Environment = require("Environment");
type Environment = Environment.Environment;

import ModeTS = require("Mode");
type Mode = ModeTS.Mode;
var Mode = ModeTS.Mode;

export class ModeDanger extends Mode
{
	private detectors: { description: string, dangerLevel: () => number }[] = [];
	
	public constructor(env: Environment)
	{
		super(env);
		this.detectors.push({
			description: "suspicious acceleration",
			dangerLevel: () => Math.random() * 3 | 0
		});
		this.detectors.push({
			description: "suspicious sounds",
			dangerLevel: () => Math.random() * 3 | 0
		});
		this.detectors.push({
			description: "suspicious movement",
			dangerLevel: () => Math.random() * 3 | 0
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
			$("p.detectorPanel").eq(i).removeClass("detectorPanel0 detectorPanel1 detectorPanel2").addClass("detectorPanel" + detector.dangerLevel());
		});
	}

	public getTitle(): string
	{
		return "danger analysis"
	}
}