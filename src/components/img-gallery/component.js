import * as arrUtil from './util/arrays';
import * as $ from './util/dom';
import { debounce, onBodyClick, onSwipeLR, sendEvent } from './util/events';

const BACK_EVENT = 'img-gallery-back';
const CLICK_EVENT = 'img-gallery-click';
const CURRENT_CLASS = 'img-gallery-current';
const DECK_ITEMS_CLASS = '.img-gallery-deck-items';
const NEXT_EVENT = 'img-gallery-next';
const TRANSITION_CLASS = 'img-gallery-transition';

let importedTemplate = $.importHTMLTemplate('img-gallery');

function getClickInfo(target) {
  let classes = $.classNames(target);
  let isImage = target.tagName.match(/img/i);
  let isButton = classes.includes('img-gallery-btn');

  return {
    isThumbnail: isImage && !classes.includes('img-gallery-deck-img'),
    isButton,
    isBackButton: isButton && classes.includes('img-gallery-btn-back')
  };
}

function setBtnLabel(context, direction, label) {
  if (label == null) { return; }
  $.find(`.img-gallery-btn-${direction}`, context).innerHTML = label;
}

onBodyClick(e => {
  let target = e.target;
  let parent = $.findParentByTagName(target, 'img-gallery');

  if (!parent) { return true; }

  let clickInfo = getClickInfo(target);

  if (clickInfo.isThumbnail) {
    parent.current = target;
    sendEvent(parent, CLICK_EVENT);
  } else if (clickInfo.isButton) {
    if (clickInfo.isBackButton) {
      sendEvent(parent, BACK_EVENT);
    } else {
      sendEvent(parent, NEXT_EVENT);
    }
  }
});

export default class ImgGallery extends HTMLElement {
  constructor() {
    super();

    this.currentIndex = 0;
    this.images = [];
    this.transitionTime = this.getAttribute('transition-time') || 0;
    this.touchStart = null;

    this.buildDOM();
  }

  disconnectedCallback() {
    this.setupEventHandlers('remove');
  }

  buildDOM() {
    importedTemplate.then(templateDocument => {
      let template = $.find('#img-gallery', templateDocument);
      let deepCopy = template.content.cloneNode(true);
      let images = $.findAll('img', this);

      this.appendChild(deepCopy);

      this.setupEventHandlers('add');

      if (images.length) {
        this.images = images;
        this.init();
      }
    });
  }

  init() {
    this.setupDeck();
    this.setupThumbs();
    this.setDeck();
  }

  back() {
    this.transitionDeckImages('right');
  }

  click() {
    this.setDeck(true);
  }

  get current() {
    return this.images[this.currentIndex];
  }

  set current(img) {
    $.removeClass(CURRENT_CLASS, this.current);
    this.currentIndex = $.findNodeIndex(this.images, _img => _img === img);
    $.addClass(CURRENT_CLASS, this.current);
  }

  getDeckImage(position) {
    return $.find(`.img-gallery-deck-${position}`, this);
  }

  getCurrentDeckImages() {
    return $.findAll('.img-gallery-deck-img');
  }

  getDeckImages() {
    let count = this.images.length;
    let index = this.currentIndex;
    let backImg;
    let currentImg = this.images[index];
    let nextImg;

    if (count === 1) {
      backImg = nextImg = currentImg;
    } else if (count === 2) {
      backImg = nextImg = this.images[index ? 0 : 1];
    } else {
      backImg = this.images[arrUtil.previousIndex(index, count)];
      nextImg = this.images[arrUtil.nextIndex(index, count)];
    }

    return [ backImg, currentImg, nextImg ];
  }

  getHasChanged() {
    return this.current !== $.find('.img-gallery-deck-current', this);
  }

  getNextImage() {
    return this.images[arrUtil.nextIndex(this.currentIndex, this.images)];
  }

  getTransitionReplacementImage(isLeft) {
    let action = (isLeft ? 'next' : 'previous') + 'Index';
    let count = this.images.length;
    let moveImgIndex = arrUtil[action](this.currentIndex, count);

    return this.images[arrUtil[action](moveImgIndex, count)];
  }

  next() {
    this.transitionDeckImages('left');
  }

  rearrangeDeckImages(isLeft, moveImg) {
    let parent = moveImg.parentNode;

    parent.removeChild(moveImg);

    this.updateDeckImage(moveImg, this.getTransitionReplacementImage(isLeft));

    if (isLeft) {
      parent.appendChild(moveImg);
    } else {
      parent.insertBefore(moveImg, parent.firstChild);
    }
  }

  setDeck(click) {
    if (!this.getHasChanged()) { return; }

    let done = () => {
      this.updateDeck(...this.getDeckImages()).then(() => {
        this.transitionDeckItems('in').then(() => {
          this.setMeta();
        });
      });
    }

    if (click) {
      this.transitionDeckItems('out').then(done);
    } else {
      done();
    }
  }

