import {createRouter, createWebHistory} from "vue-router";
import dailyMain from "/src/views/dailyMain.vue";
import home from "/src/views/home.vue";

const routes = [
  {
    path: "/travelMaker/",
    name: "root",
    component: home,
  },
  {
    path: "/index.html",
    redirect: {path: "/travelMaker/"},
    name: "home",
    component: home,
  },
  {
    path: "/",
    redirect: {path: "/travelMaker/"},
    name: "rootRoot",
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
