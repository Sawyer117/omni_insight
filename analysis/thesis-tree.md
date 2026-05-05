# Omni 后训练 Thesis Tree (2026.05)

> 基于三篇 reference design 的完整 L0–L5 论证树。每层都做承重工作,可单独被攻击。

## L0 — 可争议判断

到 2026-04,Thinker-Talker 已经从 Qwen2.5-Omni 的特例进化为开放/闭源 SOTA 的共同骨架,真正的分歧不在「是否融合」而在「Talker 怎么做」:

- **Qwen3.5-Omni** 用独立 MoE Talker + 多码本 RVQ + ARIA 拿下 215 个音频/AV 基准 SOTA,文本仅掉 ≤1 个点;
- **LongCat-Next** 用统一 discrete 空间换图像+语音生成,文本掉 5+ 个点;
- **Nemotron 3 Nano Omni** 没做生成只走模块化理解,文本掉 1 个点。

三者的 benchmark 摆在一起得到的实证结论是:**「separate Talker(模块化生成头)」在质量和文本保持上都优于「unified discrete tokenization」**,unified 路径的卖点正在收窄。

**可争议性**:LongCat 的支持者会说统一空间的 long-term scaling 更优;Qwen 派会说当下数据已证明分离更优。2026 H2 是这个争议见分晓的窗口。

## L1 — 必要前提(三条 load-bearing)

### (A) Thinker-Talker 已是事实标准
三篇里两篇(Qwen3.5,Nemotron 的 reasoning 头)显式或隐式采用,LongCat 也有「text-then-audio」的 serial 模式作为退化版。
**否定 (A)** → 若 2026 H2 出现明显胜出的「单流统一」reference,L0 须改写。

### (B) 多阶段 RL + 蒸馏 stack 是真正的杠杆
Qwen3.5 Thinker 用了 Specialist Distillation → On-Policy Distillation → Interaction-Aligned RL 三段;Talker 单独再加 4 段(含 DPO + GSPO)。Nemotron 是 5 阶段 RL。这两套配方的复杂度已经无法用 SFT-only 复现。
**否定 (B)** → 若有团队公开证明纯 SFT 配方复现 Nemotron 在 ScreenSpot-Pro / OSWorld 的成绩,「RL 是杠杆」破产。

### (C) Audio 数据规模已成 omni 的隐藏门槛
Qwen3.5 用了 40M 小时音频训练自研 AuT encoder,且预训练 4T token 中 audio 占 1.99T(50%),远超 image + video + text 的总和。
**否定 (C)** → 若有团队用 <1M 小时音频复现 Qwen3.5 的 ASR/TTS,音频规模门槛论破产。

## L2 — 证据轴

1. **架构轴**:encoder 选型、projector vs RVQ-tokenization、MoE 路由、融合点、token reduction、**Talker 设计子轴**
2. **训练阶段轴**:projector warmup → vision SFT → audio warmup → audio SFT → omni SFT → 长上下文扩展 → 多阶段 RL
3. **数据轴**:466.9B token SFT 配比(Nemotron)+ 2T token 统一语料(LongCat)+ 4T token 含 50% audio(Qwen3.5)
4. **评测轴**:omni 端到端(DailyOmni / WorldSense)+ agentic(OSWorld / Tau2)+ 文本回归测试(必备)

### Talker 设计子轴对比

| 模型 | Talker 形态 | 码本 | Vocoder | 流式延迟 |
|---|---|---|---|---|
| Qwen3.5-Omni | 独立 MoE + MTP 残差头 | 多码本 RVQ | Code2Wav(因果 ConvNet) | TTFC 54–56 ms / TTFP 235–435 ms |
| Qwen2.5-Omni / Qwen3-Omni | 独立但 dense | 单码本 RVQ | dense convnet | 较高 |
| LongCat-Next | 统一 token 空间(无独立 Talker) | 8 层 RVQ @ 12.5 Hz | mel + flow-matching + HiFi-GAN | 未公开 |
| Nemotron 3 Nano Omni | 不做语音生成 | – | – | – |

## L3 — 关键 finding

### 3.1 Nemotron 3 Nano Omni 真实 pipeline

**架构**:C-RADIOv4-H(视觉)+ Parakeet-TDT-0.6B-v2(音频)+ Nemotron 3 Nano 30B-A3B MoE backbone + 两个独立 MLP projector

