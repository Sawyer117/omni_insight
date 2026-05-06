// Omni 后训练实验计划 v2 —— 内部团队规划版(已纳入 5 点反馈)
// 场景:文本预训练 ckpt 在路上(架构新颖,无 off-the-shelf 模型)
//       后训练 team 用 Qwen3.5-4B-base 做 proxy 先把流水线跑通,实 ckpt 到达后无缝切换
// 目标:扩展为 omni 理解模型(V/A/Vid/T),无生成
// 实 ckpt:MoE ~10B-A2B
// 技术栈:HF transformers + FSDP2 + verl(RL)+ vLLM(rollout/inference)+ VLMEvalKit
// 起源:基于 Nemotron 3 Nano Omni / LongCat-Next / Qwen3.5-Omni 三篇

const pptxgen = require("pptxgenjs");

const COLOR = {
  ink: "1F3864", red: "C00000", inkSoft: "595959", inkFaint: "BFBFBF",
  warn: "ED7D31", good: "70AD47", brandA: "7030A0", brandB: "00B0F0",
  highlight: "FFFF00",
  fillBlue: "D9E2F3", fillOrange: "FCE4D6", fillGreen: "E2EFDA", fillRed: "FBDDDC",
  cardYellow: "FFF2CC", cardGray: "F2F2F2",
  darkBg: "0A0A1F", darkInk: "E8E8F0"
};
const FONT = { zh: "Microsoft YaHei", en: "Calibri", mono: "Consolas", serif: "Times New Roman" };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Post-Training Team";
pres.title = "Omni 理解后训练实验计划 v2 — Qwen3.5-4B Proxy → MoE 10B-A2B";

// ============================================================
// 通用工具
// ============================================================
function addTitleBand(slide, redText, blackText) {
  slide.addText([
    { text: redText, options: { color: COLOR.red, bold: true, fontSize: 24 } },
    { text: ": ", options: { color: COLOR.ink, bold: true, fontSize: 24 } },
    { text: blackText, options: { color: COLOR.ink, bold: true, fontSize: 22 } }
  ], { x: 0.4, y: 0.18, w: 12.5, h: 0.50, margin: 0, fontFace: FONT.zh });
  slide.addShape(pres.shapes.LINE, {
    x: 0.4, y: 0.72, w: 12.5, h: 0,
    line: { color: COLOR.red, width: 1.5 }
  });
}

function addRedConclusionBox(slide, conclusions, y = 6.20) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y, w: 12.5, h: 1.00,
    fill: { color: "FFFFFF" }, line: { color: COLOR.red, width: 1.5 }
  });
  conclusions.forEach((c, i) => {
    slide.addText([
      { text: c.tag + ": ", options: { color: COLOR.red, bold: true, fontSize: 11 } },
      { text: c.body, options: { color: COLOR.ink, fontSize: 10 } },
      { text: c.bold || "", options: { color: COLOR.ink, bold: true, fontSize: 10 } },
      { text: c.warn || "", options: { color: COLOR.warn, bold: true, fontSize: 10 } },
      { text: c.tail || "", options: { color: COLOR.inkSoft, fontSize: 9, italic: true } }
    ], { x: 0.5, y: y + 0.08 + i * 0.30, w: 12.3, h: 0.28, margin: 0, fontFace: FONT.zh });
  });
}

function addSources(slide, sources, y = 7.26) {
  const arr = [{ text: "Source: ", options: { color: COLOR.inkSoft, italic: true, fontSize: 8 } }];
  sources.forEach((s, i) => {
    arr.push({ text: s.name, options: { color: COLOR.red, italic: true, fontSize: 8, underline: { style: "sng", color: COLOR.red } } });
    arr.push({ text: s.tail + (i < sources.length - 1 ? " | " : ""), options: { color: COLOR.inkSoft, italic: true, fontSize: 8 } });
  });
  slide.addText(arr, { x: 0.4, y, w: 12.5, h: 0.22, margin: 0, fontFace: FONT.zh });
}

function metricCell(primary, secondary, primaryColor) {
  return {
    text: [
      { text: primary, options: { color: primaryColor || COLOR.warn, bold: true, fontSize: 11, breakLine: true } },
      { text: secondary, options: { color: COLOR.inkSoft, fontSize: 9 } }
    ],
    options: { valign: "middle", align: "center", margin: 2 }
  };
}

function headerCell(text) {
  return { text, options: { fill: { color: COLOR.fillBlue }, color: COLOR.ink, bold: true, fontSize: 11, align: "center", valign: "middle" } };
}

function rowLabelCell(text, color) {
  return { text, options: { color: color || COLOR.red, bold: true, fontSize: 10, align: "left", valign: "middle", margin: 4 } };
}

// ============================================================
// SLIDE 1 — 背景 + 约束(v2 更新版)
// ============================================================
function slide1() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "背景 + 约束 v2",
    "Qwen3.5-4B proxy → 实 ckpt MoE 10B-A2B,HF/FSDP/verl/vLLM 栈");

  // 左:目标 + 双阶段
  const lX = 0.4, lY = 0.85, lW = 6.30, lH = 5.05;
  s.addShape(pres.shapes.RECTANGLE, { x: lX, y: lY, w: lW, h: lH, fill: { color: "FFFFFF" }, line: { color: COLOR.good, width: 1.0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: lX, y: lY, w: lW, h: 0.42, fill: { color: COLOR.good }, line: { color: COLOR.good, width: 0 } });
  s.addText("✓ 目标 + 模型形态(In-Scope)", {
    x: lX + 0.10, y: lY + 0.05, w: lW - 0.20, h: 0.32, color: "FFFFFF", bold: true, fontSize: 13, valign: "middle", fontFace: FONT.zh
  });
  const inScope = [
    { tag: "Phase A 模型(proxy)", goal: "Qwen3.5-4B-base + Vision/Audio encoder", target: "T-12 → T 期间训出可工作的 omni 理解模型,验证整套流水线" },
    { tag: "Phase B 模型(real)", goal: "实 ckpt(MoE ~10B-A2B,新架构)", target: "T → T+18 期间用同一份流水线,只换 LLM 骨干" },
    { tag: "支持模态(理解)", goal: "Vision / Audio / Video / Text", target: "MMMU ≥ 60 / DocVQA ≥ 90 / VideoMME ≥ 60 / OpenASR ≤ 7 WER" },
    { tag: "上下文长度", goal: "起步 16K,扩到 48K", target: "MMLongBench-Doc ≥ 35,跳过 256K" },
    { tag: "Agent 能力", goal: "GUI / 文档 / 工具调用", target: "ScreenSpot-Pro ≥ 40,可上线门槛" },
    { tag: "Text 保真(硬约束)", goal: "保留 base 文本能力", target: "MMLU-Pro 相对 base 损 ≤ 2 pt" }
  ];
  const itemTop = lY + 0.55;
  const itemH = (lH - 0.65) / inScope.length;
  inScope.forEach((it, i) => {
    const y = itemTop + i * itemH;
    s.addText([
      { text: "▸ " + it.tag + " ", options: { color: COLOR.good, bold: true, fontSize: 11 } },
      { text: it.goal, options: { color: COLOR.ink, fontSize: 10, breakLine: true } },
      { text: "  目标: ", options: { color: COLOR.red, bold: true, fontSize: 9 } },
      { text: it.target, options: { color: COLOR.warn, bold: true, fontSize: 9, italic: true } }
    ], { x: lX + 0.12, y, w: lW - 0.24, h: itemH - 0.04, margin: 0, fontFace: FONT.zh });
    if (i < inScope.length - 1) {
      s.addShape(pres.shapes.LINE, { x: lX + 0.12, y: y + itemH - 0.04, w: lW - 0.24, h: 0, line: { color: COLOR.inkFaint, width: 0.25 } });
    }
  });

  // 右上:Out-of-Scope
  const rX = 6.85, rY = 0.85, rW = 6.05;
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: rY, w: rW, h: 1.55, fill: { color: "FFFFFF" }, line: { color: COLOR.red, width: 1.0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: rY, w: rW, h: 0.42, fill: { color: COLOR.red }, line: { color: COLOR.red, width: 0 } });
  s.addText("✗ 明确不做(Out-of-Scope)", {
    x: rX + 0.10, y: rY + 0.05, w: rW - 0.20, h: 0.32, color: "FFFFFF", bold: true, fontSize: 13, valign: "middle", fontFace: FONT.zh
  });
  const outScope = [
    { k: "图像 / 语音 / 视频生成", v: "无 Talker / Code2Wav / dNaViT / DiT head" },
    { k: "256K 长上下文", v: "Stage 6 跳过,Phase B 内 48K 即收敛" },
    { k: "自研 audio encoder", v: "AuT 需 40M 小时音频,我方走 Whisper-v3 路线" }
  ];
  outScope.forEach((it, i) => {
    s.addText([
      { text: "✗ " + it.k + " ", options: { color: COLOR.red, bold: true, fontSize: 10 } },
      { text: it.v, options: { color: COLOR.inkSoft, fontSize: 9.5 } }
    ], { x: rX + 0.12, y: rY + 0.50 + i * 0.32, w: rW - 0.24, h: 0.30, margin: 0, fontFace: FONT.zh });
  });

  // 右下:技术栈 + 假设
  const cY = rY + 1.70;
  const cH = 3.35;
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: cY, w: rW, h: cH, fill: { color: "FFFFFF" }, line: { color: COLOR.warn, width: 1.0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: cY, w: rW, h: 0.42, fill: { color: COLOR.warn }, line: { color: COLOR.warn, width: 0 } });
  s.addText("⚙ 技术栈选择 + 关键假设", {
    x: rX + 0.10, y: cY + 0.05, w: rW - 0.20, h: 0.32, color: "FFFFFF", bold: true, fontSize: 13, valign: "middle", fontFace: FONT.zh
  });
  const stack = [
    { tag: "训练框架", v: "HF transformers + FSDP2(避免 Megatron),accelerate optional" },
    { tag: "RL 框架", v: "verl(volcengine/verl),原生支持 GRPO + FSDP + vLLM rollout" },
    { tag: "推理 / Rollout", v: "vLLM(verl rollout 后端 + 评测推理)" },
    { tag: "评测", v: "VLMEvalKit fork + 自家 text 套件" },
    { tag: "Tokenizer", v: "复用 Qwen3.5-4B-base(~151K vocab)+ 添加 ~25 MM special token" },
    { tag: "Vision encoder", v: "SigLIP-SO400M 或 InternViT-300M(2 选 1,T-8 决) + MLP projector" },
    { tag: "Audio encoder", v: "Whisper-large-v3(~5M 小时) + MLP projector" },
    { tag: "实 ckpt 假设", v: "MoE 10B-A2B 新架构,需要本组 vLLM/verl 模型类适配" },
    { tag: "算力", v: "16-32 H100 节点(SFT)+ B200 集群(RL)" }
  ];
  const sTop = cY + 0.50;
  const sH = (cH - 0.60) / stack.length;
  stack.forEach((c, i) => {
    s.addText([
      { text: c.tag + " ", options: { color: COLOR.red, bold: true, fontSize: 9.5 } },
      { text: c.v, options: { color: COLOR.ink, fontSize: 9 } }
    ], { x: rX + 0.12, y: sTop + i * sH, w: rW - 0.24, h: sH - 0.02, margin: 0, fontFace: FONT.zh });
  });

  addRedConclusionBox(s, [
    { tag: "❶ 双阶段策略",
      body: "Phase A 用 Qwen3.5-4B-base 做 proxy 跑通流水线,",
      bold: "实 ckpt 到达后只换 LLM 骨干,",
      warn: " 流水线零返工",
      tail: "" },
    { tag: "❷ 离开 Megatron",
      body: "全栈 HF transformers + FSDP2,RL 用 verl + vLLM,",
      bold: "对齐主流 OSS 生态,",
      warn: " 与 NVIDIA NeMo-RL 配方逻辑等价",
      tail: "" },
    { tag: "❸ Whisper 替代 AuT",
      body: "Qwen3.5-Omni 的 AuT 用 ",
      warn: "40M ",
      bold: "小时音频,我方资源不允许;",
      tail: "Whisper-v3(~5M)足够覆盖理解需求" }
  ]);

  addSources(s, [
    { name: "Qwen3.5-4B-base 模型卡", tail: " (HuggingFace)" },
    { name: "verl(volcengine/verl)", tail: " (OSS RL 框架,FSDP+vLLM)" },
    { name: "三篇 reference design", tail: " (Nemotron / LongCat / Qwen3.5)" }
  ]);
}

