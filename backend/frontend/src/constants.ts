import { TechnologyData } from './types';

export const TECH_DATA: Record<string, TechnologyData> = {
  'embodied-ai': {
    id: 'embodied-ai',
    name: '具身智能',
    categories: [
      {
        id: 'perception',
        name: '感知系统',
        subComponents: [
          {
            id: 'vision',
            name: '计算机视觉',
            description: '用摄像头和算法让机器人"看见"',
            keywords: ['视觉语义', '3D重建', '物体识别'],
            recentResults: [
              { text: 'OpenAI 发布 GPT-4o 增强机器人实时视觉交互', link: '#' },
              { text: 'Tesla Optimus 视觉端到端学习取得突破', link: '#' }
            ],
            boundary: '在复杂光照下仍存在感知偏差，无法完全模拟人类情感视觉。'
          },
          {
            id: 'force',
            name: '力觉传感器',
            description: '感知接触力的大小和方向',
            keywords: ['柔顺控制', '力矩融合', '碰撞检测'],
            recentResults: [
              { text: '高精度多维力传感器实现国产替代', link: '#' }
            ],
            boundary: '微小力的感知精度仍不如人类指尖灵敏。'
          },
          {
            id: 'tactile',
            name: '触觉反馈',
            description: '模拟人类触觉的电子皮肤',
            keywords: ['电子皮肤', '纹理识别', '柔性电子'],
            recentResults: [
              { text: '斯坦福开发出自修复电子皮肤', link: '#' }
            ],
            boundary: '大面积部署成本极高，数据量巨大。'
          }
        ]
      },
      {
        id: 'motion',
        name: '运动控制',
        subComponents: [
          {
            id: 'servo',
            name: '伺服电机',
            description: '精确控制转动角度和速度',
            keywords: ['高功率密度', '精巧结构', '一体化关节'],
            recentResults: [
              { text: '新型空心轴伺服电机提升机器人负载比', link: '#' }
            ],
            boundary: '受限于耐热性和能量密度，持续高负载能力有限。'
          },
          {
            id: 'joint',
            name: '关节控制',
            description: '多关节协调运动的算法',
            keywords: ['动力学解算', '阻抗控制', '多体协同'],
            recentResults: [
              { text: 'Boston Dynamics 实现全电传动关节平稳运动', link: '#' }
            ],
            boundary: '高速突发状况下的稳定性仍需完善。'
          },
          {
            id: 'path',
            name: '路径规划',
            description: '从 A 到 B 的最优运动轨迹',
            keywords: ['SLAM', '实时避障', '动态约束'],
            recentResults: [
              { text: '强化学习在复杂地形路径生成中表现优异', link: '#' }
            ],
            boundary: '完全动态且不可预测环境下的解算延迟。'
          }
        ]
      },
      {
        id: 'intelligence',
        name: '决策智能',
        subComponents: [
          {
            id: 'vlm',
            name: '大语言模型',
            description: '理解自然语言指令',
            keywords: ['指令跟随', '任务拆解', '具身对话'],
            recentResults: [
              { text: 'Google PaLM-E 实现跨模态具身任务执行', link: '#' }
            ],
            boundary: '逻辑推理链断裂可能导致不可逆的物理损坏。'
          },
          {
            id: 'rl',
            name: '强化学习',
            description: '通过试错学习最优策略',
            keywords: ['Sim-to-Real', '奖励函数', '自我进化'],
            recentResults: [
              { text: 'NVIDIA Isaac 平台缩短训练周期 100 倍', link: '#' }
            ],
            boundary: '虚实迁移（Sim-to-Real）中的物理误差难以完全消除。'
          },
          {
            id: 'world-model',
            name: '世界模型',
            description: '对物理世界的内部模拟',
            keywords: ['因果推理', '物理规律预测', '长程规划'],
            recentResults: [
              { text: 'Meta 发布 JEPA 模型，初步具备直觉物理能力', link: '#' }
            ],
            boundary: '对于极端随机物理事件的预测能力尚浅。'
          }
        ]
      }
    ]
  }
};
