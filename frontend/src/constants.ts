import { TechnologyData } from './types';

export const TECH_DATA: Record<string, TechnologyData> = {
  'embodied-ai': {
    id: 'embodied-ai',
    name: '具身智能',
    nameEn: 'Embodied AI',
    tagline: '让 AI 拥有身体，能在物理世界感知、行动、决策',
    categories: [
      {
        id: 'perception',
        name: '感知系统',
        nameEn: 'Perception',
        subComponents: [
          {
            id: 'computer-vision',
            name: '计算机视觉',
            shortLabel: '计算机视觉',
            description: "让机器人通过摄像头识别物体、人脸、场景和空间结构，相当于机器的'眼睛'。",
            capabilityCan: [
              '在良好光照下识别常见物体和人脸',
              '估计物体距离、三维位姿',
              '结合深度相机做室内 SLAM 建图',
            ],
            capabilityCannot: [
              '完全透明/高反光物体识别',
              '极暗或烟雾等复杂环境',
              '未见过品类的可靠零样本识别',
            ],
            recentAchievements: [
              { title: 'Meta SAM 2 实现视频任意物体分割', date: '2024-07', source: 'https://ai.meta.com/sam2/' },
              { title: '特斯拉 Optimus 纯视觉方案量产迭代', date: '2025-01', source: 'https://www.tesla.com/AI' },
            ],
          },
          {
            id: 'force-sensor',
            name: '力觉传感器',
            shortLabel: '力觉传感',
            description: "安装在机器人关节或末端的传感器，能感知受力大小和方向，让机器人知道'抓得稳不稳、推得重不重'。",
            capabilityCan: [
              '六维力/力矩测量',
              '精密装配中的柔顺控制',
              '抓取力度闭环调节',
            ],
            capabilityCannot: [
              '低成本高精度仍难两全',
              '极小接触力（<0.1N）难稳定测量',
              '长期使用后零漂需校准',
            ],
            recentAchievements: [
              { title: 'ATI 多轴力传感器用于波士顿动力 Atlas 装配任务', date: '2024-10', source: 'https://www.ati-ia.com/' },
              { title: '国产宇立仪器六维力传感器出货量翻倍', date: '2025-03', source: 'https://www.sri-instruments.com/' },
            ],
          },
          {
            id: 'tactile-skin',
            name: '触觉反馈',
            shortLabel: '电子皮肤',
            description: '覆盖在机器人表面的柔性传感阵列，模拟人类皮肤对压力、温度、纹理的感知，是精细操作的关键。',
            capabilityCan: [
              '分布式接触点检测',
              '软物体（布料、水果）抓取',
              '触觉与视觉融合感知',
            ],
            capabilityCannot: [
              '大面积全身覆盖成本仍高',
              '抗磨损耐用性不足',
              '触觉数据标准化尚未形成',
            ],
            recentAchievements: [
              { title: 'MIT CSAIL 发布高分辨率触觉手套', date: '2024-06', source: 'https://www.csail.mit.edu/' },
              { title: 'Meta Digit 360 开源触觉传感器', date: '2024-11', source: 'https://digit.ml/' },
            ],
          },
        ],
      },
      {
        id: 'motion',
        name: '运动控制',
        nameEn: 'Motion Control',
        subComponents: [
          {
            id: 'servo-motor',
            name: '伺服电机',
            shortLabel: '伺服电机',
            description: "能够精确控制转动角度、速度和扭矩的电机，是机器人关节的'肌肉'。性能直接决定了机器人运动的精度和响应速度。",
            capabilityCan: [
              '亚毫米级位置控制精度',
              '毫秒级响应速度',
              '一体化关节模组降低集成难度',
            ],
            capabilityCannot: [
              '高扭矩密度与低成本难兼得',
              '长期满载下发热和寿命问题',
              '极端环境（高温、强辐射）可靠性不足',
            ],
            recentAchievements: [
              { title: '绿的谐波谐波减速器+伺服一体关节量产', date: '2024-12', source: 'https://www.leaderdrive.com/' },
              { title: '宇树 H1 使用自研高扭矩关节达成跑步', date: '2024-03', source: 'https://www.unitree.com/' },
            ],
          },
          {
            id: 'joint-control',
            name: '关节控制',
            shortLabel: '关节协调',
            description: '让机器人多个关节协调运动的算法，保证整体动作既稳又准。人形机器人通常需要同时控制 20–40 个关节。',
            capabilityCan: [
              '双足静态/动态平衡',
              '全身动力学模型预测控制',
              '模仿学习快速复现人类动作',
            ],
            capabilityCannot: [
              '未知地面的极限鲁棒性',
              '受冲击后的自恢复',
              '能耗优化仍显著落后于生物',
            ],
            recentAchievements: [
              { title: '波士顿动力全电动 Atlas 发布', date: '2024-04', source: 'https://bostondynamics.com/' },
              { title: '宇树 H1 完成室外越野行走测试', date: '2025-02', source: 'https://www.unitree.com/' },
            ],
          },
          {
            id: 'path-planning',
            name: '路径规划',
            shortLabel: '路径规划',
            description: '计算从起点到目标点的最优移动轨迹，同时避开障碍物。既要考虑几何可行，也要考虑时间、能耗。',
            capabilityCan: [
              '静态环境下快速全局规划',
              '动态避障反应式调整',
              '与 SLAM 结合的在线重规划',
            ],
            capabilityCannot: [
              '人群密集环境下的社交感知规划',
              '长时域多目标任务规划',
              '完全未建图环境下的高速导航',
            ],
            recentAchievements: [
              { title: 'NVIDIA Isaac 发布 cuRobo GPU 加速规划', date: '2024-08', source: 'https://developer.nvidia.com/isaac/' },
              { title: 'Figure 02 工厂场景实时路径规划落地', date: '2025-01', source: 'https://www.figure.ai/' },
            ],
          },
        ],
      },
      {
        id: 'cognition',
        name: '决策智能',
        nameEn: 'Cognition',
        subComponents: [
          {
            id: 'llm-agent',
            name: '大语言模型',
            shortLabel: '大语言模型',
            description: "像 ChatGPT 一样的大模型装进机器人大脑，让机器人能听懂自然语言指令，并把'把桌上的杯子递给我'拆成一系列可执行动作。",
            capabilityCan: [
              '自然语言理解任务指令',
              '高层任务拆解为子步骤',
              '多模态输入（图像+语言）',
            ],
            capabilityCannot: [
              '精确物理数值推理仍不稳定',
              '长时序任务中易遗忘',
              '端侧部署功耗与时延受限',
            ],
            recentAchievements: [
              { title: 'Google RT-2 视觉-语言-动作模型', date: '2023-07', source: 'https://robotics-transformer2.github.io/' },
              { title: 'Figure 02 接入 OpenAI 完成家庭场景 Demo', date: '2024-08', source: 'https://www.figure.ai/' },
            ],
          },
          {
            id: 'reinforcement-learning',
            name: '强化学习',
            shortLabel: '强化学习',
            description: "通过'试错 + 奖励'让机器人自己学会怎么做任务，就像训练小孩骑自行车一样。大量训练在仿真环境中完成，再迁移到真机。",
            capabilityCan: [
              '仿真环境中大规模并行训练',
              'Sim-to-Real 迁移基本可行',
              '步态、抓取等技能自动习得',
            ],
            capabilityCannot: [
              '高样本效率的真实世界学习',
              '安全约束下的探索',
              '奖励函数设计仍高度依赖人工',
            ],
            recentAchievements: [
              { title: 'ETH ANYmal 纯 RL 完成山地徒步', date: '2024-05', source: 'https://rsl.ethz.ch/' },
              { title: 'NVIDIA GR00T 人形机器人基础模型发布', date: '2024-03', source: 'https://developer.nvidia.com/project-gr00t' },
            ],
          },
          {
            id: 'world-model',
            name: '世界模型',
            shortLabel: '世界模型',
            description: "机器人大脑里的'物理小宇宙'，它能预测'如果我这样动，物体会怎样运动'，相当于让机器人在脑子里先排练一遍再执行。",
            capabilityCan: [
              '短时域物理动力学预测',
              '视频生成作为可学习仿真器',
              '作为策略训练的可微环境',
            ],
            capabilityCannot: [
              '长时域精确物理预测',
              '完全替代传统物理引擎',
              '与刚体/软体精确接触建模',
            ],
            recentAchievements: [
              { title: 'Google DeepMind Genie 2 交互式世界模型', date: '2024-12', source: 'https://deepmind.google/discover/blog/genie-2-a-large-scale-foundation-world-model/' },
              { title: 'NVIDIA Cosmos 世界基础模型开放', date: '2025-01', source: 'https://www.nvidia.com/en-us/ai/cosmos/' },
            ],
          },
        ],
      },
    ],
  },
};
