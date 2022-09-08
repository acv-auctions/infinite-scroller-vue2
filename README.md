# @acva/infinite-scroller-vue2
> An infinite scroller component implemented in Vue.js 2.

[![Release](https://github.com/acv-auctions/infinite-scroller-vue2/actions/workflows/semantic-release.yml/badge.svg)](https://github.com/acv-auctions/infinite-scroller-vue2/actions/workflows/semantic-release.yml)

## How to use:

```bash
npm i --save @acva/infinite-scroller-vue2
```

Usage Example:
```html
<template>
  <acv-infinite-scroller
    :data-sources="dataCollection"
    :viewport-chunks-definitions="{
      '992px': 2,
      '1200px': 3,
    }"
    :in-viewport-chunks="true"
    :show-loading="true"
>
  <template #default="{ item }">
    <div>
      <span>{{ item.id }}</span>
    </div>
  </template>
</acv-infinite-scroller>
</template>

<script>
export default {
  name: 'SomeComponent',
  components: {
   AcvInfiniteScroller: () => import('@acva/infinite-scroller-vue2'), // dynamic import
  },
  computed: {
    dataCollection() {
      const arr = [];
      for (let i = 0; i < 500; i += 1) {
        arr.push({ id: i + 1 });
      }
      return arr;
    },
  },
};
</script>
```

## Local Development:

Run the following command:
```sh
nvm use \
&& npm i \
&& npm run dev
```

### Props:
```javascript
/**
 * Loading for the pull to refresh and to emit when reached bottom of list
 */
loading: {
     type: Boolean,
     default: false,
},
/**
 * Loading for the loading indicator at bottom of list
 */
loadingNextPage: {
     type: Boolean,
     default: false,
},
/**
 * Show loading indicator at bottom of list
 */
showLoading: {
     type: Boolean,
     default: false,
},
/**
 * Provided to determine if the event denoting the bottom of list should be triggered
 */
next: {
     type: Number,
     default: null,
},
/**
 * Unique key on objects in data sources
 */
dataKey: {
     type: String,
     default: 'id',
},
/**
 * Data set
 */
dataSources: {
     type: Array,
     default: () => [],
},
/**
 * Determines how many extra items should be rendered.</br>
 * Higher value provides more nodes rendered
 */
bufferSize: {
     type: Number,
     default: 10,
},
/**
 * Height of each object in the data set
 */
estimateItemHeight: {
     type: Number,
     default: 50,
},
/**
 * Determines if the rowHeight should be dynamically recalculated once to be the
 * largest height of the objects after mounted.
 */
variableHeight: {
     type: Boolean,
     default: true,
},
/**
 * Scroll offset above the component
 */
startOffset: {
     type: Number,
     default: 0,
},
/**
 * Bottom threshold for before event trigger when scrolled to bottom
 */
bottomThreshold: {
     type: Number,
     default: 0,
},
/**
 * Additional classes for the wrapper
 */
wrapClasses: {
     type: [String, Object, Array],
     default: '',
},
/**
 * Additional classes for the list containing the data sources
 */
listClasses: {
     type: [String, Object, Array],
     default: '',
},
/**
 * Additional classes for each item element
 */
itemClasses: {
     type: [String, Object, Array],
     default: '',
},
/**
 * Split the data sources into chunks based on the current breakpoint key
 */
inViewportChunks: {
     type: Boolean,
     default: false,
},
/**
 * A dictionary to map resolutions to number of items per row to render.
 * Example:
 * const {
 *   '992px': 2,
 *   '1000px': 3
 *   '1200px': 4,
 * }
 * For the object above, when the viewport is <= 992px, we render 2 items per row.
 * When the viewport is > 992px and <= 1000px, we render 3 items.
 * When the viewport is > 1200px, render 4 items per row
 */
viewportChunksDefinitions: {
     type: Object,
     default: () => {},
},
```

### Slots

* `<template #before>` - rendered before the list of items
* `<template #default="{ item, index }">` - each rendered item
* `<template #after>` - rendered after the list of items
* `<template #loading>` - replaces the default loading indicator

### Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to the project.