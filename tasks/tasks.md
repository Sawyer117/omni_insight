# Omni 后训练任务清单 v1.0

> **给工程师的细节级任务拆解**。所有任务对齐 Nemotron 3 Nano Omni / LongCat-Next /
> Qwen3.5-Omni 三篇论文。优先复用 / 复现已发表方法,可组合,**禁止天马行空自创**。
>
> 不含人员分配 / 时间估计——这些由 lead 在分发时再加。

---

## 文档说明

每个任务卡包含:
- **来源**:具体到 paper / section / table / 算法名
- **类型**:`复用`(直接 import)/ `复现`(按 paper 描述实现)/ `组合`(多 paper 拼)
- **前置**:依赖的其它任务 ID
- **输出**:具体可交付物(代码 / 配置 / 数据 / 模型)
- **关键参数**:抄自论文的具体数字
- **验收**:可机械验证的完成标准
- **注意**:常见坑

任务编号:`<模块>-<序号>`

---

## 论文引用速查

| 引用标记 | 论文 | arxiv | 主要贡献 |
|---|---|---|---|
| **[Nemotron]** | Nemotron 3 Nano Omni Tech Report | 2604.24954 (2026.04) | 7 阶段 SFT + 5 段 RL,GSPO + MPO,EVS + Conv3D 视频压缩,完整开源 |
| **[Qwen3.5]** | Qwen3.5-Omni Tech Report | 2604.15804 (2026.04) | Specialist Distillation,OPD,Hybrid-Attn MoE,ARIA(我方不用) |
| **[LongCat]** | LongCat-Next | 2603.27538 (2026.03) | DiNA(我方不用)、Cluster Rebalancing、Modality-Agnostic MoE、Random delay |

---

## 任务索引

| ID | 任务 | 模块 | 主要来源 | 类型 |
|---|---|---|---|---|
| D-01 | Vision Pretrain 数据下载 | 数据 | [Nemotron] Stage 0 | 复用 |
| D-02 | Vision SFT 数据下载 | 数据 | [Nemotron] Stage 1 | 复用 |
| D-03 | Audio 数据下载 | 数据 | [Nemotron] Stage 2/3 | 复用 |
| D-04 | Video 数据下载 | 数据 | [Nemotron] Stage 4/5 | 复用 |
| D-05 | RL 偏好数据下载 | 数据 | [Nemotron] RL | 复用 |
| D-06 | 文本同分布数据获取(SLA) | 数据 | [Nemotron] Text-RL S2 | 复现 |
| DS-01 | OPD audio-text 配对生成 | 数据合成 | [Qwen3.5] Thinker Stage 2 | 复现 |
| DS-02 | Vision SFT CoT 数据合成 | 数据合成 | [Nemotron] Stage 1 | 复现 |
| DS-03 | Cluster-based Rebalancing 实现 | 数据合成 | [LongCat] mid-training | 复现 |
| F-01 | HF transformers + FSDP2 训练 loop | Framework | 工程基建 | 自建(标准做法)|
| F-02 | MoE-aware FSDP wrap policy | Framework | 工程基建 | 自建 |
| F-03 | Encoder hot-swap 接口 | Framework | 工程基建 | 自建 |
| F-04 | 5 yaml 配置模板 | Framework | 工程基建 | 自建 |
| F-05 | webdataset 数据加载器 | Framework | 工程基建 | 复用 |
| F-06 | vLLM 模型类 stub(为实 ckpt) | Framework | 工程基建 | 自建 |
| I-01 | Tokenizer 25 MM token 扩展 | 基础设施 | Qwen2-VL/3-Omni 标准 | 复现 |
| I-02 | Vision projector(MLP)实现 | 基础设施 | [Nemotron] | 复用 |
| I-03 | Audio projector(MLP)实现 | 基础设施 | [Nemotron] | 复用 |
| I-04 | EVS + Conv3D 视频压缩 | 基础设施 | [Nemotron] Section 3.x | 复现 |
| I-05 | Context parallel 实现 | 基础设施 | [Nemotron] Stage 5 | 复用(PyTorch 已有)|
| T-00 | Phase A 全栈跑通(Demo A) | 训练 | 多任务串联 | 元任务 |
| T-01 | Stage 0 Vision Projector Warmup | 训练 | [Nemotron] Stage 0 | 复用 |
| T-02 | Stage 1 Vision SFT | 训练 | [Nemotron] Stage 1 | 复用 |
| T-03 | Stage 2 Audio Projector Warmup | 训练 | [Nemotron] Stage 2 | 复用 |
| T-04 | Stage 3 Audio Encoder + Projector | 训练 | [Nemotron] Stage 3 | 复用 |
| T-05 | Stage 4 Omni SFT 16K(含 OPD)| 训练 | [Nemotron] Stage 4 + [Qwen3.5] OPD | 组合 |
| T-06 | Stage 5 Omni SFT 48K(含 EVS)| 训练 | [Nemotron] Stage 5 | 复用 |
| T-99 | Phase B 全栈跑通(Demo B) | 训练 | 多任务串联 | 元任务 |
| R-01 | verl 接入 + GRPO 跑通 | RL | verl 文档 | 复用 |
| R-02 | GSPO 算法实现(基于 GRPO) | RL | [Nemotron] + Qwen GSPO | 复现 |
| R-03 | MPO 偏好优化(DPO + BCO)| RL | [Nemotron] RL Stage 1 | 复现 |
| R-04 | Image-RL with verifiers | RL | [Nemotron] RL Stage 3 | 复现 |
| R-05 | Text-RL Stage 2(必跑) | RL | [Nemotron] RL Stage 5 | 复现 |
| S-01 | 35B-A3B 通才 teacher label 生成 | Specialist | [Qwen3.5] Specialist 变体 | 组合 |
| S-02 | Vision specialist 训练 | Specialist | [Qwen3.5] Specialist Stage 1 | 复现 |
| S-03 | 蒸馏 SFT pipeline | Specialist | [Qwen3.5] Specialist Stage 1 | 复现 |
| E-01 | VLMEvalKit fork + 自定义接口 | 评测 | 开源 | 复用 |
| E-02 | 视觉 / OCR / 文档评测集成 | 评测 | [Nemotron] Section 4.1 | 复用 |
| E-03 | 音频评测集成 | 评测 | [Nemotron] Section 4.2 | 复用 |
| E-04 | 视频 + Omni 端到端评测集成 | 评测 | [Nemotron] Section 4.1/4.3 | 复用 |
| E-05 | 文本回归评测套件 | 评测 | [Nemotron] Section 4.4 | 复用 |
| E-06 | 幻觉评测(POPE / HallusionBench) | 评测 | 开源(必跑) | 复用 |
| E-07 | 自动化 mini-eval + 仪表盘 | 评测 | 工程 | 自建 |
| O-01 | vLLM serve template | 部署 | 工程 | 复用 |
| O-02 | REST API + Docker + K8s | 部署 | 工程 | 自建 |
| O-03 | Demo Jupyter notebook + Tutorial | 部署 | 工程 | 自建 |
| A-01 | P2: 完整 5T Specialist Distillation | 消融 | [Qwen3.5] 完整版 | 组合 |
| A-02 | P2: Cluster-based Rebalancing | 消融 | [LongCat] | 复现 |
| A-03 | P2: Modality-Agnostic MoE 路由 | 消融 | [LongCat] | 复现 |
| A-04 | P3: Random delay audio-text | 消融 | [LongCat] | 复现 |
| A-05 | P3: 中英多语 3.5:3.5:3 配比 | 消融 | [Qwen3.5] AuT 数据策略 | 复现 |

---

# 模块 D — 数据准备

## D-01: Vision Pretrain 数据下载

**来源**:[Nemotron] Stage 0 数据组成
**类型**:复用
**前置**:无
**输出**:`data/vision_pretrain/` 下的 webdataset 分片

### 任务详细

下载以下数据集到本地存储:

| 数据集 | HuggingFace ID | 样本数(估)| 用途 |
|---|---|---|---|
| LLaVA-Pretrain | `liuhaotian/LLaVA-Pretrain` | 558K | 图文对齐基础 |
| ShareGPT4V | `Lin-Chen/ShareGPT4V` | 1.2M | 高质量长描述 |
| DenseFusion-1M | `BAAI/DenseFusion-1M` | 1M | 复杂场景描述 |

统一转成 JSON-Lines:

```json
{"image": "path/to/img.jpg",
 "conversations": [
   {"from": "human", "value": "What is in this image?"},
   {"from": "gpt", "value": "..."}
 ]}
```

### 验收

- [ ] 总样本数 ≥ 2.5M(扣损坏图片)
- [ ] `python tools/data_sanity.py --config data/vision_pretrain.yaml` 通过
- [ ] 可被 `data.yaml` 中 `vision_pretrain` 配置项加载

