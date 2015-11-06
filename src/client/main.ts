/// <reference path="../decls/jquery.d.ts" />
/// <reference path="../decls/require.d.ts" />
/// <reference path="../decls/socket.io-client.d.ts" />
/// <reference path="../shared/include.ts" />
/// <reference path="../decls/webrtc/MediaStream.d.ts" />
/// <reference path="../decls/webaudioapi/waa.d.ts" />

import $ = require("jquery");

import { Environment } from "Environment";
import { Mode } from "Mode";

// fix color vision
import { ModeVideoFilterContrast, ModeVideoFilterSimCB, ModeVideoFilterSimProtanope, ModeVideoFilterSimDeuteranope, ModeVideoFilterSimTritanope, ModeVideoFilterDaltonize } from "ModeVideoFilterLinear";
import { ModeVideoFilterRedFlash } from "ModeVideoFilterRedFlash";

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
    
    if (!navigator.getUserMedia) 
        throw "no camera detected";
    else
        navigator.getUserMedia({ video: true, audio: false }, 
            stream => 
            {
                video.onloadedmetadata = () => main(new Environment({ x: video.videoWidth, y: video.videoHeight }, video));
                video.src = window.URL.createObjectURL(stream);
                video.play();
            }, 
            error => { throw "failed to access camera"; });
});

window.onerror = errorMsg => (alert("Unhandled error: " + errorMsg), false);

// CALLED WHEN READY
function main(environment: Environment)
{
    var body = $("body");
    
    // MODES
    var modes: Mode[] = [
        new ModeVideoFilterDaltonize(environment),
        new ModeVideoFilterRedFlash(environment),
        //new ModeVideoFilterContrast(environment),
        new ModeVideoFilterSimProtanope(environment),
        new ModeVideoFilterSimDeuteranope(environment),
        new ModeVideoFilterSimTritanope(environment),
        new ModeVideoFilterSimCB(environment)
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
        $("audio").each((i: number, e: HTMLAudioElement) => { e.pause(); try { e.currentTime = 0; } catch (e) { } e.muted = false; });
    
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
            environment.vibrate();
            oldWrapper.remove();
            wrapper.fadeIn(undefined, () => flashCaption());
        });
    };
    
    // HACK: make every mode fast (guess: firefox caller-dependent optimization)
    $("audio").each((i: number, e: HTMLAudioElement) => e.muted = true);
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
    body.on("mousedown touchstart", eo => 
    {
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
    

    //body.click(() => { document.body.requestFullscreen(); });
    
    setInterval(() => 
    {
        wrapper.css("width", Math.min($(window).width(), $(window).height() * environment.size.x / environment.size.y) + "px");
        wrapper.css("height", Math.min($(window).width() * environment.size.y / environment.size.x, $(window).height()) + "px");
        mode.update();
    }, 10);
}