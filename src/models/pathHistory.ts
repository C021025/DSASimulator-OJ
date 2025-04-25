// path History : 用户退出登录时，保存的路径，用于登录后跳转到之前的页面
import { DEFAULT_HOME_PATH } from '@/constants';
import { useState } from 'react';

const useCustomHistoryPath = () => {
  const [historyPath, setHistoryPath] = useState<string>(DEFAULT_HOME_PATH);
  return {
    historyPath,
    setHistoryPath
  };
};

export default useCustomHistoryPath;
