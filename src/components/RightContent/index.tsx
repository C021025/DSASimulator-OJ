import { stringify } from "@ant-design/pro-components"
import { Col, Dropdown, Modal, Row, Spin, Typography } from "antd";
import { useCallback, useState } from "react";
import { useModel, history } from "@umijs/max";
import { KeyOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { flushSync } from "react-dom";
import { userLogoutUsingPOST } from "@/services/backendService/user/userController";
import { DEFAULT_HOME_PATH } from "@/constants";
type RightContentProps = {
    loading?: boolean;  // 是否加载中
    menu?: boolean;     // 是否存在菜单
    children?: React.ReactNode;
}

export const RightContent: React.FC<RightContentProps> = ({ loading, menu, children }) => {
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const { initialState, setInitialState } = useModel('@@initialState');
    const { setHistoryPath } = useModel('pathHistory')
    const { currentUser } = initialState;
    const loginOut = async () => {
        await userLogoutUsingPOST();
        const { search, pathname } = window.location;
        const redirect = pathname + search;
        if (redirect !== DEFAULT_HOME_PATH) {
            setHistoryPath(redirect);
        }
        history.replace({
            pathname: DEFAULT_HOME_PATH
        })
    }
    const handleMenuClick = useCallback(({ key } : {key: string}) => {
        switch (key) {
            case 'logout': {
                flushSync(() => {
                    setInitialState((state) => ({ ...state, currentUser: undefined }));
                })
                loginOut();
                break;
            }
            case 'login': {
                history.push('/login');
                break; 
            }
            case 'register': {
                history.push('/register');
                break;
            }
            case 'AK/SK': {
                setModalVisible(true);
                break;
            }
            case 'center': {
                history.push(`/user/${currentUser?.id}`);
                break;
            }
            case 'settings': {
                history.push('/user/settings');
                break;
            }
            default: console.log('unknown menu key')
        }
    }, [setInitialState])
    const menuItems = currentUser ? [
        { key: "AK/SK", icon: <KeyOutlined/>, label: 'API密钥' },
        { key: "center", icon: <UserOutlined />, label:'个人中心' },
        { key: "settings", icon: <SettingOutlined />, label: '账号设置' },
        { key: 'logout', icon: <LogoutOutlined />, label: '退出' }
    ] : [
        { key: 'login', icon: <UserOutlined />, label: '登录' },
        { key: 'register', icon: <SettingOutlined />, label: '注册' }
    ]
    if (loading) {
        return <Spin size='large' className="mx-4" />; 
    } else {
        return (
            <>
                <Dropdown
                    menu={{
                        selectedKeys: [],
                        items: menuItems,
                        onClick: handleMenuClick
                    }}
                >
                    {children}
                </Dropdown>
                <Modal open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
                    <Row className="py-1">
                        <Col className="text-black text-opacity-40" flex='80px'>
                            AccessKey
                        </Col>
                        <Col flex='auto'>
                            <Typography.Paragraph className="text-black text-opacity-90" copyable>
                                    {currentUser?.accessKey}
                            </Typography.Paragraph>
                        </Col>
                    </Row>
                    <Row className="py-1">
                        <Col className="text-black text-opacity-40" flex='80px'>
                            SecretKey
                        </Col>
                        <Col flex='auto'>
                            <Typography.Paragraph className="text-black text-opacity-90" copyable>
                                    {currentUser?.secretKey}
                            </Typography.Paragraph>
                        </Col>
                    </Row>
                </Modal>
            </>
        )
    }
    
}