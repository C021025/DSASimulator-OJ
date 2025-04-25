import { Button, Card, Col, Input, Row, Select, Space, Tag, Tooltip } from "antd";
import { ProTable, type ProColumns } from "@ant-design/pro-components";
import { CheckCircleOutlined, CheckOutlined, CloseCircleOutlined, ExclamationCircleOutlined, TagsOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { history, useNavigate } from "@umijs/max";
import { getQuestionTagsUsingGET, listSafeQuestionVoByPageUsingPOST } from "@/services/backendService/questionServer/questionController";
import { Color } from "@/constants/color";
import { IconFont } from "@/components/IconFont";

export const QuestionsTable: React.FC = () => {
    const navigate = useNavigate();
    const urlSearchParams = new URLSearchParams(window.location.search);
    const [loading, setLoading] = useState<boolean>(false);
    const [dataSource, setDataSource] = useState<API.SafeQuestionVo[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [tagOptions, setTagsOptions] = useState<any[]>([]); 
    // 搜索条件
    const [questionStatus, setQuestionStatus] = useState<string>(() => urlSearchParams.get('status') || '全部'); 
    const [pageNum, setPageNun] = useState<number>(() => Number(urlSearchParams.get('pageNum') || 1));
    const [difficulty, setDifficulty] = useState<string>(() => urlSearchParams.get('difficulty') || '全部');
    const [keyword, setKeyword] = useState<string>(() => urlSearchParams.get('keyword') || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(() => urlSearchParams.getAll('tags') || []);
    // functions
    const reloadData = () => {
        setLoading(true);
        listSafeQuestionVoByPageUsingPOST({
            current: pageNum,
            keyword: keyword,
            status: questionStatus,
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
    const updateQueryParam = (pageNum: number, status: string, difficulty: string, keyword: string, selectedTags: string[]) => {
        const params = new URLSearchParams({
          pageNum: pageNum.toString(),
          status,
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
    const handleStatusChange = (newStatus: string) => {
        setQuestionStatus(newStatus);
        updateQueryParam(pageNum, newStatus, difficulty, keyword, selectedTags);
    }
    const handleDifficultyChange = (newDifficulty: string) => {
        setDifficulty(newDifficulty);
        updateQueryParam(pageNum, questionStatus, newDifficulty, keyword, selectedTags);
    }
    const handleTagRemove = (removeTag: string) => {
        const newTags = selectedTags.filter(t => t !== removeTag);
        setSelectedTags(newTags);
        updateQueryParam(pageNum, questionStatus, difficulty, keyword, newTags); 
    }
    const handleTagAdd = (addTag: string) => {
        const newTags = [...selectedTags, addTag];
        setSelectedTags(newTags);
        updateQueryParam(pageNum, questionStatus, difficulty, keyword, newTags);
    }
    const handleQuestionsSearch = (keyword: string) => {
        setKeyword(keyword);
        updateQueryParam(pageNum, questionStatus, difficulty, keyword, selectedTags);
    }
    const handleClickInspect = (problem: API.SafeQuestionVo) => {
        history.push(`/question/${problem.id}`);
    }
    const handlePageChange = (pageNum: number) => {
        setPageNun(pageNum);
        updateQueryParam(pageNum, questionStatus, difficulty, keyword, selectedTags);
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
    const questionColumns: ProColumns<API.SafeQuestionVo>[] = [
        {
            title: '状态',
            width: '5%',
            align: 'center',
            render: (_, problem) => (
              <>
                {
                  problem.status === '失败' && <CloseCircleOutlined style={{fontSize: 18, color: Color.HARD}}/> ||
                  problem.status === '未开始' ||
                  problem.status === '尝试过' && <ExclamationCircleOutlined style={{fontSize: 18, color: Color.MEDIUM}} />  ||
                  problem.status === '已通过' && <CheckCircleOutlined style={{fontSize: 18, color: Color.EASY}}/>
                }
              </>
            ),
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
            width: '20%',
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
            width: '10%',
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
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: '5%',
            align: 'center',
            render: (_, entity) => (
                <Tooltip placement="top" title="查看" color="#FA541C">
                    <Button
                        type="text"
                        icon={<IconFont type='icon-chakan' />}
                        onClick={() => handleClickInspect(entity)}
                    />
                </Tooltip>
            ),
          
        },
    ]
    return (
        <Card>
            {/* 筛选条件 */}
            <Row className="px-6 pt-6 pb-4">
                <Col flex='150px'>
                    状态：
                    <Select
                        value={questionStatus}
                        className="w-[90px]"
                        options={[
                            { value: '全部', label: '全部' },
                            { value: '未开始', label: '未开始' },
                            { value: '尝试过', label: '尝试过' },
                            { value: '已通过', label: '已通过' },
                        ]}
                        onChange={handleStatusChange}
                    />
                </Col>
                <Col flex='150px'>
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
                                className="w-[90%]"
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
                <Col flex='200px'>
                    <Input.Search placeholder="输入题目关键词" allowClear onSearch={handleQuestionsSearch} />
                </Col>
            </Row>
            {/* 题目列表 */}
            <ProTable<API.SafeQuestionVo>
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
            />
        </Card>
    )
}