// ============================================================
// SLIDE 2 — 路径选型推理(NEW)
// ============================================================
function slide2() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "路径选型推理",
    "借 Nemotron 工程纪律 + Qwen3.5 配方 trick,LongCat 不适用");

  // 主表:三派 vs 我方需求
  const tbl = [
    [
      headerCell("评估维度"),
      headerCell("Nemotron 3 Nano Omni"),
      headerCell("LongCat-Next"),
      headerCell("Qwen3.5-Omni"),
      headerCell("我方判断")
    ],
    [
      rowLabelCell("权重 / 代码开放"),
      metricCell("✓ 全开源", "weights+code+data", COLOR.good),
      metricCell("✓ 全开源", "weights+tokenizer", COLOR.good),
      metricCell("✗ 仅 API", "无权重无代码", COLOR.red),
      metricCell("淘汰 Qwen3.5 整体", "可借配方,不可借代码", COLOR.warn)
    ],
    [
      rowLabelCell("匹配理解-only"),
      metricCell("✓ 完美", "本就只做理解", COLOR.good),
      metricCell("✗ 错配", "5.3 pt 文本税换\n图像生成(我方不要)", COLOR.red),
      metricCell("~ 部分", "Talker 部分对我方无用", COLOR.warn),
      metricCell("淘汰 LongCat", "为不需要的能力付代价", COLOR.red)
    ],
    [
      rowLabelCell("Audio encoder 资源门槛", COLOR.ink),
      metricCell("Whisper / Parakeet", "我方可用", COLOR.good),
      metricCell("Whisper + 自训 RVQ", "RVQ 我方不需要", COLOR.warn),
      metricCell("AuT 自研(40M 小时)", "我方无此数据规模", COLOR.red),
      metricCell("Nemotron 同档", "Whisper 即可", COLOR.good)
    ],
    [
      rowLabelCell("RL 配方"),
      metricCell("5 段 GSPO + MPO", "+ NeMo-RL 开源", COLOR.good),
      metricCell("未细化", "(论文未公开)", COLOR.inkSoft),
      metricCell("Thinker 3+Talker 4 段", "Specialist+OPD 配方公开", COLOR.warn),
      metricCell("Nemotron 主线 + Qwen3.5 OPD", "Nemotron 给骨架,Qwen3.5 给点睛", COLOR.warn)
    ],
    [
      rowLabelCell("框架技术栈"),
      metricCell("Megatron-Bridge", "+ NeMo-RL", COLOR.warn),
      metricCell("自研框架", "未公开", COLOR.inkSoft),
      metricCell("内部框架", "无外部代码", COLOR.red),
      metricCell("我方走 HF/FSDP/verl", "三家代码全不直接复用", COLOR.warn)
    ],
    [
      rowLabelCell("文本保真证据"),
      metricCell("MMLU-Pro 损 1.0", "AIME25 损 7.0", COLOR.warn),
      metricCell("MMLU 损 5.3", "MMLU-Pro 损 5.9", COLOR.red),
      metricCell("MMLU-Pro 损 0.9", "Redux 损 0.1", COLOR.good),
      metricCell("Qwen3.5 配方对文本最友好", "OPD trick 是关键", COLOR.warn)
    ],
    [
      rowLabelCell("我方采纳决定", COLOR.red),
      metricCell("✓ 主线", "工程纪律 + Stage 划分", COLOR.good),
      metricCell("✗ 不用", "用例错配", COLOR.red),
      metricCell("◐ 借 trick", "OPD + Specialist (可选)", COLOR.warn),
      metricCell("Nemotron-Lite + OPD", "在 HF/verl 上重实现", COLOR.red)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: 0.85, w: 12.5, h: 4.30,
    colW: [1.95, 2.50, 2.50, 2.55, 3.00],
    rowH: [0.50, 0.55, 0.65, 0.55, 0.65, 0.55, 0.50, 0.55],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  // 底部:决策逻辑链
  const dY = 5.30;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: dY, w: 12.5, h: 0.82,
    fill: { color: COLOR.cardYellow }, line: { color: COLOR.warn, width: 0.75 }
  });
  s.addText([
    { text: "决策链: ", options: { color: COLOR.red, bold: true, fontSize: 12 } },
    { text: "(1)我方做理解-only ", options: { color: COLOR.ink, bold: true, fontSize: 11 } },
    { text: "→ LongCat 用例错配,",  options: { color: COLOR.warn, fontSize: 10 } },
    { text: "5.3 pt 文本税换不要的图像生成", options: { color: COLOR.red, bold: true, fontSize: 10 } },
    { text: "  ✗\n", options: { color: COLOR.red, bold: true, fontSize: 12, breakLine: true } },
    { text: "(2)我方走 HF/FSDP/verl ", options: { color: COLOR.ink, bold: true, fontSize: 11 } },
    { text: "→ Nemotron 工程要 port 到 HF;Qwen3.5 无代码可 port", options: { color: COLOR.warn, fontSize: 10 } },
    { text: "  ⊕ ", options: { color: COLOR.warn, bold: true, fontSize: 12 } },
    { text: "(3)Nemotron 7+5 阶段划分 + GSPO 给骨架,Qwen3.5 OPD trick 即插即用", options: { color: COLOR.warn, bold: true, fontSize: 10 } },
    { text: "  →  ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "Nemotron-Lite ⊕ OPD on HF stack", options: { color: COLOR.red, bold: true, fontSize: 11 } }
  ], { x: 0.50, y: dY + 0.05, w: 12.30, h: 0.70, valign: "middle", fontFace: FONT.zh });

  addRedConclusionBox(s, [
    { tag: "❶ LongCat 直接淘汰",
      body: "为不需要的图像生成付出 ",
      warn: "5.3 pt MMLU 损 ",
      bold: "无任何收益,理解-only 场景路径错配",
      tail: "" },
    { tag: "❷ Qwen3.5 整体不可复现",
      body: "API-only + AuT 需 40M 小时音频,",
      bold: "代码无法 fork,数据门槛过高",
      warn: ";只取 OPD / Specialist Distillation 两个配方",
      tail: "" },
    { tag: "❸ Nemotron 也不直接复用",
      body: "Megatron-Bridge / NeMo-RL 与我方 HF 栈不兼容;",
      bold: "借的是「7 阶段 + 5 段 RL」的配方逻辑,",
      warn: " 实现在 HF/verl 上重做",
      tail: "" }
  ]);

  addSources(s, [
    { name: "三篇 reference design 原报告", tail: "" },
    { name: "verl 与 NeMo-RL 算法对照", tail: " (内部技术评估)" }
  ]);
}

