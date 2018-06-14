# Image Lazy Loading

Images are lazy loaded in the browser based on scroll position.  When the user scrolls to within 200px of the image, the image will be loaded onto the page. For carousels, the second pagination is loaded when the first page reaches within 200px of the viewport, while subsequent pages load when the previous page is loaded.  Using the dots to directly go to page will also trigger images on that page to load.

# Usage

```html
<hl-image src="http://ebay.com/image.jpg"
          alt="Image"
          class="hl-demo-image" >
</hl-image>
```

Lazy loading is done through the `<hl-image>` tag, which also ensures image sizing responsiveness.

Images added through the `<hl-image>` tag is displayed as the background of the parent `div`. Nested in the container div is an empty `div` that serves as the grey placeholder background when we're waiting for an image to finish loading and a blank `img`.  This `img`'s `src` points to a 1x1px static image. When this image loads, it's `onload` event handler adds the element to a lazy loading queue.  When the user scrolls, we iterate through the queue (`handler()`), check for images that needed to be loaded (`loadImageIfVisible(image, i)`), and emit a `lazyload` event to the image that tells it to load.

Image loading (`loadImage(e)`) is done by attaching a new `onload` handler to the placeholder image that sets the parent `div`'s `background` to be the same as the placeholder image's source.  We then set the placeholder image's src to be image we want to load, stored on its `data-src` attribute. This triggers the new `onload` handler, and we remove the image from the queue.

For carousels, we manually trigger the `lazyload` event on images.  For the second pagination, this happens when the first image on the first page loads. Other paginations wait for the user to click the next page or one of dots.

## Testing

Run the tests with `grunt fe-test --files='src/components/utils/lazy-load-images/fe-test/*.js'`
