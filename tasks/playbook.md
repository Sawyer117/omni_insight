# Omni 后训练 Playbook(Lead 自用)

> 5 分钟扫完就知道下一步做什么。详细任务卡见 `tasks.md`。
> 论文简写:**[N]** = Nemotron(2604.24954) / **[Q]** = Qwen3.5-Omni(2604.15804) / **[L]** = LongCat-Next(2603.27538)

---

## 🎯 关键决策速查(背下这个表)

| 步骤 | 用什么方法 | 为什么 | 来源 |
|---|---|---|---|
| Stage 0~5 | **SFT**(纯监督微调) | 模态对齐 + 主能力 | [N] 主线 |
| Stage 4 加料 ① | **+ OPD self-distillation**(20% 配对样本混入) | 修 audio-vs-text 答案不一致 | [Q] OPD |
| Stage 1/4/5 加料 ② | **+ Hybrid 2T 蒸馏(KD)** | 35B-A3B 通才 + Vision specialist 两个 teacher 教 student | [Q] Specialist 简化版 |
| RL Stage 1 | **MPO**(= DPO + BCO 混合) | 偏好对齐,纯 DPO 不够稳 | [N] RL S1 |
| RL Stage 2 | **GSPO**(GRPO 兜底) | sequence-level,DPO 已退役 | [N] + [Q] |
| RL Stage 3 | **GSPO**(数据换文本) | **必跑**——修文本回归红线 | [N] RL S5 |

**算法选型一句话总结**:SFT 主体 + 一条 KD 副线 + 三段 RL(MPO → GSPO → GSPO),**不要混 PPO / 不要单跑 DPO / 不要自创**。

---

## 📋 阶段 0:Pre-arrival(T-12 → T,5 流并行)

### 0.1 数据下载(各模态独立)

| 用途 | 数据集 | HF 链接 | 估 token |
|---|---|---|---|
| Vision Pretrain | LLaVA-Pretrain | `liuhaotian/LLaVA-Pretrain` | ~2B |
| Vision Pretrain | ShareGPT4V | `Lin-Chen/ShareGPT4V` | ~2B |
| Vision Pretrain | DenseFusion-1M | `BAAI/DenseFusion-1M` | ~1B |
| Vision SFT | LLaVA-OneVision-Data | `lmms-lab/LLaVA-OneVision-Data` | ~50B |
| Vision SFT | Cambrian-7M(去 GUI 子集) | `nyu-visionx/Cambrian-10M` | ~30B |
| Vision SFT | Cauldron(50 task) | `HuggingFaceM4/the_cauldron` | ~10B |
| Vision SFT | ALLaVA-4V | `FreedomIntelligence/ALLaVA-4V` | ~5B |
| Audio | Granary v1.1 | `nvidia/Granary` | ~15B |
| Audio | AudioCaps + WavCaps | `OpenSound/AudioCaps`, `cvssp/WavCaps` | ~5B |
| Audio | Common Voice 17 | `mozilla-foundation/common_voice_17_0` | ~5B |
| Video 短中 | ShareGPT4Video | `ShareGPT4Video/ShareGPT4Video` | ~5B |
| Video 中长 | LLaVA-Video-178K | `lmms-lab/LLaVA-Video-178K` | ~10B |
| RL 偏好 | RLHF-V + VLFeedback + POVID | `openbmb/RLHF-V-Dataset`, `MMInstruction/VLFeedback`, `YiyangAiLab/POVID` | ~120K 对 |
| 文本同分布 | **找预训练 team 要**(SLA T-10 前签) | — | ~35B |

- [ ] 全部 prefetch 到本地 / OSS(预计 2-4 周完成)
- [ ] 统一 JSON-Lines 格式 + webdataset 分片
- [ ] **预训练 team 文本数据 SLA 必须 T-10 前签**(R3 风险)

### 0.2 Tokenizer 扩展(Phase A 第 1 周)

**做的事**:复用 Qwen3.5-4B-base tokenizer,加 ~15-18 个真正新的 MM token,5 步操作:

