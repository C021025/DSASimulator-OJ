// 运行时配置
import {
  type RunTimeLayoutConfig,
  history
} from "@umijs/max";
import {
  requestConfig,
} from '@/config'
import Footer from '@/components/Footer';
import { getLoginUserUsingGET } from "./services/backendService/user/userController";
import { RightContent } from "./components/RightContent";

//这里应该设置一个黑名单，黑名单里的必须登录
const blackList: string[] = [
  // '/user/settings',
  '/updates',
  '/admin',
];
// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate

export async function getInitialState(): Promise<any> {
  const fetchUserInfo = async () => {
    try {
      const msg = await getLoginUserUsingGET();
      return msg.data;
    } catch (error) {
      history.push('/login');
    }
    return undefined;
  };

  // 如果不是登录页面或者注册页面，去拉取用户信息
  const curPath = history.location.pathname;
  if (curPath !== '/login' && curPath !== '/register') {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
    };
  }
  // 如果是登陆页面或者注册页面，只返回获取用户信息的方法
  return {
    fetchUserInfo
  };
}
/**
 * 运行时配置 --- layout 配置
 * 更多信息见文档：URL_ADDRESS * 更多信息见文档：https://umijs.org/docs/api/runtime-config#layout
 */
export const layout: RunTimeLayoutConfig = ({ initialState }) => { 
  return {
    title: 'DSA-Simulator-Oj',
    logo: '/logo.svg',
    menu: {   
      locale: false,
    },
    colorPrimary: '#1890ff', // 主题色
    navTheme: 'light', // layout Theme
    layout: 'side', // 布局模式 top 顶部布局，side 左侧布局，mix 混合布局
    contentWidth: 'Fluid', // 内容布局 Fluid 或 Fixed
    fixedHeader: false, // 固定 Header
    fixSiderbar: true, // 固定左侧菜单
    pwa: true, // 支持 PWA 功能 一个用于创建渐进式 Web 应用程序（PWA）的工具包。
    avatarProps: {
      src: initialState?.currentUser?.userAvatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      title: initialState?.currentUser?.userName || '未登入',
      render: (_, avatarChildren) => {
        return <RightContent>{avatarChildren}</RightContent>
      },
    },
    footerRender: () => <Footer />,
  };
};

/**
 * 运行时配置 --- 请求配置
 * 更多信息见文档：URL_ADDRESS * 更多信息见文档：https://umijs.org/docs/api/runtime-config#request
 */
export const request = {
  ...requestConfig,
}
