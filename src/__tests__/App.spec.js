import { shallowMount } from '@vue/test-utils';
import App from '@/App.vue';

describe('App.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(App);
  });
  it('should render a default app', () => {
    expect(wrapper.find('#app').exists()).toBe(true);
    expect(wrapper.vm.$el).toMatchSnapshot();
  });
});