```python
# Step 1: 添加 special tokens(去重)
new_tokens = [
    "<|vision_start|>", "<|vision_end|>", "<|image_pad|>",
    "<|audio_start|>", "<|audio_end|>", "<|audio_pad|>",
    "<|video_start|>", "<|video_end|>", "<|frame_pad|>",
    "<|grounding|>", "<|bbox|>",
    "<|ocr_start|>", "<|ocr_end|>",
    # 跳过 <|im_start|>/<|im_end|>/<|tool_call|>(Qwen3.5 已有)
]
tokenizer.add_special_tokens({"additional_special_tokens": new_tokens})

# Step 2: resize embedding(必须 256 倍数)
model.resize_token_embeddings(len(tokenizer), pad_to_multiple_of=256)

# Step 3: 近义 mean 初始化
# <|vision_start|> ← mean(image, img, picture, photo)
# <|audio_start|> ← mean(audio, sound, voice)
# 没近义词的用 σ=0.02 随机

# Step 4: Stage 0 训练时,只解冻 [V-Proj + 25 个新 token embedding 行]

# Step 5: 数据预处理插入 placeholder
# "<|vision_start|>" + N×"<|image_pad|>" + "<|vision_end|>"
```

- [ ] 写 `prepare_tokenizer.py` 脚本
- [ ] 单元测试:已有 token 的 embedding 训练后完全不变

### 0.3 Encoder 选型(T-8 决定)

| 模态 | 候选 1 | 候选 2 | 默认推荐 |
|---|---|---|---|
| Vision | SigLIP-SO400M(`google/siglip-so400m-patch14-384`)| InternViT-300M(`OpenGVLab/InternViT-300M-448px`)| **SigLIP-SO400M** |
| Audio | Whisper-large-v3(`openai/whisper-large-v3`)| Parakeet-TDT-0.6B(`nvidia/parakeet-tdt-0.6b-v2`,Nemotron 用的)| **Whisper-large-v3** |
| Video | 复用 Vision encoder + Conv3D(每 2 帧合 1)+ EVS(q=0.5)| — | 同 Vision |

- [ ] 用 Qwen3.5-4B 各跑一次 sanity 看哪个 encoder 更搭(在 MMMU 上对照)
- [ ] **Phase A 主线选 SigLIP**,InternViT 留作备选(若 SigLIP 在中文 OCR 弱可换)

### 0.4 Framework 代码骨架

- [ ] HF transformers + FSDP2 训练 loop(参考 LLaMA-Factory 但不直接 fork)
- [ ] MoE-aware FSDP wrap(Phase B 实 ckpt 必需)
- [ ] verl 接入 + GRPO 跑通 sanity
- [ ] vLLM 模型类 stub(为实 ckpt 留接口,**Phase A 第 8 周必须开始预留**——R1 风险)
- [ ] 5 个 yaml 模板:`data.yaml / train.yaml / rl.yaml / eval.yaml / deploy.yaml`

### 0.5 评测 harness

- [ ] fork VLMEvalKit
- [ ] 集成 36 项 benchmark(分 8 维:视觉/OCR/数学/Agent/音频/视频/Omni/文本回归)
- [ ] 加幻觉评测(POPE / HallusionBench)— **必跑**
- [ ] WandB 仪表盘 + 每 1B token mini-eval 自动触发

---

## 🚀 阶段 1:Phase A 训练 Demo A(T-4 → T,Qwen3.5-4B-base)

**目标**:在 Qwen3.5-4B-base 上跑通整套流水线,T-2 给客户 α 版试用。

### Stage 0 — Vision Projector Warmup(SFT)

| 项 | 值 | 来源 |
|---|---|---|
| 方法 | **纯 SFT**,只解冻 V-Proj + 25 个新 token | [N] Stage 0 |
| 数据 | LLaVA-Pretrain + ShareGPT4V + DenseFusion(~5B token)| [N] |
| LR | **1e-3** | [N] Table 6 |
| Min LR | 1e-5 |
| Global BS | **128** | |
| Warmup ratio | 0.1 | |
| Weight decay | 0.01 | |
| Optimizer | AdamW(β₁=0.9, β₂=0.999),cosine decay | |
| Precision | bf16 | |

- [ ] 跑通 ~5B token,sanity:简单 prompt "describe this image" 输出合理

### Stage 1 — Vision SFT(SFT,主战场)

