import {
    LoginForm,
    ProFormCaptcha,
    ProFormCheckbox,
    ProFormText
} from "@ant-design/pro-components";
import {
    LockOutlined,
    MobileOutlined,
    UserOutlined
} from "@ant-design/icons";
import { message, Tabs } from "antd";
import { Helmet, history, useModel } from "@umijs/max";
import { IconFont } from "@/components/IconFont";
import Footer from "@/components/Footer";
import { useState } from "react";
import { flushSync } from "react-dom";
import { loginByEmailUsingPOST, sendMsgUsingPOST, userLoginUsingPOST } from "@/services/backendService/user/userController";
import { DEFAULT_HOME_PATH } from "@/constants";

const ActionIcons: React.FC = () => {
    return (
        <>
            <IconFont
                type="icon-gitee"
                className="ml-2 text-black cursor-pointer transition-colors duration-300 hover:text-blue-500"
            />
            <a
                className="float-right cursor-pointer text-blue-500"
                onClick={() => {
                    // 跳转登录页
                    history.push('/register')
                }}
            >
                立即注册
            </a>
        </>
    )
}

const LoginPage: React.FC = () => {
    const [type, setType] = useState<string>('account');
    const {initialState, setInitialState} = useModel('@@initialState');
    const {historyPath, setHistoryPath} = useModel('pathHistory')
    const fetchUserInfo = async () => {
        const userInfo = await initialState?.fetchUserInfo?.();
        if (userInfo) {
          flushSync(() => {
              //@ts-ignore
              setInitialState((s) => ({
                  ...s,
                  currentUser: userInfo,
              })
            );
        });
        }
    };
    const handleSubmit = async (values: any) => {
        try {
          let res: any = {};
          if (type === 'account') {
            // 登录
            res = await userLoginUsingPOST({
              ...values,
            });
          } else if (type === 'email') {
            res = await loginByEmailUsingPOST({
              ...values,
            });
          }
          if (res.data) {
            message.success('登录成功！');
            // 登陆成功后处理
            fetchUserInfo();
            // 跳转回原来的页面
            console.log(historyPath);
            history.push(historyPath);
            if (historyPath !== DEFAULT_HOME_PATH) {
              setHistoryPath(DEFAULT_HOME_PATH);
            }
            return;
          } else {
            console.log(res);
          }
        } catch (error) {
          console.log(error);
          message.error('登录失败，请重试！');
        }
  };

    return (
        <div className="h-lvh flex flex-col overflow-auto bg-gradient-to-tr from-slate-50 to-sky-300">
            {/* 由 umimax 提供用于动态配置 <head></head>中的内容 */}
            <Helmet>
                <title>登录- DSA-Simulator Oj</title>
            </Helmet>
            <section className="h-[90vh] flex flex-1 py-10">
                <LoginForm
                    className="min-w-[280px] max-w-[75vw]"
                    logo={<img alt="logo" src="/logo.svg"/>}
                    title="DSA-Simulator OJ"
                    subTitle={'DSA-Simulator OJ 是由DSA-Simulator提供的在线判题系统'}
                    initialValues={{autoLogin: true,}}
                    actions={['其他登录方式 :', <ActionIcons key="icons"/>]}
                    onFinish={async (values) => {
                        await handleSubmit(values as any);
                        console.log(values);
                    }}
                >
                    <Tabs
                        activeKey={type}
                        onChange={setType}
                        centered
                        items={[
                            { key: 'account', label: '账户密码登录' },
                            { key: 'email', label: '邮箱登录' },
                        ]}
                    />
                    {type === 'account' && (
                        <>
                            <ProFormText
                                name="userAccount"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined/>,
                                }}
                                placeholder={'请输入账号'}
                                rules={[
                                    { required: true, message: '用户名是必填项！' },
                                ]}
                            />
                            <ProFormText.Password
                                name="userPassword"
                                fieldProps={{
                                  size: 'large',
                                  prefix: <LockOutlined/>,
                                }}
                                placeholder={'请输入密码'}
                                rules={[
                                    { required: true, message: '密码是必填项！' }
                                ]}
                            />
                        </>
                    )}
                    {type === 'email' && (
                      <>
                        <ProFormText
                          fieldProps={{
                            size: 'large',
                            prefix: <MobileOutlined/>,
                          }}
                          name="email"
                          placeholder={'请输入邮箱'}
                          rules={[
                            { required: true, message: '邮箱是必填项!' },
                          ]}
                        />
                        <ProFormCaptcha
                          fieldProps={{
                            size: 'large',
                            prefix: <LockOutlined/>,
                          }}
                          captchaProps={{
                            size: 'large',
                          }}
                          placeholder={'请输入验证码'}
                          captchaTextRender={(timing, count) => {
                            if (timing) {
                              return `${count} ${'秒后重新获取'}`;
                            }
                            return '获取验证码';
                          }}
                          name="code"
                          phoneName="email"
                          rules={[
                            {
                              required: true,
                              message: '验证码是必填项！',
                            },
                          ]}
                          onGetCaptcha={async (email) => {
                            const res = await sendMsgUsingPOST({email})
                            if (res.code === 200) {
                              message.success('获取验证码成功！')
                              return;
                            }
                            throw new Error('验证码获取错误！')
                          }}
                        />
                      </>
                    )}
                    <div className="mb-8">
                        <ProFormCheckbox noStyle name="autoLogin">
                            自动登录
                        </ProFormCheckbox>
                        <a className="float-right">
                            忘记密码 ?
                        </a>
                    </div>
                </LoginForm>
            </section>
            <Footer/>
        </div>
    )
}

export default LoginPage;
