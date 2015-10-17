/// <reference path="../decls/jquery.d.ts" />
/// <reference path="../decls/require.d.ts" />
/// <reference path="../decls/socket.io-client.d.ts" />
/// <reference path="../shared/include.ts" />
/// <reference path="../decls/webrtc/MediaStream.d.ts" />

import $ = require("jquery");

document.body.requestFullscreen = 
    document.body.requestFullscreen || 
    document.body.webkitRequestFullscreen || 
    (<any>document.body).mozRequestFullScreen || 
    (<any>document.body).msRequestFullscreen;
navigator.getUserMedia = 
    navigator.getUserMedia || 
    navigator.webkitGetUserMedia || 
    navigator.mozGetUserMedia || 
    navigator.msGetUserMedia;

// HELPERS
function getTimeMs(): number { return Date.now(); }
function saturate(x: number): number { return x < 0 ? 0 : (x > 1 ? 1 : x); }

var vWidth: number = 1200;
var vHeight: number = 900;

// INIT
$(() => {
    var video = <HTMLVideoElement>$("#inputVideo")[0];
    video.width = vWidth;
    video.height = vHeight;
    var canvas = <HTMLCanvasElement>$("#outputVideo")[0];
    canvas.width = vWidth;
    canvas.height = vHeight;

    navigator.getUserMedia({ video: true }, 
        stream => 
        {
            video.src = window.URL.createObjectURL(stream);
            video.play();
            main(canvas.getContext("2d"), video);
        }, 
        error => 
        {
            window.alert("COULD NOT SETUP VIDEO INPUT; " + error);
        });
});

// CALLED WHEN READY
function main(context: CanvasRenderingContext2D, inputVideo: HTMLVideoElement)
{
    $("body").click(() => document.body.requestFullscreen());
    
    setInterval(() => {        
        context.drawImage(inputVideo, 0, 0, vWidth, vHeight);
        var imageData = context.getImageData(0, 0, vWidth, vHeight);
        processImage(imageData);
        context.putImageData(imageData, 0, 0);
    }, 20);
}

function processImage(imageData: ImageData)
{
    var time = getTimeMs();
    var pulse = Math.abs((time / 300) % 2 - 1); // [0..1] continuously

    var raw = imageData.data;
    for (var y = 0, i = 0; y < imageData.height; ++y)
        for (var x = 0; x < imageData.width; ++x, i += 4)
        {
            var r = raw[i + 0];
            var g = raw[i + 1];
            var b = raw[i + 2];
            
            var notRed = Math.max(g, b / 2);
            var redness = saturate((r - notRed - 40) / (r + 1));
            var flashFactor = 1 + (pulse - 0.5) * 1.7 * redness;
            r *= flashFactor;
            g *= flashFactor;
            b *= flashFactor;
            
            raw[i + 0] = r;
            raw[i + 1] = g;
            raw[i + 2] = b;
        }
}