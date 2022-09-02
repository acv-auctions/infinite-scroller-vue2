import { mount } from '@vue/test-utils';
import AcvInfiniteScroller from '@/components/AcvInfiniteScroller.vue';

describe('AcvInfiniteScroller.vue', () => {
  let wrapper;

  describe('Should render infinite scroll', () => {
    afterEach(() => {
      wrapper.destroy();
      jest.clearAllTimers();
      jest.clearAllMocks();
    });

    beforeEach(() => {
      global.innerWidth = 993;

      const elem = document.createElement('div');
      if (document.body) {
        document.body.appendChild(elem);
      }

      wrapper = mount(AcvInfiniteScroller, {
        attachTo: elem,
        propsData: {
          next: 2,
          dataSources: [{ id: 1 }],
        },
      });
      jest.useFakeTimers();
    });

    it('should render infinite scroll', () => {
      expect(wrapper.find('.acv-infinite-scroller').exists()).toBe(true);
      expect(wrapper.vm.$el).toMatchSnapshot();
      expect(wrapper.vm.adjustedDataSources.length).toBe(1);
    });

    it('triggers next page', () => {
      wrapper.vm.handleNextPage();
      expect(wrapper.emitted().onNextPage).toBeTruthy();
    });

    it('resets page when destroyed', () => {
      expect(wrapper.vm.resizeObserver).toBeTruthy();
      const resetSpy = jest.spyOn(wrapper.vm, 'resetPage');
      const disconnectSpy = jest.spyOn(wrapper.vm.resizeObserver, 'disconnect');
      wrapper.destroy();
      expect(resetSpy).toHaveBeenCalled();
      expect(disconnectSpy).toHaveBeenCalled();
      expect(wrapper.vm.resizeObserver).toBeFalsy();
    });

    it('able to refresh page', () => {
      wrapper.vm.refresh();
      expect(wrapper.emitted().onPulledToRefresh).toBeTruthy();
    });

    it('able to reset page', () => {
      wrapper.vm.page = 2;
      wrapper.vm.resetPage();
      expect(wrapper.vm.page).toBe(1);
    });

    it('should show loading indicator when showLoading and is loadingNextPage', async () => {
      wrapper.setProps({
        showLoading: true,
        loadingNextPage: true,
      });

      await wrapper.vm.$nextTick();
      expect(wrapper.find('.acv-loading-content').exists()).toBe(true);
    });

    it('should chunk collections when inViewportChunks is provided', async () => {
      wrapper.setProps({
        inViewportChunks: true,
        dataSources: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
        viewportChunksDefinitions: {
          '992px': 2,
          '1200px': 3,
        },
      });

      await wrapper.vm.$nextTick();
      expect(wrapper.vm.windowWidth).toBe(window.innerWidth);
      expect(wrapper.vm.adjustedDataSources.length).toBe(3);
      expect(wrapper.vm.adjustedDataSources[0].chunk.length).toBe(wrapper.vm.getChunkSize());
    });

    it('should handle resize', async () => {
      wrapper.setProps({
        inViewportChunks: true,
        dataSources: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
        viewportChunksDefinitions: {
          '992px': 2,
          '1200px': 3,
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.windowWidth).toBe(window.innerWidth);
      expect(wrapper.vm.adjustedDataSources.length).toBe(3);
      expect(wrapper.vm.adjustedDataSources[0].chunk.length).toBe(wrapper.vm.getChunkSize());

      await wrapper.vm.$nextTick();

      wrapper.vm.handleResize();

      expect(wrapper.emitted().resize).toBeTruthy();

      expect(wrapper.vm.windowWidth).toBe(window.innerWidth);
      expect(wrapper.vm.adjustedDataSources[0].chunk.length).toBe(wrapper.vm.getChunkSize());
    });

    it('should change the row height if the estimateItemHeight changes', async () => {
      expect(wrapper.vm.rowHeight).toBe(50);
      wrapper.setProps({
        estimateItemHeight: 300,
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.rowHeight).toBe(300);
    });

    it('should call handle next page when scrolling', async () => {
      const spy = jest.spyOn(wrapper.vm, 'handleNextPage');
      Object.defineProperty(document.documentElement, 'scrollTop', { configurable: true, value: 100 });
      Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 900 });
      Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 1000 });
      wrapper.vm.handleScroll();
      jest.advanceTimersByTime(16);
      await wrapper.vm.$nextTick();
      expect(spy).toHaveBeenCalled();
    });

    it('should not be able to handle scroll with negative scroll top', async () => {
      const spy = jest.spyOn(wrapper.vm, 'handleNextPage');
      Object.defineProperty(document.documentElement, 'scrollTop', { configurable: true, value: -1337 });
      wrapper.vm.handleScroll();
      jest.advanceTimersByTime(16);
      await wrapper.vm.$nextTick();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not be able to handle scroll with scroll position is past scroll height', async () => {
      const spy = jest.spyOn(wrapper.vm, 'handleNextPage');
      Object.defineProperty(document.documentElement, 'scrollTop', { configurable: true, value: 1000 });
      Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 900 });
      Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 100 });
      wrapper.vm.handleScroll();
      jest.advanceTimersByTime(16);
      await wrapper.vm.$nextTick();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not be able to handle scroll with falsy scroll height', async () => {
      const spy = jest.spyOn(wrapper.vm, 'handleNextPage');
      Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 0 });
      wrapper.vm.handleScroll();
      jest.advanceTimersByTime(16);
      await wrapper.vm.$nextTick();
      expect(spy).not.toHaveBeenCalled();
    });

    it('able to calculate dynamic height if variable height is provided', async () => {
      const handleSpy = jest.spyOn(wrapper.vm, 'handleDynamicRowHeight');
      const calculateSpy = jest.spyOn(wrapper.vm, 'calculateDynamicHeight');
      wrapper.vm.$refs[wrapper.vm.infiniteScrollerListRef] = {
        children: [
          {
            offsetHeight: 1337,
          },
        ],
      };
      wrapper.setProps({
        variableHeight: true,
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.rowHeight).toBe(50);
      wrapper.vm.handleScroll();
      await wrapper.vm.$nextTick();
      expect(handleSpy).toHaveBeenCalled();
      expect(calculateSpy).toHaveBeenCalled();
      expect(wrapper.vm.rowHeight).toBe(1337);
      expect(wrapper.vm.hasCalculatedHeight).toBe(true);
    });

    it('should not calculate dynamic height if variable height is provided and no items are present', async () => {
      const handleSpy = jest.spyOn(wrapper.vm, 'handleDynamicRowHeight');
      const calculateSpy = jest.spyOn(wrapper.vm, 'calculateDynamicHeight');
      wrapper.vm.$refs[wrapper.vm.infiniteScrollerListRef] = {
        children: [],
      };
      wrapper.setProps({
        variableHeight: true,
        dataSources: [],
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.rowHeight).toBe(50);
      expect(wrapper.vm.hasCalculatedHeight).toBe(false);
      wrapper.vm.handleScroll();
      await wrapper.vm.$nextTick();
      expect(handleSpy).toHaveBeenCalled();
      expect(calculateSpy).toHaveBeenCalled();
      expect(wrapper.vm.rowHeight).toBe(50);
      expect(wrapper.vm.hasCalculatedHeight).toBe(false);
    });
  });
});