### 注意

- ShareGPT4V 的 1.2M 已包含一些 LLaVA-Pretrain 子集,要去重
- 图片完整性校验用 PIL 试开,损坏过滤掉

---

## D-02: Vision SFT 数据下载

**来源**:[Nemotron] Stage 1 数据组成
**类型**:复用
**前置**:无
**输出**:`data/vision_sft/` webdataset 分片,~95B token 池

### 任务详细

| 数据集 | HuggingFace ID | 样本数 | 用途 |
|---|---|---|---|
| LLaVA-OneVision-Data | `lmms-lab/LLaVA-OneVision-Data` | 4M+ | 视觉指令主体 |
| Cambrian-7M | `nyu-visionx/Cambrian-10M`(用 7M 子集) | 7M | 通用 VQA |
| Cauldron | `HuggingFaceM4/the_cauldron` | 50 个 task 合集 | 多任务 |
| ALLaVA-4V | `FreedomIntelligence/ALLaVA-4V` | 1.4M | 高质量描述 |

**裁剪原则**(按 v4 任务定位):
- ❌ **不下载** Cambrian 中明显的 GUI/agent / coding / 数学奥赛 子集(我方框架场景不强相关,客户自加)
- ✅ 保留 OCR / 文档 / 图表 / 通用 VQA / 物体识别 / 场景理解

### 关键参考

[Nemotron] Stage 1 的数据合成补充:用 **Qwen3-VL / Qwen3.5 / Kimi-K2.5** 给部分子集生成 CoT 推理轨迹(详见 DS-02)。

### 验收

- [ ] 总 token 量(用 Qwen3.5-4B tokenizer 跑过)≈ 90-110B
- [ ] 数据格式统一为 JSON-Lines + 图片路径
- [ ] sanity check 通过

---

## D-03: Audio 数据下载

**来源**:[Nemotron] Stage 2/3 数据组成
**类型**:复用
**前置**:无
**输出**:`data/audio/` webdataset,~25B token

### 任务详细

| 数据集 | HuggingFace ID / Source | 用途 | 时长(估)|
|---|---|---|---|
| Granary v1.1 ASR | `nvidia/Granary` | ASR 主体 | 59M 样本 |
| AudioCaps | `OpenSound/AudioCaps` | 音频描述 | 50K |
| WavCaps | `cvssp/WavCaps` | 音频描述 | 400K |
| Common Voice | `mozilla-foundation/common_voice_17_0` | 多语 ASR | varies |

### 任务说明

[Nemotron] Stage 3 的数据组成:
- ASR: 113.8M 样本(22.7% tokens, 22.8B)
- Sound understanding: 61.0M(24.4% tokens, 24.5B)
- Music understanding: 19.8M(43.3% tokens, 43.5B)
- Speech understanding: 47.5M(9.6% tokens, 9.6B)

**我方按 0.22 缩放系数减量**(见 [Slide 8 SFT 配方]),Stage 3 目标 ~25B。

### 验收

- [ ] 各子任务样本量比例 ≈ Nemotron 比例(±10%)
- [ ] 音频统一重采样到 16 kHz mono
- [ ] log-mel 预处理 pipeline 跑通

---

## D-04: Video 数据下载

**来源**:[Nemotron] Stage 4/5 视频数据组成
**类型**:复用
**前置**:无
**输出**:`data/video/` 分片

### 任务详细

| 数据集 | 来源 | 用途 | 视频长度 |
|---|---|---|---|
| ShareGPT4Video | `ShareGPT4Video/ShareGPT4Video` | 短视频描述 | < 60s |
| LLaVA-Video-178K | `lmms-lab/LLaVA-Video-178K` | 视频指令 | 0.5-3 min |
| EgoSchema | `lmms-lab/egoschema` | 长视频问答(选采)| 3 min |
| LongVideoBench dist. | 公开 split | 长视频分布(测训用) | varies |

**抽帧策略**:
- 短视频(<60s):1 fps
- 中视频(1-3 min):0.5 fps
- 应用 EVS 压缩(详见 I-04)

### 验收

- [ ] 总样本数 ≥ 1M(中短视频为主)
- [ ] 抽帧后总 token ≈ 15B(在 EVS+Conv3D 压缩后)
- [ ] 单 batch 数据加载 latency < 5s(本地存储)

---

## D-05: RL 偏好数据下载

**来源**:[Nemotron] RL Stage 1 (MPO) + Stage 3 (Image-RL)
**类型**:复用
**前置**:无
**输出**:`data/rl_preference/` 偏好对集合

### 任务详细

| 数据集 | HuggingFace ID | 样本数 | 用途 |
|---|---|---|---|
| RLHF-V | `openbmb/RLHF-V-Dataset` | 5.7K | 视觉 RLHF 偏好 |
| VLFeedback | `MMInstruction/VLFeedback` | 80K | 大规模 VLM 偏好 |
| POVID | `YiyangAiLab/POVID` | ~17K | 反幻觉偏好 |

合计 ~120K 偏好对。每条格式:

```json
{"image": "...", "prompt": "...",
 "chosen": "...", "rejected": "...",
 "reason": "..." }
```

### 验收

- [ ] 总偏好对数 ≥ 100K
- [ ] 数据格式被 verl DPO loader 接受

---

## D-06: 文本同分布数据获取(Cross-team SLA)

**来源**:[Nemotron] Text-RL Stage 2 — 文本回归修复段
**类型**:复现(数据来源不同)
**前置**:无
**输出**:~35B token 文本数据,与预训练 ckpt 同分布

### 任务详细

[Nemotron] 用自家 Nemotron 3 Nano SFT 数据做 Text-RL S2;我方需要从**预训练 team** 拿到**同分布**文本 SFT 数据用于:

1. **Stage 0/1/4/5 的 text 混采**(防漂移),~35B token
2. **Text-RL Stage 2** 修复段,~5B token

如果预训练 team **不能提供**(R3 风险),fallback:
- 使用 OpenHermes / Tulu / Nemotron-Text 公开数据(差异损 ~3 pt MMLU,可接受)

### 验收

- [ ] 拿到 ≥ 30B token 同分布数据,**或**确认走 fallback 方案
- [ ] 数据 tokenize 后存盘

### 注意

**T-12 周必须签 SLA**——这是 R3 风险的核心 mitigation。

---

# 模块 D-Synth — 数据合成与处理

## DS-01: OPD audio-text 配对生成

**来源**:[Qwen3.5] **Section 4.4 Thinker post-training Stage 2 (On-Policy Distillation)**
**类型**:复现
**前置**:D-03 (Audio 数据)
**输出**:~5B token 的 audio-text 配对样本

### 算法说明(直接抄自 [Qwen3.5])

> **OPD**: 对同一 query 准备文本版本和音频版本。文本版本 query 输入 student,得到 response_text;音频版本 query 输入 student,得到 response_audio。**用 stop-gradient 后的 response_text 监督 response_audio**。

```python
# 伪代码 (引自 Qwen3.5 Section 4.4)
for batch in dataloader:
    query_text = batch["text_query"]
    query_audio = batch["audio_query"]   # 同 query 的音频版本
    
    # student 跑两遍(共享参数)
    response_text = student.generate(query_text)
    response_audio = student.generate(query_audio)
    
    # 用 text response 监督 audio response
    loss = cross_entropy(
        response_audio,
        stop_grad(response_text)
    )
```

### 数据合成步骤

1. 从已有 SFT 数据池里选**纯文本 query**样本(如 MMLU 题目、知识问答)
2. 用 **TTS**(可用开源 CosyVoice / XTTS-v2)把 text query 转成 audio query
3. 校验:audio query 时长 ≤ 30s(避免训练时溢出)
4. 输出格式:

```json
{"text_query": "What is the capital of France?",
 "audio_query": "path/to/audio.wav",
 "expected_response": "Paris"}
```

### 关键参数

- 配对样本占 Stage 4 batch 的 **20%**(其余 80% 是常规多模态 SFT 样本)
- TTS 选 1 voice 即可,不需要多 voice(只为 robustness)

### 验收

- [ ] 配对样本数 ≥ 500K(对应 ~5B token)
- [ ] 可在 Stage 4 训练中按 20% 采样混入
- [ ] OPD loss 实现并通过单元测试

---

## DS-02: Vision SFT CoT 数据合成

**来源**:[Nemotron] **Stage 1 数据描述** —「leveraging models from the Qwen3-VL, Qwen3.5, and Kimi-K2.5 families」
**类型**:复现
**前置**:D-02
**输出**:~5B token 带推理过程的 CoT SFT 数据

### 任务详细

[Nemotron] Stage 1 用现成的强多模态模型给 vision 数据**重新标注**带 CoT 的 response。我方复现这个流程:

