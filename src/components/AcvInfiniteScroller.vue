<template>
  <div class="acv-infinite-scroller">
    <slot name="before" />
    <div
      :ref="infiniteScrollerRef"
      :class="['acv-infinite-scroller', wrapClasses]"
      :style="infiniteScrollerWrapStyle"
    >
      <div
        :ref="infiniteScrollerListRef"
        :class="['acv-infinite-scroller-list', listClasses]"
        :style="infiniteScrollerListStyle"
      >
        <div
          v-for="(item, index) in dataSourcesToRender"
          :key="item[dataKey]"
          :class="[computedItemClasses, itemClasses]"
        >
          <template v-if="inViewportChunks">
            <div
              v-for="(entry, entryIndex) in item.chunk"
              :key="entry[dataKey]"
              class="acv-infinite-scroller-item--chunk"
            >
              <slot v-bind="{ item: entry, index: entryIndex }" />
            </div>
          </template>
          <template v-else>
            <slot v-bind="{ item, index }" />
          </template>
          <slot name="appendRow" v-bind="{ item, index }" />
        </div>
      </div>
    </div>
    <slot name="after" />
    <template v-if="showLoading">
      <slot name="loading">
        <span class="acv-loading-content">Loading...</span>
      </slot>
    </template>
  </div>
</template>

<script>

