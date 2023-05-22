import { createRouter, createWebHistory } from "vue-router";
import dailyMain from "/src/views/dailyMain.vue";
import home from "/src/views/home.vue";
import App from "/src/App.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: home,
  },
  {
    path: "/dailyMain/",
    name: "dailyMain",
    component: dailyMain,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