| 项 | 值 | 来源 |
|---|---|---|
| 方法 | **纯 SFT**,解冻 LLM + ViT(audio 仍冻)| [N] Stage 1 |
| 数据 | LLaVA-OV + Cambrian-7M(去 GUI)+ Cauldron + ALLaVA + DS-02 CoT(~95B token)| [N] + [N] CoT 合成 |
| LR | **5e-5** | [N] Table 6 |
| Global BS | **256** | |
| Max video frames | 64 | |
| Weight decay | 0.05 | |

**+ 加料**:
- 用 Qwen3-VL / Qwen3.5 / Kimi-K2.5 给难样本生成 CoT(`<think>...</think>`)再混入 SFT 数据 — [N] Stage 1 描述

- [ ] sanity 目标:MMMU ≥ 50, DocVQA ≥ 80, **MMLU-Pro 损 ≤ 1 pt**

### Stage 2 — Audio Projector Warmup(SFT)

| 项 | 值 | 来源 |
|---|---|---|
| 方法 | **纯 SFT**,只解冻 A-Proj | [N] Stage 2 |
| 数据 | Granary v1.1 子集(~5B token)| [N] |
| LR | **1e-3** | [N] Table 6 |
| Global BS | **512** | |

- [ ] LibriSpeech-clean WER ≤ 8(初步对齐)

### Stage 3 — Audio Encoder + Projector(SFT)

| 项 | 值 | 来源 |
|---|---|---|
| 方法 | **纯 SFT**,解冻 Audio Encoder + Proj(LLM/Vision 冻)| [N] Stage 3 |
| 数据 | Granary 全集 + AudioCaps + WavCaps + CV(~20B token,ASR/Sound/Music/Speech 按 22:24:43:10 比例)| [N] |
| LR | **2.5e-5** | [N] Table 6 |
| Global BS | **256** | |

- [ ] OpenASR avg WER ≤ 8, MMAU ≥ 50

### Stage 4 — Omni SFT 16K(SFT + OPD,核心阶段)

| 项 | 值 | 来源 |
|---|---|---|
| 方法 | **SFT 全参数** + **20% OPD 配对样本** + **Cluster Rebalancing** | [N] Stage 4 + [Q] OPD + [L] Rebal |
| 数据 | V+A+T 5:3:2 混采(~30B token)+ OPD 配对(~5B,从 Stage 1 文本 query 转 audio query)| 组合 |
| LR | **1e-5** | [N] Table 6 |
| Global BS | **128** | |

**OPD 怎么做**(self-distillation,不是 KD):
```
对同一 query 准备 (text 版, audio 版) 配对:
  text 输入 → student 跑出 response_text
  audio 输入 → student 跑出 response_audio
  loss = CE(response_audio, stop_grad(response_text))
```
配对样本占 batch 的 20%。

- [ ] DailyOmni ≥ 60, VoiceBench(audio-vs-text 一致性)+1-3 pt vs Stage 3

### Stage 5 — Omni SFT 48K(SFT + EVS 视频压缩)

| 项 | 值 | 来源 |
|---|---|---|
| 方法 | **纯 SFT**,解冻除 audio 外所有(audio 冻防漂移)| [N] Stage 5 |
| 数据 | 中长视频(LLaVA-Video-178K + EgoSchema 短选)+ 长文档(~15B token)| [N] |
| LR | **1e-6** | [N] Table 6 |
| Context | **48K**(扩 3×,需 context_parallel=2)| |
| Max video frames | 256 | |
| 视频压缩 | **EVS q=0.5 + Conv3D(每 2 帧合 1)** | [N] Section 3.x |

- [ ] VideoMME ≥ 60, LongVideoBench ≥ 55, MMLongBench-Doc ≥ 40

### Phase A 收尾(T-2)

- [ ] Demo A α 版 ckpt 出来
- [ ] 公开 benchmark 8 维全跑,生成报告
- [ ] **MMLU-Pro 损 ≤ 1 pt** vs Qwen3.5-4B-base(没达到 → 不要进 Phase B)
- [ ] α 版交付客户先体验

---

## 🚀 阶段 2:Phase B 训练 Demo B(T → T+8,实 ckpt)

### Day 1-3 — ckpt 切换 SOP

