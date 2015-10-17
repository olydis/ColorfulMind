/// <reference path="../decls/jquery.d.ts" />
/// <reference path="Environment.ts" />

import Environment = require("Environment");
type Environment = Environment.Environment;

import ModeVideoFilterTS = require("ModeVideoFilter");
type ModeVideoFilter = ModeVideoFilterTS.ModeVideoFilter;
var ModeVideoFilter = ModeVideoFilterTS.ModeVideoFilter;

export class ModeVideoFilterLinear extends ModeVideoFilter
{
	public constructor(env: Environment, private matrix: number[][])
	{
		super(env);
	}

	public processImage(imageData: ImageData)
	{
		var raw = imageData.data;
		var matrix = this.matrix;
		for (var i = 0; i < raw.length; i += 4)
		{
			var r = raw[i + 0];
			var g = raw[i + 1];
			var b = raw[i + 2];
			
			raw[i + 0] = matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b + (matrix[0][3] || 0) * 255;
			raw[i + 1] = matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b + (matrix[1][3] || 0) * 255;
			raw[i + 2] = matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b + (matrix[2][3] || 0) * 255;
		}
	}
}

export class ModeVideoFilterSimCB extends ModeVideoFilterLinear
{
	public constructor(env: Environment)
	{
		super(env, [
			[0.2126, 0.7152, 0.0722],
			[0.2126, 0.7152, 0.0722],
			[0.2126, 0.7152, 0.0722]
		]);
	}
	
	public getTitle(): string
	{
		return "simulate total color blindness (achromatopsia)";
	}
}

export class ModeVideoFilterSimRG extends ModeVideoFilterLinear
{
	public constructor(env: Environment)
	{
		super(env, [
			[0.3, 0.7, 0.0],
			[0.3, 0.7, 0.0],
			[0.0, 0.0, 1.0]
		]);
	}
	
	public getTitle(): string
	{
		return "simulate red–green color blindness (protanopia)";
	}
}

export class ModeVideoFilterContrast extends ModeVideoFilterLinear
{
	public constructor(env: Environment)
	{
		super(env, [
			[1.3, 0.0, 0.0, -0.15],
			[0.0, 1.3, 0.0, -0.15],
			[0.0, 0.0, 1.3, -0.15]
		]);
	}
	
	public getTitle(): string
	{
		return "high contrast";
	}
}
