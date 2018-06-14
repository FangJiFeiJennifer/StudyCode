/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = window.sinon;
const sinonChai = require('sinon-chai');
const lazyLoadModule = require('../index');
const siteSpeedChannel = require('raptor-pubsub').channel('site-speed-ebay');

chai.use(sinonChai);

const removeEl = (el) => el.parentNode.removeChild(el);

window.highline = window.highline || { lazyLoadAll: false };

describe('Lazy Load Images Test Suite', () => {
    describe('init Test Suite', () => {
        let handler;
        const spy = sinon.spy();
        before(() => {
            handler = lazyLoadModule.handler;
            lazyLoadModule.handler = spy;
            lazyLoadModule.init();
        });

        after(() => {
            lazyLoadModule.handler = handler;
            lazyLoadModule.queue = [];
            lazyLoadModule.tearDown();
        });

        it('adds a lazyLoad object to the global scope', () => {
            const lazyLoad = window.lazyLoad;
            expect(lazyLoad).to.be.an('object');
            expect(lazyLoad.addToQueue).to.be.a('function');
        });

        it('handles a resize event', done => {
            window.addEventListener('resize', function eventHandler() {
                expect(spy).to.have.been.calledWithMatch({ type: "resize" });
                expect(spy).to.have.been.calledOnce;
                window.removeEventListener('resize', eventHandler);
                done();
            });
            window.dispatchEvent(new Event('resize'));
        });

        it('handles a scroll event', done => {
            window.addEventListener('scroll', function eventHandler() {
                expect(spy).to.have.been.calledWithMatch({ type: "scroll" });
                expect(spy).to.have.been.calledTwice;
                window.removeEventListener('scroll', eventHandler);
                done();
            });
            window.dispatchEvent(new Event('scroll'));
        });
    });

    describe("loadImageDiv Test Suite", () => {
        let el, backgroundDiv, img;
        const dataSrc = 'http://ebay.com/image.jpg';

        before(lazyLoadModule.init);
        after(lazyLoadModule.tearDown);

        beforeEach(() => {
            el = document.createElement('div');
            el.dataset.src = dataSrc;
            backgroundDiv = document.createElement('div');
            el.appendChild(backgroundDiv);
            img = document.createElement('img');
            el.appendChild(img);
            document.body.appendChild(el);
        });

        afterEach(() => {
            removeEl(el);
        });

        describe('on success', () => {
            beforeEach(() => {
                lazyLoadModule.loadImageDiv({ target: el });
                img.dispatchEvent(new Event('load'));
            });

            it('sets the div\'s background', () => {
                expect(el.style.backgroundImage).to.equal(`url(${dataSrc})`);
            });

            it('sets the placeholder div\'s opacity to 0', () => {
                expect(backgroundDiv.style.opacity).to.equal('0');
            });

            it('Change the place image\'s src for the dataset src', () => {
                expect(img.src).to.equal(dataSrc);
            });
        });

        describe('on error', () => {
            before(lazyLoadModule.init);
            after(lazyLoadModule.tearDown);

            beforeEach(() => {
                lazyLoadModule.loadImageDiv({ target: el });
                img.dispatchEvent(new Event('error'));
            });

            it('Should remove the img tag', () => {
                expect(el.children.length).to.equal(1);
            });

            it('sets the div\'s background', () => {
                expect(el.style.backgroundImage).to.equal('none');
            });

            it('sets the placeholder div\'s opacity to 1 for fallback', () => {
                expect(backgroundDiv.style.opacity).to.equal('1');
            });

            it('Change the place image\'s src for the dataset src', () => {
                expect(img.src).to.equal(dataSrc);
            });
        });
    });

    describe('loadImageIfVisible', () => {
        let el, el2;
        let spy;
        let spy2;

        before(lazyLoadModule.init);
        after(lazyLoadModule.tearDown);

        beforeEach(() => {
            spy = sinon.spy();
            spy2 = sinon.spy();

            el = document.createElement('div');
            el.style.height = "2000px";
            el.style.width = "100px";
            document.body.appendChild(el);
            el.addEventListener('lazyLoad', spy);

            el2 = document.createElement('div');
            el2.style.height = "100px";
            el2.style.width = "100px";
            document.body.appendChild(el2);
            el2.addEventListener('lazyLoad', spy2);
        });

        afterEach(() => {
            removeEl(el);
            removeEl(el2);
            lazyLoadModule.queue = [];
        });

        it('load an image if it\'s visible and updates the queue', () => {
            lazyLoadModule.queue.push(el);
            lazyLoadModule.loadImageIfVisible(el);
            expect(spy).to.have.been.calledOnce;
            expect(lazyLoadModule.queue).to.be.empty;
        });

        it('doesn\'t load non-visible images', () => {
            lazyLoadModule.queue.push(el2);
            lazyLoadModule.queue.push(el);
            lazyLoadModule.loadImageIfVisible(el2);
            expect(spy2).to.have.not.been.called;
            expect(lazyLoadModule.queue).to.have.lengthOf(2);
        });

        it('loads an image at a specific place in the queue', () => {
            lazyLoadModule.queue.push(el2);
            lazyLoadModule.queue.push(el);
            lazyLoadModule.loadImageIfVisible(el, 1);
            expect(lazyLoadModule.queue).to.have.lengthOf(1);
            expect(lazyLoadModule.queue[0]).to.equal(el2);
        });
    });

    describe('less lazy approach', () => {
        let el, el2;
        let spy;
        let spy2;

        const setUp = () => {
            spy = sinon.spy();
            spy2 = sinon.spy();

            el = document.createElement('div');
            el.style.height = "2000px";
            el.style.width = "100px";
            document.body.appendChild(el);
            el.addEventListener('lazyLoad', spy);

            el2 = document.createElement('div');
            el2.style.height = "100px";
            el2.style.width = "100px";
            document.body.appendChild(el2);
            el2.addEventListener('lazyLoad', spy2);

            lazyLoadModule.init();

            lazyLoadModule.queue.push(el2);
            lazyLoadModule.queue.push(el);
        };

        const tearDown = () => {
            lazyLoadModule.tearDown();
            removeEl(el);
            removeEl(el2);
            lazyLoadModule.queue = [];
        };

        it('loads all images after window.onload if user has HIGH bandwidth', () => {
            window.highline.lazyLoadAll = true;
            setUp();

            expect(lazyLoadModule.queue).to.have.lengthOf(2);
            window.dispatchEvent(new Event('load'));
            expect(lazyLoadModule.queue).to.have.lengthOf(0);

            tearDown();
        });

        it('loads only visible images before/after window.onload if user has LOW bandwidth', () => {
            window.highline.lazyLoadAll = false;
            setUp();

            expect(lazyLoadModule.queue).to.have.lengthOf(2);
            window.dispatchEvent(new Event('load'));
            window.dispatchEvent(new Event('scroll'));
            expect(lazyLoadModule.queue).to.have.lengthOf(1);

            tearDown();
        });
    });

    describe('handler Test Suite', () => {
        let spy;

        before(lazyLoadModule.init);
        after(lazyLoadModule.tearDown);

        beforeEach(() => {
            spy = sinon.spy(lazyLoadModule, 'loadImageIfVisible');
        });

        afterEach(() => {
            spy.restore();
            lazyLoadModule.queue = [];
        });

        it('handles iterating through the queue', () => {
            const el = document.createElement('div');
            const el2 = document.createElement('div');

            lazyLoadModule.queue.push(el);
            lazyLoadModule.queue.push(el2);
            lazyLoadModule.handler();
            expect(spy).to.have.been.calledTwice;
        });

        it('handles iterating through the queue with carousel override', () => {
            const el = document.createElement('div');
            const el2 = document.createElement('div');

            const e = {
                getBoundingClientRect() {
                    return {
                        width: 10,
                        left: 5
                    };
                }
            };

            lazyLoadModule.queue.push(el);
            lazyLoadModule.queue.push(el2);
            lazyLoadModule.carouselHandler(e);
            expect(spy).to.have.been.calledWith(el, 0, 25);
            expect(spy).to.have.been.calledWith(el2, 1, 25);
        });

        it('handles iterating through the queue without carousel override', () => {
            window.highline.lazyLoadOnlyFirstCarouselPage = true;

            const el = document.createElement('div');
            const el2 = document.createElement('div');

            const e = {
                getBoundingClientRect() {
                    return {
                        width: 10,
                        left: 5
                    };
                }
            };

            lazyLoadModule.queue.push(el);
            lazyLoadModule.queue.push(el2);
            lazyLoadModule.carouselHandler(e);
            expect(spy).to.have.been.calledWith(el, 0);
            expect(spy).to.have.been.calledWith(el2, 1);

            window.highline.lazyLoadOnlyFirstCarouselPage = true;
        });
    });

    describe("ATF Tracking Suite", () => {
        before(lazyLoadModule.init);
        after(lazyLoadModule.tearDown);

        it("should set the loaded time", () => {
            const img = document.createElement("img");
            lazyLoadModule.setLoadTime(img);

            expect(img.getAttribute("data-load-time")).to.exist;
        });

        it("should get the loaded time", () => {
            const img = document.createElement("img");
            lazyLoadModule.setLoadTime(img);

            expect(lazyLoadModule.getLoadTime(img)).to.be.ok;
        });

        it("should report the ATF time", (done) => {
            const div = document.createElement("div");
            const img1 = document.createElement("img");
            let img2;
            lazyLoadModule.setLoadTime(img1);

            div.appendChild(img1);
            div.classList.add("hl-atf-module-js");
            document.body.appendChild(div);

            siteSpeedChannel.on("metricsData", (e) => {
                // should measure 100ms from img2 since it was loaded last
                expect(e.jsljgr2).to.equal(100);
                expect(lazyLoadModule.getLoadTime(img2)).to.be.above(lazyLoadModule.getLoadTime(img1));
                removeEl(div);
                done();
            });

            setTimeout(() => {
                img2 = document.createElement("img");
                lazyLoadModule.setLoadTime(img2);
                div.appendChild(img2);
                const time = lazyLoadModule.getLoadTime(img2);
                lazyLoadModule.startTime = time - 100;
                window.dispatchEvent(new Event('load'));
            }, 50);
        });
    });
});