// ============================================================
// SLIDE 3 — 两阶段路线图
// ============================================================
function slide3() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "两阶段路线图",
    "Phase A proxy 训练 → Phase B ckpt 切换,流水线零返工设计");

  // 时间轴
  const tlY = 0.95;
  const tlX = 0.4;
  const tlW = 12.5;
  s.addShape(pres.shapes.LINE, {
    x: tlX, y: tlY + 0.30, w: tlW, h: 0,
    line: { color: COLOR.ink, width: 1.5 }
  });
  const milestones = [
    { x: 0.0, label: "T-12 周", desc: "Phase A 启动", color: COLOR.brandB },
    { x: 0.18, label: "T-8", desc: "数据 + 评测 ready", color: COLOR.brandB },
    { x: 0.34, label: "T-4", desc: "Proxy SFT 跑通", color: COLOR.brandB },
    { x: 0.48, label: "T = 0", desc: "实 ckpt 到达", color: COLOR.red },
    { x: 0.55, label: "T+2", desc: "Sanity + 切换", color: COLOR.warn },
    { x: 0.68, label: "T+8", desc: "实 ckpt SFT 完成", color: COLOR.warn },
    { x: 0.83, label: "T+14", desc: "RL 完成", color: COLOR.warn },
    { x: 1.0, label: "T+18", desc: "上线评估", color: COLOR.good }
  ];
  milestones.forEach(m => {
    const mx = tlX + m.x * tlW;
    s.addShape(pres.shapes.OVAL, {
      x: mx - 0.10, y: tlY + 0.20, w: 0.20, h: 0.20,
      fill: { color: m.color }, line: { color: m.color, width: 0 }
    });
    s.addText(m.label, {
      x: mx - 0.85, y: tlY - 0.08, w: 1.70, h: 0.22,
      color: m.color, bold: true, fontSize: 9, align: "center", fontFace: FONT.zh
    });
    s.addText(m.desc, {
      x: mx - 0.85, y: tlY + 0.45, w: 1.70, h: 0.22,
      color: COLOR.inkSoft, fontSize: 8, italic: true, align: "center", fontFace: FONT.zh
    });
  });
  // ckpt 到达竖线
  const ckptX = tlX + 0.48 * tlW;
  s.addShape(pres.shapes.LINE, {
    x: ckptX, y: tlY - 0.10, w: 0, h: 0.95,
    line: { color: COLOR.red, width: 2.0, dashType: "dash" }
  });

  // Swimlanes
  const swimY = 1.95;
  const swimH = 1.20;
  const lanes = [
    {
      y: swimY, label: "Phase A\nProxy 训练\n(T-12 → T)", color: COLOR.brandB,
      blocks: [
        { x: 0.0, w: 0.18, text: "数据 + tokenizer\n+ 评测 harness", c: COLOR.brandB },
        { x: 0.18, w: 0.16, text: "encoder 选 + projector\n+ HF/FSDP 代码", c: COLOR.brandB },
        { x: 0.34, w: 0.14, text: "Proxy 全流水线\nSFT+RL 跑通", c: COLOR.brandB }
      ]
    },
    {
      y: swimY + swimH + 0.10, label: "Phase B\nckpt 切换\n+ 实训\n(T → T+8)", color: COLOR.warn,
      blocks: [
        { x: 0.48, w: 0.07, text: "Sanity\n+ 模型类\n适配", c: COLOR.red },
        { x: 0.55, w: 0.13, text: "实 ckpt 走 SFT 5 段\n(配置只换 LLM 路径)", c: COLOR.warn }
      ]
    },
    {
      y: swimY + 2 * (swimH + 0.10), label: "Phase B\nRL + 上线\n(T+8 → T+18)", color: COLOR.red,
      blocks: [
        { x: 0.68, w: 0.15, text: "verl + vLLM rollout\nMPO → Image-RL → Text-RL S2", c: COLOR.red },
        { x: 0.83, w: 0.17, text: "评测 + 文本回归 +\n上线判定", c: COLOR.good }
      ]
    }
  ];
  lanes.forEach(lane => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: tlX, y: lane.y, w: 1.40, h: swimH,
      fill: { color: lane.color }, line: { color: lane.color, width: 0 }
    });
    s.addText(lane.label, {
      x: tlX + 0.05, y: lane.y, w: 1.30, h: swimH,
      color: "FFFFFF", bold: true, fontSize: 11, align: "center", valign: "middle", fontFace: FONT.zh
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: tlX + 1.50, y: lane.y, w: tlW - 1.50, h: swimH,
      fill: { color: COLOR.cardGray }, line: { color: COLOR.inkFaint, width: 0.5 }
    });
    lane.blocks.forEach(b => {
      const bX = tlX + 1.50 + b.x * (tlW - 1.50);
      const bW = b.w * (tlW - 1.50);
      s.addShape(pres.shapes.RECTANGLE, {
        x: bX + 0.04, y: lane.y + 0.08, w: bW - 0.08, h: swimH - 0.16,
        fill: { color: "FFFFFF" }, line: { color: b.c, width: 1.0 }
      });
      s.addText(b.text, {
        x: bX + 0.06, y: lane.y + 0.10, w: bW - 0.12, h: swimH - 0.20,
        color: b.c, bold: true, fontSize: 9, align: "center", valign: "middle", fontFace: FONT.zh
      });
    });
  });

  addRedConclusionBox(s, [
    { tag: "❶ Phase A 不是「准备」",
      body: "Phase A 12 周交付的是 ",
      bold: "可运行的 omni 理解 proxy 模型",
      warn: ",流水线已经端到端跑过,",
      tail: "ckpt 到达只是换 LLM" },
    { tag: "❷ Phase B 仅 18 周",
      body: "vs v1 的 24 周,",
      warn: "省 6 周 ",
      bold: "因为流水线在 Phase A 已验证,",
      tail: "Phase B 不需要 R&D 时间" },
    { tag: "❸ ckpt 切换 = 改配置",
      body: "理想情况只需改 ",
      bold: "model_path / model_class / tokenizer_path,",
      warn: " 数据/RL/eval 三栈零改动",
      tail: "" }
  ]);

  addSources(s, [
    { name: "内部 Phase 切换协议", tail: " (T+0 → T+2 设 1 道 Sanity gate)" },
    { name: "Nemotron 7+5 阶段时间估算", tail: " (按 10B-A2B 缩放)" }
  ]);
}

