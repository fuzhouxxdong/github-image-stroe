import Vue from 'vue'
import App from './App.vue'
import VueClipboard from 'vue-clipboard2'
import Global from './utils/global'

Vue.use(Global)
Vue.use(VueClipboard)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
