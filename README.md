# Image Gallery Component

*Works in Chrome 57, Firefox 53 and Safari 10 in OSX Sierra. Feel
free to test in your browsers and systems and update this page.*

---

### Demo

See a demo here [vikingglory.com/image-gallery-demo](http://vikingglory.com/image-gallery-demo). You can build the demo yourself if you clone this repository. You will need Yarn (or npm) and gulp.

### Usage

```html
<img-gallery>
  <img src="" alt="">
  <img src="" alt="">
  <img src="" alt="">
</img-gallery>
```

### Component API

These are attributes you can pass in when invoking the component in your HTML code.

`no-deck (default: false)`

This tells the component *not* to render the deck markup. This allows you to use your own markup for the deck. It is encouraged to use the same class names from the default template for your elements so you don’t have to recreate component functionality.

`back-label (default: "Previous")`

This tells the component what the back button text should be.

`next-label (default: "Next")`

This tells the component what the next button text should be.

`transition-time (default: 0)`

The time, in milliseconds, the component will wait before updating the deck. Set this value to the same animation time you use in your CSS.

### Extending the component

Since the gallery is a web component, it can be extended to create new custom components that inherit its functionality. This would allow you to implement your own versions of hooks like `next()`, `click()` and `transformImageSource()` to name a few.

For example, imagine you’d like to transform a gallery image source
whenever its selected for display in the slide deck:

```javascript
import ImgGallery from './path/to/img-gallery';

class MyImgGallery extends ImgGallery {
  // The thumbnail images are appended with "-tn". Remove this for full-size.
  transformImageSource(img) {
    return img.getAttribute('src').replace('-tn', '');
  }
}

customElements.define('img-gallery', MyImgGallery);
```

### Contributing

This component is free and open-source. If you’d like to improve it, please feel free to open issues and pull requests.