**SFT 阶段**(总计 466.9B token):

| Stage | Context | 数据规模 | 解冻部分 | 关键作用 |
|---|---|---|---|---|
| 0 Vision Projector Warmup | 16K | 9.35M / 15.5B | 仅 vision projector | 模态对齐 |
| 1 Vision SFT | 16K | 86.3M / 214.8B | LLM + vision encoder | 视觉主能力 |
| 2 Audio Projector Warmup | 16K | 59.2M / 11.4B | 仅 audio projector | 音频对齐 |
| 3 Audio Encoder & Projector | 16K | 242.0M / 100.5B | audio encoder + projector | 音频主能力 |
| 4 Omni SFT 16K | 16K | 30.5M / 57.3B | 全参数 | 联合训练 |
| 5 Omni SFT 48K | 48K | 6.08M / 33.5B | 全参数 | 中长上下文 |
| 6 Omni SFT 256K | 256K | 623K / 34.0B | 冻结 audio | 长文档 |

**RL 阶段**(5 阶段):
1. **MPO**(Mixed Preference Optimization)= DPO + BCO 混合
2. **Text-RL Stage 1**:多环境 RLVR/RLHF,冻结 token embedding 防漂移
3. **Image-RL**:74K 视觉推理任务,GSPO 算法
4. **Omni-RL**:120K prompts,113 子集,verifier 含 ASR(reward = 1 - WER)
5. **Text-RL Stage 2**:专门修文本回归

**算法**:Group Sequence Policy Optimization (GSPO),不是 DPO/PPO/GRPO。

### 3.2 LongCat-Next 真实 pipeline

**架构**:LongCat-Flash-Lite A3B(68.5B / 3B 活跃)+ DiNA 统一离散空间

**dNaViT 视觉 tokenizer**:
- SAE(QwenViT/MoonViT/AIMv2 改)做 pre-quantization 表示
- 8 级 cascaded RVQ codebook,每级 16,384,EMA 更新
- 任意分辨率,最高 28× 压缩

**音频 tokenizer**:Whisper encoder + 4× 下采样 + 8 层 RVQ @ 12.5 Hz

**关键意外发现**:论文报告「即使随机初始化的 ViT-Base 也表现出强重建能力」,归因于残差路径保留细粒度信号。这对 tokenizer 设计的下界有直接意义。

### 3.3 Qwen3.5-Omni 引入的 4 个关键概念

#### (1) AuT — Audio Transformer encoder from scratch
- 40M 小时监督音对训练
- 4 层 Conv2D 下采样(16×),输出 6.25 Hz token rate
- 训练比例:中:英:其他多语 = 3.5:3.5:3,覆盖 20+ 语言

#### (2) ARIA — Adaptive Rate Interleave Alignment
- 解决 Qwen3-Omni 双轨生成的「漏字、错音、数字念错」问题
- **单通道单调交错**约束:任意 prefix 的「speech token / text token 累计比」不得超过样本全局比
- 是对自家 TMRoPE 的显式否定

#### (3) On-Policy Distillation (OPD)
- 同 query 的「音频版本」和「文本版本」配对
- **用文本 query 的 response 做音频 query 的蒸馏目标**
- 修补「问同问题文字答对、语音答错」的痛点

#### (4) Specialist Distillation
- 先从 base 各自 SFT/RL 出多个领域专家(text-agentic / coding / reasoning / vision / audio)
- 再蒸馏进**一个统一 Thinker**

### 3.4 三篇贯穿的 5 个意外发现

1. **GSPO 三连发** — 三篇全部用 GSPO 或其变体,DPO 在 omni 时代被淘汰已成事实
2. **Audio 在 omni pretraining 中是数据大头** — Qwen3.5 预训练 4T token 中 audio 占 50%
3. **独立 Talker 的文本保持显著优于统一 token** — Qwen3.5 仅 0.9 点 vs LongCat 5.3 点
4. **40M 小时是新的音频规模门槛** — 开源 Whisper-v3 仅 ~5M 小时,差 8×
5. **Specialist-then-distill 取代「一锅端」训练** — 三篇都按模态/领域分段再合并

### 3.5 文本回归代价对比