// ============================================================
// SLIDE 4 — Pre-arrival = Phase A 全流水线
// ============================================================
function slide4() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "Phase A 交付物",
    "12 周内训出 Qwen3.5-4B + Vision/Audio 的 proxy omni 模型");

  // 5 流改造:都以「为 proxy 训练交付」为目标
  const streams = [
    {
      tag: "①", title: "数据流水线", color: COLOR.brandB,
      owner: "Data team (2-3 人)",
      tasks: [
        "Vision: LLaVA-OneVision-Data + Cambrian-7M + Cauldron 全量",
        "Audio: Granary v1.1 + AudioCaps + WavCaps + Common Voice",
        "Video: ShareGPT4Video + LLaVA-Video-178K(短中视频为主)",
        "交错图文: MMC4 / OBELICS(关键稀缺,T-12 立项)",
        "Tokenize 用 Qwen3.5-4B-base tokenizer 预处理 + webdataset 分片"
      ],
      deliverable: "T-8 前:全量 tokenized 数据落盘,~200B token 池就绪",
      dependency: "无(完全独立)"
    },
    {
      tag: "②", title: "评测 harness", color: COLOR.good,
      owner: "Eval team (1-2 人)",
      tasks: [
        "VLMEvalKit fork + 内部分支(支持自建 base + custom model class)",
        "8 维 36 项整合(MMMU/DocVQA/VideoMME/OpenASR/ScreenSpot-Pro/...)",
        "文本回归套件:MMLU-Pro / AIME25 / IFBench / LiveCodeBench v6",
        "每 1B token 自动 mini-eval + 每 5B token 全量 + WandB 仪表盘",
        "vLLM serving 接 eval pipeline(避免 HF generate 慢评测)"
      ],
      deliverable: "T-10 前:harness 通过,Qwen2.5-VL-7B 基线对照跑出",
      dependency: "无"
    },
    {
      tag: "③", title: "训练代码(HF/FSDP)", color: COLOR.warn,
      owner: "Eng team (2 人)",
      tasks: [
        "HF transformers + FSDP2 训练 loop(避开 Megatron)",
        "MoE-aware FSDP wrap policy(为 Phase B 实 ckpt 准备)",
        "Encoder hot-swap(SigLIP/InternViT/RADIO 切换 + projector 模板)",
        "verl 接入 + GRPO/GSPO 实现验证(GSPO 可能需要自实现)",
        "vLLM 模型类 stub(为 Phase B 自家 MoE 架构预留接口)"
      ],
      deliverable: "T-6 前:代码全跑通,Qwen3.5-4B + SigLIP Stage 0 训出",
      dependency: "Tokenizer 决策(⑤)"
    },
    {
      tag: "④", title: "Encoder 选型 + 训练", color: COLOR.brandA,
      owner: "Research (1-2 人)",
      tasks: [
        "Vision: SigLIP-SO400M vs InternViT-300M 在 Qwen3.5-4B 上对照",
        "Audio: Whisper-large-v3 + MLP projector(Parakeet 备选)",
        "Video: 复用 Vision encoder + Conv3D 时序压缩(Nemotron 同方案)",
        "EVS(Efficient Video Sampling)实现 + q ∈ [0.5, 0.9] 调参",
        "T-2 前完成 Stage 0/1 训练(在 Qwen3.5-4B 上)"
      ],
      deliverable: "T-2 前:Stage 0/1 完成,proxy 模型 MMMU ≥ 50",
      dependency: "②(评测)+ ③(代码)"
    },
    {
      tag: "⑤", title: "Tokenizer 决策", color: COLOR.red,
      owner: "Cross-team (1 人)",
      tasks: [
        "复用 Qwen3.5-4B-base tokenizer(~151K vocab)",
        "添加 ~25 个多模态 special token(详见 Slide 5)",
        "新 token embedding 用近义文本 token mean 初始化",
        "对齐预训练 team:确认实 ckpt 使用同 tokenizer 家族 / 词表是否一致",
        "若实 ckpt 词表不同:retokenize 数据(预留 1-2 周)"
      ],
      deliverable: "T-12 前:tokenizer 规范文档发布,数据预处理依赖此",
      dependency: "强依赖预训练 team(每 2 周对齐)"
    }
  ];

  const baseY = 0.85;
  const cardW = 4.10;
  const cardH = 2.50;
  const positions = [
    { x: 0.4, y: baseY },
    { x: 4.60, y: baseY },
    { x: 8.80, y: baseY },
    { x: 0.4, y: baseY + cardH + 0.10 },
    { x: 4.60, y: baseY + cardH + 0.10 }
  ];
  positions[4].w = cardW * 2 + 0.10;

  streams.forEach((st, i) => {
    const p = positions[i];
    const w = p.w || cardW;
    s.addShape(pres.shapes.RECTANGLE, {
      x: p.x, y: p.y, w, h: cardH,
      fill: { color: "FFFFFF" }, line: { color: st.color, width: 1.0 }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: p.x, y: p.y, w, h: 0.40,
      fill: { color: st.color }, line: { color: st.color, width: 0 }
    });
    s.addText([
      { text: st.tag + "  ", options: { color: "FFFFFF", bold: true, fontSize: 14 } },
      { text: st.title, options: { color: "FFFFFF", bold: true, fontSize: 13 } },
      { text: "   " + st.owner, options: { color: "FFFFFF", fontSize: 10, italic: true } }
    ], { x: p.x + 0.10, y: p.y + 0.04, w: w - 0.20, h: 0.32, valign: "middle", fontFace: FONT.zh });

    const taskTop = p.y + 0.45;
    const taskH = 0.27;
    st.tasks.forEach((t, j) => {
      s.addText([
        { text: "▸ ", options: { color: st.color, bold: true, fontSize: 10 } },
        { text: t, options: { color: COLOR.ink, fontSize: 9 } }
      ], { x: p.x + 0.12, y: taskTop + j * taskH, w: w - 0.24, h: taskH - 0.02, margin: 0, fontFace: FONT.zh });
    });
    const dY = p.y + cardH - 0.55;
    s.addShape(pres.shapes.LINE, {
      x: p.x + 0.10, y: dY - 0.04, w: w - 0.20, h: 0,
      line: { color: COLOR.inkFaint, width: 0.5 }
    });
    s.addText([
      { text: "交付  ", options: { color: COLOR.red, bold: true, fontSize: 9 } },
      { text: st.deliverable, options: { color: COLOR.ink, fontSize: 9 } }
    ], { x: p.x + 0.12, y: dY, w: w - 0.24, h: 0.22, margin: 0, fontFace: FONT.zh });
    s.addText([
      { text: "依赖  ", options: { color: COLOR.warn, bold: true, fontSize: 9 } },
      { text: st.dependency, options: { color: COLOR.inkSoft, fontSize: 9, italic: true } }
    ], { x: p.x + 0.12, y: dY + 0.24, w: w - 0.24, h: 0.22, margin: 0, fontFace: FONT.zh });
  });

  addRedConclusionBox(s, [
    { tag: "❶ T 时刻已有 proxy 模型",
      body: "Phase A 不只是「准备好工具」,",
      bold: "Qwen3.5-4B + SigLIP + Whisper 的 omni proxy 已经训出,",
      warn: " 这是与 v1 的本质差别",
      tail: "" },
    { tag: "❷ MMC4/OBELICS 是死结",
      body: "这两个交错图文资源 ",
      warn: "T-12 必须立项 ",
      bold: "(下载 + 清洗 + 标注耗时 8 周),",
      tail: "迟则 Stage 1 训不出来" },
    { tag: "❸ vLLM 模型类预留",
      body: "Phase A 用 Qwen3.5(vLLM 已支持),Phase B 自家 MoE 架构 ",
      bold: "需要本组提供 vLLM 模型类,",
      warn: " 这个工作要在 Phase B 第 1 周完成",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Qwen3.5-4B-base + SigLIP-SO400M / Whisper-v3", tail: " (HF model hub)" },
    { name: "verl + vLLM 集成模式", tail: " (GitHub 文档)" },
    { name: "VLMEvalKit", tail: " (开源评测)" }
  ]);
}

