/// <reference path="../shared/include.ts" />

export class Environment
{
	private freqByteData: Uint8Array;
	
	public constructor(
		public size: Vector2D, 
		public videoInput: HTMLVideoElement,
		private analyserNode: AnalyserNode)
	{ 
		this.freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
	}
	
	public getAudioFrequencies(): Uint8Array
	{
		this.analyserNode.getByteFrequencyData(this.freqByteData);
		return this.freqByteData;
	}
}