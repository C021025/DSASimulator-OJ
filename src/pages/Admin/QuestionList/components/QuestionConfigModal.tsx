import { type ProFormInstance, type ProColumns, ProForm, ProFormText, EditableProTable } from "@ant-design/pro-components"
import { Input, InputNumber, type InputRef, message, Modal, Select, Space, Tag, Tooltip } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import { MdEditor } from "md-editor-rt"
import 'md-editor-rt/lib/style.css';
import { getUUID } from "rc-select/es/hooks/useId"
import { useEffect, useRef, useState } from "react"
import {
    addQuestionUsingPOST,
    getQuestionVOByIdUsingGET,
    updateQuestionUsingPOST
} from "@/services/backendService/questionServer/questionController"

type QuestionConfigModalProps = {
    visible: boolean,
    targetId: number,
    onCancel: () => void,
    reloadData: () => void,
}

type JudgeCase = {
    id: string | number;
    input: string;
    output: string;
}

const columns: ProColumns<JudgeCase>[] = [
  {
    title: '输入用例',
    dataIndex: 'input',
    valueType: 'textarea',
    width: '40%',
  },
  {
    title: '输出用例',
    dataIndex: 'output',
    valueType: 'textarea',
    width: '40%',
  },
  {
    title: '操作',
    valueType: 'option',
  },
];