// ============================================================
// SLIDE 5 — Tokenizer 计划(NEW)
// ============================================================
function slide5() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "Tokenizer 复用",
    "Qwen3.5-4B 词表 + 25 个 MM 特殊 token,Phase B 切换风险预案");

  // 顶部:tokenizer 公式
  const fY = 0.85;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: fY, w: 12.5, h: 0.85,
    fill: { color: COLOR.cardGray }, line: { color: COLOR.ink, width: 0.5 }
  });
  s.addText([
    { text: "我方 Tokenizer = ", options: { color: COLOR.ink, bold: true, fontSize: 12 } },
    { text: "Qwen3.5-4B-base ", options: { color: COLOR.brandB, bold: true, fontSize: 12 } },
    { text: "(~151,936 BPE,中英多语)", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "  ⊕  ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "+25 multimodal special tokens ", options: { color: COLOR.warn, bold: true, fontSize: 12 } },
    { text: "(vision/audio/video placeholder + role token)", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "  ⇒  最终词表 ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "~151,961 tokens", options: { color: COLOR.warn, bold: true, fontSize: 12 } }
  ], { x: 0.50, y: fY + 0.10, w: 12.30, h: 0.70, valign: "middle", fontFace: FONT.zh });

  // 左:新增 token 明细
  const lX = 0.4, lY = 1.95, lW = 6.30, lH = 4.05;
  const tokTbl = [
    [
      headerCell("分组"),
      headerCell("Token 列表"),
      headerCell("数量"),
      headerCell("初始化策略")
    ],
    [
      rowLabelCell("Vision", COLOR.brandB),
      metricCell("<|vision_start|>", "<|vision_end|> <|image_pad|>", COLOR.ink),
      metricCell("3", "—", COLOR.warn),
      metricCell("近义 token 平均", "<image><img></img>", COLOR.good)
    ],
    [
      rowLabelCell("Audio", COLOR.brandA),
      metricCell("<|audio_start|>", "<|audio_end|> <|audio_pad|>", COLOR.ink),
      metricCell("3", "—", COLOR.warn),
      metricCell("近义 token 平均", "<audio>...", COLOR.good)
    ],
    [
      rowLabelCell("Video", COLOR.warn),
      metricCell("<|video_start|>", "<|video_end|> <|frame_pad|>", COLOR.ink),
      metricCell("3", "—", COLOR.warn),
      metricCell("vision token + 时序前缀", "—", COLOR.good)
    ],
    [
      rowLabelCell("结构 / 角色", COLOR.red),
      metricCell("<|im_start|> <|im_end|>", "<|tool_call|> 等 ChatML 已有,只补 <|grounding|>/<|bbox|>", COLOR.ink),
      metricCell("~10", "ChatML 大部分已存在", COLOR.warn),
      metricCell("已存在不重复加", "新增小批量随机 init σ=0.02", COLOR.good)
    ],
    [
      rowLabelCell("OCR / Doc", COLOR.brandB),
      metricCell("<|ocr_start|>", "<|ocr_end|> + table 结构 token", COLOR.ink),
      metricCell("~6", "—", COLOR.warn),
      metricCell("文本 token 平均", "—", COLOR.good)
    ],
    [
      rowLabelCell("合计新增", COLOR.red),
      metricCell("—", "—", COLOR.ink),
      metricCell("~25", "(可调 ±5)", COLOR.warn),
      metricCell("Stage 0 解冻 embedding", "其余冻结", COLOR.warn)
    ]
  ];
  s.addTable(tokTbl, {
    x: lX, y: lY, w: lW, h: lH,
    colW: [1.40, 2.80, 0.80, 1.30],
    rowH: [0.50, 0.55, 0.55, 0.55, 0.65, 0.55, 0.70],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  // 右:Phase B 切换协议
  const rX = 6.85, rY = 1.95, rW = 6.05, rH = 4.05;
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: rH,
    fill: { color: "FFFFFF" }, line: { color: COLOR.red, width: 1.0 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: 0.40,
    fill: { color: COLOR.red }, line: { color: COLOR.red, width: 0 }
  });
  s.addText("⚠ Phase B(实 ckpt 到达)Tokenizer 切换协议", {
    x: rX + 0.10, y: rY + 0.05, w: rW - 0.20, h: 0.32,
    color: "FFFFFF", bold: true, fontSize: 12, valign: "middle", fontFace: FONT.zh
  });

  const switchPlan = [
    {
      cond: "Case 1: 实 ckpt 用 Qwen3.5 同一 tokenizer",
      action: "理想情况:tokenizer 完全复用,只把 25 个 MM special token append 即可",
      cost: "0 周(零返工)",
      color: COLOR.good
    },
    {
      cond: "Case 2: 同家族,词表略有差异(±5%)",
      action: "对比 vocab.json,补缺漏 token + retokenize 受影响的样本(<10%)",
      cost: "1-2 周",
      color: COLOR.warn
    },
    {
      cond: "Case 3: 完全不同 tokenizer",
      action: "全量 retokenize 200B token 数据池;评测脚本/RL prompt template 全部重做",
      cost: "3-4 周(严重)",
      color: COLOR.red
    },
    {
      cond: "对预训练 team 的 SLA 请求",
      action: "T-10 前确认实 ckpt 词表与 Qwen3.5 兼容性;不兼容需提前 4 周通告",
      cost: "需立 alert",
      color: COLOR.red
    }
  ];
  switchPlan.forEach((sp, i) => {
    const y = rY + 0.50 + i * 0.85;
    s.addText(sp.cond, {
      x: rX + 0.10, y, w: rW - 0.20, h: 0.24,
      color: sp.color, bold: true, fontSize: 11, fontFace: FONT.zh
    });
    s.addText(sp.action, {
      x: rX + 0.10, y: y + 0.24, w: rW - 0.20, h: 0.36,
      color: COLOR.ink, fontSize: 9, fontFace: FONT.zh
    });
    s.addText([
      { text: "成本: ", options: { color: COLOR.red, bold: true, fontSize: 9 } },
      { text: sp.cost, options: { color: sp.color, bold: true, fontSize: 9.5 } }
    ], { x: rX + 0.10, y: y + 0.60, w: rW - 0.20, h: 0.18, fontFace: FONT.zh });
    if (i < switchPlan.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: rX + 0.10, y: y + 0.80, w: rW - 0.20, h: 0,
        line: { color: COLOR.inkFaint, width: 0.5 }
      });
    }
  });

  addRedConclusionBox(s, [
    { tag: "❶ 复用胜过重训",
      body: "复用 Qwen3.5-4B tokenizer 能完整继承预训练 team 已学到的词表分布,",
      bold: "vs 自训 BPE 的 NLU 能力差距 ~3-5 个 MMLU 点",
      warn: "",
      tail: "" },
    { tag: "❷ 25 个 token 是 Qwen2-VL/3-Omni 标准做法",
      body: "vision/audio/video placeholder + grounding/bbox 是 ",
      bold: "open-source 最佳实践,",
      warn: " 直接照抄,无创新风险",
      tail: "" },
    { tag: "❸ Case 3 是最大风险",
      body: "若实 ckpt 用全新 tokenizer,",
      warn: "数据 retokenize 4 周 + RL prompt 重做,",
      bold: "Phase B 整体延迟 4 周,T-10 必须签 SLA",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Qwen3.5 / Qwen3-VL tokenizer 设计", tail: " (HF tokenizer.json)" },
    { name: "Qwen2-VL / Qwen3-Omni MM special token 列表", tail: " (开源代码参考)" },
    { name: "Embedding 平均初始化方法", tail: " (常见实践,LLaVA 等同方法)" }
  ]);
}

// ============================================================
// SLIDE 6 — SFT 配方(按 10B-A2B 重新缩放)
// ============================================================
function slide6() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "SFT 配方 (10B-A2B 缩放版)",
    "5 段 ~200B token,基于 active params 比例 + 跳 Stage 6");

  // 顶部:缩放公式
  const fY = 0.85;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: fY, w: 12.5, h: 0.85,
    fill: { color: COLOR.cardGray }, line: { color: COLOR.ink, width: 0.5 }
  });
  s.addText([
    { text: "Token 预算缩放推理: ", options: { color: COLOR.red, bold: true, fontSize: 12 } },
    { text: "Nemotron 30B-A3B = 466.9B token  ", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "→ ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "我方 10B-A2B 按 active params 缩放(2/3 ≈ 67%)= 312B  ", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "→ ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "扣 Stage 6 256K 节省(-34B)", options: { color: COLOR.warn, bold: true, fontSize: 11 } },
    { text: "  +  ", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "Stage 5 缩到 15B(-15B)", options: { color: COLOR.warn, bold: true, fontSize: 11 } },
    { text: "  +  ", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "其它阶段同比例缩  ", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "≈ ~200B ", options: { color: COLOR.red, bold: true, fontSize: 13 } },
    { text: "(占 Nemotron 43%)", options: { color: COLOR.inkSoft, italic: true, fontSize: 10 } }
  ], { x: 0.50, y: fY + 0.10, w: 12.30, h: 0.70, valign: "middle", fontFace: FONT.zh });

  // 主表
  const tY = 1.95;
  const tH = 3.30;
  const tbl = [
    [
      headerCell("阶段"),
      headerCell("Context"),
      headerCell("Nemotron 原值\n(30B-A3B)"),
      headerCell("我方 token\n(10B-A2B)"),
      headerCell("缩放系数"),
      headerCell("FSDP / 算力"),
      headerCell("周数")
    ],
    [
      rowLabelCell("Stage 0\nVision Proj", COLOR.brandB),
      metricCell("16K", "—", COLOR.ink),
      metricCell("15.5B", "—", COLOR.ink),
      metricCell("~5B", "—", COLOR.warn),
      metricCell("0.32", "fixed step", COLOR.warn),
      metricCell("8 H100", "FSDP, BS=128", COLOR.good),
      metricCell("0.5 周", "—", COLOR.good)
    ],
    [
      rowLabelCell("Stage 1\nVision SFT", COLOR.warn),
      metricCell("16K", "—", COLOR.ink),
      metricCell("215B", "Nemotron 主战场", COLOR.warn),
      metricCell("~110B", "—", COLOR.warn),
      metricCell("0.51", "略压缩", COLOR.warn),
      metricCell("16-32 H100", "FSDP, mixed precision", COLOR.warn),
      metricCell("3-4 周", "—", COLOR.warn)
    ],
    [
      rowLabelCell("Stage 2/3\nAudio Enc+Proj", COLOR.brandA),
      metricCell("16K", "—", COLOR.ink),
      metricCell("11.4 + 100.5\n=112B", "—", COLOR.ink),
      metricCell("~30B", "S2:5B + S3:25B", COLOR.warn),
      metricCell("0.27", "audio 任务相对简单", COLOR.warn),
      metricCell("8-16 H100", "FSDP", COLOR.good),
      metricCell("2 周", "—", COLOR.good)
    ],
    [
      rowLabelCell("Stage 4\nOmni SFT 16K", COLOR.warn),
      metricCell("16K", "联合", COLOR.ink),
      metricCell("57.3B", "—", COLOR.ink),
      metricCell("~35B", "+ OPD 配对样本", COLOR.warn),
      metricCell("0.61", "—", COLOR.warn),
      metricCell("16-32 H100", "FSDP", COLOR.warn),
      metricCell("2-3 周", "—", COLOR.warn)
    ],
    [
      rowLabelCell("Stage 5\nOmni SFT 48K", COLOR.warn),
      metricCell("48K", "扩 3×", COLOR.warn),
      metricCell("33.5B", "—", COLOR.ink),
      metricCell("~15B", "video + 长文档", COLOR.warn),
      metricCell("0.45", "context 大但样本少", COLOR.warn),
      metricCell("16-32 H100", "FSDP + ctx parallel", COLOR.warn),
      metricCell("2 周", "—", COLOR.warn)
    ],
    [
      rowLabelCell("⊘ Stage 6\n256K", COLOR.red),
      metricCell("256K", "跳过", COLOR.red),
      metricCell("34B", "—", COLOR.inkSoft),
      metricCell("0", "省时省钱", COLOR.good),
      metricCell("0", "—", COLOR.red),
      metricCell("—", "256K 训练成本翻倍", COLOR.inkSoft),
      metricCell("—", "省 4 周", COLOR.good)
    ],
    [
      rowLabelCell("总计", COLOR.red),
      metricCell("—", "—", COLOR.ink),
      metricCell("466.9B", "Nemotron 全栈", COLOR.ink),
      metricCell("~195B", "+ OPD ~5B = 200B", COLOR.warn),
      metricCell("0.43", "符合 active params 比例", COLOR.warn),
      metricCell("16-32 H100", "全程", COLOR.warn),
      metricCell("9-11 周", "Phase B SFT", COLOR.warn)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: tY, w: 12.5, h: tH,
    colW: [1.40, 0.90, 1.50, 1.65, 1.40, 2.55, 1.10],
    rowH: [0.45, 0.40, 0.45, 0.45, 0.45, 0.45, 0.40, 0.40],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  // 底部:缩放理由 + Phase A vs Phase B 对比
  const bY = tY + tH + 0.20;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: bY, w: 12.5, h: 0.55,
    fill: { color: COLOR.cardYellow }, line: { color: COLOR.warn, width: 0.75 }
  });
  s.addText([
    { text: "为什么 ~200B 而不是 466.9B: ", options: { color: COLOR.red, bold: true, fontSize: 11 } },
    { text: "(1)active params 2/3:active 越小 token 饱和越快  ", options: { color: COLOR.ink, fontSize: 10 } },
    { text: "(2)跳 Stage 6 = 省 34B  ", options: { color: COLOR.warn, fontSize: 10 } },
    { text: "(3)Stage 1 vision SFT 缩 50%(我方场景比 Nemotron 窄)  ", options: { color: COLOR.warn, fontSize: 10 } },
    { text: "(4)Phase A 在 Qwen3.5-4B 上跑 100B token 验证,Phase B 实 ckpt 跑 200B", options: { color: COLOR.ink, bold: true, fontSize: 10 } }
  ], { x: 0.50, y: bY + 0.10, w: 12.30, h: 0.40, valign: "middle", fontFace: FONT.zh });

  addRedConclusionBox(s, [
    { tag: "❶ 缩放有据可依",
      body: "200B = 466.9B × 0.43,与 active params 比例 ",
      bold: "(2/3 = 0.67) ",
      warn: "× Stage 跳过折损(0.65) 一致",
      tail: ",非拍脑袋数字" },
    { tag: "❷ Phase A 100B 试水",
      body: "用 Qwen3.5-4B 做 proxy 时跑 ",
      bold: "100B token 即够",
      warn: "(更小模型饱和更快),",
      tail: "Phase B 实 ckpt 再扩到 200B" },
    { tag: "❸ FSDP2 单纯",
      body: "10B-A2B 在 16-32 H100(FSDP2 + mixed precision)即可,",
      bold: "无需 TP / PP,",
      warn: " Stage 5 加 context parallel",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Nemotron 7 阶段原始 token 量", tail: " (arxiv 2604.24954)" },
    { name: "Chinchilla scaling law + active params 经验", tail: " (内部估算)" },
    { name: "PyTorch FSDP2 / accelerate 文档", tail: "" }
  ]);
}

