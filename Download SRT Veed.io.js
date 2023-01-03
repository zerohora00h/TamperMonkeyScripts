// ==UserScript==
// @name         Download SRT Veed
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Download SRT Free from Veed
// @author       ZeroHora
// @match        https://www.veed.io/edit/*/subtitles
// @icon         https://www.google.com/s2/favicons?sz=64&domain=veed.io
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    async function getSubtitles() {
    try {
        const response = await fetch('/api/v1/subtitles?projectId=' + document.location.pathname.split('/')[2], {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        downloadSrt(data.data[0].subtitles)

    } catch (error) {
        console.error('Erro ao acessar a url')
        console.log(error)
    }
}

function convertToSrt(data) {
    let srt = '';
    let counter = 1;

    // Obtém uma lista de IDs ordenados pelo tempo de início
    const ids = Object.keys(data).sort((a, b) => data[a].from - data[b].from);

    for (const id of ids) {
        const entry = data[id];
        const startTime = entry.from;
        const endTime = entry.to;
        const words = entry.words;

        srt += counter + '\n';
        srt += convertToTimecode(startTime) + ' --> ' + convertToTimecode(endTime) + '\n';

        for (const word of words) {
            srt += word.value + ' ';
        }

        srt += '\n\n';
        counter++;
    }

    return srt;
}

function convertToTimecode(time) {
    const seconds = Math.floor(time);
    const fraction = time - seconds;
    const milliseconds = Math.floor(fraction * 1000);

    const date = new Date(null);
    date.setSeconds(seconds);

    let timecode = date.toISOString().substr(11, 8);
    timecode += ',' + milliseconds.toString().padStart(3, '0');

    return timecode;
}

function downloadSrt(data) {
    const srt = convertToSrt(data);

    const blob = new Blob([srt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.download = 'subtitles.srt';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const main = document.querySelector('main.app');

main.insertAdjacentHTML('beforeend', `
    <div class="floatSRDownload">Press CTRL + SPACE to download SRT Free</div>
`);

document.body.insertAdjacentHTML('beforeend', `
  <style>
    .floatSRDownload {
      position: fixed;
      right: 50%;
      bottom: 94%;
      z-index: 999;
    }
  </style>
`);

    document.addEventListener('keydown', event => {
        if (event.key === ' ' && event.ctrlKey) {
            getSubtitles();
        }
    });
})();