1. 从 D-02 池里选难样本(MathVista/CharXiv 类需要推理的)
2. 用 **Qwen3-VL** 或 **Qwen2.5-VL-72B** 类模型生成带 `<think>...</think>` 的 response
3. 简单 verifier 过滤:答案数字 / 关键词与 ground truth 一致才保留

### 关键参数

- 目标 ~5B token CoT 样本
- 思考块长度限制:`<think>` 内 ≤ 512 token,避免过长

### 验收

- [ ] CoT 样本数 ≥ 200K
- [ ] 有效率(verifier 通过率)≥ 70%

---

## DS-03: Cluster-based Rebalancing 实现

**来源**:[LongCat] **Stage II Mid-training: Cluster-based Rebalancing**
**类型**:复现
**前置**:D-02, D-03, D-04
**输出**:rebalanced 数据采样器代码 + 配置

### 算法说明(引自 [LongCat])

> 对多模态数据按语义 cluster 后,**计算每个 cluster 的样本量**,**对欠采样 cluster 上采样**,目标是让 LLM 在多模态分布上更平衡。

### 实现步骤

1. 对所有 SFT 数据(D-02/03/04 合集)用 SigLIP/Whisper 跑 embedding
2. KMeans 聚 K=128 个 cluster(可调)
3. 统计每个 cluster 的样本量,得到分布 `cluster_dist`
4. 上采样小 cluster:`weight[c] = max(1, median_size / cluster_dist[c])`
5. 在 SFT 数据采样器中按 `weight` 重采样

### 关键参数

- K = 128(可调到 64 或 256 做消融)
- 上采样 cap:max weight = 5×(避免极端长尾)

### 验收

- [ ] Rebalancing 前后的 cluster 分布在 Stage 4 中拉平到 ±20%
- [ ] 集成到 data.yaml 的 sampler 配置开关
- [ ] **A-02 消融实验在此基础上做**(开关此功能跑两次)

---

# 模块 F — Framework 代码

## F-01: HF transformers + FSDP2 训练 loop

**来源**:工程基建(参考 LLaMA-Factory / Axolotl 但不直接 fork)
**类型**:自建(标准做法)
**前置**:无
**输出**:`framework/training/trainer.py` 训练主循环

### 任务详细

最小可用训练 loop 需要支持:
- HF transformers 模型加载(任意 LM + 多模态 head)
- FSDP2 wrapping(支持 transformer block + MoE expert wrap)
- gradient accumulation
- mixed precision (bf16)
- gradient checkpointing(可配)
- learning rate schedule (cosine warmup + cosine decay)
- AdamW optimizer(β₁=0.9, β₂=0.999,**抄自 [Nemotron] Section 3.x**)
- WandB logging
- save / resume

```python
# 参考接口
class OmniTrainer:
    def __init__(self, config: TrainConfig): ...
    def train(self, train_loader, val_loader): ...
    def save_ckpt(self, step: int): ...
    def load_ckpt(self, path: str): ...
```

### 验收

- [ ] 在 Qwen3.5-4B-base 上能跑通 1B token 不发散
- [ ] FSDP2 wrap policy 单元测试通过(单卡内 sharding 正确)
- [ ] 可接入 train.yaml 配置

---

## F-02: MoE-aware FSDP wrap policy

**来源**:工程基建(为 Phase B 实 ckpt 准备)
**类型**:自建
**前置**:F-01
**输出**:`framework/training/fsdp_wrap.py` MoE-aware wrap policy

### 任务详细

10B-A2B MoE 在 FSDP2 下的最佳 wrap 策略:
- 每个 expert 单独 wrap(否则一个 layer 的所有 expert 都 gather,显存爆)
- attention block 整体 wrap
- router gate 不 wrap(参数小)

```python
def moe_wrap_policy(module, recurse, **kwargs):
    if isinstance(module, MoEExpert):
        return True
    if isinstance(module, AttentionBlock):
        return True
    return False

fsdp_model = FSDP(
    model,
    auto_wrap_policy=functools.partial(
        transformer_auto_wrap_policy,
        transformer_layer_cls={MoEExpert, AttentionBlock},
    ),
    ...
)
```

### 验收

- [ ] 10B-A2B 在 8×H100 上 FSDP2 加载,显存 < 70GB / GPU
- [ ] 训练步骤 throughput 达 baseline(对照纯 dense 同 active params)

### 注意

**Phase A 用 Qwen3.5-4B(dense)不需要这条**,但 Phase B 必须 ready。

---

## F-03: Encoder hot-swap 接口

**来源**:工程基建(为多客户灵活性)
**类型**:自建
**前置**:F-01
**输出**:`framework/encoders/` 目录,统一 encoder 接口

### 任务详细

定义统一 encoder 接口,支持 plug-and-play:

```python
class BaseEncoder(nn.Module):
    """所有 encoder 实现这个接口"""
    @abstractmethod
    def encode(self, inputs) -> Tensor:
        """返回 (batch, num_tokens, hidden_dim)"""
    
    @property
    @abstractmethod
    def output_dim(self) -> int: ...
```

实现至少 4 个具体 encoder:
- `SigLIPEncoder`(SigLIP-SO400M)
- `InternViTEncoder`(InternViT-300M)
- `WhisperEncoder`(Whisper-large-v3)
- `ParakeetEncoder`(Parakeet-TDT-0.6B,备选,见 [Nemotron])

`data.yaml` 中通过 `encoder_class: SigLIPEncoder` 切换。

### 验收

- [ ] 4 种 encoder 都能 inference,输出 shape 正确
- [ ] 切换 encoder 不需要改训练代码

---

## F-04: 5 yaml 配置模板

**来源**:工程基建(framework 可移交性核心)
**类型**:自建
**前置**:F-01, F-02, F-03
**输出**:`configs/` 目录下 5 个 yaml 模板

### 任务详细

| 文件 | 用途 | 关键字段 |
|---|---|---|
| `data.yaml` | 数据 | datasets, sampling weights, encoders, tokenizer config |
| `train.yaml` | SFT 训练 | stage, lr, bs, max_steps, fsdp config, ckpt save |
| `rl.yaml` | RL 训练 | algorithm (GRPO/GSPO), reward_fn, rollout_config |
| `eval.yaml` | 评测 | benchmarks, custom tasks, output dir |
| `deploy.yaml` | 部署 | vllm config, port, max_concurrent |

每个 yaml 给 **3 套预设**:
- `*.minimal.yaml`: 单卡 quickstart
- `*.standard.yaml`: 16-32 H100 标配
- `*.production.yaml`: 客户线上推荐

### 验收

- [ ] 客户改 yaml 切换数据 / 算力 / encoder 不需改代码
- [ ] 文档说明每个字段的含义和合法值

---

## F-05: webdataset 数据加载器

**来源**:工程基建(支持大规模数据流)
**类型**:复用(基于 webdataset 库)
**前置**:F-01
**输出**:`framework/data/loader.py`

### 任务详细

用 `webdataset` 库做 streaming:
- 支持 multi-shard 并行 prefetch
- 支持模态混合采样(weighted by data.yaml)
- 支持 Cluster Rebalancing 采样器(DS-03)
- 支持 OPD 配对样本注入(DS-01)

### 验收

- [ ] 单 epoch 加载 100B token 数据,无 OOM
- [ ] Sampling 比例符合 data.yaml 配置(±5%)

---

## F-06: vLLM 模型类 stub

**来源**:工程基建(为 Phase B 自家 MoE 架构)
**类型**:自建
**前置**:无
**输出**:`framework/serving/vllm_models/our_moe_omni.py`

### 任务详细

vLLM 上游不会有自家 10B-A2B 的模型类,需要本组实现:
- 继承 vLLM `ModelRegistry` 注册自家架构
- 实现 forward / KV-cache / attention 适配
- 实现多模态 input 接口(image / audio / video tokens)
- 必须支持 PagedAttention(否则 verl rollout 慢)

### 关键参考

vLLM 已支持的类似 MoE 模型(可作模板):
- `Qwen3-MoE`
- `MixtralForCausalLM`
- `DeepSeek-V3`

### 验收

- [ ] Phase A 期间用 Qwen3.5-4B(vLLM 已支持)跑通整套
- [ ] Phase B 第 1 周 vLLM 类适配通过 sanity test
- [ ] `python -c "from vllm import LLM; LLM('our_omni')"` 不报错

### 注意

**这是 R1 风险的核心**——Phase A 第 8 周起本组 eng 必须开始预留接口。

---

# 模块 I — 基础设施(Tokenizer / Encoder / Compression)

## I-01: Tokenizer 25 MM token 扩展

**来源**:Qwen2-VL / Qwen3-Omni 标准 token 设计
**类型**:复现(标准做法)
**前置**:无
**输出**:`framework/tokenizer/` + `prepare_tokenizer.py` 脚本

