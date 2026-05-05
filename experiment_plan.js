// Omni 后训练实验计划 deck —— 内部团队规划版
// 场景:文本 base 在预训练中,后训练 team 并行准备,ckpt 到达后立即扩展为 omni 理解模型
// 用例:vision / audio / video / text 多模态理解,不做生成

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
pres.title = "Omni 理解后训练实验计划 2026 H2";

// ============================================================
// 通用工具(与 deck.js 一致)
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
// SLIDE 1 — 任务定义 + 约束矩阵 (Prototype A)
// ============================================================
function slide1() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "任务定义 + 约束",
    "ckpt 到达即启动 omni 理解后训练,4 模态理解,无生成");

  // 左:目标矩阵(in-scope)
  const lX = 0.4, lY = 0.85, lW = 6.30, lH = 5.05;
  s.addShape(pres.shapes.RECTANGLE, { x: lX, y: lY, w: lW, h: lH, fill: { color: "FFFFFF" }, line: { color: COLOR.good, width: 1.0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: lX, y: lY, w: lW, h: 0.42, fill: { color: COLOR.good }, line: { color: COLOR.good, width: 0 } });
  s.addText("✓ In-Scope:理解能力扩展", {
    x: lX + 0.10, y: lY + 0.05, w: lW - 0.20, h: 0.32, color: "FFFFFF", bold: true, fontSize: 13, valign: "middle", fontFace: FONT.zh
  });
  const inScope = [
    { tag: "Vision 理解", goal: "图像 / 文档 / 图表 / OCR / GUI", target: "MMMU ≥ 65, OCRBench ≥ 85, ScreenSpot-Pro ≥ 50" },
    { tag: "Audio 理解", goal: "ASR / 音频问答 / 音乐 / 声音事件", target: "OpenASR avg WER ≤ 7, MMAU ≥ 70" },
    { tag: "Video 理解", goal: "短/中/长视频 + 时序推理", target: "VideoMME ≥ 65, LongVideoBench ≥ 60" },
    { tag: "Text 保真", goal: "文本能力不漂移(关键约束)", target: "MMLU-Pro 损 ≤ 2 pt vs base" },
    { tag: "Omni 端到端", goal: "音视频联合理解", target: "DailyOmni ≥ 70, WorldSense ≥ 50" },
    { tag: "上下文长度", goal: "16K → 48K 起步,256K 视需要", target: "MMLongBench-Doc ≥ 40" }
  ];
  const itemTop = lY + 0.55;
  const itemH = (lH - 0.65) / inScope.length;
  inScope.forEach((it, i) => {
    const y = itemTop + i * itemH;
    s.addText([
      { text: "▸ " + it.tag + " ", options: { color: COLOR.good, bold: true, fontSize: 11 } },
      { text: it.goal, options: { color: COLOR.ink, fontSize: 10, breakLine: true } },
      { text: "  红线: ", options: { color: COLOR.red, bold: true, fontSize: 9 } },
      { text: it.target, options: { color: COLOR.warn, bold: true, fontSize: 9, italic: true } }
    ], { x: lX + 0.12, y, w: lW - 0.24, h: itemH - 0.04, margin: 0, fontFace: FONT.zh });
    if (i < inScope.length - 1) {
      s.addShape(pres.shapes.LINE, { x: lX + 0.12, y: y + itemH - 0.04, w: lW - 0.24, h: 0, line: { color: COLOR.inkFaint, width: 0.25 } });
    }
  });

  // 右:Out-of-Scope + 约束 + 假设
  const rX = 6.85, rY = 0.85, rW = 6.05, rH = 5.05;
  // Out-of-scope 框
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: rY, w: rW, h: 1.95, fill: { color: "FFFFFF" }, line: { color: COLOR.red, width: 1.0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: rY, w: rW, h: 0.42, fill: { color: COLOR.red }, line: { color: COLOR.red, width: 0 } });
  s.addText("✗ Out-of-Scope:本次明确不做", {
    x: rX + 0.10, y: rY + 0.05, w: rW - 0.20, h: 0.32, color: "FFFFFF", bold: true, fontSize: 13, valign: "middle", fontFace: FONT.zh
  });
  const outScope = [
    { k: "图像生成", v: "无 dNaViT / VQ-VAE / DALL-E 风格 head" },
    { k: "语音生成", v: "无 Talker / Code2Wav / RVQ-MTP head" },
    { k: "视频生成", v: "完全不在范围" },
    { k: "TTS / SeedTTS 系列", v: "不做评测,不投入数据" }
  ];
  outScope.forEach((it, i) => {
    s.addText([
      { text: "✗ " + it.k + " ", options: { color: COLOR.red, bold: true, fontSize: 10 } },
      { text: it.v, options: { color: COLOR.inkSoft, fontSize: 9.5 } }
    ], { x: rX + 0.12, y: rY + 0.50 + i * 0.32, w: rW - 0.24, h: 0.30, margin: 0, fontFace: FONT.zh });
  });

  // 约束 + 假设框
  const cY = rY + 2.10;
  const cH = 2.95;
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: cY, w: rW, h: cH, fill: { color: "FFFFFF" }, line: { color: COLOR.warn, width: 1.0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: cY, w: rW, h: 0.42, fill: { color: COLOR.warn }, line: { color: COLOR.warn, width: 0 } });
  s.addText("⚠ 关键约束 + 工作假设", {
    x: rX + 0.10, y: cY + 0.05, w: rW - 0.20, h: 0.32, color: "FFFFFF", bold: true, fontSize: 13, valign: "middle", fontFace: FONT.zh
  });
  const constraints = [
    { tag: "Base 类型", v: "假设 MoE A3B(若 dense 需先 upcycle,加 4-6 周)" },
    { tag: "Base 词表", v: "假设标准 BPE,不预留视觉/音频 token slot" },
    { tag: "ckpt 到达", v: "T = 0(相对时间);本计划锁定 T-12 至 T+24" },
    { tag: "算力", v: "假设可获 32-64 H100 节点(SFT)+ B200(RL)" },
    { tag: "团队", v: "后训练 4-6 人 + 数据 2-3 人 + 评测 1-2 人" },
    { tag: "技术参考", v: "Nemotron 3 Nano Omni 范式 + Qwen3.5 OPD trick" },
    { tag: "失败回滚", v: "MMLU-Pro 损 >2 pt 立即停 + 加 Text-RL S2 修复段" }
  ];
  const conTop = cY + 0.50;
  const conH = (cH - 0.60) / constraints.length;
  constraints.forEach((c, i) => {
    s.addText([
      { text: c.tag + " ", options: { color: COLOR.red, bold: true, fontSize: 9.5 } },
      { text: c.v, options: { color: COLOR.ink, fontSize: 9 } }
    ], { x: rX + 0.12, y: conTop + i * conH, w: rW - 0.24, h: conH - 0.02, margin: 0, fontFace: FONT.zh });
  });

  addRedConclusionBox(s, [
    { tag: "❶ 路径锁定",
      body: "走 ", bold: "Nemotron 模块化理解路径,",
      warn: " 不做生成,不投入 Talker / 图像头 / 视频头训练",
      tail: "" },
    { tag: "❷ 文本红线",
      body: "MMLU-Pro 损 ",
      warn: "≤ 2 pt ",
      bold: "是上线门槛,",
      tail: "Qwen3.5 0.9 / Nemotron 1.0 是可达分位线" },
    { tag: "❸ 时间窗",
      body: "T-12 至 T+24 共 ",
      warn: "36 周,",
      bold: "Pre-arrival 12 周做工程基建不依赖 ckpt",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Nemotron 3 Nano Omni 范式", tail: " (arxiv 2604.24954)" },
    { name: "Qwen3.5-Omni OPD / Specialist", tail: " (arxiv 2604.15804)" },
    { name: "内部规划假设", tail: " (compute / team / timeline)" }
  ]);
}

