import { PageContainer } from "@ant-design/pro-components";
import { Card, Col, Row } from "antd";
import { QuestionsTable } from "./componets/QuestionsTable";
import * as echarts from 'echarts/core';
import { GraphicComponent, type GraphicComponentOption } from "echarts/components";
import { PieChart, type PieSeriesOption } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { LabelLayout } from "echarts/features";
import { useEffect, useRef, useState } from "react";
import { useModel } from "@umijs/max";
import { getSubmitSummaryUsingGET } from "@/services/backendService/questionServer/questionController";
import { Color } from "@/constants/color";

// echarts 使用
echarts.use([GraphicComponent, PieChart, CanvasRenderer, LabelLayout]);
// echarts 配置
type EChartsOption = echarts.ComposeOption<GraphicComponentOption | PieSeriesOption>

const QuestionsPage: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [summary, setSummary] = useState<API.SubmitSummaryVo | null>(null);
  const echartContainerRef = useRef<HTMLDivElement>(null);
  // functions
  const getTotalByName = (name: string, data: API.SubmitSummaryVo) => {
    switch (name) {
      case '简单': return data.easyTotal;
      case '中等': return data.mediumTotal;
      case '困难': return data.hardTotal;
      case '未通过': return data.total;
    }
  }

  // initialization
  useEffect(() => {
    getSubmitSummaryUsingGET().then(res => {
      if (res.data) {
        const statisticalData = res.data;
        setSummary(statisticalData);

        // 初始化echarts统计信息
        const myChartInstance = echarts.init(echartContainerRef.current!);
        const option: EChartsOption = {
          graphic: [
            {
              type: 'text',
              left: 'center', // 文本居中
              top: 'middle', // 文本居中
              style: {
                text: [
                  '{name|全部}',
                  '{divider| }',
                  '{divider| }',
                  '{divider| }',
                  '{value|' + (statisticalData.easyPass + statisticalData.mediumPass + statisticalData.hardPass) + '}',
                  '{line|——————}',
                  '{divider| }',
                  '{total|' + statisticalData.total + '}'
                ].join('\n'),
                rich: {
                  name: {
                    align: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                  },
                  value: {
                    align: 'center',
                    fontSize: 20,
                    fontWeight: 700,
                  },
                  line: {
                    fontSize: 6,
                    fontWeight: 'bold'
                  },
                  divider: {
                    fontSize: 4
                  },
                  total: {
                    align: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                  }
                }
              },
            }
          ],
          color: [
            '#91cc75',
            '#fac858',
            '#ee6666',
            '#000a200d',
          ],
          series: [
            {
              type: 'pie',
              radius: ['75%', '90%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 2,
                borderColor: '#fff',
                borderWidth: 1
              },
              label: {
                show: false,
                position: 'center',
                formatter: (params) => (
                  [
                    `{name|${params.name}\n}`,
                    `{divider|\n}`,
                    `{value|${params.value}}`,
                    `{line|——————}`,
                    `{divider|\n}`,
                    `{total|${getTotalByName(params.name, statisticalData)}}`
                  ].join('\n')
                ),
                rich: {
                  name: {
                    fontSize: 14,
                    fontWeight: 600,
                  },
                  value: {
                    fontSize: 20,
                    fontWeight: 700,
                    color: Color.EASY
                  },
                  divider: {
                    fontSize: 0
                  },
                  total: {
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#3c3c434d'
                  }
                }
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 6,
                  fontWeight: 'bold',
                }
              },
              data: [
                { value: statisticalData.easyPass, name: '简单'},
                { value: statisticalData.mediumPass, name: '中等'},
                { value: statisticalData.hardPass, name: '困难'},
                { value: statisticalData.total - statisticalData.easyPass - statisticalData.mediumPass - statisticalData.hardPass, name: '未通过'},
              ] 
            }
          ]
        }
        myChartInstance.setOption(option);
        myChartInstance.on('mouseover', (params) => {
          if (params.seriesType === 'pie' && params.dataIndex !== undefined) {
            // 当 hover 到环图时，将 graphic 第一个元素设置为不可见
            // @ts-ignore
            option.graphic[0].invisible = true;
            myChartInstance.setOption(option);
          }
        })
        myChartInstance.on('mouseout', (params) => {
          if (params.seriesType === 'pie' && params.dataIndex !== undefined) {
            // 当 hover 到环图时，将 graphic 第一个元素设置为可见
            // @ts-ignore
            option.graphic[0].invisible = false;
            myChartInstance.setOption(option);
          }
        })
      }
    })
  }, [])
  return (
    <PageContainer className="h-[80vh]">
      <Row>
        {/* 问题列表 */}
        <Col span={17} className="pr-2">
          <QuestionsTable />
        </Col>

        {/* 个人做题统计信息 */}
        <Col span={7}>
          <Card title='当前进度' className="rounded-xl p-4">
            <Row justify="space-around" align="middle">
              <Col span={10}>
                <div className="h-[139px] w-full" ref={echartContainerRef} />
              </Col>
    
              <Col span={14}>
                <Row>
                  <Col span={8} className="flex flex-col items-center">
                    <div className="text-[14px] opacity-45">通过数</div>
                    <div className="text-[18px] font-bold mt-2">{summary?.submitCount}</div>
                  </Col>
                  <Col span={8} className="flex flex-col items-center">
                    <div className="text-[14px] opacity-45">提交数</div>
                    <div className="text-[18px] font-bold mt-2">{summary?.passCount}</div>
                  </Col>
                  <Col span={8} className="flex flex-col items-center">
                    <div className="text-[14px] opacity-45">通过率</div>
                    <div className="text-[18px] font-bold mt-2">
                      {(summary?.passCount || summary?.submitCount ?
                        (summary?.passCount / summary?.submitCount) * 100 : 0)
                        .toFixed(2)}%
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
        </Row>
      </PageContainer>
  )
}

export default QuestionsPage;