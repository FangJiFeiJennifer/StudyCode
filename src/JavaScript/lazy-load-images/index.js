/* eslint-disable no-param-reassign */
/* globals $ssgST, $rmod */
'use strict';

const SCROLL_PADDING = 200;
const THROTTLE_DELAY = 100;
const isOnScreen = require('../dom-util/is-on-screen');
const throttle = require('../dom-util/throttle');
const DATA_SRC = "data-src";
const LOAD = "load";
const SCROLL = "scroll";
const RESIZE = "resize";
const ERROR = "error";
const LAZY_LOAD = "lazyLoad";
const WHITE = "rgb(255, 255, 255)";
const LOAD_TIME = "data-load-time";
const CAROUSEL_PAGINATION = "hl-carousel-pagination";
const CAROUSEL_SCROLL = "hl-carousel-scroll";

const ADD_EVENT_LISTENER = "addEventListener";
const REMOVE_EVENT_LISTENER = "removeEventListener";
const REMOVE_ATTRIBUTE = "removeAttribute";
const SET_ATTRIBUTE = "setAttribute";
const GET_ATTRIBUTE = "getAttribute";
const HAS_ATTRIBUTE = "hasAttribute";
const GET_EL_BY_CLASS = "getElementsByClassName";
const QUERY_ALL = "querySelectorAll";

let pubsub;
let siteSpeedChannel;

const arraySlice = Array.prototype.slice;

const getColor = (sourceImage) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    document.body.appendChild(canvas);

    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height;

    context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const pixelCount = canvas.width * canvas.height;

    for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + 5) { // 5 is magic number, the lower the more accurate, but slower
        offset = i * 4;
        r = pixels[offset + 0];
        g = pixels[offset + 1];
        b = pixels[offset + 2];
        a = pixels[offset + 3];
        // If pixel is mostly opaque
        if (a >= 125) {
            canvas.parentNode.removeChild(canvas);
            return `rgb(${r}, ${g}, ${b})`;
        }
    }
    canvas.parentNode.removeChild(canvas);
    return WHITE;
};

const getLoadTime = el => parseInt(el[GET_ATTRIBUTE](LOAD_TIME));

const onDomReady = (callback) => {
    if (document.readyState !== "loading") {
        callback();
    } else {
        document.addEventListener("DOMContentLoaded", callback);
    }
};

