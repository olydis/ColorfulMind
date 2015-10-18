/// <reference path="../shared/include.ts" />

export class Environment
{
    public accelIntens: number = (<any>window).DeviceOrientationEvent ? 0 : 0.5;

    private prevx: number[] = [];
    private prevy: number[] = [];
    private prevz: number[] = [];
    private windowSize: number = 10;

    private sq(x: number) { return x*x; }

    private magnitude(x: number, y: number, z: number) {
        return Math.sqrt(x*x + y*y + z*z);
    }

    private accelWindow: number[] = [];
    private cntover99: number = 0;

	private freqByteData: Uint8Array;
	public latLong: Vector2D = { x: 0, y: 0 };
    public speed: number;
	
    public playSound(id: string): void
    {
        var audio = <HTMLAudioElement>$("#" + id)[0];
        audio.play();
    }
    
    public constructor(
        public size: Vector2D, 
        public videoInput: HTMLVideoElement,
        private analyserNode: AnalyserNode)
    { 
        this.freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
        
		navigator.geolocation.watchPosition((position: Position) =>
		{
			this.latLong.y = position.coords.latitude;
			this.latLong.x = position.coords.longitude;
            this.speed = position.coords.speed;
		});

		window.addEventListener('deviceorientation', (event) => {
          var x = event.alpha;
          var y = event.beta;
          var z = event.gamma;

          this.prevx = [x].concat(this.prevx);
          this.prevy = [y].concat(this.prevy);
          this.prevz = [z].concat(this.prevz);
          while (this.prevx.length > this.windowSize) this.prevx.pop();
          while (this.prevy.length > this.windowSize) this.prevy.pop();
          while (this.prevz.length > this.windowSize) this.prevz.pop();

          var abs: number = 0;
          for (var i = 0; i < Math.min(this.windowSize, this.prevx.length); ++i) {
            var add = this.sq(x-this.prevx[i]) + this.sq(y-this.prevy[i]) + this.sq(z-this.prevz[i])
            abs += add;
          }
          abs /= this.windowSize;
          abs = Math.log(1+abs)/6;
          this.accelIntens = abs;

          this.accelWindow.push(abs);
          while (this.accelWindow.length > 500) this.accelWindow.shift();
        });
	}
	
	public getLoudness(): number
	{
		this.analyserNode.getByteFrequencyData(this.freqByteData);
        var freqs = this.freqByteData; 
        var sum = freqs.reduce((a,b) => a+b, 0);
        var max = freqs.reduce((a,b) => Math.max(a, b), 0);
        var highest = freqs.indexOf(max);
        return (sum > 10000 ? 0.5 : 0) + (highest > freqs.length / 4 ? 0.5 : 0);
	}

    public getAccelDanger(): number
    {
        if (this.accelWindow.length == 0) return 0;
        
        var sum = 0;
        for (var i = 0; i < this.accelWindow.length; ++i)
            sum += this.accelWindow[i];
        sum /= this.accelWindow.length;

        var ret = 1-Math.min(1, sum);

        if (ret > 0.98) this.cntover99++;
        else if (this.cntover99 > 300) { this.cntover99 = 0; this.accelWindow = []; }

        if (this.cntover99 > 300) return Math.max(0, ret - (this.cntover99 - 300)/300);

        return ret;
    }
    
    public vibrate(duration: number = 200): void
    {
        (<any>navigator).vibrate && (<any>navigator).vibrate(duration);
    }
}