import { Button, Card, Col, Input, message, Popconfirm, Row, Select, Space, Tag, Tooltip } from "antd";
import { PageContainer, ProTable, type ProColumns } from "@ant-design/pro-components";
import { CheckOutlined, PlusOutlined, TagsOutlined } from "@ant-design/icons";
import moment from "moment";
import { useEffect, useState } from "react";
import { history, useNavigate } from "@umijs/max";
import { QuestionConfigModal } from "./components/QuestionConfigModal";
import { Color } from "@/constants/color";
import { IconFont } from "@/components/IconFont";
import {
    getQuestionTagsUsingGET,
    listQuestionVOByPageUsingPOST,
    deleteQuestionUsingPOST
} from "@/services/backendService/questionServer/questionController";

const QuestionList: React.FC = () => {
    const navigate = useNavigate();
    const urlSearchParams = new URLSearchParams(window.location.search);
    const [loading, setLoading] = useState<boolean>(false);
    const [dataSource, setDataSource] = useState<API.Question[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [pageNum, setPageNun] = useState<number>(() => Number(urlSearchParams.get('pageNum') || 1));
    
    const [tagOptions, setTagsOptions] = useState<any[]>([]);

    const [visible, setVisible] = useState<boolean>(false);
    const [targetQuestionId, setTargetQuestionId] = useState<number>(-1);

    // 搜索条件
    const [difficulty, setDifficulty] = useState<string>(() => urlSearchParams.get('difficulty') || '全部');
    const [keyword, setKeyword] = useState<string>(() => urlSearchParams.get('keyword') || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(() => urlSearchParams.getAll('tags') || []);
    // functions
    const reloadData = () => {
        setLoading(true);
        listQuestionVOByPageUsingPOST({
            current: pageNum,
            keyword: keyword,
            difficulty: difficulty === '全部' ? '' : difficulty,
            tags: selectedTags,
        }).then(res => {
            if (res.data) {
                setDataSource(res.data.records);
                setTotal(res.data.total);
                setLoading(false);
            }
        })
    }
    const updateQueryParam = (pageNum: number, difficulty: string, keyword: string, selectedTags: string[]) => {
        const params = new URLSearchParams({
          pageNum: pageNum.toString(),
          difficulty,
          keyword: keyword,
        });
        selectedTags.forEach(tag => params.append('tags', tag));
        //将搜索参数拼接到query上
        navigate({
          search: `?${params.toString()}`
        })
    }

    // event handler
    const handlePageChange = (pageNum: number) => {
        setPageNun(pageNum);
        updateQueryParam(pageNum, difficulty, keyword, selectedTags);
    }
    const handleDifficultyChange = (newDifficulty: string) => {
        setDifficulty(newDifficulty);
        updateQueryParam(pageNum, newDifficulty, keyword, selectedTags);
    }
    const handleTagRemove = (removeTag: string) => {
        const newTags = selectedTags.filter(t => t !== removeTag);
        setSelectedTags(newTags);
        updateQueryParam(pageNum, difficulty, keyword, newTags); 
    }
    const handleTagAdd = (addTag: string) => {
        const newTags = [...selectedTags, addTag];
        setSelectedTags(newTags);
        updateQueryParam(pageNum, difficulty, keyword, newTags);
    }
    const handleQuestionsSearch = (keyword: string) => {
        setKeyword(keyword);
        updateQueryParam(pageNum, difficulty, keyword, selectedTags);
    }
    const handleClickInspect = (problem: API.Question) => {
        history.push(`/question/${problem.id}`);
    }
    const handleClickEditor = (problem: API.Question) => {
        console.log('编辑题目')
        setVisible(true);
        setTargetQuestionId(problem.id);
    }
    const handleComfirmDelete = (problem: API.Question) => () => {
        console.log('删除题目')
        deleteQuestionUsingPOST({
            id: problem.id,
        }).then(res => {
            if (res.data) {
                message.success('删除成功!');
                reloadData();
            }
        })
    }
    
    // initialization
    useEffect(() => {
        getQuestionTagsUsingGET().then(res => {
            console.log(res);
            if (res.data) {
                setTagsOptions(res.data);
            }
        })
    }, [])
    useEffect(() => {
        reloadData();
    }, [location.search])
    
    // UI constent
    const questionColumns: ProColumns<API.Question>[] = [
        {
            title: 'ID',
            width: '5%',
            align: 'center',
            ellipsis: true,
            render: (_, problem) => problem.id,
        },
        {
            title: '题目',
            width: '20%',
            ellipsis: true,
            render: (_, problem) => problem.title,
        },
        {
            title: '标签',
            ellipsis: true,
            width: '18%',
            render: (_, record) => (
              <Space>
                {record.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            ),
        },
        {
            title: '通过率',
            width: '8%',
            align: 'center',
            render: (_, entity) => ((entity.acceptedNum / entity.submitNum || 0)*100).toFixed(2) + '%',
        },
        {
            title: '难度',
            width: '5%',
            align: 'center',
            render: (_, entity) => (
                  entity.difficulty === '简单' && <span style={{marginRight: 0, color: Color.EASY}} >简单</span> ||
                  entity.difficulty === '中等' && <span style={{marginRight: 0, color: Color.MEDIUM}} >中等</span> ||
                  entity.difficulty === '困难' && <span style={{marginRight: 0, color: Color.HARD}} >困难</span>
            )
        },
        {
            title: '判题配置',
            width: '22%',
            render: (_, entity) => (
                <>
                    <Tag icon={<IconFont type="icon-miaobiao" />}>{entity.judgeConfig.timeLimit}ms</Tag>
                    <Tag icon={<IconFont type="icon-neicun" />}>{entity.judgeConfig.memoryLimit}MB</Tag>
                    <Tag icon={<IconFont type="icon-kongjian" />}>{entity.judgeConfig.stackLimit}MB</Tag>
                </>
            )
        },
        {
            title: '创建时间',
            width: '12%',
            render: (_, entity) => (
                <span>{moment(new Date(entity.createTime).toISOString()).format('YYYY-MM-DD HH:mm:ss')}</span>
            )
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <>
                    <Tooltip placement="top" title="查看" color="#FA541C">
                        <Button
                            type="text"
                            icon={<IconFont type='icon-chakan' />}
                            onClick={() => handleClickInspect(record)}
                        />
                    </Tooltip>
                    <Tooltip placement="top" title="编辑" color="#FA541C">
                        <Button
                            type="text"
                            icon={<IconFont type='icon-bianji' />}
                            onClick={() => handleClickEditor(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="删除"
                        description="确定要删除该题目吗？"
                        okText="是"
                        cancelText="否"
                        onConfirm={handleComfirmDelete(record)}
                    >
                        <Button type="text" icon={<IconFont type='icon-shanchu' />} />
                    </Popconfirm>
                </>
            ),
          
        },
    ]
    return (
        <PageContainer title={false}>
            <Card bodyStyle={{padding: 0}}>
                {/* 筛选条件 */}
                <Row className="px-6 pt-6 pb-4">
                    <Col flex='160px'>
                        难度：
                        <Select
                            value={difficulty}
                            className="w-[90px]"
                            options={[
                                { value: '全部', label: '全部' },
                                { value: '简单', label: '简单' },
                                { value: '中等', label: '中等' },
                                { value: '困难', label: '困难' },
                            ]}
                            onChange={handleDifficultyChange}
                        />
                    </Col>
                    <Col flex='auto'>
                        <Row justify="space-around" align="middle">
                            <Col flex='66px'>
                                <div className="text-[14px]">
                                    <TagsOutlined />
                                    <span className="ml-2">标签：</span>
                                </div>
                            </Col>
                            <Col flex='auto'>
                                <Select
                                    mode="multiple"
                                    showSearch={false}
                                    value={selectedTags}
                                    className="w-[60%]"
                                    dropdownStyle={{ padding: 12 }}
                                    tagRender={(tag) => (
                                        <Tag closable={true} onClose={() => handleTagRemove(tag.value)} className="mr-[3px]">
                                            {tag.value}
                                        </Tag>
                                    )}
                                    dropdownRender={() => (
                                        <div>
                                            {tagOptions.map(option => selectedTags.includes(option) ?
                                                <Tag color="#f50" key={option} className="cursor-pointer" onClick={() => handleTagRemove(option)}>
                                                    {option}<CheckOutlined />
                                                </Tag>:
                                                <Tag key={option} className="cursor-pointer" onClick={() => handleTagAdd(option)}>
                                                    {option}
                                                </Tag>
                                            )}
                                        </div>
                                    )}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col flex='300px'>
                        <Input.Search placeholder="输入题目关键词" allowClear onSearch={handleQuestionsSearch} />
                    </Col>
                </Row>
                {/* 题目列表 */}
                <ProTable<API.Question>
                    headerTitle='题库列表'
                    loading={loading}
                    dataSource={dataSource}
                    columns={questionColumns}
                    rowKey='id'
                    search={false}
                    options={false}
                    pagination={{
                        total: total,
                        current: pageNum,
                        pageSize: 20,
                        onChange: handlePageChange
                    }}
                    toolBarRender={() => [
                        <Button key='button' type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>新建</Button>
                    ]}
                />
            </Card>

            <QuestionConfigModal
                visible={visible}
                targetId={targetQuestionId}
                onCancel={() => { setVisible(false); setTargetQuestionId(-1); }}
                reloadData={reloadData}
            />
        </PageContainer>
    )
}

export default QuestionList;