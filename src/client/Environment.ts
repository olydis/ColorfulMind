/// <reference path="../shared/include.ts" />

export class Environment
{
	private freqByteData: Uint8Array;
	public latLong: Vector2D = { x: 0, y: 0 };
	
	public constructor(
		public size: Vector2D, 
		public videoInput: HTMLVideoElement,
		private analyserNode: AnalyserNode)
	{ 
		this.freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
		
		navigator.geolocation.watchPosition((position: any) =>
		{        
			this.latLong.y = position.coords.latitude;
			this.latLong.x = position.coords.longitude;
		});
	}
	
	public getAudioFrequencies(): Uint8Array
	{
		this.analyserNode.getByteFrequencyData(this.freqByteData);
		return this.freqByteData;
	}
}