### 任务详细

5 步操作流(详见 v4 deck Slide 7):

**Step 1**:加载 Qwen3.5-4B-base tokenizer,**列出已有 special token**(去重必需):

```python
from transformers import AutoTokenizer
tok = AutoTokenizer.from_pretrained("Qwen/Qwen3.5-4B-base")
existing = tok.get_vocab().keys()
# 已有的 ChatML token: <|im_start|>, <|im_end|>, <|tool_call|>, ...
# 这些不要重复加
```

**Step 2**:添加新 token(去掉已有):

```python
new_tokens = [
    # Vision
    "<|vision_start|>", "<|vision_end|>", "<|image_pad|>",
    # Audio
    "<|audio_start|>", "<|audio_end|>", "<|audio_pad|>",
    # Video
    "<|video_start|>", "<|video_end|>", "<|frame_pad|>",
    # Grounding / OCR
    "<|grounding|>", "<|bbox|>", "<|ocr_start|>", "<|ocr_end|>",
    # 其它(需要时再加)
]
new_tokens = [t for t in new_tokens if t not in existing]
tok.add_special_tokens({"additional_special_tokens": new_tokens})
```

**Step 3**:resize embedding(必须 pad_to_multiple_of=256):

```python
model.resize_token_embeddings(len(tok), pad_to_multiple_of=256)
```

**Step 4**:近义 mean 初始化新 token embedding:

```python
def init_special_token(tok, model, new_token, anchor_words):
    new_id = tok.convert_tokens_to_ids(new_token)
    anchor_ids = [tok.convert_tokens_to_ids(w) for w in anchor_words]
    model.get_input_embeddings().weight.data[new_id] = (
        model.get_input_embeddings().weight.data[anchor_ids].mean(dim=0)
    )

init_special_token(tok, model, "<|vision_start|>",
                   ["image", "img", "picture", "photo"])
init_special_token(tok, model, "<|audio_start|>",
                   ["audio", "sound", "voice"])
# 没有近义词的用小方差随机
torch.nn.init.normal_(
    model.get_input_embeddings().weight.data[new_id],
    mean=0, std=0.02
)
```

**Step 5**:Stage 0 训练时,**只解冻 [Vision-Proj + 25 个新 token 的 embedding 行]**:

```python
# 冻全部
for p in model.parameters(): p.requires_grad = False
# 解冻 vision projector
for p in model.vision_projector.parameters(): p.requires_grad = True
# 解冻新 token 的 embedding(用 hook 实现 partial unfreeze)
new_token_ids = [tok.convert_tokens_to_ids(t) for t in new_tokens]
emb = model.get_input_embeddings()
def grad_mask_hook(grad):
    mask = torch.zeros_like(grad)
    mask[new_token_ids] = 1.0
    return grad * mask
emb.weight.register_hook(grad_mask_hook)
```

### 验收

- [ ] Tokenizer 加载后 vocab size = `≈ 151,955`(可调到 256 倍数)
- [ ] 新 token embedding 初始化后,`embedding[new_id].abs().mean()` 与已有 token 同量级
- [ ] Stage 0 训练 1B token 后,**已有 token 的 embedding 完全不变**(grad 测试)

---

## I-02: Vision projector(MLP)实现

**来源**:[Nemotron] Section 3.x —「simple MLP projector」
**类型**:复用
**前置**:F-03
**输出**:`framework/projectors/vision_mlp.py`

### 任务详细

[Nemotron] 用简单 2 层 MLP 把 vision encoder 输出映射到 LLM hidden dim:

```python
class VisionMLPProjector(nn.Module):
    def __init__(self, encoder_dim, llm_dim, hidden_dim=4096):
        super().__init__()
        self.fc1 = nn.Linear(encoder_dim, hidden_dim)
        self.act = nn.GELU()
        self.fc2 = nn.Linear(hidden_dim, llm_dim)
    
    def forward(self, x):
        return self.fc2(self.act(self.fc1(x)))
```

加 4× pixel shuffle 下采样(在 encoder 之后,projector 之前):

```python
# 引自 [Nemotron]: "4x pixel shuffle downsampling pre-projection"
def pixel_shuffle_4x(x):  # x: (B, H, W, D)
    B, H, W, D = x.shape
    return x.reshape(B, H//2, 2, W//2, 2, D).permute(0, 1, 3, 2, 4, 5).reshape(B, H//2, W//2, 4*D)
```

### 验收

- [ ] Encoder out → pixel_shuffle → projector,token 数缩 4×
- [ ] 在 Qwen3.5-4B 上跑通 forward / backward

---

## I-03: Audio projector(MLP)实现

**来源**:[Nemotron] Section 3.x — Audio path
**类型**:复用
**前置**:F-03
**输出**:`framework/projectors/audio_mlp.py`

### 任务详细

同 I-02 但用于 audio。Whisper-v3 输出 1280 维(每 20ms 一个 token),映射到 LLM hidden dim。

不需要 pixel shuffle(audio 已经是 1D)。

### 验收

- [ ] 30s 音频 → ~1500 audio tokens → projector → LLM(token 数与 Nemotron Parakeet 12.5 t/s 同量级)

---

## I-04: EVS + Conv3D 视频压缩

**来源**:[Nemotron] **Section 3.x Video Processing** + Table 12/13 EVS 实测
**类型**:复现
**前置**:F-03
**输出**:`framework/video_compression/`(EVS + Conv3D 模块)

### 算法说明(引自 [Nemotron])

**Conv3D Patch Embedder**:每 2 帧合并成 1 帧,token 减半。

**EVS (Efficient Video Sampling)**:
- 计算相邻 tubelet 的 cosine similarity
- 如果 sim 高(冗余),**丢弃后一帧 token**
- 阈值参数 `q ∈ [0.5, 0.95]`,`q=0.5` 表示丢弃 50% 高相似度 tube

```python
# 伪代码 (按 [Nemotron] Table 12/13 描述)
def evs_compress(video_tokens, q=0.5):
    # video_tokens: (B, T, N, D), T=帧数, N=每帧 token 数
    keep_mask = torch.ones(B, T, N)
    for t in range(1, T):
        sim = cosine_similarity(video_tokens[:, t], video_tokens[:, t-1])
        # 排序后丢 top-q% 高相似度的 token
        threshold = sim.quantile(q, dim=-1, keepdim=True)
        keep_mask[:, t] = (sim < threshold).float()
    return video_tokens[keep_mask.bool()]
```

### 关键参数(从 [Nemotron] Table 13)

| q 值 | DailyOmni | TTFT(ms) |
|---|---|---|
| 无 EVS | 74.41 | 5984 |
| 0.5 | 73.74 | 5313 |
| 0.7 | 73.82 | 5124 |
| 0.9 | 71.54 | 4883 |

**主线推荐 q=0.5**(精度损 < 1 pt,TTFT 降 11%)。

### 验收

- [ ] 60s 视频经 Conv3D + EVS(q=0.5)后 token 数 ≤ 25K
- [ ] 集成到 train.yaml 的 video config
- [ ] 单元测试:输入 / 输出 shape 正确

---

## I-05: Context parallel 实现

**来源**:[Nemotron] Stage 5/6 用 context parallelism
**类型**:复用(PyTorch 2.5+ 已支持 / 或用 ring-attention 库)
**前置**:F-01
**输出**:`framework/training/context_parallel.py`

### 任务详细

Stage 5 的 48K context 在单 GPU 装不下,需要 context parallel:
- [Nemotron] Stage 5 用 CP=2
- [Nemotron] Stage 6 用 CP=16(我方跳过)

我方用 PyTorch 原生 `torch.distributed.tensor.parallel`(2.5+)或集成 `ring-attention` 库。

### 验收

- [ ] 在 16 H100 上 CP=2 跑通 48K context 训练
- [ ] throughput 退化 ≤ 30% vs 16K 训练

---

# 模块 T — SFT 训练任务

## T-01: Stage 0 Vision Projector Warmup

**来源**:[Nemotron] **Table 6 Stage 0**(完整超参可直接抄)
**类型**:复用
**前置**:I-01, I-02, F-04, D-01
**输出**:Stage 0 ckpt(`output/stage0/ckpt-final/`)

### 关键参数(从 [Nemotron] Table 6,直接复用)

| 参数 | 值 |
|---|---|
| Context length | 16K |
| Global batch size | **128** |
| Learning rate | **1e-3** |
| Min LR | 1e-5 |
| Warmup ratio | 0.1 |
| Weight decay | 0.01 |
| Trainable | **仅 Vision Projector**(LLM 全冻 + audio 不动) |
| GPU nodes(原文)| 32(我方按算力等比缩) |
| Optimizer | AdamW(β₁=0.9, β₂=0.999) |
| LR schedule | cosine decay |
| Precision | bf16 |
| TP / EP | TP=2 / EP=32(原文,我方调到自家配置) |