  setMeta() {
    $.find('.img-gallery-meta-current').innerHTML = this.currentIndex + 1;
    $.find('.img-gallery-meta-total').innerHTML = this.images.length;
  }

  setupDeck() {
    if (this.getAttribute('no-deck')) {
      this.removeChild($.find('.img-gallery-deck', this));
    }

    let buttons = $.findAll('.img-gallery-btn');

    $.forEachNode(buttons, node => {
      if (this.images.length > 1) {
        node.removeAttribute('disabled');
      } else {
        node.setAttribute('disabled', true);
      }
    });

    setBtnLabel(this, 'back', this.getAttribute('back-label'));
    setBtnLabel(this, 'next', this.getAttribute('next-label'));
  }

  setupEventHandlers(action) {
    let waitTime = this.transitionTime;

    action += 'EventListener';

    this[action](CLICK_EVENT, debounce(this.click, waitTime, true));
    this[action](BACK_EVENT, debounce(this.back, waitTime, true));
    this[action](NEXT_EVENT, debounce(this.next, waitTime, true));

    this[action]('touchstart', e => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    });

    this[action]('touchend', debounce(function(e) {
      onSwipeLR(e, this.touchStartX, this.touchStartY,
        () => { sendEvent(this, NEXT_EVENT) },
        () => { sendEvent(this, BACK_EVENT) }
      );
    }, waitTime, true));
  }

  setupThumbs() {
    let thumbs = $.find('.img-gallery-thumbs', this);

    $.forEachNode(this.images, function(img, i) {
      if (i === 0) {
        $.addClass(CURRENT_CLASS, img);
      }

      this.removeChild(img);
      thumbs.appendChild(img);
    }, this);
  }

  set touchstart(touchStart) {
    this.touchStart = touchStart;
  }

  transformImageSource(img) {
    return img.getAttribute('src');
  }

  transitionDeckImages(direction) {
    let [ backImg, currentImg, nextImg ] = this.getCurrentDeckImages();
    let isLeft = direction === 'left';
    let otherDirection = isLeft ? 'right' : 'left';
    let moveImg = isLeft ? backImg : nextImg;
    let targetImg = isLeft ? nextImg : backImg;
    let outClass = `${TRANSITION_CLASS}-${direction}-out`;
    let inClass = `${TRANSITION_CLASS}-${otherDirection}-in`;

    $.addClass(outClass, currentImg);
    $.addClass(inClass, targetImg);

    setTimeout(() => {
      $.removeClass(outClass, currentImg);
      $.removeClass(inClass, targetImg);

      this.updateDeckImageClasses(isLeft, backImg, currentImg, nextImg);

      this.rearrangeDeckImages(isLeft, moveImg);

      this.current = this.getDeckImages()[isLeft ? 2 : 0];

      this.setMeta();
    }, this.transitionTime);
  }

  transitionDeckItems(direction) {
    return new Promise(resolve => {
      let reverseDirection = direction === 'in' ? 'out' : 'in';
      let classToAdd = `${TRANSITION_CLASS}-${direction}`;
      let classToRemove = `${TRANSITION_CLASS}-${reverseDirection}`;

      $.removeClass(classToRemove, DECK_ITEMS_CLASS, this);
      $.addClass(classToAdd, DECK_ITEMS_CLASS, this);

      setTimeout(resolve, this.transitionTime);
    });
  }

  updateDeck(backImg, currentImg, nextImg) {
    return Promise.all([
      this.updateDeckImage(this.getDeckImage('back'), backImg),
      this.updateDeckImage(this.getDeckImage('current'), currentImg),
      this.updateDeckImage(this.getDeckImage('next'), nextImg)
    ]);
  }

  updateDeckImage(img, newImg) {
    return new Promise(resolve => {
      img.onload = () => resolve();
      img.setAttribute('alt', newImg.getAttribute('alt'));
      img.setAttribute('src', this.transformImageSource(newImg));
    });
  }

  updateDeckImageClasses(isLeft, backImg, currentImg, nextImg) {
    $.removeClass('img-gallery-deck-back', backImg);
    $.removeClass('img-gallery-deck-current', currentImg);
    $.removeClass('img-gallery-deck-next', nextImg);

    if (isLeft) {
      $.addClass('img-gallery-deck-back', currentImg);
      $.addClass('img-gallery-deck-current', nextImg);
      $.addClass('img-gallery-deck-next', backImg);
    } else {
      $.addClass('img-gallery-deck-back', nextImg);
      $.addClass('img-gallery-deck-current', backImg);
      $.addClass('img-gallery-deck-next', currentImg);
    }
  }
}
