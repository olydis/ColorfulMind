/// <reference path="../decls/jquery.d.ts" />
/// <reference path="Environment.ts" />

import Environment = require("Environment");
type Environment = Environment.Environment;

import ModeTS = require("Mode");
type Mode = ModeTS.Mode;
var Mode = ModeTS.Mode;

export class ModeDanger extends Mode
{
	public constructor(env: Environment)
	{
		super(env);
	}

	public init(container: JQuery): void
	{
		
	}
	
	public update(): void
	{
		
	}

	public getTitle(): string
	{
		return "danger analysis"
	}
}