**我方目标 token 量**:~5B(从 v4 deck SFT 配方)

### 任务步骤

1. 加载 Qwen3.5-4B-base + I-01 扩展后的 tokenizer
2. 加载 Vision encoder(SigLIP / InternViT 已在 F-03 实现)
3. 解冻 Vision Projector + 25 个新 token embedding(I-01 Step 5)
4. 数据用 D-01,通过 F-05 加载
5. 跑训练 to 5B token

### 验收

- [ ] 训练 loss 收敛(最后 1B token loss < 初始的 30%)
- [ ] LM 部分 weight 完全没变(grad sanity check)
- [ ] 模型可正确把 image token 翻译成 text(简单 prompt: "describe this image" 输出合理)

---

## T-02: Stage 1 Vision SFT

**来源**:[Nemotron] **Table 6 Stage 1**
**类型**:复用
**前置**:T-01, D-02, DS-02
**输出**:Stage 1 ckpt

### 关键参数(从 [Nemotron] Table 6)

| 参数 | 值 |
|---|---|
| Context | 16K |
| Max video frames | 64 |
| Global BS | **256** |
| LR | **5e-5** |
| Min LR | 0 |
| Warmup ratio | 0.01 |
| Weight decay | 0.05 |
| Trainable | **All except audio**(LLM + Vision encoder + V-Proj 都解冻) |

**注意**:
- Vision encoder **解冻**(与 LLaVA 早期范式相反)
- Audio encoder **保持冻**(此阶段尚未训音频)
- **CPE layers kept in eval mode**(Nemotron 指明)

**我方目标 token 量**:~95B(裁掉 GUI agent / 数学奥赛 / coding 子集)

### 验收

- [ ] MMMU(zero-shot evaluation post-Stage 1)≥ 50
- [ ] DocVQA ≥ 80
- [ ] 文本回归(MMLU-Pro)损 ≤ 1 pt vs Qwen3.5-4B-base

---

## T-03: Stage 2 Audio Projector Warmup

**来源**:[Nemotron] **Table 6 Stage 2**
**类型**:复用
**前置**:I-03, F-03 (Whisper encoder), D-03 (Granary 子集)
**输出**:Stage 2 ckpt

### 关键参数

| 参数 | 值 |
|---|---|
| Context | 16K |
| Global BS | **512** |
| LR | **1e-3** |
| Trainable | **仅 Audio Projector** |

**我方目标 token 量**:~5B

### 任务步骤

1. 从 T-02 ckpt 出发(Vision/Text 已训好)
2. 解冻仅 Audio Projector
3. 用 Granary v1.1 的子集(主要 ASR caption 对)训 5B token

### 验收

- [ ] ASR sanity:LibriSpeech-clean WER ≤ 8(初步对齐)
- [ ] Vision 能力不退化(MMMU 不掉)

---

## T-04: Stage 3 Audio Encoder + Projector

**来源**:[Nemotron] **Table 6 Stage 3 + Section 3.1 数据组成**
**类型**:复用
**前置**:T-03, D-03 全集
**输出**:Stage 3 ckpt

### 关键参数

| 参数 | 值 |
|---|---|
| Context | 16K |
| Global BS | **256** |
| LR | **2.5e-5** |
| Trainable | **Audio Encoder + Audio Projector**(LLM 冻 / Vision 冻) |

**我方目标 token 量**:~20B

### 数据组合(我方按 0.22 缩放抄 [Nemotron])

| 子任务 | Token 占比 | 估计 token |
|---|---|---|
| ASR | ~22% | 4.4B |
| Sound understanding | ~24% | 4.8B |
| Music understanding | ~43% | 8.6B |
| Speech understanding | ~10% | 2B |

### 验收

- [ ] OpenASR avg WER ≤ 8
- [ ] MMAU ≥ 50(初步)

---

## T-05: Stage 4 Omni SFT 16K(含 OPD)

**来源**:[Nemotron] **Table 6 Stage 4** + [Qwen3.5] **OPD trick**
**类型**:**组合**
**前置**:T-04, D-02/03/04, DS-01 (OPD pairs), DS-03 (Cluster Rebal)
**输出**:Stage 4 ckpt

### 关键参数

| 参数 | 值 |
|---|---|
| Context | 16K |
| Max video frames | 64 |
| Global BS | **128** |
| LR | **1e-5** |
| Min LR | 1e-7 |
| Trainable | **All**(全参数解冻) |

**我方目标 token 量**:~30B

### 数据混合配方(组合 [Nemotron] + [Qwen3.5])

| 类型 | 占比 | 来源 |
|---|---|---|
| Vision SFT | 50% | D-02 |
| Audio SFT | 18% | D-03 |
| Video(短)| 12% | D-04 |
| **OPD audio-text 配对** | **20%** | **DS-01** ★ |
| Text 防漂移 | (混采)| D-06 |

启用 **DS-03 Cluster Rebalancing**(可在 data.yaml 开关)。

### 验收

- [ ] DailyOmni ≥ 60
- [ ] VoiceBench(text-vs-audio query 一致性)improvement vs T-04 + 1-3 pt(OPD trick 效果)
- [ ] 文本回归 MMLU-Pro 损 ≤ 1.5 pt

---

## T-06: Stage 5 Omni SFT 48K(含 EVS)

**来源**:[Nemotron] **Table 6 Stage 5**
**类型**:复用
**前置**:T-05, I-04 (EVS), I-05 (Context Parallel), D-04 长视频
**输出**:Stage 5 ckpt

### 关键参数

| 参数 | 值 |
|---|---|
| Context | **48K**(扩 3×) |
| Max video frames | 256 |
| Context Parallel | **2** |
| LR | **1e-6** |
| Trainable | **All except audio**(冻 audio 防漂移)|

**我方目标 token 量**:~15B

### 数据组合([Nemotron] Stage 5 配方,缩比例)

| 类型 | 占比 | 来源 |
|---|---|---|
| Medium+long omni | ~39% | D-04 中视频 |
| Video reasoning | ~10% | DS-02 视频 CoT |
| Long video | ~3% | D-04 长视频 |
| Long context vision | ~10% | D-02 长文档子集 |
| Text 长 | ~7% | D-06 |
| ASR / Audio(混采)| ~12% | D-03(冻 audio,但 data 仍混)|
| Short video | ~6% | D-04 |
| Video CoT | ~10% | DS-02 |

### 验收

- [ ] VideoMME ≥ 60
- [ ] LongVideoBench ≥ 55
- [ ] MMLongBench-Doc ≥ 40
- [ ] **48K 上下文不溢出**:60s 视频 + 10K 文本 prompt 能跑

---

## T-00: Phase A 全栈跑通(Demo A 元任务)

**来源**:多任务串联
**类型**:元任务
**前置**:T-01..T-06 在 Qwen3.5-4B-base 上跑完
**输出**:Demo A ckpt(α 版交付)

### 任务详细

按 T-01 → T-02 → T-03 → T-04 → T-05 → T-06 顺序在 **Qwen3.5-4B-base** 上跑完整 SFT 流水线,不含 RL(RL 在 Phase B 跑)。

目的:**验证 framework 可工作**,作为客户 α 版交付物。

### 验收

- [ ] Demo A 模型在 8 维 benchmark 都能跑(评测通过)
- [ ] MMMU ≥ 50,DocVQA ≥ 85,VideoMME ≥ 55(详见 [Slide 11 评测红线])
- [ ] 整套 yaml 可被陌生人使用(配合 O-03 Tutorial)

---

## T-99: Phase B 全栈跑通(Demo B 元任务)

**来源**:多任务串联
**类型**:元任务
**前置**:T-00 通过 + 实 ckpt 到达 + R-01..R-05 完成
**输出**:Demo B ckpt(β 版交付)

### 任务详细

按 T-01..T-06 在**自家 10B-A2B 实 ckpt** 上跑,然后接 RL 三段(R-03 → R-04 → R-05)。

### 验收

- [ ] 全 SFT + RL 完成,各 benchmark 达 [Slide 11 评测红线]
- [ ] 文本回归 MMLU-Pro 损 ≤ 2 pt vs 实 ckpt base
- [ ] 完整 framework β 版交付客户

---

# 模块 R — RL 训练任务

## R-01: verl 接入 + GRPO 跑通

