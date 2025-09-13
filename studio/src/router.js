import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store';

Vue.use(VueRouter)


const appRoutes = [
  {
    path: '',
    //name: 'Apps',
    component: () => import(/* webpackChunkName: "about" */ 'src/page/AppList.vue'),
  },
  {
    path: '/org/:orgId/team',
    //name: 'Users',
    component: () => import(/* webpackChunkName: "about" */ 'views/apps/OrganizationUsers.vue'),
    meta: { requiresOrg: true },
  },
  {
    path: '/org/:orgId/settings',
    //name: 'Settings',
    component: () => import(/* webpackChunkName: "about" */ 'views/apps/OrganizationSettings.vue'),
    meta: { requiresOrg: true },
  },
  {
    path:'/apps/:orgId/:id.html', 
    component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Workspace.vue')
  },
  {
    path:'/apps/:orgId/:id/:tab.html', 
    component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Workspace.vue')
  }
]

const mainRoutes = []

mainRoutes.push({path:'my-account.html', component: () => import(/* webpackChunkName: "about" */ 'views/user/Account.vue')})
mainRoutes.push({path:'404.html', component: () => import(/* webpackChunkName: "about" */ 'views/404.vue')})
mainRoutes.push({path:'logout.html', component: () => import(/* webpackChunkName: "about" */ 'views/LogoutPage.vue')})
mainRoutes.push({path:'', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Apps.vue'), children: appRoutes,  meta: {isDarkHeader: true}})
mainRoutes.push({path:'/apps/:orgId.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Apps.vue'), children: appRoutes,  meta: {isDarkHeader: true}})
mainRoutes.push({path:'apps/:orgId/my-apps.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Apps.vue'), meta: {isDarkHeader: true}})
mainRoutes.push({path:'apps/:orgId/logged_in.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Apps.vue'),  meta: {isDarkHeader: true}})
mainRoutes.push({path:'apps/:orgId/create-app.html', component: () => import(/* webpackChunkName: "apps" */ 'views/apps/Create.vue')})

// MCU
const mcuRoutes = []
mcuRoutes.push({path:'', name: "mcu_home", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/DashUsers.vue'), meta: {isAdmin:true, isHome:false} })
mcuRoutes.push({path:'apps.html', name: "mcu_apps", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/Apps.vue'), meta: {isAdmin:true, isHome:false} })
mcuRoutes.push({path:'users.html', name: "mcu_users", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/Users.vue'), meta: {isAdmin:true, isHome:false} })

mcuRoutes.push({path:'events.html', name: "mcu_log", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/Events.vue'), meta: {isAdmin:true, isHome:false} })
mcuRoutes.push({path:'log.html', name: "mcu_log_file", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/FileLog.vue'), meta: {isAdmin:true, isHome:false} })
mcuRoutes.push({path:'dash-users.html', name: "mcu_dash_users", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/DashUsers.vue'), meta: {isAdmin:true, isHome:false} })
mcuRoutes.push({path:'dash-performance.html', name: "mcu_dash_performance", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/DashPerformance.vue'), meta: {isAdmin:true, isHome:false} })
mcuRoutes.push({path:'dash-db.html', name: "mcu_dash_db", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/DashDB.vue'), meta: {isAdmin:true, isHome:false} })
mcuRoutes.push({path:'dash-metrics.html', name: "mcu_dash_metric", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/DashMetrics.vue'), meta: {isAdmin:true, isHome:false} })
mcuRoutes.push({path:'dash-analytics.html', name: "mcu_dash_analytic", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/DashAnalytics.vue'), meta: {isAdmin:true, isHome:false} })
mcuRoutes.push({path:'errors.html', name: "mcu_dash_error", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/Errors.vue'), meta: {isAdmin:true, isHome:false} })

mcuRoutes.push({path:'organizations/:id.html', name: "mcu_org_edit", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/Organization.vue'), meta: {isAdmin:true, isHome:false} })
mcuRoutes.push({path:'organizations.html', name: "mcu_orgs", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/Organizations.vue'), meta: {isAdmin:true, isHome:false} })

mcuRoutes.push({path:'secrets.html', name: "mcu_secrets", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/Secrets.vue'), meta: {isAdmin:true, isHome:false} })
mcuRoutes.push({path:'ai.html', name: "mcu_ai", component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/AiModels.vue'), meta: {isAdmin:true, isHome:false} })


const routes = new VueRouter({
  routes: [ 
    {path:'/privacy.html', component: () => import(/* webpackChunkName: "about" */ 'views/Privacy.vue')},
    {path:'/terms-of-service.html', component: () => import(/* webpackChunkName: "about" */ 'views/Tos.vue')},
    {path:'/login.html', component: () => import(/* webpackChunkName: "about" */ 'views/LoginPage.vue')},
    {
      path: '/apps/:orgId/:id/create.html',
      name: 'Editor',
      component: () => import(/* webpackChunkName: "design" */ 'views/apps/Design.vue')
    },
    {
      path: '/apps/:orgId/:id/design/:sid.html',
      name: 'ScreenEditor',
      component: () => import(/* webpackChunkName: "design" */ 'views/apps/Design.vue')
    },
    {
      path: '/',
      name: '',
      children: mainRoutes,
      component: () => import(/* webpackChunkName: "matc" */ 'views/Flowrabbit.vue'),
    },
    {
      path: '/mcu/',
      name: 'mcu2',
      children: mcuRoutes,
      component: () => import(/* webpackChunkName: "mcu" */ 'views/mcu/MCU.vue')
    },
    {
      path: '/test/DataBindingTree.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/DataBindingTreeTest.vue')
    },
    {
      path: '/test/Tree.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/TreeTest.vue')
    },
    {
      path: '/test/Layer.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/LayerTest.vue')
    },
    {
      path: '/test/Table.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/TableConfTest.vue')
    },
    {
      path: '/test/Color.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/ColorPickerTest.vue')
    },
    {
      path: '/test/Export.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/ExportTest.vue')
    },
    {
      path: '/test/WS.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/WebSocketTest.vue')
    },
    {
      path: '/test/StyledTable.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/StyledTableTest.vue')
    },
    {
      path: '/test/JS.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/JSSandboxTest.vue')
    }, {
      path: '/test/TRest.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/TemplatedRestSettingsTest.vue')
    },
    {
      path: '/test/Theme.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/ThemeDialogTest.vue')
    },   
    {
      path: '/test/DTree.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/DataBindingTreeTest.vue')
    },
    {
      path: '/test/TreeEdit.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/TreeEditorTest.vue')
    }, {
      path: '/test/Auto.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/AutoCompleteTextareaTest.vue')
          },
    {
      path: '/test/Debugger.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/PreviewDeguggerTest.vue')      
    },
    {
      path: '/test/DesignGPT.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/DesignGPTTest.vue')      
    },
    {
      path: '/test/TokenInput.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/TokenInputTest.vue')      
    },
    {
      path: '/test/Make.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/MakeSettingsTest.vue')      
    },
    {
      path: '/test/Ionos.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/IonosDocsSettingsTest.vue')      
    },
    {
      path: '/test/AL.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/AutoLayoutTest.vue')      
    },
    {
      path: '/test/Secret.html',
      component: () => import(/* webpackChunkName: "unit" */ './unit/SecretSettingTest.vue')      
    }
  ]
})


routes.beforeEach((to, from, next) => {
  const selectedOrg = store.getters.selectedOrg;

  if (to.matched.some(record => record.meta.requiresOrg)) {
    if (selectedOrg.id === 'private') {
      next({ path: '/' });
    } else {
      next();
    }
  } else {
    next(); 
  }
});


export default routes;