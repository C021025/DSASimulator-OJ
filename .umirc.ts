import { defineConfig } from "@umijs/max";
const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/login",
    layout: false,
    component: "./Login",
  },
  {
    path: "/register",
    layout: false,
    component: "./Register",
  },
  {
    name: "首页", 
    path: "/home",
    icon: "smile",
    component: "./Home",
  },
  {
    name: "题库",
    path: "/question/all",
    icon: "profile",
    component: "./Question/QuestionList",
    
  },
  {
    path: "/question/:id",
    component: "./Question/QuestionDetail",
  },
  {
    name: "管理页面",
    path: "/admin",
    icon: "crown",
    access: "canSeeAdmin",
    routes: [
      {
        name: "用户管理",
        path: "/admin/user",
        icon: "user",
        component: "./Admin/UserList",
      },
      {
        name: "题目管理",
        path: "/admin/question",
        icon: "question-circle",
        component: "./Admin/QuestionList",
      }
    ]
  },
  {
    path: "*",
    layout: false,
    component: "./error/404",
  }
]
export default defineConfig({
  /**
   * @name 开启 hash 模式
   * @description 让 build 之后的产物包含 hash 后缀。通常用于增量发布和避免浏览器加载缓存。
   * @doc URL_ADDRESS   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,
  /**
   * @name 配置 favicons
   * @description 配置 favicons，参考：URL_ADDRESS   * @description 配置 favicons，参考：https://github.com/nuxt-contrib/nuxt-icon
   */
  favicons: ["/favicons.svg"],
  //============== 开发服务器配置 ====================
  /**
   * @name 代理
   * @description 可以让你的开发服务器从另一个服务器或者本地资源代理请求。 
   */
  proxy: {
    "/api": {
      target: "http://localhost:8101",
      changeOrigin: true,
      pathRewrite: { "^/api": "" },
    }
  },
  //============== 开发服务器配置 ====================
  //============== max的插件配置 ===============
  antd: {},
  /**
   * @name 权限插件
   * @description 基于 initialState 的权限插件，必须先打开 initialState
   * @doc https://umijs.org/docs/max/access
   */
  access: {},
  /**
   * @name 数据流插件
   * @@doc https://umijs.org/docs/max/data-flow
   */
  model: {},
  /**
   * @name 一个全局的初始数据对象
   * @description 可以用来存放一些全局的数据，比如用户信息，或者一些全局的状态，全局初始状态在整个 Umi 项目的最开始创建。
   * @doc https://umijs.org/docs/max/data-flow#%E5%85%A8%E5%B1%80%E5%88%9D%E5%A7%8B%E7%8A%B6%E6%80%81
   */
  initialState: {},
  /**
   * @name 网络请求配置
   * @description 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
   * @doc https://umijs.org/docs/max/request
   */
  request: {},
  /**
   * @name 布局插件 静态配置
   * @description 快速给应用添加布局功能，支持多种布局模式。
   * @doc URL_ADDRESS   * @doc https://umijs.org/docs/max/layout-menu
   */
  layout: {},
  /**
   * @name <head> 中额外的 script
   * @description 配置 <head> 中额外的 script
   */
  headScripts: [
    // 解决首次加载时白屏的问题
    {
      src: '/scripts/loading.js',
      async: true,
    },
  ],
  //============== max的插件配置 ===============
  //============== 路由配置 ====================
  routes: routes,
  //============== 路由配置 ====================
  npmClient: "pnpm",
  tailwindcss: {},
});
