/// <reference path="../shared/include.ts" />

export class Environment
{   
    public constructor(
        public size: Vector2D, 
        public videoInput: HTMLVideoElement)
    { }
    
    public vibrate(duration: number = 200): void
    {
        (<any>navigator).vibrate && (<any>navigator).vibrate(duration);
    }
}