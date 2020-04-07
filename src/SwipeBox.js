import React, { useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import Swiper from "swiper";
import $ from "jquery";
import "./swipe-box-styles.css";

const appendNumber = 600;
const prependNumber = 1;

function getAbsoluteHeight(el) {
  /*
  // Get the DOM Node if you pass in a string
  el = typeof el === "string" ? document.querySelector(el) : el;

  var styles = window.getComputedStyle(el);
  var margin =
    parseFloat(styles["marginTop"]) + parseFloat(styles["marginBottom"]);

  return Math.ceil(el.offsetHeight + margin);
  */
  return 465;
}

function findEmpty(slides) {
  let slide;
  for (let index = 0; index < 4; index += 1) {
    slide = slides[index];
    if (!slide.hasChildNodes()) {
      return slide;
    }
  }
}

function findSlide(slides, slideIndex) {
  const targetIndex = String(slideIndex);
  let slide;
  for (let index = 0; index < 4; index += 1) {
    slide = slides.eq(index);
    if (slide.data("swiper-slide-index") === targetIndex) {
      return slide[0];
    }
  }
}

const myPlugin = {
  name: "debugger",
  params: {
    debugger: false,
    translateStatus: {
      start: false,
      delta: 0
    }
  },
  on: {
    init: function() {
      if (!this.params.debugger) return;
      console.log("init");
    },
    click: function(e) {
      if (!this.params.debugger) return;
      console.log("click");
    },
    tap: function(e) {
      if (!this.params.debugger) return;
      console.log("tap");
    },
    progress: function(e) {
      if (!this.params.debugger) return;
      console.log("progress");
    },
    doubleTap: function(e) {
      if (!this.params.debugger) return;
      console.log("doubleTap");
    },
    sliderMove: function(e) {
      if (!this.params.debugger) return;
      console.log("sliderMove", e);
    },
    slideChange: function() {
      if (!this.params.debugger) return;
      console.warn(
        "*****slideChange",
        this.previousIndex,
        "->",
        this.activeIndex
      );
    },
    slideChangeTransitionStart: function(e) {
      if (!this.params.debugger) return;
      console.log("slideChangeTransitionStart", e);
    },
    slideChangeTransitionEnd: function() {
      if (!this.params.debugger) return;
      console.log("slideChangeTransitionEnd");
    },
    slidePrevTransitionStart: function(e) {
      if (!this.params.debugger) return;
      console.log("slidePrevTransitionStart", e);
    },
    slidePrevTransitionEnd: function() {
      if (!this.params.debugger) return;
      console.log("slidePrevTransitionEnd");
    },
    slideNextTransitionStart: function(e) {
      if (!this.params.debugger) return;
      console.log("slideNextTransitionStart", e);
    },
    slideNextTransitionEnd: function() {
      if (!this.params.debugger) return;
      console.log("slideNextTransitionEnd");
    },
    setTranslate: function(translate) {
      if (!this.params.debugger) return;
      console.log(
        "setTranslate",
        translate,
        //this.realIndex,
        this.activeIndex,
        this.previousIndex,
        this.params.translateStatus
      );
      if (this.params.translateStatus.start) {
        const nextDelta = translate - this.params.translateStatus.startPosition;
        const direction = nextDelta <= 0;
        if (
          this.params.translateStatus.direction === undefined ||
          this.params.translateStatus.direction === direction
        ) {
          if (this.params.slideHeight <= Math.abs(nextDelta)) {
            // XXX 1번 동작 종료 코드
            let slide = findSlide(
              this.slides,
              this.params.translateStatus.startIndex
            );
            if (slide.hasChildNodes()) {
              slide = findEmpty(this.slides);
            }
            slide.append(...this.params.elemGhost.childNodes);
            slide.style.visibility = null; //"visible";
            this.params.translateStatus.start = false;
            delete this.params.translateStatus.direction;
            console.log(
              "*****start:OVERFLOW",
              //this.realIndex,
              this.activeIndex,
              this.previousIndex
            );
          } else {
            this.params.translateStatus.direction = direction;
            this.params.translateStatus.delta = nextDelta;
            const deltaValue = direction
              ? Math.min(
                  1,
                  Math.max(0.5, 1 + nextDelta / (2 * this.params.slideHeight))
                )
              : Math.max(
                  0.5,
                  Math.min(1, 0.5 + nextDelta / (2 * this.params.slideHeight))
                );
            if (this.params.translateStatus.startIndex > -1) {
              this.params.elemGhost.style.opacity = deltaValue;
              this.params.elemGhost.style.transform = `scale(${deltaValue})`;
            }
            console.log(
              "*****start:MOVING",
              this.params.translateStatus.direction,
              this.params.translateStatus.delta,
              deltaValue,
              //this.realIndex,
              this.activeIndex,
              this.previousIndex
            );
          }
        } else {
          if (this.params.translateStatus.startIndex > -1) {
            // XXX 1번 동작 종료 코드
            let slide = findSlide(
              this.slides,
              this.params.translateStatus.startIndex
            );
            if (slide.hasChildNodes()) {
              slide = findEmpty(this.slides);
            }
            slide.append(...this.params.elemGhost.childNodes);
            slide.style.visibility = null; //"visible";
            this.params.translateStatus.start = false;
            delete this.params.translateStatus.direction;
            console.log(
              "*****start:CHANGE-DIRECTION",
              //this.realIndex,
              this.activeIndex,
              this.previousIndex
            );
          }
        }
      } else {
        if (this.params.translateStatus.previousPosition !== undefined) {
          let delta = translate - this.params.translateStatus.previousPosition;
          if (Math.abs(delta) > 5) {
            // TODO: 마지막 것보다 더 큰지도 검사 필요
            this.params.translateStatus.start = true;
            this.params.translateStatus.startPosition = this.params.translateStatus.previousPosition;
            delete this.params.translateStatus.previousPosition;
            this.params.translateStatus.delta = delta;
            if (delta <= 0) {
              const activeIndex = this.activeIndex === 0 ? 0 : this.activeIndex;
              const slide = findSlide(this.slides, activeIndex);
              // 시작한 slide index
              this.params.translateStatus.startIndex = activeIndex;
              this.params.elemGhost.append(...slide.childNodes);
              this.params.elemGhost.style.opacity = 1;
              this.params.elemGhost.style.transform = "scale(1)";
              slide.style.visibility = "hidden";
              console.log(
                "*****start:UP",
                //this.realIndex,
                this.activeIndex,
                this.previousIndex,
                slide
              );
            } else {
              // virtual mode 이므로, 변경될 slide는 항상 0 혹은 1번이다.
              // TODO: active가 0일때 처리 필요
              if (this.activeIndex > 0) {
                const activeIndex = this.activeIndex - 1;
                const slide = findSlide(this.slides, activeIndex);
                // 시작한 slide index
                this.params.translateStatus.startIndex = activeIndex;
                this.params.elemGhost.append(...slide.childNodes);
                this.params.elemGhost.style.opacity = 0.5;
                this.params.elemGhost.style.transform = "scale(0.5)";
                slide.style.visibility = "hidden";
                console.log(
                  "*****start:DN",
                  //this.realIndex,
                  this.activeIndex,
                  this.previousIndex,
                  slide
                );
              } else {
                this.params.translateStatus.startIndex = -1;
                this.params.elemGhost.style.opacity = 0;
                console.log(
                  "*****start:DN-TOP",
                  //this.realIndex,
                  this.activeIndex,
                  this.previousIndex
                );
              }
            }
          }
        } else {
          // 계속 과거 상태를 저장해서, 어느 방향으로 이동했는지를 알아 낸다.
          // 이로서, 1temp 늦게 반응하게 된다.
          this.params.translateStatus.previousPosition = translate;
        }
      }
    },
    setTranslation: function(e) {
      if (!this.params.debugger) return;
      console.log("setTranslation", e);
    },
    transitionStart: function() {
      if (!this.params.debugger) return;
      // Touch 마쳤을 때,
      if (this.params.translateStatus.start) {
        // virtual mode 이므로, 항상 active index는 0 혹은 1번이다.
        if (this.params.translateStatus.startIndex === -1) {
          console.log(
            "*****run:DN-TOP",
            //this.realIndex,
            this.activeIndex,
            this.previousIndex
          );
        } else if (this.params.translateStatus.startIndex === undefined) {
          // TODO: 나중에 바닥을 올렸을 때 처리
          console.log(
            "*****run:UP-BOTTOM",
            //this.realIndex,
            this.activeIndex,
            this.previousIndex
          );
        } else {
          console.log(
            "*****run",
            //this.realIndex,
            this.activeIndex,
            this.previousIndex
          );
          $(this.params.elemGhost).animate(
            this.params.translateStatus.direction
              ? {
                  opacity: 0.5,
                  transform: "scale(0.5)"
                }
              : {
                  opacity: 1,
                  transform: "scale(1)"
                },
            {
              duration: 100,
              specialEasing: {
                width: "linear",
                height: "easeOutBounce"
              },
              complete: function() {
                let slide = findSlide(
                  this.slides,
                  // 원복
                  this.params.translateStatus.startIndex !== this.activeIndex
                    ? this.activeIndex === 0
                      ? 0
                      : this.previousIndex
                    : this.activeIndex
                );
                if (slide.hasChildNodes()) {
                  slide = findEmpty(this.slides);
                }
                slide.append(...this.params.elemGhost.childNodes);
                slide.style.visibility = null; //"visible";
                console.log(
                  "*****end",
                  this.realIndex,
                  this.activeIndex,
                  this.previousIndex,
                  slide
                );
              }.bind(this)
            }
          );
        }
      }
      console.log(
        "transitionStart",
        this.activeIndex,
        this.slides[this.activeIndex]
      );
    },
    transitionEnd: function() {
      if (!this.params.debugger) return;
      if (this.params.translateStatus.start) {
        this.params.translateStatus.start = false;
        delete this.params.translateStatus.direction;
      }
      console.log("transitionEnd");
    },
    fromEdge: function() {
      if (!this.params.debugger) return;
      console.log("fromEdge");
    },
    reachBeginning: function() {
      if (!this.params.debugger) return;
      console.log("reachBeginning");
    },
    reachEnd: function() {
      if (!this.params.debugger) return;
      console.log("reachEnd");
    }
  }
};

export default function SwipeBox() {
  const refThis = useRef(null);
  useEffect(() => {
    console.log("***", ReactDOM.findDOMNode(refThis.current));
    const ghost = document.getElementsByClassName("swiper-slide-ghost")[0];
    myPlugin.params.elemGhost = ghost.getElementsByClassName("swiper-slide")[0];
    myPlugin.params.slideHeight = getAbsoluteHeight(".swiper-slide-active");
    Swiper.use(myPlugin);
    //const swiper = new Swiper(".swiper-container", {
    const swiper = new Swiper(ReactDOM.findDOMNode(refThis.current), {
      slidesPerView: 2,
      direction: "vertical",
      centeredSlides: false,
      setWrapperSize: false,
      autoHeight: false,
      /*effect: 'coverflow',
      coverflowEffect: {
        rotate: 0,
        stretch: 20,
        depth: 30,
        slideShadows: false
      },*/
      spaceBetween: 30,
      speed: 300,
      /* pagination: {
        el: '.swiper-pagination',
        type: 'fraction'
      }, */
      /* navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }, */
      freeModeSticky: true,
      preventInteractionOnTransition: true,
      virtual: {
        slides: (function() {
          const slides = [];
          for (let i = 0; i < appendNumber; i += prependNumber) {
            slides.push(`<div>
              <h1>Card #${i + 1}</h1>
              <p>Card Content</p>
            </div>`);
          }
          return slides;
        })()
      },
      debugger: true
    });
    return () => {
      swiper.destroy(true, true);
    };
  }, []);

  return (
    <div className="swiper-container" ref={refThis}>
      <div className="swiper-slide-ghost">
        <div className="swiper-slide" />
      </div>
      <div className="swiper-wrapper" />
    </div>
  );
}
