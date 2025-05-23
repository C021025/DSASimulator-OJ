import { Result, Button } from "antd"
import { history } from "@umijs/max"
const NoFonundPage: React.FC = () => {
    return (
        <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={
                <Button type="primary" onClick={() => history.push('/')}>
                    Back Home
                </Button>
            }
        />
    )
}
export default NoFonundPage