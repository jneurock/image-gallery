export function debounce(cb, waitTime, immediate) {
  let timeout;

  return function() {
    let args = arguments;
    let callNow = immediate && !timeout;

		clearTimeout(timeout);

		timeout = setTimeout(() => {
      timeout = null;

      if (!immediate) {
        cb.apply(this, args);
      }
    }, waitTime);

		if (callNow) {
      cb.apply(this, args);
    }
  };
}

export function onBodyClick(cb) {
  document.body.addEventListener('click', cb);
}

export function onSwipeLR(e, xStart, yStart, leftCb, rightCb) {
  if (xStart == null || yStart == null) { return; }

  let xEnd = e.changedTouches[0].clientX;
  let yEnd = e.changedTouches[0].clientY;
  let xDistance = xStart - xEnd;
  let isHorizontalSwipe = Math.abs(xDistance) > Math.abs(yStart - yEnd);

  if (isHorizontalSwipe) {
    if (xDistance > 0) {
      leftCb();
    } else {
      rightCb();
    }
  }
}

export function sendEvent(target, eventName) {
  target.dispatchEvent(new Event(eventName));
}