// ============================================================
// SLIDE 2 — 总体路线图 (Prototype 横向 swimlane,改造自 C)
// ============================================================
function slide2() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "总体路线图",
    "Pre-arrival 5 流并行 → ckpt 到达 → 4 段后训练,T-12 至 T+24");

  // 时间轴(顶部)
  const tlY = 0.95;
  const tlX = 0.4;
  const tlW = 12.5;
  // 主轴线
  s.addShape(pres.shapes.LINE, {
    x: tlX, y: tlY + 0.30, w: tlW, h: 0,
    line: { color: COLOR.ink, width: 1.5 }
  });
  // 时间刻度点
  const milestones = [
    { x: 0.0, label: "T-12 周", desc: "Pre-arrival 启动", color: COLOR.brandB },
    { x: 0.18, label: "T-8", desc: "数据 + 评测 ready", color: COLOR.brandB },
    { x: 0.34, label: "T-4", desc: "代码 + dry run", color: COLOR.brandB },
    { x: 0.50, label: "T = 0 (ckpt 到达)", desc: "Sanity + 启动 SFT", color: COLOR.red },
    { x: 0.62, label: "T+6", desc: "Vision SFT 完成", color: COLOR.warn },
    { x: 0.74, label: "T+12", desc: "Audio + Omni SFT", color: COLOR.warn },
    { x: 0.85, label: "T+18", desc: "RL 3 段完成", color: COLOR.warn },
    { x: 1.0, label: "T+24", desc: "上线评估", color: COLOR.good }
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

  // ckpt 到达竖线(强调)
  const ckptX = tlX + 0.50 * tlW;
  s.addShape(pres.shapes.LINE, {
    x: ckptX, y: tlY - 0.10, w: 0, h: 0.95,
    line: { color: COLOR.red, width: 2.0, dashType: "dash" }
  });

  // Swimlanes(三道)
  const swimY = 1.95;
  const swimH = 1.25;
  const lanes = [
    { y: swimY, label: "Pre-arrival\n(T-12 → T)", color: COLOR.brandB,
      blocks: [
        { x: 0.0, w: 0.18, text: "数据流水线\n+ 来源谈判", c: COLOR.brandB },
        { x: 0.18, w: 0.16, text: "评测 harness\n+ 监控仪表盘", c: COLOR.brandB },
        { x: 0.34, w: 0.16, text: "代码 port\n+ Megatron-Bridge", c: COLOR.brandB }
      ] },
    { y: swimY + swimH + 0.10, label: "Encoder &\nProjector\n(T-8 → T+2)", color: COLOR.brandA,
      blocks: [
        { x: 0.30, w: 0.22, text: "Encoder 选型\n(SigLIP / RADIO + Whisper)", c: COLOR.brandA },
        { x: 0.50, w: 0.12, text: "Projector dry run\n on proxy base", c: COLOR.brandA }
      ] },
    { y: swimY + 2 * (swimH + 0.10), label: "后训练 4 段\n(T → T+24)", color: COLOR.warn,
      blocks: [
        { x: 0.50, w: 0.12, text: "Phase 1\nSanity + Stage 0/1\n(Vision SFT)", c: COLOR.warn },
        { x: 0.62, w: 0.12, text: "Phase 2\nStage 2/3/4\n(Audio + Omni SFT)", c: COLOR.warn },
        { x: 0.74, w: 0.12, text: "Phase 3\nStage 5 + RL prep\n(48K 长上下文)", c: COLOR.warn },
        { x: 0.85, w: 0.15, text: "Phase 4\nMPO+Image-RL\n+Text-RL S2", c: COLOR.red }
      ] }
  ];

  lanes.forEach(lane => {
    // lane label
    s.addShape(pres.shapes.RECTANGLE, {
      x: tlX, y: lane.y, w: 1.40, h: swimH,
      fill: { color: lane.color }, line: { color: lane.color, width: 0 }
    });
    s.addText(lane.label, {
      x: tlX + 0.05, y: lane.y, w: 1.30, h: swimH,
      color: "FFFFFF", bold: true, fontSize: 11, align: "center", valign: "middle", fontFace: FONT.zh
    });
    // lane track
    s.addShape(pres.shapes.RECTANGLE, {
      x: tlX + 1.50, y: lane.y, w: tlW - 1.50, h: swimH,
      fill: { color: COLOR.cardGray }, line: { color: COLOR.inkFaint, width: 0.5 }
    });
    // blocks within lane
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
    { tag: "❶ 12 周 pre-arrival",
      body: "数据 / 评测 / 代码三流并行,",
      bold: "全部不依赖 ckpt;",
      warn: " ckpt 到达即可立刻启动 Phase 1",
      tail: "" },
    { tag: "❷ 4 段后训练",
      body: "Phase 1-3 SFT(18 周)+ Phase 4 RL(6 周),",
      bold: "总共 24 周",
      warn: ";不走 Stage 6 256K(成本过高,理解场景非必要)",
      tail: "" },
    { tag: "❸ 关键里程碑",
      body: "T+6 vision SFT 完成 → T+12 omni SFT 完成 → T+18 RL 完成 → ",
      bold: "T+24 上线评估",
      warn: ",每节点设 go/no-go gate",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Nemotron 7 阶段渐进式 SFT", tail: " (本计划简化为 5 段,跳过 Stage 6)" },
    { name: "内部时间表估算", tail: " (基于 32-64 H100 节点 + 4-6 人 team)" }
  ]);
}

// ============================================================
// SLIDE 3 — Pre-arrival 5 流并行 (Prototype C 流程矩阵)
// ============================================================
function slide3() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "Pre-arrival 5 流",
    "全部不需 ckpt,80% 工程在 ckpt 到达前完成,T-12 至 T = 0");

  // 5 卡片矩阵
  const streams = [
    {
      tag: "①", title: "数据流水线", color: COLOR.brandB,
      owner: "Data team (2-3 人)",
      tasks: [
        "Vision: LLaVA-OneVision + Cambrian-7M + Cauldron 全量预下载",
        "Audio: Granary v1.1 ASR(59M)+ AudioCaps + WavCaps + Common Voice",
        "Video: ShareGPT4Video + LLaVA-Video-178K + WebVid-10M",
        "交错图文: MMC4 + OBELICS(关键稀缺,需谈判 / 自建)",
        "偏好: RLHF-V + VLFeedback + POVID"
      ],
      deliverable: "T-4 周前:全量数据落地 + tokenize + sharded",
      dependency: "无(完全独立)"
    },
    {
      tag: "②", title: "评测 harness", color: COLOR.good,
      owner: "Eval team (1-2 人)",
      tasks: [
        "VLMEvalKit fork + 内部 fork branch",
        "8 维 36 项评测整合(含 ScreenSpot-Pro / DailyOmni)",
        "文本回归测试套件:MMLU-Pro / IFBench / AIME25 / LiveCodeBench",
        "自动化每 1B token 跑一次 mini-eval(早期发现漂移)",
        "WandB / TensorBoard 仪表盘 + 每日报告"
      ],
      deliverable: "T-8 周前:harness 通过,跑通 Qwen2.5-VL 基线对照",
      dependency: "无"
    },
    {
      tag: "③", title: "代码 port", color: COLOR.warn,
      owner: "Eng team (2 人)",
      tasks: [
        "Megatron-Bridge fork + 适配自家 base 架构",
        "NeMo-RL 移植 + GSPO 实现验证",
        "MoE-aware sequence packing + context parallel(Stage 5 用)",
        "Encoder hot-swap(支持 SigLIP / C-RADIOv4 / NaViT 切换)",
        "Projector 模板代码(MLP / Q-Former 两套)"
      ],
      deliverable: "T-4 周前:代码全通过 + 在 Qwen2.5-VL ckpt 上 dry run 出能力",
      dependency: "Megatron 内部版本(对齐预训练 team)"
    },
    {
      tag: "④", title: "Encoder 选型", color: COLOR.brandA,
      owner: "Research (1-2 人)",
      tasks: [
        "Vision: SigLIP-SO400M vs C-RADIOv4-H 对比实验(用 proxy base)",
        "Audio: Whisper-large-v3 vs Parakeet-TDT-0.6B 对比",
        "Video: 复用 Vision encoder + Conv3D 时序压缩(Nemotron 同方案)",
        "EVS(Efficient Video Sampling)实现 + q 值调参",
        "动态分辨率 + M-RoPE 实现"
      ],
      deliverable: "T-2 周前:确定 encoder 组合 + projector 架构",
      dependency: "Eval harness ready(②)"
    },
    {
      tag: "⑤", title: "Tokenizer 规划", color: COLOR.red,
      owner: "Cross-team (1 人接口)",
      tasks: [
        "对齐预训练 team:词表是否预留 special tokens(<image> / <audio>)",
        "若未预留:扩词表方案 + 新 token embedding 初始化策略",
        "ChatML 模板对齐(消息 / 多轮 / 工具调用)",
        "音视频 placeholder token 数估算(影响 context budget)",
        "Long-doc 场景下 vision token 压缩比设计(Conv3D + EVS)"
      ],
      deliverable: "T-4 周前:tokenizer 决策落地 + 内部规范文档",
      dependency: "强依赖预训练 team(每 2 周对齐一次)"
    }
  ];

  // 5 卡片 2 行布局:第一行 3 张,第二行 2 张
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

  // 第 5 张占 2 列
  positions[4].w = cardW * 2 + 0.10;

  streams.forEach((st, i) => {
    const p = positions[i];
    const w = p.w || cardW;
    s.addShape(pres.shapes.RECTANGLE, {
      x: p.x, y: p.y, w, h: cardH,
      fill: { color: "FFFFFF" }, line: { color: st.color, width: 1.0 }
    });
    // 顶部 tag 条
    s.addShape(pres.shapes.RECTANGLE, {
      x: p.x, y: p.y, w, h: 0.40,
      fill: { color: st.color }, line: { color: st.color, width: 0 }
    });
    s.addText([
      { text: st.tag + "  ", options: { color: "FFFFFF", bold: true, fontSize: 14 } },
      { text: st.title, options: { color: "FFFFFF", bold: true, fontSize: 13 } },
      { text: "   " + st.owner, options: { color: "FFFFFF", fontSize: 10, italic: true } }
    ], { x: p.x + 0.10, y: p.y + 0.04, w: w - 0.20, h: 0.32, valign: "middle", fontFace: FONT.zh });
    // tasks
    const taskTop = p.y + 0.45;
    const taskH = 0.27;
    st.tasks.forEach((t, j) => {
      s.addText([
        { text: "▸ ", options: { color: st.color, bold: true, fontSize: 10 } },
        { text: t, options: { color: COLOR.ink, fontSize: 9 } }
      ], { x: p.x + 0.12, y: taskTop + j * taskH, w: w - 0.24, h: taskH - 0.02, margin: 0, fontFace: FONT.zh });
    });
    // 底部 deliverable + dependency
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
    { tag: "❶ 关键稀缺资源",
      body: "MMC4 / OBELICS 类交错图文是 ",
      bold: "Stage 1/4 的成败关键,",
      warn: " 必须在 T-12 立项谈判,迟则 T 后无米下锅",
      tail: "" },
    { tag: "❷ Tokenizer 决策窗口",
      body: "若预训练 team 没预留 ",
      bold: "<image>/<audio> special tokens,",
      warn: " 扩词表会让前 1-2 epoch 训不稳,",
      tail: "T-12 必须确认" },
    { tag: "❸ Proxy base 方法",
      body: "Encoder/Projector 用 ",
      bold: "Qwen2.5-VL 或 LLaVA-OneVision 做 dry run,",
      warn: " ckpt 到达后只换骨干不重训 encoder",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Nemotron Stage 0/1 数据", tail: " (NVIDIA 2026.04)" },
    { name: "VLMEvalKit", tail: " (开源评测框架)" },
    { name: "内部 owner / 时间估算", tail: "" }
  ]);
}