// ============================================================
// SLIDE 7 — 数据规模(按新 token 量更新)
// ============================================================
function slide7() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "数据规模 + 来源",
    "200B token 总池,vision 55% / audio 15% / video 10% / text 20%");

  const tbl = [
    [
      headerCell("模态 / 阶段"),
      headerCell("主用数据集"),
      headerCell("规模(样本)"),
      headerCell("我方 token"),
      headerCell("状态"),
      headerCell("Owner / 风险")
    ],
    [
      rowLabelCell("Vision Pretrain\n(Stage 0)", COLOR.brandB),
      metricCell("LLaVA-Pretrain", "+ ShareGPT4V + DenseFusion", COLOR.ink),
      metricCell("~3M", "图文对", COLOR.ink),
      metricCell("~5B", "短文 caption", COLOR.warn),
      metricCell("✓ 全开源", "T-12 起下载", COLOR.good),
      metricCell("Data team", "无风险", COLOR.good)
    ],
    [
      rowLabelCell("Vision SFT\n(Stage 1)", COLOR.brandB),
      metricCell("LLaVA-OneVision-Data", "+ Cambrian-7M + Cauldron + ALLaVA", COLOR.ink),
      metricCell("~25M", "复合指令", COLOR.warn),
      metricCell("~110B", "Stage 1 主战场", COLOR.warn),
      metricCell("✓ 全开源", "+ 自建 CoT 数据", COLOR.good),
      metricCell("Data + Research", "CoT 数据需自合成 ~5B", COLOR.warn)
    ],
    [
      rowLabelCell("Audio Pretrain + SFT\n(Stage 2/3)", COLOR.brandA),
      metricCell("Granary v1.1 ASR", "+ AudioCaps + WavCaps + CV", COLOR.ink),
      metricCell("~25M", "音频任务", COLOR.warn),
      metricCell("~30B", "ASR + AQA + Music", COLOR.warn),
      metricCell("✓ 公开", "Granary HF 直接拉", COLOR.good),
      metricCell("Data team", "AudioSet 仅 label", COLOR.warn)
    ],
    [
      rowLabelCell("Omni 混合\n(Stage 4)", COLOR.warn),
      metricCell("V+A+T 混采", "+ ShareGPT4Video + 短视频 + 安全", COLOR.ink),
      metricCell("~6M", "混合", COLOR.warn),
      metricCell("~35B", "5:3:2 比例 + OPD 配对", COLOR.warn),
      metricCell("⚠ 自建", "比例需调优", COLOR.warn),
      metricCell("Research", "OPD 配对 ~2 人 4 周自合成", COLOR.red)
    ],
    [
      rowLabelCell("中长视频\n(Stage 5)", COLOR.warn),
      metricCell("LLaVA-Video-178K", "+ EgoSchema + 部分 LongVideoBench 分布", COLOR.ink),
      metricCell("~1M", "中长视频", COLOR.warn),
      metricCell("~15B", "含视频推理 CoT", COLOR.warn),
      metricCell("⚠ 部分", "需采样长尾", COLOR.warn),
      metricCell("Data + Research", "长视频标注稀缺", COLOR.red)
    ],
    [
      rowLabelCell("Text 保留\n(全程混采)", COLOR.red),
      metricCell("自家文本 SFT 同分布", "(由预训练 team 提供)", COLOR.ink),
      metricCell("—", "按比例混", COLOR.ink),
      metricCell("~40B", "防漂移采样", COLOR.warn),
      metricCell("✗ 待对齐", "需 cross-team SLA", COLOR.red),
      metricCell("Cross-team", "强依赖,T-12 立项", COLOR.red)
    ],
    [
      rowLabelCell("RL 偏好", COLOR.red),
      metricCell("RLHF-V + VLFeedback", "+ POVID + 自标 ScreenSpot 偏好", COLOR.ink),
      metricCell("~150K", "偏好对", COLOR.warn),
      metricCell("~3B", "(短样本,RL 数据)", COLOR.warn),
      metricCell("✓ 公开+自建", "GUI 偏好需自标 ~30K", COLOR.warn),
      metricCell("Eval team + 标注", "标注成本中等", COLOR.warn)
    ],
    [
      rowLabelCell("总计", COLOR.red),
      metricCell("—", "—", COLOR.ink),
      metricCell("~60M+150K", "—", COLOR.ink),
      metricCell("~238B", "(SFT 200B + RL 3B + 安全 35B)", COLOR.warn),
      metricCell("80% ready", "20% 需自建/谈判", COLOR.warn),
      metricCell("3 团队 + 跨团队", "—", COLOR.warn)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: 0.85, w: 12.5, h: 5.10,
    colW: [1.50, 3.10, 1.55, 1.55, 1.95, 2.85],
    rowH: [0.50, 0.55, 0.65, 0.55, 0.65, 0.65, 0.65, 0.55, 0.45],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  addRedConclusionBox(s, [
    { tag: "❶ 80% 数据已开源",
      body: "Vision / Audio / 短视频主体均开源,",
      bold: "Phase A 12 周内完成下载 + tokenize + 分片",
      warn: "",
      tail: "" },
    { tag: "❷ Text 同分布是 R2 风险",
      body: "防漂移的 ",
      warn: "~40B Text 数据 ",
      bold: "必须由预训练 team 提供同分布,",
      tail: "T-12 必须签 SLA;否则退化到公开 Nemotron-text 混合" },
    { tag: "❸ OPD 配对 + GUI 偏好要自建",
      body: "OPD audio-text 配对 ",
      warn: "~5B token + GUI 偏好 ~30K 对,",
      bold: "合计 ~2 人 6 周",
      tail: ",T-8 立项" }
  ]);

  addSources(s, [
    { name: "LLaVA-OneVision / Cambrian / Granary", tail: " (HuggingFace 直接 stream)" },
    { name: "OPD 配对方案", tail: " (Qwen3.5-Omni 论文复刻)" },
    { name: "ScreenSpot 偏好标注流程", tail: " (内部自建)" }
  ]);
}

// ============================================================
// SLIDE 8 — RL 栈(verl + FSDP + vLLM)
// ============================================================
function slide8() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "RL 栈 verl/FSDP",
    "3 段 GSPO,verl rollout 用 vLLM,GRPO 兜底,跳 Audio/Omni-RL");

  // 左侧:3 段流(纵向)
  const stageX = 0.4, stageY = 0.85, stageW = 3.20, stageH = 5.05;
  s.addShape(pres.shapes.RECTANGLE, {
    x: stageX, y: stageY, w: stageW, h: stageH,
    fill: { color: COLOR.cardGray }, line: { color: COLOR.inkFaint, width: 0.5 }
  });
  s.addText("3 段 RL(verl 实现)", {
    x: stageX + 0.10, y: stageY + 0.05, w: stageW - 0.20, h: 0.30,
    color: COLOR.ink, bold: true, fontSize: 12, fontFace: FONT.zh
  });
  s.addText("跳过:Text-RL S1 / Omni-RL / Audio-RL", {
    x: stageX + 0.10, y: stageY + 0.34, w: stageW - 0.20, h: 0.24,
    color: COLOR.inkSoft, fontSize: 9, italic: true, fontFace: FONT.zh
  });

  const stages = [
    { num: "1", name: "MPO 偏好优化", detail: "DPO + BCO 混合(verl 内置 DPO + 自加 BCO)\n~150K 偏好对(RLHF-V + VLFeedback)\n2 周 / 16 H100,FSDP", color: COLOR.warn },
    { num: "2", name: "Image-RL", detail: "GSPO(verl 主干 + 我方贡献)\n~50K 视觉推理 + ~30K GUI 偏好\nverifier: string/math/GUI-coord/format\n3 周 / B200 + vLLM rollout", color: COLOR.red },
    { num: "3", name: "Text-RL Stage 2", detail: "修文本回归(必跑)\n冻 token embedding 防漂移\n~30K 自家文本任务\n1 周 / 16 H100", color: COLOR.brandA }
  ];
  const stageItemH = 1.45;
  stages.forEach((st, i) => {
    const y = stageY + 0.65 + i * (stageItemH + 0.05);
    s.addShape(pres.shapes.OVAL, {
      x: stageX + 0.15, y: y + 0.30, w: 0.50, h: 0.50,
      fill: { color: st.color }, line: { color: st.color, width: 0 }
    });
    s.addText(st.num, {
      x: stageX + 0.15, y: y + 0.30, w: 0.50, h: 0.50,
      color: "FFFFFF", bold: true, fontSize: 18, align: "center", valign: "middle", fontFace: FONT.zh
    });
    s.addText([
      { text: st.name, options: { color: st.color, bold: true, fontSize: 12, breakLine: true } },
      { text: st.detail, options: { color: COLOR.ink, fontSize: 9 } }
    ], { x: stageX + 0.75, y: y + 0.05, w: stageW - 0.85, h: stageItemH - 0.10, margin: 0, fontFace: FONT.zh });
    if (i < stages.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: stageX + 0.40, y: y + stageItemH - 0.05, w: 0, h: 0.10,
        line: { color: COLOR.red, width: 1.5 }
      });
    }
  });

  // 中间:verl 栈架构
  const mX = 3.75, mY = 0.85, mW = 3.40;
  s.addShape(pres.shapes.RECTANGLE, {
    x: mX, y: mY, w: mW, h: 5.05,
    fill: { color: "FFFFFF" }, line: { color: COLOR.warn, width: 1.0 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: mX, y: mY, w: mW, h: 0.42,
    fill: { color: COLOR.warn }, line: { color: COLOR.warn, width: 0 }
  });
  s.addText("⚙ verl + FSDP + vLLM 栈", {
    x: mX + 0.10, y: mY + 0.05, w: mW - 0.20, h: 0.32,
    color: "FFFFFF", bold: true, fontSize: 12, valign: "middle", fontFace: FONT.zh
  });

  // 架构层级图
  const arch = [
    { y: 0, h: 0.55, text: "verl Trainer", subtext: "GRPO / GSPO / DPO 算法层", color: COLOR.red },
    { y: 0.60, h: 0.55, text: "FSDP2 Worker", subtext: "策略模型 + 参考模型 训练 + 梯度", color: COLOR.warn },
    { y: 1.20, h: 0.55, text: "Ray Cluster", subtext: "rollout / actor / critic 编排", color: COLOR.brandA },
    { y: 1.80, h: 0.55, text: "vLLM Rollout", subtext: "并行 generate(支持 PagedAttn)", color: COLOR.brandB },
    { y: 2.40, h: 0.55, text: "Reward Verifiers", subtext: "string-match / math / GUI / format", color: COLOR.good },
    { y: 3.00, h: 0.55, text: "Replay Buffer + 偏好数据", subtext: "RLHF-V / VLFeedback / POVID / 自标", color: COLOR.ink }
  ];
  arch.forEach(a => {
    const y = mY + 0.55 + a.y;
    s.addShape(pres.shapes.RECTANGLE, {
      x: mX + 0.15, y, w: mW - 0.30, h: a.h,
      fill: { color: "FFFFFF" }, line: { color: a.color, width: 1.0 }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: mX + 0.15, y, w: 0.10, h: a.h,
      fill: { color: a.color }, line: { color: a.color, width: 0 }
    });
    s.addText([
      { text: a.text, options: { color: a.color, bold: true, fontSize: 11, breakLine: true } },
      { text: a.subtext, options: { color: COLOR.inkSoft, fontSize: 9 } }
    ], { x: mX + 0.32, y: y + 0.05, w: mW - 0.42, h: a.h - 0.10, margin: 0, fontFace: FONT.zh });
  });

  // 右侧:GSPO 实现 + 跳过段理由
  const rX = 7.30, rY = 0.85, rW = 5.60, rH = 5.05;
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: rH,
    fill: { color: "FFFFFF" }, line: { color: COLOR.red, width: 1.0 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: 0.42,
    fill: { color: COLOR.red }, line: { color: COLOR.red, width: 0 }
  });
  s.addText("⚠ GSPO 实现状态 + 跳过段理由", {
    x: rX + 0.10, y: rY + 0.05, w: rW - 0.20, h: 0.32,
    color: "FFFFFF", bold: true, fontSize: 12, valign: "middle", fontFace: FONT.zh
  });

  const gspoNotes = [
    { k: "GSPO 实现状态", v: "verl 主干含 GRPO,GSPO 需自实现(~300 行)或等社区 PR", color: COLOR.warn },
    { k: "兜底方案", v: "GRPO 在 omni 已被验证可用,损失约 1-2 pt 稳定性", color: COLOR.warn },
    { k: "Global BS / rollouts", v: "4096 / 16 rollouts(vLLM 并行 = 16-32 副本)", color: COLOR.ink },
    { k: "⊘ Text-RL S1 跳过", v: "Nemotron 用于多环境 RLVR,我方仅理解,无需多环境支持", color: COLOR.inkSoft },
    { k: "⊘ Omni-RL 跳过", v: "Image-RL + audio benchmark 已可覆盖 DailyOmni\n若 T+14 不达标可后补 2-3 周", color: COLOR.inkSoft },
    { k: "⊘ Audio-RL 跳过", v: "ASR/分类 SFT 已逼近上限,RL 边际收益低", color: COLOR.inkSoft },
    { k: "Text-RL S2 必跑", v: "Stage 4/5 后必有 1-2 pt 漂移,这是修复段", color: COLOR.red },
    { k: "Verifier", v: "复用 verl 内置 + 自实现 GUI-coord(smooth distance)", color: COLOR.ink }
  ];
  const gspoTop = rY + 0.55;
  const gspoH = 0.52;
  gspoNotes.forEach((n, i) => {
    const y = gspoTop + i * gspoH;
    s.addText([
      { text: "▸ " + n.k + " ", options: { color: COLOR.red, bold: true, fontSize: 10 } },
      { text: n.v, options: { color: n.color, fontSize: 9.5 } }
    ], { x: rX + 0.12, y, w: rW - 0.24, h: gspoH - 0.04, margin: 0, fontFace: FONT.zh });
    if (i < gspoNotes.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: rX + 0.12, y: y + gspoH - 0.04, w: rW - 0.24, h: 0,
        line: { color: COLOR.inkFaint, width: 0.25 }
      });
    }
  });

  addRedConclusionBox(s, [
    { tag: "❶ verl + FSDP 替 NeMo-RL",
      body: "verl 是 ",
      bold: "OSS 第一梯队 RL 框架(volcengine 维护),",
      warn: " 原生 FSDP+vLLM,与我方栈对齐",
      tail: "" },
    { tag: "❷ GSPO 自实现风险可控",
      body: "GRPO → GSPO 主要差别在 ",
      bold: "sequence-level 重要性比",
      warn: ",~300 行改动,2 人 1 周可完成",
      tail: ";若延迟用 GRPO 兜底" },
    { tag: "❸ Text-RL S2 是底线",
      body: "无论 GSPO 是否就绪,",
      bold: "Text-RL S2 必须跑,",
      warn: " 这是把 MMLU-Pro 拉回 ≤2 pt 的修复段",
      tail: "" }
  ]);

  addSources(s, [
    { name: "verl(volcengine/verl)", tail: " GitHub" },
    { name: "GSPO 算法", tail: " (Qwen 团队 2025 公开)" },
    { name: "Nemotron 5 段 RL pipeline + GSPO 超参", tail: " (arxiv 2604.24954)" }
  ]);
}

