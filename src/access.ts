// 在这里按照初始化数据定义项目中的权限，统一管理
// 参考文档 https://umijs.org/docs/max/access
export default (initialState: { currentUser?: API.User } | undefined) => {
  const { currentUser } = initialState ?? {};

  // 返回规则集对象，规则集对象的 key 会作为权限标识
  return {
    canSeeAdmin: currentUser && currentUser.userRole === 'admin',
  };
};
