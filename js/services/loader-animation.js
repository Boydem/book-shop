'use strict'

const gOverlay = document.querySelector('.loader-overlay')
const gIntroLoader = document.querySelector('.loader-intro')

function loadPageAnimation() {
    gOverlay.classList.remove('hide')
    setTimeout(() => {
        gOverlay.classList.add('alpha-in')
        setTimeout(() => {
            gOverlay.classList.remove('alpha-in')
            setTimeout(() => {
                gOverlay.classList.add('hide')
            }, 500)
        }, 800)
    }, 0)
}

function introPageAnimation() {
    setTimeout(() => {
        gIntroLoader.classList.add('alpha-out')
        setTimeout(() => {
            gIntroLoader.classList.add('hide')
        }, 500)
    }, 150)
}