- [ ] **Day 1**:拿到 ckpt → vLLM 模型类适配通过
- [ ] **Day 2**:tokenizer case 判定(case 1/2/3,见 v4 Slide 7)
- [ ] **Day 3**:Stage 0 sanity 启动,确保不发散

### Stage 0-5 重跑(只换 LLM 骨干)

- [ ] **同样的 yaml + 同样的数据**,只改 `model_path`,跑 T-01..T-06
- [ ] Token 量从 Phase A 的 ~80B(proxy 验证)扩到 ~170B(实 ckpt 完整训)
- [ ] 每 stage 走完都跑评测对照 Phase A

---

## 🎯 阶段 3:RL 三段(T+8 → T+14,Phase B 后半)

### RL Stage 1 — MPO 偏好优化

**用什么算法**:**MPO = DPO + BCO 混合**(不是单跑 DPO)

| 项 | 值 | 来源 |
|---|---|---|
| 方法 | **MPO**(α=0.5 默认) | [N] RL S1 |
| 数据 | RLHF-V + VLFeedback + POVID(~120K 偏好对)| [N] |
| Global BS | 4096 | [N] |
| Rollouts/prompt | 16 | [N] |

**MPO 公式**:
```
loss_mpo = α × loss_dpo + (1-α) × loss_bco
loss_bco = BCE(reward_clf(chosen), 1) + BCE(reward_clf(rejected), 0)
```

- [ ] POPE 提升 +5 pt, MMLU-Pro 不掉

### RL Stage 2 — Image-RL with verifiers

**用什么算法**:**GSPO**(verl 自实现 ~300 行;**GRPO 兜底**,损 1-2 pt 稳定性)

| 项 | 值 | 来源 |
|---|---|---|
| 方法 | **GSPO**(sequence-level importance ratio)| [N] + Qwen GSPO |
| 数据 | ~50K 视觉推理:chart 28K + STEM 19K + games 12K + VQA 8K + grounding 7K | [N] RL S3 |
| Verifiers | string_match / mathruler / multiple_choice / **gui_coordinate(smooth distance)** | [N] |
| Pass-rate filter | 8 rollouts,**保留 < 0.8 的 prompt**(过简单题不要)| [N] |
| Format reward | `<think>...</think>` + `\boxed{answer}`,partial credit | [N] |
| 拒答样本 | 保留 ~5%(unanswerable / mismatched)训 abstention | [N] |

- [ ] ScreenSpot-Pro ≥ 35, MathVista +3-5 pt, DocVQA/ChartQA +2-3 pt

### RL Stage 3 — Text-RL Stage 2(必跑!)

**用什么算法**:**GSPO,但冻 token embedding**(防表征漂移)

| 项 | 值 | 来源 |
|---|---|---|
| 方法 | **GSPO**(同 R-S2)+ **冻 token embedding** | [N] RL S5 |
| 数据 | 自家文本 SFT 数据(D-06 同分布)+ MMLU-Pro 类知识题(~30K 任务)| [N] |

⚠️ **不可省略**——Stage 4/5 后必有 1-2 pt 文本漂移,这是修复段。

- [ ] **MMLU-Pro 损 ≤ 2 pt vs base(上线门槛)**
- [ ] 多模态指标(MMMU/DocVQA)不降 > 1 pt

---

## 🔬 平行 Ablation(分支跑,不阻塞主线)

### 启动时机:Phase A 末或 Phase B SFT 期间

| Ablation | 启动时机 | 与主线对比 | 来源 |
|---|---|---|---|
| **A1: 完整 5T Specialist Distillation** | Phase A 末(T-2 起训 5 specialist)| MMMU/DocVQA/MathVista/Audio 综合 +0~3 pt vs Hybrid 2T | [Q] Specialist 完整版 |
| **A2: Cluster-based Rebalancing** | Stage 4 期间,data.yaml 切换 on/off 跑两次 | Audio 长尾任务平衡 | [L] Mid-train |
| **A3: Modality-Agnostic MoE 路由** | Stage 4 重训,改 MoE 路由 | DailyOmni / WorldSense + expert 利用率 | [L] Backbone |
| **A4: Random delay audio-text** | Stage 3 数据加载层加 [1, len(text)] delay | Audio 流式 / 截断鲁棒性 | [L] Audio |
| **A5: 中英多语 3.5:3.5:3 配比** | Stage 3 数据采样配比 | 中文 ASR(AISHELL)| [Q] AuT 数据策略 |

