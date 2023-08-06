// ==UserScript==
// @name         Recarregar página do YouTube em caso de erro
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Recarrega a página do YouTube quando uma das classes de erro for encontrada
// @author       ZeroHora
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const targetClasses = ['ytp-error-content-wrap-reason'];
    const reloadInterval = 500; // Tempo em milisegundos

    // Função para recarregar a página
    function reloadPage() {
        window.location.reload();
    }

    // Verificar periodicamente se alguma das classes de erro está presente e recarregar a página quando encontrada
    setInterval(() => {
        for (const targetClass of targetClasses) {
            const errorElement = document.querySelector('.' + targetClass);
            if (errorElement) {
                reloadPage();
                break; // Recarrega a página apenas uma vez se uma das classes for encontrada
            }
        }
    }, reloadInterval);
})();