// ============================================================
// SLIDE 9 — 评测红线
// ============================================================
function slide9() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "评测红线",
    "3 阶段目标分位 + 8 维 36 项,MMLU-Pro 损 ≤2 pt 是上线门槛");

  const tbl = [
    [
      headerCell("评测维度"),
      headerCell("代表 benchmark"),
      headerCell("Phase A 终点\n(T,proxy 模型)"),
      headerCell("Phase B 中点\n(T+8)"),
      headerCell("Phase B 上线\n(T+18)"),
      headerCell("红线 / Go-No-Go")
    ],
    [
      rowLabelCell("文本回归 ★", COLOR.red),
      metricCell("MMLU-Pro / IFBench / AIME25", "LiveCodeBench v6", COLOR.ink),
      metricCell("≥ 99%", "vs Qwen3.5-4B-base", COLOR.warn),
      metricCell("≥ 99%", "vs 实 ckpt base", COLOR.warn),
      metricCell("≥ 98%", "等价 ≤2 pt 损", COLOR.good),
      metricCell("掉 >2 pt", "立即 rollback", COLOR.red)
    ],
    [
      rowLabelCell("视觉理解综合", COLOR.brandB),
      metricCell("MMMU / MM-Vet / MMStar", "SEED-Bench-2", COLOR.ink),
      metricCell("MMMU 50", "对标 LLaVA-OV-7B", COLOR.warn),
      metricCell("MMMU 55", "—", COLOR.warn),
      metricCell("MMMU 60+", "对标 Qwen2.5-VL-7B", COLOR.good),
      metricCell("MMMU < 50", "Phase B 中点不通过", COLOR.red)
    ],
    [
      rowLabelCell("OCR / 文档", COLOR.brandB),
      metricCell("OCRBench-V2 / DocVQA / ChartQA", "CharXiv RQ", COLOR.ink),
      metricCell("DocVQA 85", "OCRBench 75", COLOR.warn),
      metricCell("DocVQA 88", "—", COLOR.warn),
      metricCell("DocVQA 90+", "—", COLOR.good),
      metricCell("DocVQA < 85", "Phase B 上线不达标", COLOR.red)
    ],
    [
      rowLabelCell("Agent / GUI ★", COLOR.red),
      metricCell("ScreenSpot-Pro / OSWorld-G", "(2026 区分度最高)", COLOR.ink),
      metricCell("SS-Pro 25", "Phase A 验证 RL 流程", COLOR.warn),
      metricCell("SS-Pro 30", "RL 前", COLOR.warn),
      metricCell("SS-Pro 40+", "RL 后", COLOR.good),
      metricCell("SS-Pro < 25", "RL pipeline 失败", COLOR.red)
    ],
    [
      rowLabelCell("音频理解", COLOR.brandA),
      metricCell("OpenASR / MMAU / MMAR", "VoiceBench", COLOR.ink),
      metricCell("ASR WER 8", "—", COLOR.warn),
      metricCell("WER 7 / MMAU 65", "—", COLOR.warn),
      metricCell("WER 7 / MMAU 70+", "—", COLOR.good),
      metricCell("WER > 10", "Audio SFT 不达标", COLOR.red)
    ],
    [
      rowLabelCell("视频理解", COLOR.brandB),
      metricCell("VideoMME / LongVideoBench", "MVBench / NextQA", COLOR.ink),
      metricCell("VideoMME 55", "短视频", COLOR.warn),
      metricCell("VideoMME 60", "—", COLOR.warn),
      metricCell("VideoMME 65+", "LongVB 55+", COLOR.good),
      metricCell("VideoMME < 55", "Stage 5 不达标", COLOR.warn)
    ],
    [
      rowLabelCell("Omni 端到端 ★", COLOR.warn),
      metricCell("DailyOmni / WorldSense", "AVUT", COLOR.ink),
      metricCell("DailyOmni 60", "Phase A 含 omni 数据", COLOR.warn),
      metricCell("DailyOmni 65", "—", COLOR.warn),
      metricCell("DailyOmni 70+", "WorldSense 50+", COLOR.good),
      metricCell("DailyOmni < 60", "整体不达 SOTA", COLOR.red)
    ],
    [
      rowLabelCell("文本基线绝对值", COLOR.ink),
      metricCell("MMLU-Pro 绝对分", "(基于 Qwen3.5-4B-base 估)", COLOR.ink),
      metricCell("~70", "Qwen3.5-4B-base 基线", COLOR.ink),
      metricCell("—", "实 ckpt 自带", COLOR.inkSoft),
      metricCell("实 ckpt × 0.98", "Phase B 上线", COLOR.good),
      metricCell("—", "—", COLOR.inkSoft)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: 0.85, w: 12.5, h: 5.05,
    colW: [1.65, 2.55, 1.95, 1.75, 1.95, 2.65],
    rowH: [0.50, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  addRedConclusionBox(s, [
    { tag: "❶ 三阶段红线",
      body: "Phase A 终点(T) MMMU 50 / Phase B 中点(T+8) MMMU 55 / 上线(T+18) MMMU 60+,",
      bold: "递进式 gate ",
      warn: ",任一不通过暂停",
      tail: "" },
    { tag: "❷ 文本相对损为标尺",
      body: "Phase A 比 Qwen3.5-4B-base,Phase B 比实 ckpt base,",
      bold: "都用「相对损 ≤2 pt」",
      warn: " 同一标准,与绝对分数解耦",
      tail: "" },
    { tag: "❸ 自动监控",
      body: "vLLM serving + VLMEvalKit ",
      bold: "每 1B token 跑 mini-eval,",
      warn: " 异常 alert 自动通知 owner,无需人盯",
      tail: "" }
  ]);

  addSources(s, [
    { name: "三篇报告评测整合", tail: " (Nemotron / LongCat / Qwen3.5)" },
    { name: "VLMEvalKit + 自家 text 套件", tail: "" },
    { name: "Qwen3.5-4B-base 文本基线", tail: " (HF model card)" }
  ]);
}

// ============================================================
// SLIDE 10 — 风险 + ckpt 切换协议
// ============================================================
function slide10() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "风险 + 切换协议",
    "5 大风险 / 3 道 gate / Phase A→B 切换 SOP,Day-1 接 ckpt");

  // 上半:3 个 gate
  const gateY = 0.85, gateH = 1.85, gateW = 4.10;
  const gates = [
    {
      x: 0.4, name: "Gate A: Phase A 终点", time: "T = 0(ckpt 到达)",
      criteria: [
        "Proxy(Qwen3.5-4B + V/A)上 MMMU ≥ 50",
        "DocVQA ≥ 85,VideoMME ≥ 55",
        "MMLU-Pro 损 ≤ 1 pt vs Qwen3.5-4B-base",
        "整套 SFT+RL pipeline 端到端跑通"
      ],
      pass: "→ Phase B 启动,ckpt 切换",
      fail: "→ 不让 ckpt 进 Phase B,留在 proxy 调到达标",
      color: COLOR.warn
    },
    {
      x: 4.60, name: "Gate B: ckpt Sanity", time: "T+2",
      criteria: [
        "实 ckpt 与预训练 team 报告 MMLU-Pro 差 ≤ 0.5 pt",
        "vLLM 模型类适配通过,推理 sanity OK",
        "Tokenizer 兼容性确认(case 1/2/3 区分)",
        "FSDP wrap policy 调通,首 1B token 不发散"
      ],
      pass: "→ 启动 Stage 0/1 SFT",
      fail: "→ 与预训练 team 排查,可能延后 1-2 周",
      color: COLOR.red
    },
    {
      x: 8.80, name: "Gate C: 上线判定", time: "T+18",
      criteria: [
        "MMLU-Pro 损 ≤ 2 pt vs 实 ckpt base",
        "MMMU ≥ 60 / DocVQA ≥ 90 / SS-Pro ≥ 40",
        "DailyOmni ≥ 70,无幻觉爆发(POPE > 90)",
        "全栈无 NaN / 无 OOM / 推理稳定"
      ],
      pass: "→ T+18 上线",
      fail: "→ 补 Omni-RL 段或 SFT-only 上线",
      color: COLOR.brandA
    }
  ];

  gates.forEach(g => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: g.x, y: gateY, w: gateW, h: gateH,
      fill: { color: "FFFFFF" }, line: { color: g.color, width: 1.5 }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: g.x, y: gateY, w: gateW, h: 0.40,
      fill: { color: g.color }, line: { color: g.color, width: 0 }
    });
    s.addText([
      { text: g.name, options: { color: "FFFFFF", bold: true, fontSize: 12 } },
      { text: "    " + g.time, options: { color: "FFFFFF", fontSize: 11, italic: true } }
    ], { x: g.x + 0.10, y: gateY + 0.04, w: gateW - 0.20, h: 0.32, valign: "middle", fontFace: FONT.zh });
    g.criteria.forEach((c, i) => {
      s.addText([
        { text: "✓ ", options: { color: g.color, bold: true, fontSize: 10 } },
        { text: c, options: { color: COLOR.ink, fontSize: 9.5 } }
      ], { x: g.x + 0.12, y: gateY + 0.45 + i * 0.21, w: gateW - 0.24, h: 0.20, margin: 0, fontFace: FONT.zh });
    });
    const pfY = gateY + gateH - 0.55;
    s.addShape(pres.shapes.LINE, {
      x: g.x + 0.10, y: pfY - 0.02, w: gateW - 0.20, h: 0,
      line: { color: COLOR.inkFaint, width: 0.5 }
    });
    s.addText([
      { text: "PASS  ", options: { color: COLOR.good, bold: true, fontSize: 10 } },
      { text: g.pass, options: { color: COLOR.ink, fontSize: 9.5 } }
    ], { x: g.x + 0.12, y: pfY, w: gateW - 0.24, h: 0.22, margin: 0, fontFace: FONT.zh });
    s.addText([
      { text: "FAIL  ", options: { color: COLOR.red, bold: true, fontSize: 10 } },
      { text: g.fail, options: { color: COLOR.ink, fontSize: 9.5 } }
    ], { x: g.x + 0.12, y: pfY + 0.24, w: gateW - 0.24, h: 0.22, margin: 0, fontFace: FONT.zh });
  });

  // 下半:5 大风险
  const riskTbl = [
    [
      headerCell("风险"),
      headerCell("概率"),
      headerCell("影响"),
      headerCell("早期信号"),
      headerCell("Mitigation")
    ],
    [
      rowLabelCell("R1: 实 ckpt vLLM 模型类未就绪", COLOR.warn),
      metricCell("中高", "60%", COLOR.red),
      metricCell("高", "+1-3 周", COLOR.red),
      metricCell("T-4 内未提供 stub", "—", COLOR.red),
      metricCell("Phase A 第 8 周起预留", "vLLM 模型类接口", COLOR.warn)
    ],
    [
      rowLabelCell("R2: Tokenizer Case 3(完全不同)", COLOR.red),
      metricCell("低-中", "20%", COLOR.warn),
      metricCell("高", "+3-4 周 retokenize", COLOR.red),
      metricCell("T-10 SLA 未签", "—", COLOR.red),
      metricCell("准备 retokenize 脚本", "+ 数据双备份", COLOR.warn)
    ],
    [
      rowLabelCell("R3: 预训练 team 不给 text 同分布", COLOR.red),
      metricCell("中高", "40%", COLOR.red),
      metricCell("高", "文本必漂移", COLOR.red),
      metricCell("T-8 仍未到位", "—", COLOR.red),
      metricCell("退化到公开 Nemotron-text", "数据,损 ~3 pt 接受", COLOR.red)
    ],
    [
      rowLabelCell("R4: GSPO 实现延迟", COLOR.warn),
      metricCell("中", "30%", COLOR.warn),
      metricCell("中", "稳定性 1-2 pt", COLOR.warn),
      metricCell("Phase A 自实现未完", "—", COLOR.warn),
      metricCell("GRPO 兜底,verl 主干已支持", "RL 不延期", COLOR.good)
    ],
    [
      rowLabelCell("R5: B200 集群档期冲突", COLOR.warn),
      metricCell("中", "30%", COLOR.warn),
      metricCell("中", "RL 推迟 2 周", COLOR.warn),
      metricCell("T+10 资源未锁", "—", COLOR.ink),
      metricCell("退化到 H100 跑 RL", "BS 减半", COLOR.warn)
    ]
  ];
  s.addTable(riskTbl, {
    x: 0.4, y: 2.85, w: 12.5, h: 3.10,
    colW: [3.10, 1.30, 1.50, 2.40, 4.20],
    rowH: [0.45, 0.55, 0.55, 0.55, 0.55, 0.55],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  addRedConclusionBox(s, [
    { tag: "❶ Day-1 ckpt 切换 SOP",
      body: "T+0: 拿 ckpt → T+1: vLLM 类对齐 + sanity → T+2: tokenizer case 判定 → ",
      bold: "T+3: Stage 0 启动,",
      warn: " 严格 3 天工序",
      tail: "" },
    { tag: "❷ R1+R3 是组合炸弹",
      body: "vLLM 模型类未就绪 ",
      warn: "× ",
      bold: "text 同分布数据缺失 ",
      warn: " = Phase B 整体延 4-6 周,T-12 必须强 SLA",
      tail: "" },
    { tag: "❸ 三道 gate 不可跳",
      body: "Gate A 不通过则不让 ckpt 进 Phase B(防止 ckpt 浪费在不成熟 pipeline 上);",
      bold: "Gate B 不通过排查 1-2 周比硬上省 4 周",
      warn: "",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Phase A→B 切换 SOP", tail: " (内部协议草案)" },
    { name: "verl + vLLM 集成", tail: " (开源文档)" },
    { name: "三篇 reference design 风险经验", tail: " (公开论文)" }
  ]);
}

// ============================================================
// 生成
// ============================================================
slide1(); slide2(); slide3(); slide4(); slide5();
slide6(); slide7(); slide8(); slide9(); slide10();

pres.writeFile({ fileName: "D:/work/omni_insight_deck/Omni_Understanding_Experiment_Plan_2026H2_v2.pptx" })
  .then(name => console.log("Generated:", name));