// ============================================================
// SLIDE 4 — Nemotron-Lite SFT 配方 (Prototype D 公式分解)
// ============================================================
function slide4() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "Nemotron-Lite SFT",
    "5 段渐进 SFT,跳过 Stage 6 256K(理解场景成本不划算)");

  // 顶部公式条:总栈
  const fY = 0.85;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: fY, w: 12.5, h: 0.85,
    fill: { color: COLOR.cardGray }, line: { color: COLOR.ink, width: 0.5 }
  });
  s.addText([
    { text: "Nemotron-Lite = ", options: { color: COLOR.ink, bold: true, fontSize: 12 } },
    { text: "Stage 0", options: { color: COLOR.brandB, bold: true, fontSize: 12 } },
    { text: "(V-Proj)→ ", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "Stage 1", options: { color: COLOR.warn, bold: true, fontSize: 12 } },
    { text: "(Vision SFT)→ ", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "Stage 2/3", options: { color: COLOR.brandA, bold: true, fontSize: 12 } },
    { text: "(Audio)→ ", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "Stage 4", options: { color: COLOR.warn, bold: true, fontSize: 12 } },
    { text: "(Omni SFT)→ ", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "Stage 5", options: { color: COLOR.warn, bold: true, fontSize: 12 } },
    { text: "(48K 长上下文)", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "  ⊘ ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "跳过 Stage 6 256K", options: { color: COLOR.red, bold: true, fontSize: 11 } }
  ], { x: 0.50, y: fY + 0.10, w: 12.30, h: 0.70, valign: "middle", fontFace: FONT.zh });

  // 主表:5 段配方对照
  const tY = 1.95;
  const tH = 3.20;
  const tbl = [
    [
      headerCell("阶段"),
      headerCell("Context"),
      headerCell("Token 预算"),
      headerCell("可训练范围"),
      headerCell("数据组合"),
      headerCell("内部预估周数")
    ],
    [
      rowLabelCell("Stage 0\nVision Proj", COLOR.brandB),
      metricCell("16K", "起步", COLOR.ink),
      metricCell("~10B", "目标 5-15B", COLOR.warn),
      metricCell("仅 V-Proj", "LLM/ViT 全冻", COLOR.brandB),
      metricCell("LLaVA-Pretrain", "ShareGPT4V / DenseFusion", COLOR.ink),
      metricCell("0.5-1 周", "~32 H100", COLOR.good)
    ],
    [
      rowLabelCell("Stage 1\nVision SFT", COLOR.warn),
      metricCell("16K", "保持", COLOR.ink),
      metricCell("~150B", "Nemotron 是 215B", COLOR.warn),
      metricCell("LLM + ViT", "Audio 仍冻", COLOR.warn),
      metricCell("LLaVA-OneVision", "Cambrian + Cauldron + 自家 CoT", COLOR.ink),
      metricCell("4 周", "~64 H100", COLOR.warn)
    ],
    [
      rowLabelCell("Stage 2/3\nAudio Enc+Proj", COLOR.brandA),
      metricCell("16K", "保持", COLOR.ink),
      metricCell("~50B", "S2:5B + S3:45B", COLOR.warn),
      metricCell("Audio 全栈", "LLM 冻 / V 冻", COLOR.brandA),
      metricCell("Granary + AudioCaps", "WavCaps + Common Voice", COLOR.ink),
      metricCell("3 周", "~32 H100", COLOR.good)
    ],
    [
      rowLabelCell("Stage 4\nOmni SFT 16K", COLOR.warn),
      metricCell("16K", "联合", COLOR.ink),
      metricCell("~50B", "vision/audio/text 混", COLOR.warn),
      metricCell("全参数", "解冻所有", COLOR.red),
      metricCell("V+A+Text 5:3:2", "+ 短视频 + 安全数据", COLOR.ink),
      metricCell("4 周", "~64 H100", COLOR.warn)
    ],
    [
      rowLabelCell("Stage 5\nOmni SFT 48K", COLOR.warn),
      metricCell("48K", "扩 3×", COLOR.warn),
      metricCell("~25B", "重 video + 长文档", COLOR.warn),
      metricCell("除 Audio 外", "Audio 冻防漂移", COLOR.warn),
      metricCell("中长视频 + 文档", "多页 OCR + LongVideoBench 分布", COLOR.ink),
      metricCell("3 周", "~64 H100 + CP=2", COLOR.warn)
    ],
    [
      rowLabelCell("⊘ Stage 6\n256K", COLOR.red),
      metricCell("跳过", "理解非必要", COLOR.red),
      metricCell("0", "省 ~30B token", COLOR.good),
      metricCell("—", "—", COLOR.inkSoft),
      metricCell("—", "如有刚需可补 1 周轻量段", COLOR.inkSoft),
      metricCell("—", "省 4 周 + 64 节点", COLOR.good)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: tY, w: 12.5, h: tH,
    colW: [1.70, 1.20, 1.80, 2.00, 3.30, 2.50],
    rowH: [0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.40],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  // 底部:总预算 + 与 Nemotron 对照
  const bY = tY + tH + 0.20;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: bY, w: 12.5, h: 0.65,
    fill: { color: COLOR.cardYellow }, line: { color: COLOR.warn, width: 0.75 }
  });
  s.addText([
    { text: "总预算: ", options: { color: COLOR.red, bold: true, fontSize: 12 } },
    { text: "~285B token  ", options: { color: COLOR.warn, bold: true, fontSize: 13 } },
    { text: "(vs Nemotron 466.9B,省 ~40%)", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "    总周期: ", options: { color: COLOR.red, bold: true, fontSize: 12 } },
    { text: "~14.5 周  ", options: { color: COLOR.warn, bold: true, fontSize: 13 } },
    { text: "(vs Nemotron 全栈,省 4 周)", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "    OPD trick: ", options: { color: COLOR.red, bold: true, fontSize: 12 } },
    { text: "Stage 4 起加 audio-text 配对蒸馏", options: { color: COLOR.warn, bold: true, fontSize: 11 } }
  ], { x: 0.50, y: bY + 0.10, w: 12.30, h: 0.45, valign: "middle", fontFace: FONT.zh });

  addRedConclusionBox(s, [
    { tag: "❶ 跳 Stage 6 = 省 30%",
      body: "256K 长上下文成本在 ",
      warn: "compute × 2 ",
      bold: "层级,理解场景非刚需,",
      tail: "如客户必须可后补 1 周轻量段" },
    { tag: "❷ Audio 不解冻 = Stage 5 安全",
      body: "Stage 5 长上下文训练时冻结 audio 防漂移,这是 ",
      bold: "Nemotron 已验证的稳定配置",
      tail: "" },
    { tag: "❸ OPD 即插即用",
      body: "Stage 4 起每个 omni batch 加 ",
      bold: "20% audio-text 配对样本,",
      warn: " 用文本回答监督音频回答,提速文本对齐",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Nemotron 3 Nano Omni 7 阶段配方", tail: " (arxiv 2604.24954)" },
    { name: "Qwen3.5 OPD 蒸馏 trick", tail: " (arxiv 2604.15804)" },
    { name: "内部预算估算", tail: " (单 token cost × token 量 × 节点数)" }
  ]);
}

// ============================================================
// SLIDE 5 — 数据规模 + 来源 (Prototype A 表 + 状态)
// ============================================================
function slide5() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "数据规模 + 来源",
    "~285B token 目标,vision 50% / audio 18% / video 17% / text 15%");

  // 主表:模态 × 数据集明细
  const tbl = [
    [
      headerCell("模态 / 阶段"),
      headerCell("主用数据集"),
      headerCell("规模(样本)"),
      headerCell("规模(token)"),
      headerCell("状态"),
      headerCell("Owner / 风险")
    ],
    // Vision 大块
    [
      rowLabelCell("Vision Pretrain\n(Stage 0)", COLOR.brandB),
      metricCell("LLaVA-Pretrain", "+ ShareGPT4V + DenseFusion", COLOR.ink),
      metricCell("~5M", "图文对", COLOR.ink),
      metricCell("~10B", "短文 caption", COLOR.warn),
      metricCell("✓ 全开源", "T-12 起下载", COLOR.good),
      metricCell("Data team", "无风险", COLOR.good)
    ],
    [
      rowLabelCell("Vision SFT\n(Stage 1)", COLOR.brandB),
      metricCell("LLaVA-OneVision-Data", "+ Cambrian-7M + Cauldron + ALLaVA", COLOR.ink),
      metricCell("~30-50M", "复合指令", COLOR.warn),
      metricCell("~150B", "Nemotron 是 215B", COLOR.warn),
      metricCell("✓ 全开源", "+ 自建 CoT 数据", COLOR.good),
      metricCell("Data + Research", "CoT 数据需自合成", COLOR.warn)
    ],
    // Audio
    [
      rowLabelCell("Audio Pretrain\n(Stage 2)", COLOR.brandA),
      metricCell("Granary v1.1 ASR", "(NVIDIA 已开源)", COLOR.ink),
      metricCell("~10M", "音频对", COLOR.ink),
      metricCell("~5B", "短样本", COLOR.warn),
      metricCell("✓ 公开", "HF 直接拉", COLOR.good),
      metricCell("Data team", "无风险", COLOR.good)
    ],
    [
      rowLabelCell("Audio SFT\n(Stage 3)", COLOR.brandA),
      metricCell("AudioCaps + Clotho", "+ WavCaps + Common Voice + AudioSet", COLOR.ink),
      metricCell("~30M", "音频任务", COLOR.warn),
      metricCell("~45B", "ASR + AQA + Music", COLOR.warn),
      metricCell("✓ 公开", "AudioSet 仅 label", COLOR.good),
      metricCell("Data team", "音频自原始数据复杂", COLOR.warn)
    ],
    // Omni mix
    [
      rowLabelCell("Omni 混合\n(Stage 4)", COLOR.warn),
      metricCell("V+A+T 混采样", "+ ShareGPT4Video + LLaVA-Video + 安全数据", COLOR.ink),
      metricCell("~10M", "混合", COLOR.warn),
      metricCell("~50B", "5:3:2 比例", COLOR.warn),
      metricCell("⚠ 自建", "比例需调优", COLOR.warn),
      metricCell("Research", "OPD 配对样本需新合成", COLOR.red)
    ],
    [
      rowLabelCell("中长视频\n(Stage 5)", COLOR.warn),
      metricCell("LLaVA-Video-178K", "+ EgoSchema + LongVideoBench 分布", COLOR.ink),
      metricCell("~2M", "中长视频", COLOR.warn),
      metricCell("~25B", "含视频推理 CoT", COLOR.warn),
      metricCell("⚠ 部分", "需采样长尾", COLOR.warn),
      metricCell("Data + Research", "长视频标注稀缺", COLOR.red)
    ],
    // Text 保留
    [
      rowLabelCell("Text 保留\n(全程)", COLOR.red),
      metricCell("自家文本 SFT 数据", "(由预训练 team 提供同分布)", COLOR.ink),
      metricCell("—", "按比例采", COLOR.ink),
      metricCell("~40B", "防漂移采样", COLOR.warn),
      metricCell("✗ 待对齐", "需预训练 team 给", COLOR.red),
      metricCell("Cross-team", "强依赖,T-12 立项", COLOR.red)
    ],
    // 偏好
    [
      rowLabelCell("偏好(RL)", COLOR.red),
      metricCell("RLHF-V + VLFeedback", "+ POVID + 自标 ScreenSpot 偏好", COLOR.ink),
      metricCell("~200K", "偏好对", COLOR.warn),
      metricCell("~5B", "RL 数据短", COLOR.warn),
      metricCell("✓ 公开+自建", "ScreenSpot 偏好需自标", COLOR.warn),
      metricCell("Eval team + 标注", "标注成本中等", COLOR.warn)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: 0.85, w: 12.5, h: 5.10,
    colW: [1.50, 3.10, 1.55, 1.55, 1.95, 2.85],
    rowH: [0.50, 0.55, 0.65, 0.55, 0.65, 0.65, 0.65, 0.65, 0.65],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  addRedConclusionBox(s, [
    { tag: "❶ 80% 数据已就位",
      body: "Vision / Audio / Video 主体均开源(LLaVA-OV + Granary + LLaVA-Video),",
      bold: "T-12 起下载 + 预处理可在 6 周内完成",
      tail: "" },
    { tag: "❷ Text 同分布是死结",
      body: "防漂移的 ",
      warn: "~40B Text 数据 ",
      bold: "必须由预训练 team 提供同分布样本,",
      tail: "T-12 必须达成内部 SLA" },
    { tag: "❸ OPD 配对要自合成",
      body: "Stage 4 起的 audio-text 配对样本需 ",
      bold: "用 ASR + GPT-4 生成,",
      warn: " 工作量 ~2 人 4 周,T-8 立项",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Nemotron Stage 0-5 数据明细", tail: " (内部对应 Lite 版)" },
    { name: "LLaVA-OneVision / Cambrian / Granary", tail: " (HuggingFace)" },
    { name: "OPD 配对方案", tail: " (Qwen3.5-Omni 论文复刻)" }
  ]);
}

// ============================================================
// SLIDE 6 — RL 3 段简化 (Prototype C)
// ============================================================
function slide6() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "RL stack 简化",
    "GSPO 3 段(MPO+Image-RL+Text-RL S2),跳过 Audio-RL 与 Omni-RL");

  // 左侧:3 段流(纵向)
  const stageX = 0.4, stageY = 0.85, stageW = 3.20, stageH = 5.05;
  s.addShape(pres.shapes.RECTANGLE, {
    x: stageX, y: stageY, w: stageW, h: stageH,
    fill: { color: COLOR.cardGray }, line: { color: COLOR.inkFaint, width: 0.5 }
  });
  s.addText("3 段 RL 流(简化版)", {
    x: stageX + 0.10, y: stageY + 0.05, w: stageW - 0.20, h: 0.30,
    color: COLOR.ink, bold: true, fontSize: 12, fontFace: FONT.zh
  });
  s.addText("(对照 Nemotron 5 段 → 跳 Text-RL S1 + Omni-RL)", {
    x: stageX + 0.10, y: stageY + 0.34, w: stageW - 0.20, h: 0.24,
    color: COLOR.inkSoft, fontSize: 9, italic: true, fontFace: FONT.zh
  });

  const stages = [
    { num: "1", name: "MPO 偏好优化", detail: "DPO + BCO 混合\n~150K 偏好对(RLHF-V + VLFeedback)\n2 周 / 32 H100", color: COLOR.warn },
    { num: "2", name: "Image-RL", detail: "GSPO + outcome-based reward\n~50K 视觉推理任务\nverifier: string-match / mathruler / GUI\n3 周 / B200 cluster", color: COLOR.red },
    { num: "3", name: "Text-RL Stage 2", detail: "修文本回归(必跑)\n冻 token embedding\n~30K 自家文本任务\n1 周 / 32 H100", color: COLOR.brandA }
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
      { text: st.detail, options: { color: COLOR.ink, fontSize: 9.5 } }
    ], { x: stageX + 0.75, y: y + 0.05, w: stageW - 0.85, h: stageItemH - 0.10, margin: 0, fontFace: FONT.zh });
    if (i < stages.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: stageX + 0.40, y: y + stageItemH - 0.05, w: 0, h: 0.10,
        line: { color: COLOR.red, width: 1.5 }
      });
    }
  });

  // 中间:跳过的段 + 理由
  const mX = 3.75, mY = 0.85, mW = 3.40;
  s.addShape(pres.shapes.RECTANGLE, {
    x: mX, y: mY, w: mW, h: 5.05,
    fill: { color: "FFFFFF" }, line: { color: COLOR.inkFaint, width: 0.5 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: mX, y: mY, w: mW, h: 0.42,
    fill: { color: COLOR.red }, line: { color: COLOR.red, width: 0 }
  });
  s.addText("⊘ 跳过的段(及理由)", {
    x: mX + 0.10, y: mY + 0.05, w: mW - 0.20, h: 0.32,
    color: "FFFFFF", bold: true, fontSize: 12, valign: "middle", fontFace: FONT.zh
  });

  const skipped = [
    {
      name: "⊘ Text-RL Stage 1",
      reason: "Nemotron S1 是为多环境 RLVR 准备,我方仅做理解,无需多环境支持",
      risk: "低"
    },
    {
      name: "⊘ Omni-RL",
      reason: "Nemotron 是为 video+audio 联合推理,我方场景以 vision 为主,Image-RL + Audio benchmark 已可覆盖",
      risk: "中(若 DailyOmni 不达标需补)"
    },
    {
      name: "⊘ Audio-RL",
      reason: "Audio 理解任务多为 ASR / 分类,SFT 已经能逼近上限,RL 边际收益低",
      risk: "低"
    },
    {
      name: "▸ 后置可选项",
      reason: "若 T+18 后 Image-RL 后效果未达 Qwen3-Omni baseline,可补一段 Omni-RL(2-3 周)",
      risk: "—"
    }
  ];
  skipped.forEach((sk, i) => {
    const y = mY + 0.55 + i * 1.10;
    s.addText(sk.name, {
      x: mX + 0.10, y, w: mW - 0.20, h: 0.30,
      color: COLOR.red, bold: true, fontSize: 11, fontFace: FONT.zh
    });
    s.addText(sk.reason, {
      x: mX + 0.10, y: y + 0.30, w: mW - 0.20, h: 0.50,
      color: COLOR.ink, fontSize: 9, fontFace: FONT.zh
    });
    s.addText([
      { text: "风险: ", options: { color: COLOR.red, bold: true, fontSize: 9 } },
      { text: sk.risk, options: { color: COLOR.warn, bold: true, fontSize: 9 } }
    ], { x: mX + 0.10, y: y + 0.82, w: mW - 0.20, h: 0.20, fontFace: FONT.zh });
    if (i < skipped.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: mX + 0.10, y: y + 1.04, w: mW - 0.20, h: 0,
        line: { color: COLOR.inkFaint, width: 0.5 }
      });
    }
  });

  // 右侧:GSPO 关键超参
  const rX = 7.30, rY = 0.85, rW = 5.60;
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: 5.05,
    fill: { color: "FFFFFF" }, line: { color: COLOR.warn, width: 1.0 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: 0.42,
    fill: { color: COLOR.warn }, line: { color: COLOR.warn, width: 0 }
  });
  s.addText("⚙ GSPO 关键超参(参考 Nemotron NeMo-RL)", {
    x: rX + 0.10, y: rY + 0.05, w: rW - 0.20, h: 0.32,
    color: "FFFFFF", bold: true, fontSize: 12, valign: "middle", fontFace: FONT.zh
  });

  const gspoParams = [
    { k: "Algorithm", v: "Group Sequence Policy Optimization (GSPO)", note: "替代 PPO/DPO" },
    { k: "Global batch size", v: "4096", note: "Nemotron 同配置" },
    { k: "Rollouts / prompt", v: "16", note: "可降到 8 节省算力" },
    { k: "Optimizer", v: "AdamW (β₁=0.9, β₂=0.999)", note: "Linear warmup" },
    { k: "Pass-rate filter", v: "0.1 - 0.9", note: "AudioQA 收紧到 0.3-0.7" },
    { k: "Verifier 类型", v: "string-match / mathruler / multiple-choice / gui-coordinate", note: "smooth distance for GUI" },
    { k: "Format reward", v: "<think>...</think> + \\boxed{}", note: "partial credit ok" },
    { k: "Unanswerable 样本", v: "保留 ~5%", note: "训 abstention" },
    { k: "Token embedding", v: "Text-RL S2 时冻结", note: "防漂移" },
    { k: "Parallelism", v: "TP=2 / EP=32 / CP=2 (S5)", note: "B200 + H100 混部" }
  ];
  const gpTop = rY + 0.55;
  const gpH = 0.42;
  gspoParams.forEach((p, i) => {
    const y = gpTop + i * gpH;
    s.addText([
      { text: "▸ " + p.k + " ", options: { color: COLOR.red, bold: true, fontSize: 10 } },
      { text: p.v + "  ", options: { color: COLOR.ink, fontSize: 9.5 } },
      { text: "// " + p.note, options: { color: COLOR.inkSoft, fontSize: 9, italic: true } }
    ], { x: rX + 0.12, y, w: rW - 0.24, h: gpH - 0.04, margin: 0, fontFace: FONT.zh });
    if (i < gspoParams.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: rX + 0.12, y: y + gpH - 0.04, w: rW - 0.24, h: 0,
        line: { color: COLOR.inkFaint, width: 0.25 }
      });
    }
  });

  addRedConclusionBox(s, [
    { tag: "❶ Text-RL S2 不可省",
      body: "经 Stage 4/5 后文本必有 1-2 pt 漂移,",
      bold: "Text-RL S2 是把 MMLU-Pro 拉回 ≤2 pt 红线内的关键修复段",
      warn: "",
      tail: "" },
    { tag: "❷ Image-RL 是杠杆段",
      body: "ScreenSpot-Pro 类 GUI 任务 ",
      warn: "+50 个点 ",
      bold: "几乎全部来自 Image-RL,",
      tail: "Nemotron 实证" },
    { tag: "❸ MPO 比纯 DPO 稳",
      body: "MPO = DPO + BCO ",
      bold: "二元分类奖励混合,",
      warn: " 在 ~150K 偏好对上稳定性显著优于纯 DPO",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Nemotron 5 段 RL pipeline + GSPO 超参", tail: " (arxiv 2604.24954)" },
    { name: "MPO = DPO + BCO 配方", tail: " (Nemotron paper)" },
    { name: "NVIDIA/NeMo-RL", tail: " (开源 RL 框架)" }
  ]);
}

