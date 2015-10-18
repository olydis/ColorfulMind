/// <reference path="../decls/jquery.d.ts" />
/// <reference path="../decls/require.d.ts" />
/// <reference path="../decls/socket.io-client.d.ts" />
/// <reference path="../shared/include.ts" />
/// <reference path="../decls/webrtc/MediaStream.d.ts" />
/// <reference path="../decls/webaudioapi/waa.d.ts" />

import $ = require("jquery");

import EnvironmentTS = require("Environment");
type Environment = EnvironmentTS.Environment;
var Environment = EnvironmentTS.Environment;

import ModeTS = require("Mode");
type Mode = ModeTS.Mode;
var Mode = ModeTS.Mode;

// fix color vision
import ModeVideoFilterLinear = require("ModeVideoFilterLinear");
var ModeVideoFilterContrast = ModeVideoFilterLinear.ModeVideoFilterContrast;
var ModeVideoFilterSimCB = ModeVideoFilterLinear.ModeVideoFilterSimCB;
var ModeVideoFilterSimRG = ModeVideoFilterLinear.ModeVideoFilterSimRG;

import ModeDangerTS = require("ModeDanger");
var ModeDanger = ModeDangerTS.ModeDanger;

import ModeVideoFilterRedFlashTS = require("ModeVideoFilterRedFlash");
var ModeVideoFilterRedFlash = ModeVideoFilterRedFlashTS.ModeVideoFilterRedFlash;


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

function vibrate(duration: number = 200)
{
    (<any>navigator).vibrate && (<any>navigator).vibrate(duration);
}

// INIT
$(() => {
    var vWidth: number = 320;
    var vHeight: number = 240;
    var video = <HTMLVideoElement>$("#inputVideo")[0];
    video.width = vWidth;
    video.height = vHeight;
    

    navigator.getUserMedia({ video: true, audio: true }, 
        stream => 
        {
            video.onloadedmetadata = ev =>
            {
                var AudioContext: AudioContextConstructor = window.AudioContext || (<any>window).webkitAudioContext;
                var audioContext = new AudioContext();
                
                var inputPoint = audioContext.createGain();

                // Create an AudioNode from the stream.
                var realAudioInput = audioContext.createMediaStreamSource(stream);
                var audioInput = realAudioInput;
                audioInput.connect(inputPoint);
            
                var analyserNode = audioContext.createAnalyser();
                analyserNode.fftSize = 256;
                inputPoint.connect( analyserNode );
                
                var zeroGain = audioContext.createGain();
                zeroGain.gain.value = 0.0;
                inputPoint.connect( zeroGain );
                zeroGain.connect( audioContext.destination );
                
                main(new Environment({ x: video.videoWidth, y: video.videoHeight }, video, analyserNode));
            };
            video.src = window.URL.createObjectURL(stream);
            video.play();
        }, 
        error => 
        {
            //environment.videoInput = null;
            //main(environment);
            window.alert(error);
        });
});

// CALLED WHEN READY
function main(environment: Environment)
{
    var body = $("body");
    
    // MODES
    var modes: Mode[] = [
        new ModeVideoFilterRedFlash(environment),
        //new ModeVideoFilterContrast(environment),
        new ModeVideoFilterSimRG(environment),
        new ModeVideoFilterSimCB(environment),
        new ModeDanger(environment),
    ];
    var mode: Mode = null;
    var wrapper = $("<div>");
    
    var modeIndex = 0;
    var flashCaption = () =>
    {
        var caption = $(".modeCaption");
        caption.show();
        setTimeout(() => caption.fadeOut(), 3000);
    };
    var transition = (index: number) =>
    {
        modeIndex = ((index % modes.length) + modes.length) % modes.length;
        
        var oldWrapper = wrapper;
        wrapper = $("<div>").appendTo(body).addClass("modeWrapper").hide();
        mode = modes[modeIndex];
        mode.init(wrapper);
        
        // handle caption
        document.title = mode.getTitle();
        wrapper.append($("<span>").addClass("modeCaption").text(mode.getTitle()));
        
        // replace GUI
        oldWrapper.fadeOut(undefined, () =>
        {
            vibrate();
            oldWrapper.remove();
            wrapper.fadeIn(undefined, () => flashCaption());
        });
    };
    
    // HACK: make every mode fast (guess: firefox caller-dependent optimization)
    for (var i = 0; i < modes.length; i++)
    {
        wrapper.remove();
        wrapper = $("<div>").appendTo(body).addClass("modeWrapper").hide();
        mode = modes[i];
        mode.init(wrapper);
        mode.update();
    }
    transition(0);
    
    // SWIPE EVENTS
    var xThresh = 100;
    var off = () => body.off("mousemove touchmove");
    body.on("mousedown touchstart", eo => {
        var startX = eo.pageX || (<any>eo.originalEvent).changedTouches[0].pageX;
        body.on("mousemove touchmove", eo =>
        {
            var currX = eo.pageX || (<any>eo.originalEvent).changedTouches[0].pageX;
            var deltaX = currX - startX;
            if (deltaX < -xThresh)
            {
                transition(modeIndex + 1);
                off();
            }
            if (deltaX > xThresh)
            {
                transition(modeIndex - 1);
                off();
            }
        });
    });
    body.on("mouseup touchend", () => off());
    

    body.click(() => { document.body.requestFullscreen(); flashCaption(); });
    
    setInterval(() => 
    {
        wrapper.css("width", Math.min($(window).width(), $(window).height() * environment.size.x / environment.size.y) + "px");
        wrapper.css("height", Math.min($(window).width() * environment.size.y / environment.size.x, $(window).height()) + "px");
        mode.update();
    }, 10);
}