**来源**:verl 官方文档(https://github.com/volcengine/verl)
**类型**:复用
**前置**:F-01, F-06
**输出**:verl 集成,GRPO 在我方模型上跑通

### 任务详细

1. 安装 verl + 依赖
2. 注册我方模型(F-06 中的 vLLM 模型类)
3. 在小规模 prompt set 上跑 GRPO sanity(不要大数据)

### 验收

- [ ] verl GRPO 在 Qwen3.5-4B 上跑通 1 epoch 不报错
- [ ] vLLM rollout latency < 200ms(单条)

---

## R-02: GSPO 算法实现(基于 GRPO)

**来源**:[Nemotron] **使用 GSPO** + Qwen 公开 GSPO 算法描述
**类型**:复现
**前置**:R-01
**输出**:`verl/algorithms/gspo.py`(基于 verl GRPO 改)

### 算法差异(GRPO → GSPO)

GRPO 是 token-level importance ratio,GSPO 是 **sequence-level**:

```python
# GRPO (verl 现有)
# loss per token: r_token * advantage[t]
ratio = exp(log_prob_new[t] - log_prob_old[t])

# GSPO (我方实现)
# loss per sequence: r_seq * advantage[i]
ratio_seq = exp((log_prob_new.sum(-1) - log_prob_old.sum(-1)) / seq_len)
```

具体:**整序列的 importance ratio 用 length-normalized 累积概率比**。

### 关键参数(从 [Nemotron])

- Global batch size: **4096**
- Rollouts / prompt: **16**
- Optimizer: AdamW
- Linear warmup

### 验收

- [ ] GSPO 在 Qwen3.5-4B + 简单数学任务上收敛
- [ ] 与 GRPO 对照:同 step 数下 reward 提升 ≥ GRPO

### 注意

**如果 GSPO 自实现延迟,主线 fall back GRPO**(损 ~1-2 pt 稳定性)。

---

## R-03: MPO 偏好优化(DPO + BCO)

**来源**:[Nemotron] **RL Stage 1 — Mixed Preference Optimization**
**类型**:复现
**前置**:R-01, D-05, T-99(SFT 完成)
**输出**:MPO 训练 pipeline + Stage RL-1 ckpt

### 算法说明

[Nemotron] MPO = **DPO + BCO**:

```python
# DPO loss (verl 已有)
loss_dpo = -log(sigmoid(beta * (r_chosen - r_rejected)))

# BCO loss (Binary Classifier Optimization)
# 把 chosen 看正例,rejected 看负例,做二分类
loss_bco = (BCE(reward_classifier(chosen), 1) +
            BCE(reward_classifier(rejected), 0))

# MPO 混合
loss_mpo = alpha * loss_dpo + (1 - alpha) * loss_bco
```

**默认 α = 0.5**(可调)。

### 数据(D-05)

~120K 偏好对:RLHF-V + VLFeedback + POVID

### 验收

- [ ] POPE 提升 +5 pt(反幻觉效果)
- [ ] MMLU-Pro 不掉(偏好优化对文本影响小)

---

## R-04: Image-RL with verifiers

**来源**:[Nemotron] **RL Stage 3 — Image-RL**(本任务复现 Nemotron 详细 verifier 列表)
**类型**:复现
**前置**:R-02 (GSPO), R-03(MPO 后)
**输出**:Image-RL pipeline + Stage RL-2 ckpt

### 任务数据组成(直接抄 [Nemotron])

| 类型 | 样本数 |
|---|---|
| Chart/document/text-rich reasoning | ~28K |
| STEM/math | ~19K |
| Games/puzzles | ~12K |
| Visual QA | ~8K |
| Visual grounding(click-coordinate) | ~7K |
| **合计** | **~74K** |

### Verifiers(直接抄 [Nemotron])

| Verifier | 适用任务 | 实现 |
|---|---|---|
| `string_match` | 短答案 QA | 答案规范化后 string equal |
| `mathruler` | 数学题 | 表达式等价判定(lib `mathruler`) |
| `multiple_choice` | 选择题 | 输出选项 letter (A/B/C/D) match |
| `gui_coordinate` | grounding | smooth distance decay,公式 |

**GUI coordinate verifier**:

```python
def gui_coord_reward(predicted_xy, gt_xy, image_wh):
    # 平滑距离衰减(Nemotron 指明)
    dist = euclidean(predicted_xy, gt_xy) / norm(image_wh)
    return max(0, 1 - dist / 0.05)  # 5% 容差
```

### 关键参数(直接抄 [Nemotron])

- **Pass-rate filter**: 只保留 pass rate < 0.8 from 8 rollouts(过简单题不要)
- **Format reward**: `<think>...</think>` 块 + `\boxed{answer}`,partial credit 给多余推理
- **Unanswerable / mismatched 样本**: 保留 ~5%,训 abstention(模型学会答 "I don't know")

### 验收

- [ ] ScreenSpot-Pro ≥ 35(对照 Nemotron 59.3,我方目标 ~60% baseline)
- [ ] MathVista 提升 +3-5 pt
- [ ] DocVQA / ChartQA 提升 +2-3 pt

---

## R-05: Text-RL Stage 2(必跑)

**来源**:[Nemotron] **RL Stage 5 — Text-RL Stage 2**
**类型**:复现
**前置**:R-04 完成
**输出**:Text-RL S2 ckpt(最终模型)

### 任务说明

[Nemotron] 在多模态 RL 之后**必跑** Text-RL S2 修复文本漂移:
- LM 参数解冻
- **冻 token embedding**(防止表征漂移)
- 用自家文本 SFT 数据(D-06)做 RLVR/RLHF

### 数据(D-06)

- ~30K 自家文本任务(数学 / coding / agentic 视客户场景需要)
- **必须**包含 MMLU-Pro 类知识题(防漂移核心)

### 验收

- [ ] **MMLU-Pro 损 ≤ 2 pt vs base**(这是上线门槛)
- [ ] AIME25 不进一步退化
- [ ] 多模态指标(MMMU/DocVQA)不降 > 1 pt

### 注意

**这是项目能否上线的最后一个 gate**,不可省略。

---

# 模块 S — Specialist Distillation

## S-01: 35B-A3B 通才 teacher label 生成

**来源**:[Qwen3.5] **Specialist Distillation 思想 + cross-size variant**(我方简化方案)
**类型**:组合([Qwen3.5] specialist 思想 + 自定义 cross-size)
**前置**:F-06(vLLM 服务化),D-02 / D-03 / D-04 数据准备
**输出**:每条 SFT 数据带 35B-A3B 生成的 baseline response

### 任务说明

我方 **Hybrid 2T Specialist**(主线版):
- T1 = **Qwen3.5-35B-A3B**(通才 teacher,给跨模态 baseline label)
- T2 = Vision specialist(下个任务 S-02 训)

S-01 任务:用 vLLM 服务化部署 35B-A3B,对所有 SFT 数据**离线打 label**。

### 实现步骤

1. vLLM 服务化 Qwen3.5-35B-A3B(8×H100)
2. 对 D-02/03/04 中的每条 query 跑 inference,存 response 到 `data/teacher_labels/`
3. 数据格式:

```json
{"original_query": "...",
 "original_response": "...",      // 原数据集 response
 "teacher_response_35B": "..."}   // 35B-A3B 生成的 response
```

### 关键参数

- vLLM tensor_parallel_size = 8
- max_tokens = 2048
- temperature = 0.7,top_p = 0.9
- batch size 大(128+)以充分利用 vLLM throughput

### 验收

- [ ] 所有 SFT query 都打了 label(覆盖率 100%)
- [ ] 抽查 100 条:teacher response 可读 / 合理 / 与 original 不退化

### 注意

**仅对 Stage 4 / Stage 5 数据打 label**(Stage 0/1 是基础对齐,不需要 35B label)。这能省算力 60%。

---

## S-02: Vision specialist 训练

**来源**:[Qwen3.5] **Specialist Distillation Stage 1 — Vision branch**
**类型**:复现
**前置**:T-99 (SFT 完成,作为 vision specialist 的 base)
**输出**:Vision specialist ckpt(从我方 base + Vision SFT 训出)

### 任务说明

按 [Qwen3.5] Specialist Distillation 范式:
1. 从我方 base ckpt 出发
2. **只在 Vision SFT 数据上做 SFT**(不混 Audio / Video)
3. 训完得到 "Vision specialist"

具体:相当于跑一个**只有 Stage 1**(裁剪版)的训练。

### 关键参数

- 同 T-02 (Stage 1 Vision SFT) 配置
- 数据:仅 D-02 + DS-02 (Vision 部分)
- Token 量:~50B(比 T-02 少,因为是 specialist 不需要饱和)

### 验收

- [ ] Vision specialist 在 MMMU 上 ≥ 主模型 + 2 pt(specialist 应该比 generalist 强)
- [ ] DocVQA ≥ 主模型 + 3 pt

---

## S-03: 蒸馏 SFT pipeline

**来源**:[Qwen3.5] **Specialist Distillation Stage 1 — distillation step**
**类型**:复现
**前置**:S-01 (35B labels), S-02 (Vision specialist)
**输出**:更新版 Stage 4 SFT pipeline,用 teacher response 作为 supervision

### 任务说明

修改 T-05(Stage 4)的 SFT loss:不直接用原数据集 ground-truth response,而是:
- 视觉类 query → **Vision specialist response**(S-02)做 supervision
- 其它 query → **35B-A3B teacher response**(S-01)做 supervision
- 文本类 query → 原 ground-truth(防漂移)

```python
def get_target(sample):
    if sample.modality == "vision_dominant":
        return vision_specialist_response[sample.id]
    elif sample.modality == "text_only":
        return sample.original_response  # 原 GT,防漂移
    else:
        return teacher_35B_response[sample.id]  # S-01 label

# 训练时
loss = cross_entropy(student.forward(query), get_target(sample))
```

### 验收

- [ ] Hybrid 2T 蒸馏后的 student MMMU ≥ 主线 +1-2 pt
- [ ] 文本回归不退化

---

# 模块 E — 评测

## E-01: VLMEvalKit fork + 自定义接口

**来源**:开源 VLMEvalKit(`open-compass/VLMEvalKit`)
**类型**:复用
**前置**:无
**输出**:fork repo + 客户自定义 task 注册接口

### 任务详细

1. fork VLMEvalKit
2. 添加我方模型 wrapper(支持自家 model class)
3. 加客户自定义 task 接口:

```python
@register_task("custom_task_name")
class CustomTask(BaseTask):
    def load_data(self): ...
    def evaluate(self, predictions): ...
```

`eval.yaml` 中:`tasks: [MMMU, DocVQA, custom_task_name]`

### 验收

- [ ] 我方模型在 VLMEvalKit 上跑 MMMU 通过
- [ ] 客户能加 1 个自定义 task 不报错

---

## E-02: 视觉 / OCR / 文档评测集成

**来源**:[Nemotron] **Section 4.1 Table 7**
**类型**:复用
**前置**:E-01
**输出**:8 个视觉评测集成

### 评测列表(直接抄 [Nemotron] Table 7)

| 类别 | Benchmark | Nemotron 成绩(参考)|
|---|---|---|
| 综合 | MMMU val | 55.2(reasoning off)/ 70.8(on) |
| 综合 | MM-Vet | — |
| 综合 | MMStar | — |
| 综合 | SEED-Bench-2 | — |
| Doc | DocVQA test | 93.3 / 95.6 |
| Doc | OCRBench | 88.3 / 86.6 |
| Doc | OCRBench-V2 EN/ZH | 65.8/52.0 |
| Doc | ChartQA test | 89.9 / 90.3 |
| Doc | AI2D test | 88.5 |
| Doc | TextVQA val | 85.1 |
| Doc | InfoVQA test | 83.6 |
| Doc | OCR-Reasoning | 22.2 / 54.14 |
| Doc | CharXiv RQ/DQ | 49.1/81.9 |
| 数学 | MathVista mini | 71.9 / 82.8 |
| 数学 | MathVision | — |
| Grounding | TreeBench | 43.7 / 51.6 |
| Grounding | CV-Bench | 84.2 / 84.0 |
| Grounding | RefCOCO | 80.6 / 90.5 |
| GUI | ScreenSpot | 90.3 |
| GUI | ScreenSpot-V2 | 93.4 |
| GUI | **ScreenSpot-Pro** | 59.3 |

我方目标:打平**同 size**(Qwen2.5-VL-4B)开源,详见 [Slide 11]。

### 验收

- [ ] 上述 benchmark 全部能跑出数(不报错)
- [ ] 自动生成 markdown 评测报告

---

## E-03: 音频评测集成

**来源**:[Nemotron] **Section 4.2 Table 8**
**类型**:复用
**前置**:E-01
**输出**:音频评测集成

### 评测列表

- **OpenASR**(8 子集:AMI / Earnings22 / GigaSpeech / LibriSpeech clean+other / SPGISpeech / TED-LIUM / VoxPopuli)
- **MMAU**(Music / Audio / Speech 分项)
- **MMAR**
- **MMSU**
- **VoiceBench**(IFEval / BBH / AdvBench / AlpacaEval / CommonEval / WildVoice / OpenBookQA / MMSU / SD-QA)

### 验收

- [ ] OpenASR 8 子集都能跑
- [ ] WER 自动计算,JSON 输出

---

## E-04: 视频 + Omni 端到端评测集成

**来源**:[Nemotron] **Section 4.1 + 4.3**
**类型**:复用
**前置**:E-01
**输出**:视频 + omni 评测集成

### 评测列表

| 类别 | Benchmark |
|---|---|
| 视频 | VideoMME |
| 视频 | LongVideoBench |
| 视频 | MVBench |
| 视频 | NextQA |
| 视频 | EgoSchema |
| Omni | DailyOmni(128 frame / 256 frame 各报)|
| Omni | WorldSense |
| Omni | AVUT |

### 验收

- [ ] 单 GPU 跑完所有视频/omni benchmark < 12 小时

---

## E-05: 文本回归评测套件

**来源**:[Nemotron] **Section 4.4 Table 10** + 业界标准
**类型**:复用
**前置**:E-01
**输出**:文本回归评测(必跑)

### 评测列表

| Benchmark | 用途 |
|---|---|
| MMLU-Pro | 通用知识(★ 主红线) |
| MMLU-Redux | 通用知识 |
| SuperGPQA | 困难知识 |
| C-Eval | 中文知识 |
| GPQA | STEM |
| AIME25 | 数学 |
| HMMT Nov 25 | 数学 |
| LiveCodeBench v6 | Coding |
| IFBench | 指令跟随 |
| AA-LCR | 长上下文 |
| LongBench v2 | 长上下文 |
| BFCL-V4 | Function calling |
| TAU2Bench | Agentic |

### 自动化

每 1B token 跑 mini-eval(MMLU-Pro 100 题子集 + IFBench 50 条);每 5B token 跑全量。

### 验收

- [ ] mini-eval 5 分钟内跑完
- [ ] 全量 1 小时内跑完
- [ ] WandB 自动 log

---

## E-06: 幻觉评测(POPE / HallusionBench)

**来源**:开源 POPE / HallusionBench
**类型**:复用
**前置**:E-01
**输出**:幻觉评测集成(★必跑,显式加)

### 评测列表

- **POPE**(三种 setting:random / popular / adversarial)
- **HallusionBench**
- **MMHal-Bench**(辅助)
- **AMBER**(辅助)

### 验收

- [ ] 上线门槛:POPE accuracy ≥ 90
- [ ] HallusionBench 不退化超过 base + 5 pt

---

## E-07: 自动化 mini-eval + 仪表盘

**来源**:工程
**类型**:自建
**前置**:E-02..E-06
**输出**:自动评测脚本 + WandB / TensorBoard 仪表盘

### 任务详细

训练时每 N step / N B token 触发评测,自动 log:
- 关键 benchmark 趋势
- 文本回归红线监控(MMLU-Pro 掉 > 2 pt 自动 alert)
- Reward 曲线(RL 阶段)
- Loss 曲线 + grad norm

### 验收

- [ ] 触发频率可在 train.yaml 配
- [ ] alert 通过 webhook(Slack / 邮件)送达 owner

---

# 模块 O — 部署

## O-01: vLLM serve template

**来源**:vLLM 官方文档
**类型**:复用
**前置**:F-06 (vLLM 模型类)
**输出**:`framework/serving/vllm_serve.yaml` + 启动脚本

### 任务详细

```yaml
# vllm_serve.yaml
model: ${MODEL_PATH}
tensor_parallel_size: 4
gpu_memory_utilization: 0.85
max_model_len: 48000
trust_remote_code: true
served_model_name: omni-understanding-v1
```

启动:`vllm serve --config vllm_serve.yaml`

### 验收

- [ ] 启动后 OpenAI-compatible API 可用
- [ ] 多模态 input(image / audio / video)能正确解析
- [ ] 单条 query latency < 2s(常规 case)

---

## O-02: REST API + Docker + K8s

**来源**:工程
**类型**:自建
**前置**:O-01
**输出**:Dockerfile + K8s yaml + REST API server

### 任务详细

1. **Dockerfile**:基于 nvidia/cuda 镜像,装好 framework + vLLM + 模型 ckpt 加载
2. **REST API**(FastAPI):wrap vLLM,提供更友好接口
3. **K8s yaml**:Deployment + Service + HPA(自动扩缩)

### 验收

- [ ] `docker compose up` 能起服务
- [ ] K8s 部署后能 health check 通过
- [ ] 客户拿到 yaml 可在自己集群部署

---

## O-03: Demo Jupyter notebook + Tutorial

**来源**:工程(framework 可移交性核心)
**类型**:自建
**前置**:T-00 完成(Demo A 出来)
**输出**:`docs/tutorial.ipynb` + `docs/quickstart.md`

### Notebook 内容

1. 加载 Demo A ckpt
2. 跑一个图片理解 demo
3. 跑一个视频理解 demo
4. 跑一个音频理解 demo
5. 演示 omni(视频+音频联合)
6. 自定义微调:用客户的 100 条数据 fine-tune

### Quickstart 内容

- 环境安装
- 数据准备(10 行能跑通 demo 数据)
- 训练 1 个 stage(15 分钟内跑完)
- 评测 1 个 benchmark
- 部署成 API

### 验收

- [ ] notebook 从头跑到尾不报错
- [ ] 陌生人(团队外同事)按 quickstart 1 小时内能跑出 demo

---

# 模块 A — 消融实验(可选,P2/P3)

## A-01: P2 — 完整 5T Specialist Distillation

**来源**:[Qwen3.5] **完整 Specialist Distillation**(5 个 teacher)
**类型**:组合
**前置**:T-99 主线完成
**输出**:5T specialist 蒸馏 student vs Hybrid 2T 主线对照报告

### 任务详细

训 5 个 specialist(从我方 base 各自 SFT/RL):
- Text-Agentic specialist
- Text-Coding specialist
- Text-Reasoning specialist
- Vision specialist(已在 S-02 训了,直接复用)
- Audio specialist

蒸馏到一个 Thinker。对照 Hybrid 2T 主线:
- 综合提升 vs 工作量

### 验收

- [ ] 5T 版 vs 2T 版的 MMMU / DocVQA / MathVista / Audio 对比报告
- [ ] 决策:是否值得 +4-6 周训 3 个额外 specialist 换 +1-3 pt

---

## A-02: P2 — Cluster-based Rebalancing

**来源**:[LongCat] **Mid-training Cluster Rebalancing**
**类型**:复现
**前置**:DS-03(已实现),T-05 主线完成
**输出**:开 / 关 Cluster Rebalancing 的对照报告

### 任务详细

在 Stage 4(T-05)中 data.yaml 切换 `cluster_rebalancing: on/off`,跑两次,对比:
- Audio 长尾任务表现(MMAU 各子项)
- Omni 端到端(DailyOmni)

### 验收

- [ ] A/B 对照实验报告
- [ ] 决策:是否在主线启用

---

## A-03: P2 — Modality-Agnostic MoE 路由

**来源**:[LongCat] **Modality-Agnostic MoE backbone**
**类型**:复现
**前置**:F-02 (MoE wrap), T-05 主线
**输出**:模态-agnostic 路由 vs 模态特化路由对照

### 任务详细

修改 MoE 路由:
- 主线:模态分组路由(如有)
- 消融:无模态偏置(所有 expert 任意 query 都可路由)

监控 expert 利用率 + DailyOmni 表现。

### 验收

- [ ] expert 利用率分布(熵)对照
- [ ] DailyOmni / WorldSense 性能对照

---

## A-04: P3 — Random delay audio-text

**来源**:[LongCat] **Audio training random delay [1, len(text)]**
**类型**:复现
**前置**:T-04 主线
**输出**:开 / 关 random delay 的 audio robustness 对照

### 任务详细

在 Stage 3 audio SFT 数据加载时,对 audio query 加随机 delay [1, len(text segment)]。

### 验收

- [ ] Audio 流式 / 截断鲁棒性 benchmark 对照
- [ ] OpenASR 各子集稳定性变化

---

## A-05: P3 — 中英多语 3.5:3.5:3 配比

**来源**:[Qwen3.5] **AuT 训练数据策略 — Chinese/English/multilingual = 3.5:3.5:3**
**类型**:复现
**前置**:T-04 主线
**输出**:配比 A/B 对照

### 任务详细

主线默认按数据集自然分布;消融按 3.5:3.5:3 强制重采样。

监控:
- AISHELL / WenetSpeech(中文 ASR)
- LibriSpeech(英文 ASR)
- 多语 ASR

### 验收

- [ ] 中文 ASR 性能对照
- [ ] 决策:多语客户场景下是否启用

---

# 附录 A — 论文方法 → 任务对应表

| 论文方法 | 任务 ID | 来源精确位置 |
|---|---|---|
| **[Nemotron]** Stage 0 配方 | T-01 | Table 6 |
| **[Nemotron]** Stage 1 配方 | T-02 | Table 6 |
| **[Nemotron]** Stage 2 配方 | T-03 | Table 6 |
| **[Nemotron]** Stage 3 配方 | T-04 | Table 6 |
| **[Nemotron]** Stage 4 配方 | T-05 | Table 6 |
| **[Nemotron]** Stage 5 配方 | T-06 | Table 6 |
| **[Nemotron]** EVS + Conv3D | I-04 | Section 3.x + Table 12/13 |
| **[Nemotron]** GSPO 算法 | R-02 | Section 3.x RL |
| **[Nemotron]** MPO = DPO + BCO | R-03 | Section RL Stage 1 |
| **[Nemotron]** Image-RL verifiers | R-04 | Section RL Stage 3 |
| **[Nemotron]** Text-RL Stage 2 | R-05 | Section RL Stage 5 |
| **[Nemotron]** 数据组合(各 Stage) | D-01..D-04 | Tables 4-5 |
| **[Nemotron]** Specialist 数据 CoT 合成 | DS-02 | Section 3.1 数据描述 |
| **[Qwen3.5]** OPD | DS-01 / T-05 | Section 4.4 Stage 2 |
| **[Qwen3.5]** Specialist Distillation | S-02, S-03 | Section 4.4 Stage 1 |
| **[Qwen3.5]** Cross-size variant(我方简化)| S-01 | 自定义,基于 Specialist 思想 |
| **[Qwen3.5]** Hybrid Attn / GDN | — | (架构层,不在范围) |
| **[Qwen3.5]** ARIA / Code2Wav / Talker | — | (生成端,不做) |
| **[Qwen3.5]** AuT 自训 audio | — | (40M 小时不可达,不做) |
| **[LongCat]** Cluster-based Rebalancing | DS-03 + A-02 | Stage II Mid-training |
| **[LongCat]** Modality-Agnostic MoE | A-03 | Section Backbone |
| **[LongCat]** Random delay training | A-04 | Audio training Section |
| **[LongCat]** DiNA / dNaViT | — | (生成端,不做) |
| Tokenizer 25 MM token | I-01 | Qwen2-VL/3-Omni 标准 |

---

# 附录 B — 关键超参速查表(直接抄 [Nemotron] Table 6)

| 阶段 | Context | Max Frames | Global BS | LR | Min LR | Warmup | WD | Trainable |
|---|---|---|---|---|---|---|---|---|
| Stage 0 | 16K | – | 128 | 1e-3 | 1e-5 | 0.1 | 0.01 | Vision Projector |
| Stage 1 | 16K | 64 | 256 | 5e-5 | 0 | 0.01 | 0.05 | All except audio |
| Stage 2 | 16K | – | 512 | 1e-3 | 1e-5 | 0.1 | 0.01 | Audio Projector |
| Stage 3 | 16K | – | 256 | 2.5e-5 | 0 | 0.01 | 0.05 | Audio Enc + Proj |
| Stage 4 | 16K | 64 | 128 | 1e-5 | 1e-7 | 0.1 | 0.01 | All |
| Stage 5 | 48K | 256 | – | 1e-6 | 0 | – | 0.05 | All except audio |

**全局**:Optimizer = AdamW(β₁=0.9, β₂=0.999),LR schedule = cosine decay,Precision = bf16

**RL 全局**:Global BS = 4096,Rollouts/prompt = 16,Algorithm = GSPO(R-02 实现),Optimizer = AdamW + linear warmup

---

# 附录 C — 「不要做」清单(防止天马行空)

❌ 禁止:
- 自创训练算法(只能从 Nemotron / Qwen3.5 已发表中选 + 组合)
- 自创 RL 奖励函数(verifier 必须从 Nemotron 4 种 +ASR 1-WER 中选,扩展需 lead 批)
- 跳过文本回归测试(MMLU-Pro 不测视为不达标)
- 跳过 Text-RL Stage 2(必跑,否则文本必漂)
- 用未引用论文的方法 / trick(本文档不提的方法不要用,先讨论再加进文档)
- 用 Megatron-Bridge / NeMo-RL(我方栈是 HF + verl,不混)

✅ 鼓励:
- 在已发表方法之间组合(标注组合来源,见 T-05 是 [Nemotron] + [Qwen3.5] 组合)
- 加单元测试(每个 F-XX / I-XX 任务都要 pytest)
- 文档化:每个 PR 必须更新对应任务卡的「验收」状态

---

> **任务文档版本**:v1.0(2026-05-06)
> **维护**:本文档随项目演进,新增任务卡需带 ID + 来源 + 验收。
