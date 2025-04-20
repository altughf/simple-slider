# simple-slider
A slider built from scratch with JavaScript, focusing on simplicity and clean design.

```html
-Navigation
-Drag
-Slide & Fade Animation
-Multiple slides
-Infinite Loop With Clones
-Autoplay
-Dot Pagination
-Number Pagination
-Manuel Width
-Side Space
-Play & Stop
-Align Multiple Slides > Left, Center, Right
-Manuel Gap
-Custom SVG Icon
```

>Mount : Use component id

```javascript

const slider = new Slider('#slider-demo', {navigation: true,loop: true,maxWidth: 1024,dotPagination: true});

```

>Structure : 4 components

```html

<div id="slider-demo" class="component">

    <div class="slider-frame">

        <div class="slider">
            <div class="slide-item">01</div>
            <div class="slide-item">02</div>
            <div class="slide-item">03</div>
            <div class="slide-item">04</div>
            <div class="slide-item">05</div>
        </div>

    </div>

</div>

```

>Options : Default

```javascript

const defaultOptions = {

    animationType: 'slide',
    speed: 300,
    drag: true,
    loop: false,
    autoplay: false,
    interval: 4000,
    navigation: false,
    dotPagination: false,
    numberPagination: false,
    playStop: false,
    align: 'left',
    startPosition: 1,
    perSlide: 1,
    clone: 2,
    dragDistance: 120,
    gap: true,
    gapSize: 32,
    sidePadding: 32,
    maxWidth: null,
    slideWidth: false,
    slideHeight: false,

};

```

Simple Slider released under MIT license. © 2025