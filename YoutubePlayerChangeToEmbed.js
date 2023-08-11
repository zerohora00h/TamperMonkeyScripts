// ==UserScript==
// @name         Replace Youtube Player
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  This simple script changes the YouTube player for an embed of the video, this allows the video to run without ads, since ads are not displayed in embeds.
// @author       ZeroHora
// @match        *://www.youtube.com/watch*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/zerohora00h/TamperMonkeyScripts/main/YoutubePlayerChangeToEmbed.js
// @downloadURL  https://raw.githubusercontent.com/zerohora00h/TamperMonkeyScripts/main/YoutubePlayerChangeToEmbed.js
// ==/UserScript==

const app = (videoId) => {

if(!videoId) return

let videoContainer

async function waitForPlayerContainer() {
  return new Promise((resolve) => {
    const intervalLoop = setInterval(() => {

      const content = document.querySelector('#ytd-player')

      if (content) {
        console.log('Video player loaded, script working now...');
        clearInterval(intervalLoop);
        resolve(content);
      }

    }, 100);
  });
}

//videoContainer = await waitForPlayerContainer();

(async () => {
  videoContainer = await waitForPlayerContainer();

videoContainer.innerHTML = '';

const iframeToInject = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" class="html5-video-player ytp-transparent ytp-exp-bottom-control-flexbox ytp-exp-ppp-update unstarted-mode ytp-hide-controls ytp-hide-info-bar ytp-large-width-mode" title="YT Video" id="injected-iframe"></iframe>`;

videoContainer.innerHTML = iframeToInject;

function hide(element) {
    if(!element) return

    element.style.display = "none"
}

function show(element) {
    if(!element) return

    element.style.display = ""
}

const intervalId = setInterval(() => {

    let iframe = document.querySelector('#injected-iframe')
    if(!iframe) clearInterval(intervalId);

    iframe = iframe.contentDocument

    const shareButton = iframe.querySelector('.ytp-button.ytp-share-button.ytp-show-share-title.ytp-share-button-visible')

    const channelTitle = iframe.querySelector('.ytp-title-channel')
    const videoTitle = iframe.querySelector('.ytp-title')
    const moreVideoBtn = iframe.querySelector('.ytp-pause-overlay-container')
    const openOnYTBtn = iframe.querySelector('.ytp-youtube-button.ytp-button.yt-uix-sessionlink')
    const channelVideoInnerImg = iframe.querySelector('.annotation.annotation-type-custom.iv-branding')
    const watchLaterBtn = iframe.querySelector('.ytp-watch-later-button.ytp-button.ytp-show-watch-later-title')

    const pipBtn = iframe.querySelector('.ytp-pip-button.ytp-button')

    if (shareButton) {
      console.log('The selector was found, replacing player...')

      hide(shareButton)
      hide(channelTitle)
      hide(videoTitle)
      hide(moreVideoBtn)
      hide(openOnYTBtn)
      hide(channelVideoInnerImg)
      hide(watchLaterBtn)

      show(pipBtn)

      clearInterval(intervalId);
    }
}, 200);

})();
}

const getVideoId = () => {
        const url = document.location.search;

        // A regular expression to find the value of the parameter "v"
        const match = url.match(/[?&]v=([^&]+)/);

        if (!match) {
            return null
        }

        return match[1];
}

(function() {
    'use strict';

    if(document.location.href.includes('watch')) { app(getVideoId()) }

      const checkUrl = setInterval(() => {

      if(!document.location.href.includes('watch') && document.querySelector('#injected-iframe')) {
        document.querySelector('#injected-iframe').remove()
        clearInterval(checkUrl);
      }

    }, 500);

    navigation.addEventListener('navigate', (event) => {
        const url = event.destination.url;

        if(!url.includes('watch')) return

        // A regular expression to find the value of the parameter "v"
        const match = url.match(/[?&]v=([^&]+)/);

        if (!match) {
            return
        }

        app(match[1])
    });
})();
