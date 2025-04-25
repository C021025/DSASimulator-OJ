import {
  PageContainer,
  ProCard
} from '@ant-design/pro-components';

const HomePage: React.FC = () => {
  return (
    <PageContainer className='h-[80vh]'>
      <ProCard
        title='欢迎使用 DSA-Simulator-OpenJudge 系统'
        className='bg-blue-400'
      >
        Card content
      </ProCard>
    </PageContainer>
  );
};

export default HomePage;
