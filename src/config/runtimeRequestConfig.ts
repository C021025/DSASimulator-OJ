import { RequestConfig, RequestOptions } from "@umijs/max";
import { message } from "antd";

enum ErrorShowType {
    SILENT = 0,         // 不提示错误
    WARN_MESSAGE = 1,   // 警告提示
    ERROR_MESSAGE = 2,  // 错误提示
    NOTIFICATION = 3,   // 通知提示
    REDIRECT = 9,       // 页面跳转
}
// 响应数据的接口定义 -- 根据 Umi 的约定，接口名以 I 开头，如 IResponseData
interface ResponseStructure {
    success: boolean;               // 表示请求是否成功
    data: any;                      // 响应数据
    errorCode?: number;             // 错误码，可选
    errorMessage?: string;          // 错误信息，可选
    showType?: ErrorShowType;       // 错误提示类型，可选
}

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const requestConfig: RequestConfig = {
    baseURL: "/api", // 统一设置请求前缀，根据实际情况修改
    withCredentials: true, // 跨域请求时发送 Cookie
    timeout: 10000, // 请求超时时间，单位毫秒
    headers: {
        "Content-Type": "application/json", // 默认请求头
    },
    // 请求拦截器
    requestInterceptors: [
        (config: RequestOptions) => {
            console.log("Request: ", config.url)
            const url = config.url?.concat('?token=123')
            return {...config, url}
        }
    ],
    // 响应拦截器
    responseInterceptors: [
        (response: any) => {
            // 处理响应数据类型
            const {data} = response as unknown as ResponseStructure;

            if (data.code !== 0) {
                message.error(data.message).then(() => {
                    console.log('Message closed')
                })
            }
            return response;
        }
    ]
}