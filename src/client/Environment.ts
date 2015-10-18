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

	public constructor(public size: Vector2D, public videoInput: HTMLVideoElement)
	{
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

    public getAccelDanger(): number
    {
        var sum = 0;
        for (var i = 0; i < this.accelWindow.length; ++i)
            sum += this.accelWindow[i];
        sum /= this.accelWindow.length;

        if (sum > 0.99) this.cntover99++;

        return 1-Math.min(1, sum);
    }
}