// ============================================================
// SLIDE 7 — 评测体系 + 文本回归红线 (Prototype A)
// ============================================================
function slide7() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "评测红线",
    "MMLU-Pro 损 ≤2 pt 是上线门槛,8 维度 36 项每周自动监控");

  // 主表
  const tbl = [
    [
      headerCell("评测维度"),
      headerCell("代表 benchmark"),
      headerCell("基线\n(自家 Text base)"),
      headerCell("Phase 1 目标\n(T+6)"),
      headerCell("Phase 4 目标\n(T+24,上线)"),
      headerCell("红线 / Go-No-Go")
    ],
    [
      rowLabelCell("文本回归 ★", COLOR.red),
      metricCell("MMLU-Pro / IFBench", "AIME25 / LiveCodeBench v6", COLOR.ink),
      metricCell("100%", "(基线)", COLOR.ink),
      metricCell("≥ 99%", "Stage 1 后", COLOR.warn),
      metricCell("≥ 98%", "等价 ≤2 pt 损", COLOR.good),
      metricCell("掉 >2 pt", "立即 rollback", COLOR.red)
    ],
    [
      rowLabelCell("视觉理解综合", COLOR.brandB),
      metricCell("MMMU / MM-Vet", "MMStar / SEED-Bench-2", COLOR.ink),
      metricCell("—", "(无视觉)", COLOR.inkSoft),
      metricCell("MMMU 55", "对标 LLaVA-OV", COLOR.warn),
      metricCell("MMMU 65+", "对标 Qwen3-VL", COLOR.good),
      metricCell("MMMU < 50", "Phase 1 不通过", COLOR.red)
    ],
    [
      rowLabelCell("OCR / 文档", COLOR.brandB),
      metricCell("OCRBench-V2 / DocVQA", "ChartQA / CharXiv RQ", COLOR.ink),
      metricCell("—", "—", COLOR.inkSoft),
      metricCell("DocVQA 90", "OCRBench 80", COLOR.warn),
      metricCell("DocVQA 93+", "CharXiv 60+", COLOR.good),
      metricCell("DocVQA < 85", "Phase 4 不上线", COLOR.red)
    ],
    [
      rowLabelCell("数学 / 推理", COLOR.brandB),
      metricCell("MathVista / MathVision", "MathVerse", COLOR.ink),
      metricCell("—", "—", COLOR.inkSoft),
      metricCell("MathVista 65", "—", COLOR.warn),
      metricCell("MathVista 75+", "对标 Qwen3-Omni", COLOR.good),
      metricCell("—", "soft 指标", COLOR.inkSoft)
    ],
    [
      rowLabelCell("Agent / GUI ★", COLOR.red),
      metricCell("ScreenSpot-Pro / OSWorld-G", "(2026 区分度最高)", COLOR.ink),
      metricCell("—", "—", COLOR.inkSoft),
      metricCell("SS-Pro 30", "Stage 1+RL 前", COLOR.warn),
      metricCell("SS-Pro 50+", "RL 后,对标 Nemotron", COLOR.good),
      metricCell("SS-Pro < 30", "RL 失败信号", COLOR.red)
    ],
    [
      rowLabelCell("音频理解", COLOR.brandA),
      metricCell("OpenASR / MMAU / MMAR", "VoiceBench", COLOR.ink),
      metricCell("—", "—", COLOR.inkSoft),
      metricCell("OpenASR avg WER 8", "—", COLOR.warn),
      metricCell("WER 7 / MMAU 70+", "—", COLOR.good),
      metricCell("WER > 10", "Phase 2 不通过", COLOR.red)
    ],
    [
      rowLabelCell("视频理解", COLOR.brandB),
      metricCell("VideoMME / LongVideoBench", "MVBench / NextQA", COLOR.ink),
      metricCell("—", "—", COLOR.inkSoft),
      metricCell("VideoMME 60", "短视频", COLOR.warn),
      metricCell("VideoMME 65+", "LongVB 60+", COLOR.good),
      metricCell("VideoMME < 55", "Phase 3 信号", COLOR.warn)
    ],
    [
      rowLabelCell("Omni 端到端 ★", COLOR.warn),
      metricCell("DailyOmni / WorldSense", "AVUT", COLOR.ink),
      metricCell("—", "—", COLOR.inkSoft),
      metricCell("—", "(Phase 2 未跑)", COLOR.inkSoft),
      metricCell("DailyOmni 70+", "WorldSense 50+", COLOR.good),
      metricCell("DailyOmni < 60", "整体未达 SOTA", COLOR.red)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: 0.85, w: 12.5, h: 5.05,
    colW: [1.65, 2.55, 1.60, 1.95, 2.20, 2.55],
    rowH: [0.50, 0.55, 0.55, 0.55, 0.55, 0.65, 0.55, 0.55, 0.65],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  addRedConclusionBox(s, [
    { tag: "❶ 三条硬红线",
      body: "MMLU-Pro 损 ",
      warn: "≤2 pt ",
      bold: "/ DocVQA ≥ 85 / ScreenSpot-Pro ≥ 30,",
      tail: "三条同时满足才能进入 Phase 4 RL" },
    { tag: "❷ 自动化频率",
      body: "Phase 1-3 期间 ",
      bold: "每 1B token 跑 mini-eval,每 5B token 跑全量,",
      warn: " 任何回归立即 alert",
      tail: "" },
    { tag: "❸ 上线判定",
      body: "T+24 同时满足 ",
      bold: "MMLU-Pro 98% / MMMU 65 / DocVQA 93 / SS-Pro 50 / DailyOmni 70 ",
      warn: "→ 上线;缺 1 项延 2-4 周修补",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Nemotron / Qwen3.5 / LongCat 三篇 benchmark", tail: " 整合" },
    { name: "VLMEvalKit + 自家 text 评测套件", tail: " (内部)" },
    { name: "上线判定标准", tail: " (产品 + Eng 内部对齐)" }
  ]);
}

// ============================================================
// SLIDE 8 — 风险矩阵 + 决策门 (Prototype A)
// ============================================================
function slide8() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "风险 + 决策门",
    "5 大风险 / 3 道 go-no-go gate,A/B 路径取决于 ckpt 质量");

  // 上半:3 个决策门(Gate 1/2/3)
  const gateY = 0.85;
  const gateH = 1.85;
  const gateW = 4.10;
  const gates = [
    {
      x: 0.4,
      name: "Gate 1: ckpt Sanity",
      time: "T = 0",
      criteria: [
        "MMLU-Pro 与预训练 team 报告差 ≤ 0.5 pt",
        "ChatML 模板兼容,词表完整",
        "无 NaN / 无重复 token 退化",
        "在 Qwen2.5 类比模型上 sanity 通过"
      ],
      pass: "→ 启动 Phase 1",
      fail: "→ 与预训练 team 排查 1 周",
      color: COLOR.warn
    },
    {
      x: 4.60,
      name: "Gate 2: Phase 1 SFT",
      time: "T+6",
      criteria: [
        "MMLU-Pro 损 ≤ 1 pt (Stage 0/1 后)",
        "MMMU ≥ 55,DocVQA ≥ 85",
        "ScreenSpot-Pro ≥ 25",
        "训练曲线无明显发散"
      ],
      pass: "→ 启动 Phase 2 (Audio + Omni)",
      fail: "→ rollback 到 Stage 0,补数据 1-2 周",
      color: COLOR.red
    },
    {
      x: 8.80,
      name: "Gate 3: Phase 4 RL",
      time: "T+18",
      criteria: [
        "RL 后 MMLU-Pro 损 ≤ 2 pt(若 >2 加 Text-RL S2)",
        "ScreenSpot-Pro ≥ 50",
        "DailyOmni ≥ 70",
        "无幻觉爆发(POPE > 90)"
      ],
      pass: "→ T+24 上线",
      fail: "→ 补 Omni-RL 段或 rollback 到 SFT-only 上线",
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
    // 标准
    g.criteria.forEach((c, i) => {
      s.addText([
        { text: "✓ ", options: { color: g.color, bold: true, fontSize: 10 } },
        { text: c, options: { color: COLOR.ink, fontSize: 9.5 } }
      ], { x: g.x + 0.12, y: gateY + 0.45 + i * 0.21, w: gateW - 0.24, h: 0.20, margin: 0, fontFace: FONT.zh });
    });
    // pass / fail
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

  // 下半:5 大风险(表格)
  const riskTbl = [
    [
      headerCell("风险"),
      headerCell("概率"),
      headerCell("影响"),
      headerCell("早期信号"),
      headerCell("Mitigation")
    ],
    [
      rowLabelCell("R1: ckpt 是 dense 不是 MoE", COLOR.warn),
      metricCell("中", "30%", COLOR.warn),
      metricCell("高", "+4-6 周", COLOR.red),
      metricCell("T-12 对齐时即可知", "—", COLOR.ink),
      metricCell("提前准备 upcycling", "代码,加 Phase 0.5", COLOR.warn)
    ],
    [
      rowLabelCell("R2: 预训练 team 不给 text 同分布", COLOR.red),
      metricCell("中高", "40%", COLOR.red),
      metricCell("高", "文本必漂移", COLOR.red),
      metricCell("T-8 仍未到位", "立 alert", COLOR.red),
      metricCell("退化到公开 Nemotron-text", "文本数据,损 ~3 pt 接受", COLOR.red)
    ],
    [
      rowLabelCell("R3: tokenizer 需扩词表", COLOR.warn),
      metricCell("中", "50%", COLOR.warn),
      metricCell("中", "前 1-2 ep 不稳", COLOR.warn),
      metricCell("Stage 0 loss 高", "—", COLOR.ink),
      metricCell("新 token embedding 用", "近义 token 平均初始化", COLOR.warn)
    ],
    [
      rowLabelCell("R4: ScreenSpot-Pro RL 不收敛", COLOR.warn),
      metricCell("中", "30%", COLOR.warn),
      metricCell("中", "agent 能力差", COLOR.warn),
      metricCell("Image-RL pass-rate 低", "—", COLOR.ink),
      metricCell("加 GUI 自标偏好 ~20K", "+ ScreenSpot 训练数据", COLOR.warn)
    ],
    [
      rowLabelCell("R5: B200 集群档期冲突", COLOR.warn),
      metricCell("中", "30%", COLOR.warn),
      metricCell("中", "RL 推迟 2-4 周", COLOR.warn),
      metricCell("T+10 资源未锁定", "—", COLOR.ink),
      metricCell("退化到 H100 跑 RL", "BS 减半,周期 +50%", COLOR.warn)
    ]
  ];
  s.addTable(riskTbl, {
    x: 0.4, y: 2.85, w: 12.5, h: 3.10,
    colW: [3.10, 1.30, 1.50, 2.40, 4.20],
    rowH: [0.45, 0.55, 0.55, 0.55, 0.55, 0.55],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  addRedConclusionBox(s, [
    { tag: "❶ A/B 路径取决于 ckpt",
      body: "若 ckpt 是 MoE 且预训练 team 提供 text 数据 → ",
      bold: "Path A 走完整 Lite 配方;",
      warn: " 否则 Path B 跑简化版 + 接受 ~3 pt 文本损",
      tail: "" },
    { tag: "❷ 三道 gate 不可跳",
      body: "任何 gate 不通过都不能强推下一阶段;",
      bold: "Gate 2 fail 后续概率 80% 失败,",
      warn: " 立即 rollback 比硬撑省 4 周",
      tail: "" },
    { tag: "❸ 最大风险是 R2",
      body: "预训练 team 不给 text 同分布数据是 ",
      warn: "40% 概率 + 高影响 ",
      bold: "组合,T-12 必须签 SLA",
      tail: "" }
  ]);

  addSources(s, [
    { name: "三篇 reference design 风险点", tail: " (Nemotron text-RL S2 / Qwen3.5 OPD)" },
    { name: "内部 risk register", tail: " (基于 dense vs MoE 配置 + 团队历史项目)" }
  ]);
}

// ============================================================
// 生成
// ============================================================
slide1(); slide2(); slide3(); slide4(); slide5(); slide6(); slide7(); slide8();
pres.writeFile({ fileName: "D:/work/omni_insight_deck/Omni_Understanding_Experiment_Plan_2026H2.pptx" })
  .then(name => console.log("Generated:", name));
