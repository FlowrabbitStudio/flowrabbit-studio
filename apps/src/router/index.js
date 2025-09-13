import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import Home from "../views/Home.vue";
import Embedded from "../views/embedded/Embedded.vue";
// import MarketPlace from "../views/marketplace/MarketPlace.vue";
// import MarketplaceApp from "../views/marketplace/MarketplaceApp.vue";
// import MarketPlaceLoginPage from "../views/marketplace/MarketPlaceLoginPage.vue";
// import MarketplaceAppList from "../views/marketplace/MarketplaceAppList.vue";
// import AccountSettings from "../views/marketplace/AccountSettings.vue";
// import MarketplaceFavs from "../views/marketplace/MarketplaceFavs.vue";

function getRoutes() {

    return [
      // {
      //   path: "/",
      //   name: "Home",
      //   component: MarketPlace,
      //   children: [
      //     {
      //       path: "",
      //       name: "Marketplace",
      //       component: MarketplaceAppList,
      //     },
      //     {
      //       path: "/favs.html",
      //       name: "Favorites",
      //       component: MarketplaceFavs,
      //     },   
      //     {
      //       path: "/:appId.html",
      //       name: "App",
      //       component: MarketplaceApp,
      //     },          
      //     {
      //       path: "/settings.html",
      //       name: "AccountSettings",
      //       component: AccountSettings,
      //     },
      //     {
      //       path: "/welcome.html",
      //       name: "Welcome",
      //       component: MarketplaceAppList,
      //     },
      //   ],
      // },
      // {
      //   path: "/login.html",
      //   name: "Login",
      //   component: MarketPlaceLoginPage,
      // },
      {
        path: "/",
        name: "Home",
        component: Home,
      },
      {
        path: "/:orgName/:appName.html",
        name: "Home2",
        component: Home,
      },
      {
        path: "/:orgName/:appName/:screenName.html",
        name: "Home3",
        component: Home,
        meta: { isEmbedded: true },
      },
      {
        path: "/embedded/:id.html",
        name: "Embedded",
        component: Embedded,
        meta: { isEmbedded: true },
      },
      {
        path: "/embedded/:id/:screenName.html",
        name: "Embedded2",
        component: Embedded,
      },
    ];
  
}

const routes = getRoutes();
const isHashRouter = false;
const router = createRouter({
  history: isHashRouter ? createWebHashHistory() : createWebHistory(),
  routes,
});

export default router;
