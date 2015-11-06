/// <reference path="../decls/jquery.d.ts" />
/// <reference path="Environment.ts" />

import Environment = require("Environment");
type Environment = Environment.Environment;

import ModeVideoFilterTS = require("ModeVideoFilter");
type ModeVideoFilter = ModeVideoFilterTS.ModeVideoFilter;
var ModeVideoFilter = ModeVideoFilterTS.ModeVideoFilter;

function matrixMul(a: number[][], b: number[][]): number[][]
{
    var b2 = JSON.parse(JSON.stringify(b));
    for (var y = 0; y < 3; y++)
        for (var x = 0; x < 3; x++)
            b2[y][x] = b[0][x] * a[y][0] + b[1][x] * a[y][1] + b[2][x] * a[y][2];
    return b2;
}
function matrixAdd(a: number[][], b: number[][]): number[][]
{
    var b2 = JSON.parse(JSON.stringify(b));
    for (var y = 0; y < 3; y++)
        for (var x = 0; x < 3; x++)
            b2[y][x] += a[y][x];
    return b2;
}

export abstract class ModeVideoFilterLinear extends ModeVideoFilter
{
    private matrix: number[][];
    
	public constructor(env: Environment, matrix: number[][][])
	{
		super(env);
        this.matrix = [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1]
		];
        matrix.forEach(matrix => this.matrix = matrixMul(matrix, this.matrix));
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

var matA = [[0,0,0],[0.7,1,0],[0.7,0,1]];
var matI = [[1,0,0],[0,1,0],[0,0,1]];
var matMI = [[-1,0,0],[0,-1,0],[0,0,-1]];
var rgb2lms = [[17.8824,43.5161,4.11935],[3.45565,27.1554,3.86714],[0.0299566,0.184309,1.46709]];
var lms2rgb = [[0.0809444479,-0.130504409,0.116721066],[-0.0102485335,0.0540193266,-0.113614708],[-0.000365296938,-0.00412161469,0.693511405]];
var simProtanope = [
                [0.0, 2.02344, -2.52581],
                [0.0, 1.0, 0.0],
                [0.0, 0.0, 1.0]
            ];
var simDeuteranope = [
                [1.0, 0.0, 0.0],
                [0.494207, 0.0, 1.24827],
                [0.0, 0.0, 1.0]
            ];
var simTritanope = [
                [1.0, 0.0, 0.0],
                [0.0, 1.0, 0.0],
                [-0.395913, 0.801109, 0.0]
            ];

export class ModeVideoFilterDaltonize extends ModeVideoFilterLinear
{
	public constructor(env: Environment)
	{
        var filter = matrixMul(lms2rgb, matrixMul(simProtanope, rgb2lms)); // = sim defect
        filter = matrixAdd(matI, matrixMul(matMI, filter));
        filter = matrixAdd(matI, matrixMul(matA, filter));
		super(env, [filter]);
	}
	
	public getTitle(): string
	{
		return "daltonization";
	}
}

export class ModeVideoFilterSimCB extends ModeVideoFilterLinear
{
	public constructor(env: Environment)
	{
		super(env, [[
                [0.2126, 0.7152, 0.0722],
                [0.2126, 0.7152, 0.0722],
                [0.2126, 0.7152, 0.0722]
            ]]);
	}
	
	public getTitle(): string
	{
		return "simulate total color blindness (achromatopsia)";
	}
}

export class ModeVideoFilterSimProtanope extends ModeVideoFilterLinear
{
	public constructor(env: Environment)
	{
		super(env, [
            rgb2lms, 
            simProtanope, 
            lms2rgb
        ]);
	}
	
	public getTitle(): string
	{
		return "simulate Protanope";
	}
}

export class ModeVideoFilterSimDeuteranope extends ModeVideoFilterLinear
{
	public constructor(env: Environment)
	{
		super(env, [
            rgb2lms, 
            simDeuteranope, 
            lms2rgb
        ]);
	}
	
	public getTitle(): string
	{
		return "simulate Deuteranope";
	}
}

export class ModeVideoFilterSimTritanope extends ModeVideoFilterLinear
{
	public constructor(env: Environment)
	{
		super(env, [
            rgb2lms, 
            simTritanope, 
            lms2rgb
        ]);
	}
	
	public getTitle(): string
	{
		return "simulate Tritanope";
	}
}

export class ModeVideoFilterContrast extends ModeVideoFilterLinear
{
	public constructor(env: Environment)
	{
		super(env, [[
			[1.3, 0.0, 0.0, -0.15],
			[0.0, 1.3, 0.0, -0.15],
			[0.0, 0.0, 1.3, -0.15]
		]]);
	}
	
	public getTitle(): string
	{
		return "high contrast";
	}
}
