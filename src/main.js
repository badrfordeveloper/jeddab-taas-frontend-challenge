import Vue from 'vue'
import App from './App.vue'

import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css'
import common from './common';
import axios from 'axios';
import VueRouter from 'vue-router';
import routes from './routes';
import '@mdi/font/css/materialdesignicons.css'


Vue.use(Vuetify);
Vue.prototype.$axios = axios
Vue.mixin(common);
Vue.use(VueRouter);



Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  vuetify: new Vuetify(),
  router:new VueRouter(routes)
}).$mount('#app')
