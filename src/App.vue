<template>
  <div id="app">
    <acv-infinite-scroller
      :wrap-classes="'tw-border-gray tw-border-solid'"
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
  </div>
</template>

<script>
import AcvInfiniteScroller from './components/AcvInfiniteScroller.vue';

export default {
  name: 'App',
  components: {
    AcvInfiniteScroller,
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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
