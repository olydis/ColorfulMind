/// <reference path="../decls/jquery.d.ts" />

import Environment = require("Environment");
type Environment = Environment.Environment;

export abstract class Mode
{
	public constructor(protected env: Environment)
	{ }
	
	public abstract init(container: JQuery): void;
	
	public abstract update(): void;
    
	public abstract getTitle(): string;
}