| 模型 | 文本基准 | omni | text-only base | Δ |
|---|---|---|---|---|
| Qwen3.5-Omni-Plus | MMLU-Pro | 85.9 | 86.8 | -0.9 |
| Qwen3.5-Omni-Plus | MMLU-Redux | 94.2 | 94.3 | -0.1 |
| Nemotron 3 Nano Omni | MMLU-Pro | 77.3 | 78.3 | -1.0 |
| Nemotron 3 Nano Omni | AIME25 | 82.1 | 89.1 | -7.0 |
| LongCat-Next | MMLU | 83.95 | 89.28 | -5.33 |
| LongCat-Next | MMLU-Pro | 77.02 | 82.93 | -5.91 |
| LongCat-Next | C-Eval | 86.80 | 90.91 | -4.11 |

## L4 — 推论性预测(2026 H2 内可观测)

1. **GSPO 成为 omni RL 默认算法** — 已被三篇验证,任何不报 GSPO baseline 的 omni 论文会被质疑
2. **ARIA 风格的单通道交错约束扩散到开源** — 至少 2 个开源 omni 会从 dual-channel 改为 ARIA-style
3. **Specialist Distillation 成为新 SFT 范式** — 至少一个开源项目会公开复刻
4. **AuT-class audio encoder 在开源出现** — 大概率由 Meta、阿里达摩院或 Mistral 训出 ~10M 小时音频开源 audio encoder
5. **统一 discrete vs 分离 Talker 的争议在 H2 决出胜负** — 关键观测:LongCat-Next-V2 若不能在 MMLU 上把差距拉到 ≤2 个点,该路径会被视为 niche
6. **Audio-Visual Vibe Coding 类 emergent 能力催生新 benchmark**

## L5 — 证伪条件

1. **若开源 native discrete omni 文本损 <1 点 + 同时拿下生成 SOTA**,L0 中「分离优于统一」破产
2. **若有团队用 <5M 小时音频复现 Qwen3.5 的 ASR**(LibriSpeech-clean WER < 1.5),L1(C) 中「40M 小时门槛」破产
3. **若 GPT-5 / Gemini-3.5 公开任何架构细节并显示采用 unified discrete**,Thinker-Talker 共识动摇
4. **若有 SFT-only(无 GSPO/MPO)配方在 MMMU + DailyOmni 同时达到 Qwen3.5 水平**,L1(B) 的 RL 杠杆论破产

## 实操路径建议

| 你的目标 | 推荐路径 | 直接复用对象 |
|---|---|---|
| 开源 + 理解-only | Nemotron 路径 + Qwen3.5 的 OPD 蒸馏 trick | Megatron-Bridge + NeMo-RL + 用 OPD 配方做 SFT |
| 开源 + 想加 speech-out | Nemotron 路径 + 自建 Talker(Qwen3.5 设计:多码本 RVQ + MTP + ARIA) | Nemotron base + 自实现 ARIA 单通道交错 + Code2Wav 风格 vocoder |
| 开源 + 要图像生成 | LongCat 路径 | LongCat-Next + dNaViT |
| 闭源产品(API 集成) | 直接调 Qwen3.5-Omni-Plus/Flash 或 Nemotron Omni | 无需训练 |
| 算力极限(单机/小集群) | Nemotron NVFP4(20.9GB)+ 仅 Stage 0/1 + MPO | 跳过 Stage 5/6 长上下文,跳过 audio,只做 vision-omni |

## 三篇贯穿的不变量

1. **MoE A3B(3B 活跃)是 omni 默认骨干** — 三篇全是 MoE。如果你的 base 是 dense,先考虑 upcycle
2. **多阶段渐进比一锅端有效** — 三篇都不是 joint training,都是 modality-by-modality 加
3. **GSPO + 模态分段 RL** 是 SOTA 的 RL 配方,DPO 单独跑已经不够
4. **文本回归测试是 omni 训练的「心电图」** — 任何阶段都不能让 MMLU-Pro 掉超过 2 个点

## Sources

- Nemotron 3 Nano Omni Tech Report — [arxiv 2604.24954](https://arxiv.org/abs/2604.24954) (NVIDIA, 2026.04)
- LongCat-Next — [arxiv 2603.27538](https://arxiv.org/abs/2603.27538) (Meituan, 2026.03)
- Qwen3.5-Omni Tech Report — [arxiv 2604.15804](https://arxiv.org/abs/2604.15804) (Alibaba, 2026.04)
