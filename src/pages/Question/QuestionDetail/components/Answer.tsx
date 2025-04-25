import { MdCatalog, MdPreview } from "md-editor-rt";


type AnswerProps = {
    answer: string;
}

export const Answer: React.FC<AnswerProps> = ({ answer }) => {
    return (
        <div className="max-h-[calc(100vh_-_132px)] overflow-auto py-0 px-5 text-[1.125rem] leading-7">
            <MdPreview id="answer" value={answer} />
        </div>
    )
}