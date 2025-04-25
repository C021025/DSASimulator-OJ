import Footer from "@/components/Footer";
import { registerByEmailUsingPOST, sendMsgUsingPOST } from "@/services/backendService/user/userController";
import { StringUtils } from "@/utils";
import { CaretRightOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import {
    CaptFieldRef,
    LoginForm,
    ProFormCaptcha,
    ProFormCheckbox,
    ProFormText,
    type ProFormInstance
} from "@ant-design/pro-components";
import { Helmet, history } from "@umijs/max";
import { message, Popover, Progress } from "antd";
import { useRef, useState } from "react";

type registerFormType = {
    email: string;
    userPassword: string;
    checkPassword: string;
    code: string;
}
const passwordStatusMap = {
  ok: (
    <div>
      <span>强度：强</span>
    </div>
  ),
  pass: (
    <div>
      <span>强度：中</span>
    </div>
  ),
  poor: (
    <div>
      <span>强度：太短</span>
    </div>
  ),
};

const passwordProgressMap: {
  ok: 'success';
  pass: 'normal';
  poor: 'exception';
} = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};
const RegisterPage: React.FC = () => {
    const [modalVisible, setModalVisible]: [boolean, any] = useState(false);
    const [popover, setPopover]: [boolean, any] = useState(false);
    const formRef = useRef<ProFormInstance<registerFormType>>(null);
    const captchaRef = useRef<CaptFieldRef | null | undefined>();
    const confirmDirty = false;

    const getPasswordStatus = () => {
        const value = formRef.current?.getFieldValue('userPassword');
        if (value && value.length > 9) {
        return 'ok';
        }
        if (value && value.length > 5) {
        return 'pass';
        }
        return 'poor';
    };
    const renderPasswordProgress = () => {
        const value = formRef.current?.getFieldValue('userPassword');
        const passwordStatus = getPasswordStatus();
        return value && value.length ? (
            <div>
                <Progress
                    status={passwordProgressMap[passwordStatus]}
                    strokeWidth={6}
                    percent={value.length * 10 > 100 ? 100 : value.length * 10}
                    showInfo={false}
                />
            </div>
        ) : null;
    };

    const checkConfirm = (_: any, value: string) => {
        const promise = Promise;
        if (value && value !== formRef.current?.getFieldValue('userPassword')) {
        return promise.reject('两次输入的密码不匹配!');
        }
        return promise.resolve();
    };
    const checkPassword = (_: any, value: string) => {
        const promise = Promise;
        // 没有值的情况
        if (!value) {
            setModalVisible(!!value);
            return promise.reject('请输入密码!');
        }
        // 有值的情况
        if (!modalVisible) {
            setModalVisible(!!value);
        }
        setPopover(!popover);
        if (value.length < 6) {
            return promise.reject('密码至少为6个字符！');
        }
        if (value && confirmDirty) {
            formRef.current?.validateFields(['checkPassword']);
        }
        return promise.resolve();
    };

    const handleSubmit = async (values: API.RegisterEmailRequest) => {
        formRef.current?.validateFieldsReturnFormatValue?.().then(async () => {
        const res = await registerByEmailUsingPOST({
            ...values,
        });
        if(res.code === 0){
            message.success('注册成功！');
            history.push('/login');
            return;
        }
    });
    };
    return (
        <div className="h-lvh flex flex-col overflow-auto bg-gradient-to-tr from-slate-50 to-sky-300">
            {/* 由 umimax 提供用于动态配置 <head></head>中的内容 */}
            <Helmet>
                <title>登录- DSA-Simulator Oj</title>
            </Helmet>
            <section className="h-[90vh] flex flex-1 py-10">
                <LoginForm<registerFormType>
                    formRef={formRef}
                    className="min-w-[280px] max-w-[75vw]"
                    logo={<img alt="logo" src="/logo.svg" />}
                    title="DSA-Simulator OJ"
                    subTitle='DSA-Simulator OJ 是由DSA-Simulator提供的在线判题系统'
                    submitter={{ searchConfig: { submitText: '注册', resetText: '使用已有账号登录' } }}
                    onFinish={async (values) => {
                        console.log('点击了提交按钮：' + values);
                        await handleSubmit(values as API.RegisterEmailRequest);
                    }}
                >
                    <h2 className="text-xl">
                        <span>注册</span>
                        <a
                            className="float-right text-base text-blue-700 font-medium"
                            onClick={() => {
                                // 跳转登录页
                                history.push('/login')
                            }}
                        >
                            使用已有账号登录<CaretRightOutlined />
                        </a>
                    </h2>
                    {/* 邮箱 */}
                    <ProFormText
                        fieldProps={{
                          size: 'large',
                          prefix: <MailOutlined />,
                        }}
                        name="email"
                        placeholder={'请输入邮箱'}
                        rules={[
                          {
                            required: true,
                            message: '邮箱是必填项！',
                          },
                          {
                            pattern: /^([a-zA-Z\d][\w-]{2,})@(\w{2,})\.([a-z]{2,})(\.[a-z]{2,})?$/,
                            message: '不合法的邮箱地址！',
                          },
                        ]}
                    />
                    {/* 密码 */}
                    <Popover
                        getPopupContainer={(node) => {
                            if (node && node.parentNode) {
                                return node.parentNode as HTMLElement;
                            }
                            return node;
                        }}
                        content={
                            <div className="py-1 px-0">
                                {passwordStatusMap[getPasswordStatus()]}
                                {renderPasswordProgress()}
                                <div className="mt-2">
                                    <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
                                </div>
                            </div>
                        }
                        placement="right"
                        open={modalVisible}
                    >
                        <ProFormText.Password
                            fieldProps={{
                                size: 'large',
                                prefix: <LockOutlined className={'prefixIcon'} />,
                            }}
                            name="userPassword"
                            placeholder={'密码至少6个字符'}
                            rules={[
                                { required: true, validator: checkPassword },
                            ]}
                        />
                    </Popover>
                    {/* 确认密码 */}
                    <ProFormText.Password
                        fieldProps={{
                            size: 'large',
                            prefix: <LockOutlined className={'prefixIcon'} />,
                        }}
                        name="checkPassword"
                        placeholder={'确认密码'}
                        rules={[
                            { required: true, validator: checkConfirm },
                        ]}
                    />
                    {/* 验证码 */}
                    <ProFormCaptcha
                        name='code'
                        placeholder='请输入验证码'
                        rules={[
                            { required: true, message: '验证码是必填项！' },
                        ]}
                        fieldRef={captchaRef}
                        phoneName='email'
                        onGetCaptcha={async (phoneName) => {
                            if (StringUtils.isEmail(phoneName)) {
                                captchaRef.current?.startTiming();
                                const res = await sendMsgUsingPOST({ email: phoneName });
                                if (res.code === 200) {
                                    message.success('验证码已发送！');
                                    return;
                                }
                            }
                            throw new Error("获取验证码错误")
                        }}
                        fieldProps={{
                            size: 'large',
                            prefix: <LockOutlined />,
                        }}
                        captchaProps={{ size: 'large' }}
                        captchaTextRender={(timing, count) => {
                            if (timing) {
                                return `${count} ${'秒后重新获取'}`; 
                            }
                            return '获取验证码';
                        }}
                    />
                </LoginForm>
            </section>
            <Footer/>
        </div>
    )
}

export default RegisterPage;