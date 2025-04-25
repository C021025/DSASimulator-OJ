import { ProTable, type ProColumns } from "@ant-design/pro-components"
import { Button, Tooltip } from "antd";
import { useNavigate } from "@umijs/max";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { IconFont } from "@/components/IconFont";
import { Color, languageLabel } from "@/constants/color";
import { listQuestionSubmitByPageUsingPOST } from "@/services/backendService/questionServer/questionController";
import moment from "moment";

export type exportFunctionForParentType = {
    reloadData: () => void
}

type SubmitLogProps = {
    questionId: number; // 题目id
    ref?: React.RefObject<exportFunctionForParentType>; // 用于父组件调用子组件的函数
}



export const SubmitLog: React.FC<SubmitLogProps> = ({questionId, ref}) => {
    const navigate = useNavigate();
    const urlSearchParams = new URLSearchParams(window.location.search);
    const [loading, setLoading] = useState<boolean>(false);
    const [dataSource, setDataSource] = useState<API.QuestionSubmit[]>([]);
    const [total, setTotal] = useState<number>(0);

    // 搜索条件
    const [targetSubmitId, setTargetSubmitId] = useState<number>(()=> Number(urlSearchParams.get('targetSubmitId')) || -1);
    const [pageNum, setPageNum] = useState<number>(()=> Number(urlSearchParams.get('pageNum')) || 1);

    // Functions
    const reloadData = () => {
        setLoading(true);
        listQuestionSubmitByPageUsingPOST({
            questionId: questionId,
            current: pageNum,
        }).then(res => {
            if (res.data) {
                setDataSource(res.data.records);
                setTotal(res.data.total);
                setLoading(false); 
            }
        })
    }
    const updateQueryParams = (newSubmitId: number, newPageNum: number) => {
        const newQuery = new URLSearchParams({
            targetSubmitId: newSubmitId.toString(),
            pageNum: newPageNum.toString(),
            tab: 'log'
        });
        navigate({ search: newQuery.toString() });
    }

    // Event Handlers
    const handlePageChange = (page: number) => {
        //将参数拼接到path上
        setPageNum(page);
        updateQueryParams(page, targetSubmitId);
    }
    const handleClickInspect = (submitId: number) => {
        updateQueryParams(submitId, pageNum);
    }

    // Initialization
    useEffect(() => {
        reloadData(); 
    }, [window.location.search])
    // 将reloadData函数暴露给父组件
    useImperativeHandle(ref, () => {
        return {
            reloadData
        }
    })
    // UI constants
    const columns: ProColumns<API.QuestionSubmit>[] = [
        {
            title: '状态',
            width: '15%',
            align: 'center',
            render: (_, record) => (
                <>
                    {
                        record.status === 0 && <span style={{color: Color.MEDIUM}}>等待中</span> ||
                        record.status === 1 && <span style={{color: Color.MEDIUM}}>判题中</span> ||
                        record.status === 2 && <span style={{color: Color.HARD}}>解答错误</span> ||
                        record.status === 3 && <span style={{color: Color.EASY}}>通过</span>
                    }
                </>
            )
        },
        {
            title: '语言',
            width: '15%',
            align: 'center',
            render: (_, record) => languageLabel.get(record.language) || '其他语言'
        },
        {
            title: '执行用时',
            width: '15%',
            align: 'center',
            render: (_, record) => record.judgeInfo.time ? `${record.judgeInfo.time}ms` : 'N/A'
        },
        {
            title: '内存消耗',
            width: '15%',
            align: 'center',
            render: (_, record) => record.judgeInfo.memory? `${record.judgeInfo.memory}MB` : 'N/A'
        },
        {
            title: '提交时间',
            width: '25%',
            align: 'center',
            render: (_, record) => record.createTime? moment(new Date(record.createTime).toLocaleString()).format('YYYY-MM-DD HH:mm:ss') : 'N/A'
        },
        {
            title: '操作',
            width: '15%',
            align: 'center',
            render: (_, record) => (
                <Tooltip title="查看" color="#FA541C" placement="top">
                    <Button
                        type="text"
                        icon={<IconFont type="icon-chakan" />}
                        onClick={() => handleClickInspect(record.id)}
                    />
                </Tooltip> 
            )
        }
    ]
    return (
        <div className="max-h-[calc(100vh_-_132px)] overflow-auto text-[1.125rem] leading-7">
            <ProTable<API.QuestionSubmit>
                loading={loading}
                dataSource={dataSource}
                columns={columns}
                rowKey='id'
                search={false}
                options={false}
                pagination={{
                    total: total,
                    current: pageNum,
                    pageSize: 10,
                    onChange: handlePageChange, 
                }}
            />
        </div>
    )
}