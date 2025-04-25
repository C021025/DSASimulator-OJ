import { problemStatusColor, problemStatusIcon } from "@/constants/color";
import { LikeOutlined, StarOutlined } from "@ant-design/icons";
import { Button, Divider, Space, Statistic, Tag } from "antd";
import { MdPreview } from "md-editor-rt";

type ContentProps = {
    question: API.SafeQuestionVo;
    difficultyColor?: string;
}

export const Content: React.FC<ContentProps> = ({question, difficultyColor}) => {
    return (
        <div className="max-h-[calc(100vh_-_132px)] py-0 px-5 overflow-auto">
            <div className="text-[1.125rem] leading-7">{question.title}</div>
            <Space size='small' className="my-2 mx-0">
                <span style={{color: difficultyColor, paddingRight: 8}}>{question.difficulty}</span>
                <Button
                    type="text"
                    icon={problemStatusIcon.get(question.status)}
                    style={{color: problemStatusColor.get(question.status)}}
                >
                    {question.status}
                </Button>
                <Button
                    type="text"
                    icon={<LikeOutlined />}
                    className="text-[rgb(2,176,156)]"
                    onClick={() => {console.log('用户点赞该题目')}}
                >
                    {question.thumbNum.toString()}
                </Button>
                <Button
                    type="text"
                    icon={<StarOutlined />}
                    className="text-[rgb(2,176,156)]"
                    onClick={() => {console.log('用户收藏该题目')}}
                >
                    {question.favourNum.toString()}
                </Button>
            </Space>
            <div>
                {question.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
            </div>
            <Divider />
            {/* 题目描述 */}
            <div className="mt-3 text-[16px]">
                <MdPreview value={question.content || ''} id="content" />
            </div>
            {/* 统计数据 */}
            <Space size='large' className="mt-[38px] mb-3">
                <Statistic
                    className="flex items-center hover:cursor-pointer"
                    style={{fontSize: 13, marginBottom: 0}} // 覆盖antd默认样式
                    title="通过次数："
                    value={question.acceptedNum}
                    valueStyle={{ fontSize: 16, fontWeight: '500'}}
                    />
                <Statistic
                    className="flex items-center hover:cursor-pointer"
                    style={{fontSize: 13, marginBottom: 0}} // 覆盖antd默认样式
                    title="提交次数："  
                    value={question.submitNum}
                    valueStyle={{ fontSize: 16, fontWeight: '500'}}
                    />
                <Statistic
                    className="flex items-center hover:cursor-pointer"
                    style={{fontSize: 13, marginBottom: 0}} // 覆盖antd默认样式
                    title="通过率："
                    value={100 * question.acceptedNum / question.submitNum || 0}
                    suffix="%"
                    precision={2}
                    valueStyle={{ fontSize: 16, fontWeight: '500'}}
                />
            </Space>
        </div>
    )
}