export default {
  name: 'AcvInfiniteScroller',
  props: {
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
  },
  data() {
    return {
      rowHeight: this.estimateItemHeight,
      page: 1,
      windowWidth: window.innerWidth,
      scrollTop: 0, // keep track of the scroll top for startIndex
      resizeObserver: null,
      hasCalculatedHeight: false,
    };
  },
  computed: {
    inputId() {
      // eslint-disable-next-line no-underscore-dangle
      return this.$attrs.id || this.id || `${this.$options.name}-${this._uid}`;
    },
    infiniteScrollerRef() {
      return `infinite-scroller-${this.inputId}`;
    },
    infiniteScrollerListRef() {
      return `infinite-scroller-list-${this.inputId}`;
    },
    wrapHeight() {
      const totalHeight = this.itemCount * this.rowHeight;
      return totalHeight;
    },
    infiniteScrollerWrapStyle() {
      return {
        height: `${this.wrapHeight}px`,
        position: 'relative',
      };
    },
    computedItemClasses() {
      return {
        'acv-infinite-scroller-item': true,
        'acv-infinite-scroller-item--vertical': this.inViewportChunks,
      };
    },
    /*
    * Since the infinite scroll only shows a subset of items, keep track of
    * the starting node index to show the subset of items from which changes
    * while scrolling
    */
    startIndex() {
      let startNode = Math.floor(this.scrollTop / this.rowHeight) - this.bufferSize;
      startNode = Math.max(0, startNode);
      return startNode;
    },
    /*
    * Based on the client height, calculate how many nodes to show in the subset of
    * items based on the height of the items and a provided buffer size
    */
    visibleNodeCount() {
      const { clientHeight } = document.documentElement;
      let count = Math.ceil(clientHeight / this.rowHeight) + (2 * this.bufferSize);
      count = Math.min(this.itemCount - this.startIndex, count);
      return count;
    },
    /*
    * Chunk the data sources if showing in viewport chunks by the corresponding breakpoint
    * Else return the data sources
    */
    adjustedDataSources() {
      if (this.inViewportChunks && this.windowWidth) {
        return this.chunkArray([...this.dataSources], this.getChunkSize());
      }

      return [...this.dataSources];
    },
    /*
    * Subset of data sources to actually render on the page
    */
    dataSourcesToRender() {
      return this.adjustedDataSources.slice(
        this.startIndex,
        this.startIndex + this.visibleNodeCount,
      );
    },
    itemCount() {
      return this.adjustedDataSources.length;
    },
    /*
    * The translateY amount to be applied to the list
    */
    offsetY() {
      const offset = this.startIndex * this.rowHeight;
      return offset;
    },
    /*
    * Apply the offsetY to the list containing the data sources
    */
    infiniteScrollerListStyle() {
      return {
        transform: `translateY(${this.offsetY}px)`,
      };
    },
  },
  watch: {
    estimateItemHeight(newValue, oldValue) {
      // When the height provided changes, adjust the row heights
      // Reset flag for allowing dynamic heights on scroll
      if (newValue !== oldValue) {
        this.rowHeight = newValue;
        this.hasCalculatedHeight = false;
      }
    },
  },
  beforeDestroy() {
    this.hasCalculatedHeight = false;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  },
  mounted() {
    document.addEventListener('scroll', this.handleScroll, {
      passive: true,
    });

    // Watch for resize on the infinite scroll wrapper
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.$refs[this.infiniteScrollerRef]);
  },
  destroyed() {
    document.removeEventListener('scroll', this.handleScroll);
    this.resetPage();
  },
  methods: {
    /*
    * Load more items if within the bottom threshold of the bottom of the page
    */
    handleScroll() {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

      window.requestAnimationFrame(() => {
        if (scrollTop < 0
          || scrollTop + clientHeight
            > scrollHeight + 1
          || !scrollHeight
        ) {
          return;
        }

        if (!this.loading
          && !this.loadingNextPage
          && scrollTop + clientHeight + this.bottomThreshold >= scrollHeight
        ) {
          this.handleNextPage();
        }
      });

      this.scrollTop = scrollTop;

      // If there is variable height, calculate that height only once on scroll
      // with the now rendered elements
      if (this.variableHeight && !this.loading && !this.loadingNextPage) {
        this.handleDynamicRowHeight();
      }
    },
    handleNextPage() {
      if (this.next > 0 && !this.loading) {
        this.page += 1;
        this.$emit('onNextPage', this.page);
      }
    },
    refresh() {
      this.resetPage();
      this.$emit('onPulledToRefresh');
      this.hasCalculatedHeight = false;
    },
    resetPage() {
      this.page = 1;
    },
    /*
    * When resizing happens, change the breakpoint key in order to re-chunk the data sources
    */
    handleResize() {
      if (this.inViewportChunks) {
        this.windowWidth = window.innerWidth;
      }
      this.$emit('resize');
    },
    chunkArray(arr, size) {
      /*
      * Chunk the provided collection into an array of objects with chunks for those
      * arrays of items. The index is used to keep track of the ids passed to the
      * infinite scroll to keep consistent keys when an item repaints
      */
      const arrays = [];
      let index = 0;

      while (arr.length > 0) {
        const chunk = arr.splice(0, size);

        arrays.push({
          id: index,
          chunk,
        });

        index += 1;
      }
      return arrays;
    },
    getChunkSize() {
      if (this.viewportChunksDefinitions[`${this.windowWidth}`] || this.viewportChunksDefinitions[`${this.windowWidth}px`]) {
        return this.viewportChunksDefinitions[`${this.windowWidth}`] || this.viewportChunksDefinitions[`${this.windowWidth}px`];
      }
      const resolutions = Object
        .keys(this.viewportChunksDefinitions)
        .map((resolution) => parseInt(resolution.toString().replace('px', ''), 10))
        .sort((a, b) => a - b);
      const resolution = resolutions.filter((r) => (r <= this.windowWidth)).pop();
      if (resolution) {
        const itemsPerRow = this.viewportChunksDefinitions[`${resolution}`]
                    || this.viewportChunksDefinitions[`${resolution}px`]
                    || 1;
        return itemsPerRow;
      }
      return 1;
    },
    handleDynamicRowHeight() {
      this.$nextTick(() => {
        if (!this.hasCalculatedHeight) {
          const largestHeight = this.calculateDynamicHeight();
          if (largestHeight && largestHeight !== 0) {
            this.hasCalculatedHeight = true;
            this.rowHeight = largestHeight;
          }
        }
      });
    },
    calculateDynamicHeight() {
      let offsetHeight;
      if (this.$refs[this.infiniteScrollerListRef].children.length) {
        const childNode = this.$refs[this.infiniteScrollerListRef].children[0];
        offsetHeight = childNode.offsetHeight;
      }
      return offsetHeight;
    },
  },
};
</script>

<style lang="css" scoped>
.acv-infinite-scroller-list {
  will-change: transform, scroll-position;
}
</style>