const lazyLoadModule = {
    queue: [],

    startTime: (typeof $ssgST === "undefined" ? Date.now() : $ssgST), // getting ref. error in tests without type check

    init() {
        window.lazyLoad = window.lazyLoad || {};
        const lazyLoad = window.lazyLoad;

        lazyLoad.addToQueue = (el, fit) => { // eslint-disable-line consistent-return
            el[REMOVE_ATTRIBUTE]("onload");
            if (el[HAS_ATTRIBUTE]("data-load-immediately")) {
                if (fit) return lazyLoadModule.loadImageDiv({ target: el.parentElement });
                return lazyLoadModule.loadImage({ target: el });
            }

            if (fit) {
                const imageDiv = el.parentElement;
                imageDiv[ADD_EVENT_LISTENER](LAZY_LOAD, lazyLoadModule.loadImageDiv);
                lazyLoadModule.queue.unshift(imageDiv);
                lazyLoadModule.loadImageIfVisible(imageDiv);
            } else {
                el[ADD_EVENT_LISTENER](LAZY_LOAD, lazyLoadModule.loadImage);
                lazyLoadModule.queue.unshift(el);
                lazyLoadModule.loadImageIfVisible(el);
            }
        };

        onDomReady(() => {
            // need to load pubsub globally, since it is included in inception. We define it in our layout/index file
            pubsub = $rmod.require('/$/raptor-pubsub');
            siteSpeedChannel = pubsub.channel('site-speed-ebay');
        });

        if (window.highline.lazyLoadAll) {
            window[ADD_EVENT_LISTENER](LOAD, lazyLoadModule.loadAll);
        } else {
            lazyLoadModule.resizeHandler = throttle(lazyLoadModule.handler, THROTTLE_DELAY);
            lazyLoadModule.paginationHandler = throttle(lazyLoadModule.carouselHandler, THROTTLE_DELAY);
            lazyLoadModule.scrollHandler = throttle(lazyLoadModule.handler, THROTTLE_DELAY);

            window[ADD_EVENT_LISTENER](SCROLL, lazyLoadModule.scrollHandler);
            window[ADD_EVENT_LISTENER](RESIZE, lazyLoadModule.resizeHandler);
            onDomReady(() => {
                pubsub.on(CAROUSEL_PAGINATION, lazyLoadModule.paginationHandler);
                pubsub.on(CAROUSEL_SCROLL, lazyLoadModule.paginationHandler);
            });
        }

        window[ADD_EVENT_LISTENER](LOAD, lazyLoadModule.reportATFTime);
    },

    tearDown() {
        if (window.highline.lazyLoadAll) {
            window[REMOVE_EVENT_LISTENER](LOAD, lazyLoadModule.loadAll);
        } else {
            window[REMOVE_EVENT_LISTENER](SCROLL, lazyLoadModule.scrollHandler);
            window[REMOVE_EVENT_LISTENER](RESIZE, lazyLoadModule.resizeHandler);
            pubsub.removeListener(CAROUSEL_PAGINATION, lazyLoadModule.paginationHandler);
            pubsub.removeListener(CAROUSEL_SCROLL, lazyLoadModule.paginationHandler);
        }
        window[REMOVE_EVENT_LISTENER](LOAD, lazyLoadModule.reportATFTime);
    },

    reportATFTime() {
        // done on window onload, so safe to start querying DOM

        // grab all lazy-loaded images from the first two modules after window onload and get the slowest time to report
        const firstTwoModules = arraySlice.call(document[GET_EL_BY_CLASS]("hl-atf-module-js"), 0, 2);
        const loadedImages = firstTwoModules.reduce((images, el) => images.concat(arraySlice.call(el[QUERY_ALL](`[${LOAD_TIME}]`))), []); // eslint-disable-line max-len

        // sort by load times (we want the largest number which is the latest to finish loading)
        const lastImageLoaded = loadedImages.sort((a, b) => getLoadTime(b) - getLoadTime(a))[0]; // eslint-disable-line max-len
        const latestTime = lastImageLoaded ? getLoadTime(lastImageLoaded) : Date.now(); // if no images loaded and/or no modules, use current time to measure ATF against

        const siteSpeedMetrics = {
            jsljgr2: latestTime - lazyLoadModule.startTime // jsljgr2 is old ATF Calculation in ms
        };
        const timing = window.performance && window.performance.timing;
        if (timing) siteSpeedMetrics.i_29i = latestTime - timing.responseStart; // i_29i  is new ATF Calculation in ms

        siteSpeedChannel.emit('metricsData', siteSpeedMetrics);
    },

    setLoadTime(el) {
        el[SET_ATTRIBUTE](LOAD_TIME, Date.now());
    },

    getLoadTime, // for testing

    loadImage(e) {
        const el = e.target;
        const src = el[GET_ATTRIBUTE](DATA_SRC);

        const errorHandler = function(event) { // eslint-disable-line prefer-const
            if (!el) return;
            lazyLoadModule.setLoadTime(el);

            // No need to have this listener in the image's parent if there was an error fetching it
            el[REMOVE_EVENT_LISTENER](LAZY_LOAD, lazyLoadModule.loadImage);

            // For now it's okay to not show an image at all
            el.style.opacity = 0;
        };
        const loadHandler = function(event) {
            if (!el) return;
            lazyLoadModule.setLoadTime(el);
            el[REMOVE_EVENT_LISTENER](LOAD, loadHandler);
            el[REMOVE_EVENT_LISTENER](ERROR, errorHandler);
            el[REMOVE_ATTRIBUTE](DATA_SRC);
            let color;
            try {
                color = getColor(el);
            } catch (err) {
                color = WHITE;
            }
            const div = el.parentNode;
            div.style.backgroundColor = color;

            el.style.opacity = 1;
        };

        el[ADD_EVENT_LISTENER](LOAD, loadHandler);
        el[ADD_EVENT_LISTENER](ERROR, errorHandler);

        el.src = src;
    },

    loadImageDiv(e) {
        const el = e.target;
        const src = el.dataset ? el.dataset.src : el[GET_ATTRIBUTE](DATA_SRC);
        if (!src) {
            console.error("Can't find source of image", el);
            return;
        }
        let image = el.children[1];

        const errorHandler = function(event) { // eslint-disable-line prefer-const
            if (!el || !image) return;
            lazyLoadModule.setLoadTime(image);
            el.removeChild(image);
            image = null; // this so garbage collector removes the listeners assigned to the image

            // No need to have this listener in the image's parent if there was an error fetching it
            el[REMOVE_EVENT_LISTENER](LAZY_LOAD, lazyLoadModule.loadImage);

            // For now it's okay to not show an image at all
            el.style.backgroundImage = "none";
            el[REMOVE_ATTRIBUTE](DATA_SRC);
            // Show grey background
            el.children[0].style.opacity = 1;
        };
        const loadHandler = function(event) {
            if (!el || !image) return;
            lazyLoadModule.setLoadTime(image);
            image.src = src;
            image[REMOVE_EVENT_LISTENER](LOAD, loadHandler);
            image[REMOVE_EVENT_LISTENER](ERROR, errorHandler);
            el.style.backgroundImage = `url('${src}')`;
            el[REMOVE_ATTRIBUTE](DATA_SRC);
            el.children[0].style.opacity = 0;
        };

        image[ADD_EVENT_LISTENER](LOAD, loadHandler);
        image[ADD_EVENT_LISTENER](ERROR, errorHandler);

        image.src = src;
    },

    loadImageIfVisible(image, i, carouselOverride) {
        if (isOnScreen(image, carouselOverride, SCROLL_PADDING)) {
            const event = document.createEvent('Event');
            event.initEvent('lazyLoad', false, false);
            image.dispatchEvent(event);
            lazyLoadModule.queue.splice(i || 0, 1);
        }
    },

    loadAll() {
        for (let i = lazyLoadModule.queue.length - 1; i >= 0; i--) {
            const event = document.createEvent('Event');
            event.initEvent('lazyLoad', false, false);
            lazyLoadModule.queue[i].dispatchEvent(event);
            lazyLoadModule.queue.splice(i || 0, 1);
        }
    },

    iterateOverQueue(carouselOverride) {
        if (lazyLoadModule.queue.length === 0) return;
        for (let i = lazyLoadModule.queue.length - 1; i >= 0; i--) {
            lazyLoadModule.loadImageIfVisible(lazyLoadModule.queue[i], i, carouselOverride);
        }
    },

    handler() {
        lazyLoadModule.iterateOverQueue();
    },

    carouselHandler(e) {
        if (!e) return;
        // load the equivalent of 2 paginations of the carousel, the one in the window,
        // and the next one out of it
        const rect = e.getBoundingClientRect();
        const offset = rect.width * 2 + rect.left;
        lazyLoadModule.iterateOverQueue(offset);
    }
};

module.exports = lazyLoadModule;
