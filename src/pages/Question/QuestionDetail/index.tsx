import { useModel, useNavigate, useParams } from "@umijs/max";
import { Button, Card, Col, Divider, Input, message, Row, Skeleton, Space, Tabs, type TabsProps } from "antd";
import { useEffect, useRef, useState } from "react";
import { Content, Answer, SubmitLog, LogDetail, Editor } from './components'
import {type exportFunctionForParentType} from './components/SubmitLog'
import { doQuestionSubmitUsingPOST, getSafeQuestionVoByIdUsingGET } from "@/services/backendService/questionServer/questionController";
import { Color } from "@/constants/color";
import { IconFont } from "@/components/IconFont";
import { doProblemRunUsingPOST } from "@/services/backendService/judge/judgeInnerController";
type URLParamsType = {
    id: string;
}

const QuestionDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const urlSearchParams = new URLSearchParams(location.search);
    const urlParams = useParams<URLParamsType>()
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState || {};
    const [loading, setLoading] = useState<boolean>(false);

    const [activeTabKey, setActiveTabKey] = useState<string>(() => urlSearchParams.get('tab') || 'content');
    const [question, setQuestion] = useState<API.SafeQuestionVo>();
    const [difficultyColor, setDifficultyColor] = useState<string>('green');
    const [targetSubmitId, setTargetSubmitId] = useState<number>(() => Number(urlSearchParams.get('targetSubmitId')) || -1);

    const [resultLoading, setResultLoading] = useState<boolean>(false);

    const [logHeight, setLogHeight] = useState<string>('calc(100vh - 180px)');
    const [code, setCode] = useState<string>('public class Main {\n\tpublic static void main(String[] args) {\n\t\t\n\t}\n}');
    const [coderHeight, setCoderHeight] = useState<string>('100%');
    const [language, setLanguage] = useState<string>('java');

    const [terminalOpen, setTerminalOpen] = useState<boolean>(false);
    const [activeTerminalKey, setActiveTerminalKey] = useState<string>('1');
    const [textInput, setTextInput] = useState<string>('');
    const [testResult, setTestResult] = useState<API.QuestionRunResult>();
    const [testResultLoading, setTestResultLoading] = useState<boolean>(false);

    const SubmitLogRef = useRef<exportFunctionForParentType>(null)
    // functions
    const updateURLQuery = (newTabKey: string, submitId: number) => {
        const newQuery = new URLSearchParams({
            tab: newTabKey,
            submitId: submitId.toString()
        });
        navigate({ search: newQuery.toString() });
    }
    const changeTargetSubmitId = (newSubmitId: number) => {
        updateURLQuery(activeTabKey, newSubmitId);
    }

    // event handlers
    const handleTabChange = (newTabKey: string) => {
        updateURLQuery(newTabKey, 0);
    }
    const handleTerminalButtonClick = () => {
        setTerminalOpen(!terminalOpen);
        if (terminalOpen) {
            setCoderHeight('100%');
            setLogHeight('calc(100vh - 170px)'); 
        } else {
            setCoderHeight('calc(100vh - 322px)');
            setLogHeight('calc(100vh - 322px)');
        }
    }
    const handleRunButtonClick = () => {
        setTestResultLoading(true);
        doProblemRunUsingPOST({
            code,
            language,
            input: textInput
        }).then(res => {
            if (res) {
                message.success('运行成功!');
                setActiveTerminalKey('2');
                setTestResult(res);
                setTestResultLoading(false);
            }
        })
    }
    const handleSubmitButtonClick = () => {
        if (question) {
            setTestResultLoading(true);
            doQuestionSubmitUsingPOST({
                code,
                language,
                questionId: question.id
            }).then(res => {
                // console.log(res);
                // update targetSubmitId to the new submit id
                changeTargetSubmitId(res.data.id.toString())
                // 如果左侧在 log 页面中，要手动加载数据
                if (activeTabKey === 'log' && SubmitLogRef.current) {
                    SubmitLogRef.current.reloadData()
                }
            })
        }
    }

    // initialization
    useEffect(() => {
        setLoading(true);
        getSafeQuestionVoByIdUsingGET({
            id: urlParams.id!
        }).then(res => {
            if (res.data) {
                setQuestion(res.data);
                setLoading(false);
                switch (res.data.difficulty) {
                    case '简单': setDifficultyColor(Color.EASY); break;
                    case '中等': setDifficultyColor(Color.MEDIUM); break;
                    case '困难': setDifficultyColor(Color.HARD); break;
                }
            } else {
                // 题目不存在，跳转到404
                navigate('/404');
            }
        })
    }, [])
    useEffect(() => {
        setActiveTabKey(urlSearchParams.get('tab') || 'content');
        setTargetSubmitId(Number(urlSearchParams.get('targetSubmitId')) || -1);
    }, [window.location.search])

    // ui constants
    // 题目描述区tabs
    const questionTabs: TabsProps['items'] = [
        { key: 'content', label: '题目描述' },
        { key: 'answer', label: '题解' },
        { key: 'log', label: '提交记录', disabled: !currentUser }
    ]
    // 控制台tabs
    const terminalItems: TabsProps['items'] = [
        {
          key: '1',
          label: `测试用例`,
        },
        {
          key: '2',
          label: `执行结果`,
        },
    ];
    // renders
    const renderLeftTabContent = () => {
        if (loading || !question) {
            return (
                <div className="px-5 py-0">
                    <Skeleton paragraph={{rows: 10}} />
                </div>
            )
        } else {
            switch (activeTabKey) {
                case 'content': return <Content question={question} difficultyColor={difficultyColor} />;
                case 'answer': return <Answer  answer={question.answer} />;
                case 'log': return <SubmitLog ref={SubmitLogRef} questionId={question.id} />;
            }
        }
    }
    const renderRightPannelContent = () => {
        if (targetSubmitId > 0 || resultLoading) {
            return <LogDetail afterClose={() => setResultLoading(false)} logHeight={logHeight} targetSubmitId={targetSubmitId} />
        } else {
            return <Editor code={code} setCode={setCode} language={language} setLanguage={setLanguage} coderHeight={coderHeight} />
        }
    }
    const renderTerminalContent = () => {
        if (activeTerminalKey === '1') {
            return (
                <>
                    <div className="mb-2 text-xs text-[#3c3c4399]">输入</div>
                    <Input.TextArea
                        value={textInput}
                        onChange={(e) => { setTextInput(e.target.value) }}
                    />
                </>
            )
        } else if (activeTerminalKey === '2') {
            return testResult ? 
                <>
                    <div className="mb-2 text-xs text-[#3c3c4399]">输入</div>
                    <div className="py-[6px] px-[10px] bg-[#000a2008] rounded-lg">
                        {testResult?.input}
                    </div>
                    <div className="mt-4"></div>
                    <div className="mb-2 text-xs text-[#3c3c4399]">输出</div>
                    <div className="py-[6px] px-[10px] bg-[#000a2008] rounded-lg">
                        {testResult?.output}
                    </div>
                </> : testResultLoading ?
                    <Skeleton paragraph={{ rows: 4 }} /> :
                    <div className="h-20 flex justify-center items-center font-medium text-[#3c3c4399]">请先执行代码</div>
        }
    }

    return (
        <Row className="w-full mt-0 mx-auto bg-slate-100">
            {/* 题目描述区 */}
            <Col span={12}>
                <Card bodyStyle={{padding: 0}} className="h-[calc(100vh_-_73px)] p-0 rounded-md">
                    <Tabs
                        className="px-4 py-0"
                        accessKey={activeTabKey}
                        items={questionTabs}
                        onChange={handleTabChange}
                    />
                    {renderLeftTabContent()}
                </Card>
            </Col>

            {/* 代码编写区 + 控制台 */}
            <Col span={12} className="pl-1">
                <div className="h-[calc(100vh_-_73px)] flex flex-col">
                    {/* 代码编写区 */}
                    <Card
                        bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
                        className="mb-2 flex-grow rounded-[4]"
                    >
                        {renderRightPannelContent()}
                    </Card>
                    {/* 控制台 */}
                    <Card className="rounded-[4]" bodyStyle={{padding: 0}}>
                        {
                            terminalOpen &&
                            <div className="relative h-[150px]">
                                <Tabs
                                    className="py-0 px-4"
                                    accessKey={activeTerminalKey}
                                    items={terminalItems}
                                    onChange={setActiveTerminalKey}
                                />
                                <div className="max-h-[100px] overflow-auto">
                                    <div className="mt-0 mb-[10px] mx-5">
                                        {renderTerminalContent()}
                                    </div>
                                </div>
                                <Divider className="absolute bottom-0 m-0" />
                            </div>
                        }
                        <div className="p-2">
                            <Button type="text" size="small" className="w-[90px] h-7" onClick={handleTerminalButtonClick}>
                                控制台 {terminalOpen ? <IconFont type="icon-down" /> : <IconFont type="icon-up" />}
                            </Button>
                            <Space className="float-right">
                                <Button
                                    size='small'
                                    className="w-[66px] h-[28px]"
                                    disabled={!question || !currentUser || targetSubmitId > 0}
                                    onClick={handleRunButtonClick}
                                >
                                  运行
                                </Button>
                                <Button
                                    type='primary'
                                    size='small'
                                    className="w-[66px] h-[28px]"
                                    disabled={!question || !currentUser || targetSubmitId > 0}
                                    onClick={handleSubmitButtonClick}
                                >
                                  提交
                                </Button>
                            </Space>
                        </div>
                    </Card>
                </div>
            </Col>
        </Row>
    )
}

export default QuestionDetailPage;