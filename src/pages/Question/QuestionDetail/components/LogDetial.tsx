import { Avatar, Button, Divider, Skeleton, Tag } from "antd";
import { ClockCircleOutlined, CloseOutlined } from "@ant-design/icons";
import { MdPreview } from "md-editor-rt";
import { useModel, useNavigate } from "@umijs/max";
import { useEffect, useState } from "react";
import { getQuestionVOByIdUsingGET } from "@/services/backendService/questionServer/questionController";
import { Color, JUDGE_INFO_STATUS, SUBMIT_STATUS, submitStatusColor, submitStatusIcon, submitStatusText } from "@/constants/color";
import moment from "moment";


type LogDetailProps = {
    targetSubmitId: number;
    logHeight: string;
    afterClose: ()=>void;
}

export const LogDetail: React.FC<LogDetailProps> = ({ targetSubmitId, logHeight, afterClose }) => {
    const navigate = useNavigate();
    const urlSearchParams = new URLSearchParams(location.search);
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState || {};

    const [problemSubmit, setProblemSubmit] = useState<API.QuestionSubmit>();
    const [loading, setLoading] = useState<boolean>(true);

    // Event handlers
    const handleCloseDetail = () => {
        const newQuery = new URLSearchParams({
            tab: urlSearchParams.get('tab') || 'content',
            targetSubmitId: '-1'
        })
        const pageNum = urlSearchParams.get('pageNum')
        if (pageNum) {
            newQuery.append('pageNum', pageNum)
        }
        navigate({
            search: newQuery.toString()
        })
        afterClose()
    }
    // initialization
    useEffect(() => {
        setLoading(true);
        if (targetSubmitId > 0) {
            getQuestionVOByIdUsingGET({
                id: targetSubmitId,
            }).then(res => {
                if (res.data) {
                    setLoading(false);
                    setProblemSubmit(res.data);
                }
            })
        }
    }, [targetSubmitId])
    return (
        <div>
            <div className="my-[5px] mx-4">
                <CloseOutlined className="text-[rgb(140,140,140)] hover:text-black cursor-pointer" onClick={handleCloseDetail} />
                <Divider className="m-0 mt-[5px]" />
            </div>
            <div style={{height: logHeight, overflow: 'scroll'}}>
                {
                    !loading && problemSubmit ?
                        <div className="my-4 mx-5">
                            <div className="flex">
                                <Avatar size='large' src={currentUser?.userAvatar} />
                                <div className="ml-1 flex-auto">
                                    <div className="font-[600]">{currentUser?.userName}</div>
                                    <div className="text-[11px] text-[#3c3c4399]">
                                        {moment(new Date(problemSubmit?.createTime).toISOString()).format('YYYY-MM-DD HH:mm:ss')}
                                    </div>
                                </div>
                                <div className="float-right">
                                    <span className="mr-4 text-xs text-[#3c3c4399]">
                                        通过测试用例：
                                        <span className="text-base text-black font-[600]">
                                            {problemSubmit.judgeInfo.pass} / {problemSubmit.judgeInfo.total}
                                        </span>
                                    </span>
                                    <Button
                                        type="text"
                                        size="large"
                                        style={{ color: submitStatusColor.get(problemSubmit.status), fontSize: 18, padding: '0 16px' }}
                                        icon={submitStatusIcon.get(problemSubmit.status)}
                                    >
                                        {submitStatusText.get(problemSubmit.status)}
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Tag style={{ borderRadius: 16, padding: '0, 12px' }} color="processing"></Tag>
                                {
                                    problemSubmit.judgeInfo.time &&
                                    <Tag style={{ borderRadius: 16, padding: '0, 12px' }} color="processing" icon={<ClockCircleOutlined />}>
                                        {problemSubmit.judgeInfo.time} ms
                                    </Tag>
                                }
                                {
                                    problemSubmit.judgeInfo.memory &&
                                    <Tag style={{ borderRadius: 16, padding: '0, 12px' }} color="processing" icon={<ClockCircleOutlined />}>
                                        {problemSubmit.judgeInfo.memory} ms
                                    </Tag>
                                }
                            </div>

                            {
                                problemSubmit.status === SUBMIT_STATUS.FAILED &&
                                <div style={{marginTop: 16, borderRadius: 8, backgroundColor: '#000a2008', padding: 16, fontSize: 13, color: '#262626bf'}}>
                                  <div>错误信息</div>
                                  <Divider style={{margin: '4px 0'}}/>
                                  <div style={{color: Color.HARD}}>{problemSubmit.judgeInfo.message}</div>
                                  {
                                    problemSubmit.judgeInfo.status === JUDGE_INFO_STATUS.WRONG_ANSWER &&
                                    <div style={{marginTop: 16}}>
                                      <div>最后执行输入</div>
                                      <Divider style={{margin: '4px 0'}}/>
                                      <div style={{color: 'black'}}>{problemSubmit.judgeInfo.input}</div>
                                      <div style={{marginTop: 16}}>预期输出</div>
                                      <Divider style={{margin: '4px 0'}}/>
                                      <div style={{color: Color.EASY}}>{problemSubmit.judgeInfo.expectedOutput}</div>
                                      <div style={{marginTop: 16}}>实际输出</div>
                                      <Divider style={{margin: '4px 0'}}/>
                                      <div style={{color: Color.HARD}}>{problemSubmit.judgeInfo.output}
                                      </div>
                                    </div>
                                  }
                                </div>
                            }

                            {/* 代码 */}
                            <MdPreview id="log" value={`\`\`\`${problemSubmit.language}\n${problemSubmit.code}\n\`\`\`` || ''}/>
                        </div> :
                        <div className="my-4 mx-5">
                            <Skeleton paragraph={{rows: 10}} />
                        </div>
                    
                }
            </div>
        </div>
    )
}