export const QuestionConfigModal: React.FC<QuestionConfigModalProps> = ({ visible, targetId, onCancel, reloadData }) => {
    const formInstance = useRef<ProFormInstance<API.QuestionAddRequest>>()
    const inputRef = useRef<InputRef>(null);
    const editorInputRef = useRef<InputRef>(null);
    // State variables
    const [tags, setTags] = useState<string[]>([]);
    const [inputVisible, setInputVisible] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>('');
    const [difficulty, setDifficulty] = useState<string>('简单');

    const [content, setContent] = useState<string>('');
    const [answer, setAnswer] = useState<string>('');

    const [editInputIndex, setEditInputIndex] = useState(-1);
    const [editInputValue, setEditInputValue] = useState('');
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

    const [timeLimit, setTimeLimit] = useState<number | null>(1000);
    const [memoryLimit, setMemoryLimit] = useState<number | null>(128);
    const [stackLimit, setStackLimit] = useState<number | null>(128);

    // Functions
    const createUpdateQuestion = () => {
        console.log('创建题目')
        const params = {
            title: formInstance.current?.getFieldValue('title'),
            tags,
            difficulty,
            content,
            answer,
            judgeCase: formInstance.current?.getFieldValue('judgeCase').map((item: JudgeCase) => {
              return {
                input: item.input,
                output: item.output,
              }
            }),
            judgeConfig: {
              timeLimit,
              memoryLimit,
              stackLimit,
            }
        }
        if(targetId === -1){
            addQuestionUsingPOST({
                ...params
            }).then(res => {
                if(res.data){
                  message.success('创建成功！');
                  clearInput();
                  onCancel();
                  reloadData();
                }
            })
        } else {
            updateQuestionUsingPOST({
                id: targetId,
                ...params,
            }).then(res => {
                if(res.data){
                  message.success('更新成功！')
                  clearInput();
                  onCancel();
                  reloadData();
                }
            })
        }
    }
    const clearInput = ()=>{
        formInstance.current?.setFieldValue('title', '');
        setTags([]);
        setDifficulty('简单');
        setContent('');
        setAnswer('');
        formInstance.current?.setFieldValue("judgeCase", []);
        setEditableRowKeys([]);
        setTimeLimit(1000);
        setMemoryLimit(128);
        setStackLimit(128);
    }
    // Event handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    const handleInputConfirm = () => {
        if (inputValue && tags.indexOf(inputValue) === -1) {
          setTags([...tags, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    };
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditInputValue(e.target.value);
    };
    const handleEditInputConfirm = () => {
        const newTags = [...tags];
        newTags[editInputIndex] = editInputValue;
        setTags(newTags);
        setEditInputIndex(-1);
        setEditInputValue('');
    };
    const handleRemoveTag = (removedTag: string) => {
        const newTags = tags.filter((tag) => tag !== removedTag);
        // console.log(newTags);
        setTags(newTags);
    };

    // initialization
    useEffect(() => {
        if (targetId > 0) {
            getQuestionVOByIdUsingGET({
                id: targetId,
            }).then(res => {
                if (res.code === 200) {
                    // console.log(res.data);
                    const questionVo: API.Question = res.data;
                    formInstance.current?.setFieldValue('title', questionVo.title);
                    setTags(questionVo.tags);
                    setDifficulty(questionVo.difficulty);
                    setContent(questionVo.content);
                    setAnswer(questionVo.answer);
                    setTimeLimit(questionVo.judgeConfig?.timeLimit);
                    setMemoryLimit(questionVo.judgeConfig?.memoryLimit);
                    setStackLimit(questionVo.judgeConfig?.stackLimit);
                    const ids = Array.from({ length: questionVo.judgeCase.length }, () => getUUID());
                    formInstance.current?.setFieldValue('judgeCase', questionVo.judgeCase.map((item, index) => {
                        return {
                            id: ids[index],
                            input: item.input,
                            output: item.output,
                        }
                    }));
                    setEditableRowKeys(ids);
                }
            })
        }
    }, [targetId])
    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
    }, [inputVisible])
    useEffect(() => {
        editorInputRef.current?.focus();
    }, [editInputValue])
    return (
        <Modal
            width={1200}
            height={600}
            open={visible}
            title={<div style={{ fontWeight: 600, fontSize: 16, textAlign: 'center' }}>创建题目</div>}
            maskClosable={false}
            centered={true}
            onOk={createUpdateQuestion}
            onCancel={onCancel}
            onClose={() => {
                clearInput();
                onCancel();
            }}
        >
            <div style={{maxHeight: 450, overflowY: 'scroll'}}>
                <ProForm<API.QuestionAddRequest>
                    formRef={formInstance}
                >
                    <ProFormText name="title" label="标题" placeholder="请输入标题" />
                    <ProForm.Item name="tags" label="标签">
                        
                        <Space size={[0, 8]} wrap>
                            {tags.map((tag, index) => {
                                if (editInputIndex === index) {
                                    return (
                                        <Input
                                            ref={editorInputRef}
                                            key={tag}
                                            size="small"
                                            value={editInputValue}
                                            style={{ width: 64, height: 22, marginInlineEnd: 8, verticalAlign: 'top' }}
                                            onChange={handleEditInputChange}
                                            onBlur={handleEditInputConfirm}
                                            onPressEnter={handleEditInputConfirm}
                                        />
                                    )
                                }
                                const isLongTag = tag.length > 20;
                                const tagElem = (
                                    <Tag
                                        key={tag}
                                        closable={true}
                                        style={{ userSelect: 'none' }}
                                        onClose={() => handleRemoveTag(tag)}
                                    >
                                        <span onDoubleClick={(e) => {
                                            if (index !== 0) {
                                                setEditInputIndex(index);
                                                setEditInputValue(tag);
                                                e.preventDefault();
                                            }
                                        }}>
                                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                        </span>
                                    </Tag>
                                )
                                if (isLongTag) {
                                    return (
                                        <Tooltip title={tag} key={tag}>
                                            {tagElem}
                                        </Tooltip>
                                    )
                                } else {
                                    return tagElem; 
                                }
                            })}
                            {inputVisible ?
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    size="small"
                                    value={inputValue}
                                    style={{ width: 64, height: 22, marginInlineEnd: 8, verticalAlign: 'top' }}
                                    onChange={handleInputChange}
                                    onBlur={handleInputConfirm}
                                    onPressEnter={handleInputConfirm}
                                /> :
                                <Tag style={{height: 22, borderStyle: 'dashed'}} onClick={() => {setInputVisible(true)}}>
                                    <PlusOutlined /> New Tag
                                </Tag>
                            }
                        </Space>
                    </ProForm.Item>
                    <ProForm.Item name="difficulty" label="难度">
                        <Select
                            size='small'
                            value={difficulty}
                            onChange={setDifficulty}
                            style={{ width: 76}}
                            options={[
                              { value: '简单', label: '简单' },
                              { value: '中等', label: '中等' },
                              { value: '困难', label: '困难' },
                            ]}
                        />
                    </ProForm.Item>
                    <ProForm.Item name="content" label="题目描述">
                        <MdEditor
                            id='content'
                            value={content}
                            style={{height: 400}}
                            toolbarsExclude={['save','htmlPreview','github']}
                            onChange={(newContent) => {setContent(newContent)}}
                        />
                    </ProForm.Item>
                    <ProForm.Item name="content" label="题解">
                        <MdEditor
                            id='answer'
                            value={answer}
                            style={{height: 400}}
                            toolbarsExclude={['save','htmlPreview','github']}
                            onChange={(newContent) => {setAnswer(newContent)}}
                        />
                    </ProForm.Item>
                    <ProForm.Item name="judgeCase" label="测试用例" initialValue={[]} trigger='onValuesChange'>
                        <EditableProTable<JudgeCase>
                            rowKey="id"
                            columns={columns}
                            toolBarRender={false}
                            recordCreatorProps={{
                                newRecordType: 'dataSource',
                                position: 'top',
                                record: () => ({
                                    id: getUUID(),
                                    input: '',
                                    output: '',
                                })
                            }}
                            editable={{
                                type: 'multiple',
                                editableKeys,
                                onChange: setEditableRowKeys,
                                actionRender: (row, _, dom) => {
                                    return [dom.delete]
                                }
                            }}
                        />
                    </ProForm.Item>
                    <ProForm.Item name="timeLimit" label="时间限制">
                        <InputNumber addonAfter="ms" value={timeLimit} onChange={(value) => setTimeLimit(value)} />
                    </ProForm.Item>
                    <ProForm.Item name="memoryLimit" label="内存限制">
                        <InputNumber addonAfter="MB" value={memoryLimit} onChange={(value) => setMemoryLimit(value)} />
                    </ProForm.Item>
                    <ProForm.Item name="stackLimit" label="堆栈限制">
                        <InputNumber addonAfter="MB" value={stackLimit} onChange={(value) => setStackLimit(value)} />
                    </ProForm.Item>
                </ProForm>
            </div>
        </Modal>
    )
}