**做法统一**:同一份代码,改一行 yaml 配置,跑两次,对比同一个 benchmark。**禁止天马行空改算法**。

---

## ✅ 阶段 4:评测 + 部署(T+14 → T+18)

### 评测全套(用 VLMEvalKit)

| 维度 | Benchmark |
|---|---|
| 视觉综合 | MMMU / MM-Vet / MMStar / SEED-Bench-2 |
| OCR/文档 | OCRBench-V2 / DocVQA / ChartQA / CharXiv |
| 数学 | MathVista / MathVision |
| Agent/GUI | ScreenSpot-Pro / OSWorld-G |
| 音频 | OpenASR(8 子集)/ MMAU / MMAR / VoiceBench |
| 视频 | VideoMME / LongVideoBench / MVBench |
| Omni | DailyOmni / WorldSense / AVUT |
| **文本回归★** | MMLU-Pro / IFBench / AIME25 / LiveCodeBench v6 |
| **幻觉★** | POPE / HallusionBench |

**上线门槛**:文本损 ≤ 2 pt + POPE ≥ 90 + 视觉/视频/音频打平同 size 开源(±2 pt)

### 部署交付

- [ ] vLLM serve template(`vllm serve --config deploy.yaml`)
- [ ] Dockerfile + K8s yaml
- [ ] REST API server(FastAPI)
- [ ] Demo Jupyter notebook(端到端演示)
- [ ] Quickstart + Tutorial 文档

### 客户 onboarding(T+18 起)

1. **W1**:客户读 docs + 跑 demo notebook
2. **W2**:客户准备数据 + 改 yaml 跑 sanity SFT
3. **W3-W6**:客户用自家数据全量 SFT + RL
4. **持续**:每周 2h office hours,3 个月转 best-effort

---

## 🚨 关键风险监控点

| 风险 | 触发信号 | 应对 |
|---|---|---|
| R1: 实 ckpt vLLM 类未就绪 | T-4 stub 没就位 | Phase A 第 8 周起 eng 必须开始 |
| R2: Tokenizer Case 3(完全不同) | T-10 SLA 未签 | 准备 retokenize 脚本 + 数据双备份 |
| R3: 预训练 team 不给 text 同分布 | T-8 仍未到位 | 退化到公开 Nemotron-text(损 ~3 pt 接受) |
| R4: Framework 移交不达标 | 内部 dry-run 不通过 | T+12 起对 2 mock 客户 dry-run |
| R5: B200 集群档期冲突 | T+10 资源未锁 | 退化到 H100,BS 减半 |

**心电图监控**:每 1B token 自动跑 mini-eval,**MMLU-Pro 掉 > 2 pt 立即 alert**。

---

## 📌 我现在该做什么?(决策树)

```
你在哪一步?

├── 还没启动 → 跑去签预训练 team 的文本数据 SLA(R3)+ 启动 5 流并行
│
├── 数据下载中 → 同时启动 Tokenizer 扩展脚本 + Encoder 选型对照
│
├── Phase A 中 → 严格按 Stage 0→1→2→3→4→5 顺序跑,每 stage 通过文本回归测试再下一步
│
├── Phase A 末(T-2)→ Demo A α 版给客户先看 + 启动 Vision specialist 训练(为 Hybrid 2T)
│
├── 实 ckpt 到达(T+0)→ 走 Day 1-3 SOP:vLLM 类 → tokenizer case → Stage 0 sanity
│
├── Phase B SFT 中 → 主线 + Ablation 分支并行
│
├── Phase B SFT 完(T+8)→ 启动 RL 三段:MPO → GSPO Image-RL → GSPO Text-RL S2
│
├── RL 完(T+14)→ 评测全套 + 部署模板 + 文档完善
│
└── T+18 → 交付客户 + onboarding W1
```

---

> 任何方法选择不在本 playbook 出现的,先回查 tasks.md 附录 A 看是否有论文出处;
> 没有出处的,**不要自己加**,先讨论。
