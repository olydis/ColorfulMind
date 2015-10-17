/// <reference path="../decls/jquery.d.ts" />

import Environment = require("Environment");
type Environment = Environment.Environment;

export class Mode
{
	public constructor(protected env: Environment)
	{ }
	
	public init(container: JQuery): void
	{
		throw "VIRTUAL";
	}
	
	public update(): void
	{
		throw "VIRTUAL";
	}
	
	public getTitle(): string
	{
		throw "VIRTUAL";
	}
}