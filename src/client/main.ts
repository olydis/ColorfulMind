/// <reference path="../decls/jquery.d.ts" />
/// <reference path="../decls/require.d.ts" />
/// <reference path="../decls/socket.io-client.d.ts" />
/// <reference path="../shared/include.ts" />
/// <reference path="../decls/webrtc/MediaStream.d.ts" />

import $ = require("jquery");

import EnvironmentTS = require("Environment");
type Environment = EnvironmentTS.Environment;
var Environment = EnvironmentTS.Environment;

import ModeTS = require("Mode");
type Mode = ModeTS.Mode;
var Mode = ModeTS.Mode;

import ModeVideoFilterRedFlashTS = require("ModeVideoFilterRedFlash");
var ModeVideoFilterRedFlash = ModeVideoFilterRedFlashTS.ModeVideoFilterRedFlash;

import ModeVideoFilterSimRGTS = require("ModeVideoFilterSimRG");
var ModeVideoFilterSimRG = ModeVideoFilterSimRGTS.ModeVideoFilterSimRG;

import ModeVideoFilterSimCBTS = require("ModeVideoFilterSimCB");
var ModeVideoFilterSimCB = ModeVideoFilterSimCBTS.ModeVideoFilterSimCB;

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

// INIT
$(() => {
    var vWidth: number = 320;
    var vHeight: number = 240;
    var video = <HTMLVideoElement>$("#inputVideo")[0];
    video.width = vWidth;
    video.height = vHeight;
    

    navigator.getUserMedia({ video: true }, 
        stream => 
        {
            video.onloadedmetadata = ev =>
            {
                main(new Environment({ x: video.videoWidth, y: video.videoHeight }, video));
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
        new ModeVideoFilterSimRG(environment),
        new ModeVideoFilterSimCB(environment),
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
            oldWrapper.remove();
            wrapper.fadeIn(undefined, () => flashCaption());
        });
    };
    
    // HACK: make every fast (guess: firefox caller-dependent optimization)
    for (var i = 0; i < modes.length; i++)
    {
        transition(i);
        mode.update();
    }
    
    // SWIPE EVENTS
    var xThresh = 50;
    var off = () => body.off("mousemove touchmove");
    body.on("mousedown touchstart", eo => {
        var startX = eo.pageX || (<any>eo.originalEvent).changedTouches[0].pageX;
        body.on("mousemove touchmove", eo =>
        {
            var currX = eo.pageX || (<any>eo.originalEvent).changedTouches[0].pageX;
            var deltaX = currX - startX;
            if (deltaX < -xThresh)
            {
                transition(modeIndex - 1);
                off();
            }
            if (deltaX > xThresh)
            {
                transition(modeIndex + 1);
                off();
            }
        });
    });
    body.on("mouseup touchend", () => off());
    

    body.dblclick(() => document.body.requestFullscreen());
    body.click(() => flashCaption());
    
    setInterval(() => 
    {
        wrapper.css("width", Math.min($(window).width(), $(window).height() * environment.size.x / environment.size.y) + "px");
        mode.update();
    }, 10);
}