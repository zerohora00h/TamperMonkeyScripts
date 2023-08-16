// ==UserScript==
// @name         Replace Youtube Player
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  This simple script changes the YouTube player for an embed of the video, this allows the video to run without ads, since ads are not displayed in embeds.
// @author       ZeroHora
// @match        *://www.youtube.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/zerohora00h/TamperMonkeyScripts/main/YoutubePlayerChangeToEmbed.js
// @downloadURL  https://raw.githubusercontent.com/zerohora00h/TamperMonkeyScripts/main/YoutubePlayerChangeToEmbed.js
// ==/UserScript==

//it's saved here just for testing. It has several issues with it that can be annoying, but works.

document.addEventListener('yt-navigate-start', function(){

    if(document.getElementById("YOUTUBEADBLOCKBLOCKPLAYER")){
        document.getElementById("YOUTUBEADBLOCKBLOCKPLAYER").remove();
        console.log("[INFO] Removed player");
    }

});

function initNewPlayer(userEmbedURL, adblockMessageParent){
    console.log("[INFO] Creating player");
    let newPlayer = document.createElement("iframe");
    newPlayer.setAttribute("id", "YOUTUBEADBLOCKBLOCKPLAYER");
    newPlayer.setAttribute("class", "html5-video-player ytp-transparent ytp-exp-bottom-control-flexbox ytp-exp-ppp-update ytp-hide-controls ytp-hide-info-bar ytp-large-width-mode");
    newPlayer.setAttribute("height", "720");
    newPlayer.setAttribute("width", "1280");
    newPlayer.setAttribute("src", userEmbedURL);
    adblockMessageParent[0].appendChild(newPlayer);
}

document.addEventListener('yt-navigate-finish', function(){

    let userEmbedURLFormat = window.location.href.replace("watch?v=", "embed/");

    let userEmbedURL = userEmbedURLFormat.slice(0,41) + "?autoplay=1";

    setTimeout(function(){
        const injectedIframe = document.getElementById("YOUTUBEADBLOCKBLOCKPLAYER");
        
        if(!injectedIframe){
            
            let adblockMessage = document.querySelectorAll("div.style-scope.ytd-enforcement-message-view-model");
            let adblockMessageParent = document.querySelectorAll("ytd-enforcement-message-view-model.style-scope.yt-playability-error-supported-renderers");
            if(adblockMessage[0]){
                adblockMessage[0].remove();
                initNewPlayer(userEmbedURL, adblockMessageParent);
            } else {
                initNewPlayer(userEmbedURL, adblockMessageParent);
                if(!adblockMessage[0])
                {
                    console.log("[WARN] Adblock message already removed, or hasnt been removed.");
                }
            }
        }
    }, 1)
});
