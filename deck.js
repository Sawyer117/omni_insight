// Omni 后训练技术洞察 deck —— 基于 Nemotron 3 Nano Omni / LongCat-Next / Qwen3.5-Omni 三篇报告
const pptxgen = require("pptxgenjs");

const COLOR = {
  ink:        "1F3864",
  red:        "C00000",
  inkSoft:    "595959",
  inkFaint:   "BFBFBF",
  warn:       "ED7D31",
  good:       "70AD47",
  brandA:     "7030A0",
  brandB:     "00B0F0",
  highlight:  "FFFF00",
  fillBlue:   "D9E2F3",
  fillOrange: "FCE4D6",
  fillGreen:  "E2EFDA",
  fillRed:    "FBDDDC",
  cardYellow: "FFF2CC",
  cardGray:   "F2F2F2",
  darkBg:     "0A0A1F",
  darkInk:    "E8E8F0"
};

const FONT = { zh: "Microsoft YaHei", en: "Calibri", mono: "Consolas", serif: "Times New Roman" };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3" x 7.5"
pres.author = "Tech Insight";
pres.title  = "Omni 后训练 2026.05 — 三派分立";

// ============================================================
// 通用工具
// ============================================================
function addTitleBand(slide, redText, blackText) {
  slide.addText([
    { text: redText,   options: { color: COLOR.red, bold: true, fontSize: 24 } },
    { text: ": ",       options: { color: COLOR.ink, bold: true, fontSize: 24 } },
    { text: blackText, options: { color: COLOR.ink, bold: true, fontSize: 22 } }
  ], { x: 0.4, y: 0.18, w: 12.5, h: 0.50, margin: 0, fontFace: FONT.zh });

  slide.addShape(pres.shapes.LINE, {
    x: 0.4, y: 0.72, w: 12.5, h: 0,
    line: { color: COLOR.red, width: 1.5 }
  });
}

function addRedConclusionBox(slide, conclusions, y = 6.20) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: y, w: 12.5, h: 1.00,
    fill: { color: "FFFFFF" },
    line: { color: COLOR.red, width: 1.5 }
  });
  conclusions.forEach((c, i) => {
    slide.addText([
      { text: c.tag + ": ", options: { color: COLOR.red, bold: true, fontSize: 11 } },
      { text: c.body,        options: { color: COLOR.ink, fontSize: 10 } },
      { text: c.bold || "",  options: { color: COLOR.ink, bold: true, fontSize: 10 } },
      { text: c.warn || "",  options: { color: COLOR.warn, bold: true, fontSize: 10 } },
      { text: c.tail || "",  options: { color: COLOR.inkSoft, fontSize: 9, italic: true } }
    ], {
      x: 0.5, y: y + 0.08 + i * 0.30, w: 12.3, h: 0.28,
      margin: 0, fontFace: FONT.zh
    });
  });
}

function addSources(slide, sources, y = 7.26) {
  const arr = [{ text: "Source: ", options: { color: COLOR.inkSoft, italic: true, fontSize: 8 } }];
  sources.forEach((s, i) => {
    arr.push({
      text: s.name,
      options: {
        color: COLOR.red, italic: true, fontSize: 8,
        underline: { style: "sng", color: COLOR.red }
      }
    });
    arr.push({
      text: s.tail + (i < sources.length - 1 ? " | " : ""),
      options: { color: COLOR.inkSoft, italic: true, fontSize: 8 }
    });
  });
  slide.addText(arr, { x: 0.4, y, w: 12.5, h: 0.22, margin: 0, fontFace: FONT.zh });
}

function metricCell(primary, secondary, primaryColor) {
  return {
    text: [
      { text: primary,   options: { color: primaryColor || COLOR.warn, bold: true, fontSize: 11, breakLine: true } },
      { text: secondary, options: { color: COLOR.inkSoft, fontSize: 9 } }
    ],
    options: { valign: "middle", align: "center", margin: 2 }
  };
}

function headerCell(text) {
  return {
    text,
    options: {
      fill: { color: COLOR.fillBlue }, color: COLOR.ink,
      bold: true, fontSize: 11, align: "center", valign: "middle"
    }
  };
}

function rowLabelCell(text, color) {
  return {
    text,
    options: {
      color: color || COLOR.red, bold: true, fontSize: 10,
      align: "left", valign: "middle", margin: 4
    }
  };
}

// ============================================================
// SLIDE 1 — 全景对比 + 象限 (Prototype A)
// 标题:Omni 后训练: 三派分立,Thinker-Talker 成共识
// ============================================================
function slide1() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };

  addTitleBand(s, "Omni 后训练 2026.05",
    "三派分立,Thinker-Talker 成共识,native unified 降为少数派");

  // 左侧大表 — 五维度 × 三派
  const tbl = [
    [
      headerCell("维度"),
      headerCell("Nemotron 3 Nano Omni\n(NVIDIA, 2026.04)"),
      headerCell("LongCat-Next\n(Meituan, 2026.03)"),
      headerCell("Qwen3.5-Omni\n(Alibaba, 2026.04)")
    ],
    [
      rowLabelCell("骨架架构", COLOR.ink),
      metricCell("模块化 Thinker", "30B-A3B MoE\nViT+MLP+Audio MLP", COLOR.ink),
      metricCell("Native Unified", "68.5B-A3B MoE\n单一离散 token 流", COLOR.brandA),
      metricCell("Thinker+Talker", "数百 B 双 MoE\nHybrid Attn+GDN", COLOR.warn)
    ],
    [
      rowLabelCell("文本损失", COLOR.ink),
      metricCell("~1 点", "MMLU-Pro 77.3 vs 78.3", COLOR.good),
      metricCell("~5.3 点", "MMLU 83.95 vs 89.28", COLOR.red),
      metricCell("~0.9 点", "MMLU-Pro 85.9 vs 86.8", COLOR.good)
    ],
    [
      rowLabelCell("RL 阶段数"),
      metricCell("5 段", "MPO/Text-RL/Image/\nOmni/Text-RL2", COLOR.warn),
      metricCell("未公开", "含 cluster\nrebalancing mid-train", COLOR.inkSoft),
      metricCell("3+4 段", "Thinker 3 段\nTalker 4 段", COLOR.warn)
    ],
    [
      rowLabelCell("RL 算法"),
      metricCell("GSPO", "+ MPO=DPO+BCO", COLOR.warn),
      metricCell("未明示", "DPO 风格", COLOR.inkSoft),
      metricCell("GSPO", "+ DPO + 规则奖励", COLOR.warn)
    ],
    [
      rowLabelCell("生成能力"),
      metricCell("无", "仅理解", COLOR.inkSoft),
      metricCell("图+语音", "GenEval 84.44\n超 FLUX.1-dev", COLOR.warn),
      metricCell("仅语音", "SEED-TTS WER\nzh 0.99 / en 1.26", COLOR.warn)
    ],
    [
      rowLabelCell("开放度", COLOR.ink),
      metricCell("全开源", "权重+代码+数据\nMegatron-Bridge", COLOR.good),
      metricCell("全开源", "权重+tokenizer\nGitHub", COLOR.good),
      metricCell("仅 API", "Plus / Flash 两档\n通义千问", COLOR.red)
    ],
    [
      rowLabelCell("上下文"),
      metricCell("256K", "三阶段扩展\n16K→48K→256K", COLOR.warn),
      metricCell("未明示", "—", COLOR.inkSoft),
      metricCell("256K", "S3 长上下文阶段", COLOR.warn)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: 0.85, w: 8.0, h: 5.05,
    colW: [1.4, 2.2, 2.2, 2.2],
    rowH: [0.55, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65],
    border: { pt: 0.5, color: COLOR.inkFaint },
    fontFace: FONT.zh
  });

  // 右侧象限图 — 文本保真 vs 生成全面
  // 坐标系框
  s.addShape(pres.shapes.RECTANGLE, {
    x: 8.6, y: 0.85, w: 4.4, h: 5.05,
    fill: { color: "FFFFFF" },
    line: { color: COLOR.inkFaint, width: 0.5 }
  });
  // 象限说明
  s.addText("二维定位:文本保真 × 生成能力", {
    x: 8.7, y: 0.95, w: 4.2, h: 0.30,
    color: COLOR.ink, bold: true, fontSize: 12, fontFace: FONT.zh
  });
  // x 轴
  s.addShape(pres.shapes.LINE, {
    x: 8.85, y: 5.55, w: 3.95, h: 0,
    line: { color: COLOR.ink, width: 1.0 }
  });
  // y 轴
  s.addShape(pres.shapes.LINE, {
    x: 8.85, y: 1.40, w: 0, h: 4.15,
    line: { color: COLOR.ink, width: 1.0 }
  });
  // 中心十字(分象限)
  s.addShape(pres.shapes.LINE, {
    x: 10.85, y: 1.40, w: 0, h: 4.15,
    line: { color: COLOR.inkFaint, width: 0.5, dashType: "dash" }
  });
  s.addShape(pres.shapes.LINE, {
    x: 8.85, y: 3.45, w: 3.95, h: 0,
    line: { color: COLOR.inkFaint, width: 0.5, dashType: "dash" }
  });
  // 轴标签
  s.addText("文本保真 →", {
    x: 8.85, y: 5.62, w: 3.95, h: 0.22,
    color: COLOR.ink, fontSize: 9, italic: true, align: "right", fontFace: FONT.zh
  });
  s.addText("生成全面\n↑", {
    x: 8.62, y: 1.40, w: 0.22, h: 1.0,
    color: COLOR.ink, fontSize: 9, italic: true, align: "center", fontFace: FONT.zh
  });
  // 三个气泡
  // Nemotron: 文本好(1点损),生成弱 → 右下
  s.addShape(pres.shapes.OVAL, {
    x: 11.55, y: 4.05, w: 0.85, h: 0.55,
    fill: { color: COLOR.fillBlue },
    line: { color: COLOR.ink, width: 1.5 }
  });
  s.addText("Nemotron", {
    x: 11.42, y: 4.16, w: 1.10, h: 0.35,
    color: COLOR.ink, bold: true, fontSize: 9, align: "center", fontFace: FONT.zh
  });
  // LongCat: 文本差(5.3点),生成强 → 左上
  s.addShape(pres.shapes.OVAL, {
    x: 9.10, y: 1.75, w: 0.85, h: 0.55,
    fill: { color: COLOR.fillRed },
    line: { color: COLOR.red, width: 1.5 }
  });
  s.addText("LongCat", {
    x: 8.97, y: 1.86, w: 1.10, h: 0.35,
    color: COLOR.red, bold: true, fontSize: 9, align: "center", fontFace: FONT.zh
  });
  // Qwen3.5: 文本最佳(0.9点),生成中(只语音) → 右中
  s.addShape(pres.shapes.OVAL, {
    x: 11.85, y: 2.45, w: 0.95, h: 0.60,
    fill: { color: COLOR.fillOrange },
    line: { color: COLOR.warn, width: 1.5 }
  });
  s.addText("Qwen3.5", {
    x: 11.72, y: 2.58, w: 1.20, h: 0.35,
    color: COLOR.warn, bold: true, fontSize: 9, align: "center", fontFace: FONT.zh
  });
  // 象限标签
  s.addText("理想区\n(文本+生成全)", {
    x: 11.0, y: 1.50, w: 1.85, h: 0.45,
    color: COLOR.inkSoft, fontSize: 8, italic: true, align: "center", fontFace: FONT.zh
  });
  s.addText("理解专精\n(无生成)", {
    x: 11.0, y: 5.10, w: 1.85, h: 0.40,
    color: COLOR.inkSoft, fontSize: 8, italic: true, align: "center", fontFace: FONT.zh
  });

  // 象限注解
  s.addText([
    { text: "▸ 无气泡进入「理想区」",  options: { color: COLOR.red, bold: true, fontSize: 10, breakLine: true } },
    { text: "▸ 三派各占一象限,2026 内无人通吃",
      options: { color: COLOR.ink, fontSize: 9, breakLine: true } },
    { text: "▸ Qwen3.5 仅靠 Talker 加语音生成",
      options: { color: COLOR.ink, fontSize: 9 } }
  ], { x: 8.85, y: 5.78, w: 4.0, h: 0.40, fontFace: FONT.zh });

  addRedConclusionBox(s, [
    { tag: "❶ 三派分立",
      body: "2026 Q1-Q2 出现 ",
      bold: "Nemotron / LongCat / Qwen3.5 ",
      warn: "三套都跑通的 reference design",
      tail: ",彼此 use case 不重叠" },
    { tag: "❷ 共识收敛",
      body: "Thinker-Talker(独立 MoE+多码本 RVQ)成主流,unified discrete 仅 ",
      bold: "LongCat ",
      warn: "一家坚持,占比 1/3",
      tail: "" },
    { tag: "❸ 文本税分化",
      body: "Qwen3.5 ",
      warn: "仅 0.9 点 ",
      bold: "MMLU-Pro 损失,",
      tail: "LongCat 5.3 点是路径选择的真实代价" }
  ]);

  addSources(s, [
    { name: "Nemotron 3 Nano Omni Tech Report", tail: " (arxiv 2604.24954, 2026.04)" },
    { name: "LongCat-Next", tail: " (arxiv 2603.27538, 2026.03)" },
    { name: "Qwen3.5-Omni Tech Report", tail: " (arxiv 2604.15804, 2026.04)" }
  ]);
}

// ============================================================
// SLIDE 2 — Talker 设计收敛(Prototype B 深色拓扑)
// ============================================================
function slide2() {
  const s = pres.addSlide();
  s.background = { color: COLOR.darkBg };

  // 标题(深色背景下:红仍然红,黑改白)
  s.addText([
    { text: "Talker 收敛", options: { color: COLOR.red, bold: true, fontSize: 24 } },
    { text: ": ",            options: { color: COLOR.darkInk, bold: true, fontSize: 24 } },
    { text: "独立 MoE+多码本 RVQ+ARIA 战胜 unified,unified 退守 1/3",
      options: { color: COLOR.darkInk, bold: true, fontSize: 22 } }
  ], { x: 0.4, y: 0.18, w: 12.5, h: 0.50, margin: 0, fontFace: FONT.zh });

  s.addShape(pres.shapes.LINE, {
    x: 0.4, y: 0.72, w: 12.5, h: 0,
    line: { color: COLOR.red, width: 1.5 }
  });

  // 三列拓扑(每列一个 Talker 范式)
  const colW = 4.0;
  const colY = 1.0;
  const colH = 4.45;
  const cols = [
    {
      x: 0.4,
      title: "Qwen3.5-Omni 范式",
      subtitle: "独立 MoE Talker + 多码本 RVQ + ARIA",
      bgFill: "16213E",
      accent: COLOR.warn,
      blocks: [
        { label: "Thinker", detail: "Hybrid-Attn MoE + GDN", color: COLOR.brandB },
        { label: "Talker(独立 MoE)", detail: "多码本 RVQ + MTP", color: COLOR.warn },
        { label: "Code2Wav", detail: "因果 ConvNet 流式\n3-5ms / 帧", color: COLOR.good },
        { label: "ARIA 单通道", detail: "speech/text 累计比约束\n替代 dual-channel", color: COLOR.warn }
      ],
      metric: "TTFC 54-56ms\nTTFP 235-435ms"
    },
    {
      x: 4.65,
      title: "LongCat-Next 范式",
      subtitle: "Native unified discrete tokens",
      bgFill: "1F1F3D",
      accent: COLOR.brandA,
      blocks: [
        { label: "统一离散 token 空间", detail: "text/image/audio 共享词表", color: COLOR.brandA },
        { label: "dNaViT(8 级 RVQ)", detail: "16,384 codebook × 8 级\nEMA 更新", color: COLOR.brandA },
        { label: "Whisper + 8 层 RVQ", detail: "12.5 Hz token rate", color: COLOR.brandA },
        { label: "无独立 Talker", detail: "音频/图像走 NTP\nflow-matching 解码", color: COLOR.red }
      ],
      metric: "GenEval 84.44\n但文本损 5.3 点"
    },
    {
      x: 8.90,
      title: "Nemotron 范式",
      subtitle: "模块化理解,不做生成",
      bgFill: "162132",
      accent: COLOR.brandB,
      blocks: [
        { label: "Nemotron 30B-A3B", detail: "Mamba-Transformer MoE", color: COLOR.brandB },
        { label: "C-RADIOv4-H + MLP", detail: "视觉模态 projector", color: COLOR.brandB },
        { label: "Parakeet-TDT 0.6B + MLP", detail: "FastConformer 12.5 t/s", color: COLOR.brandB },
        { label: "无 Talker 头", detail: "仅理解,无语音/图像\n输出能力", color: COLOR.red }
      ],
      metric: "纯理解 SOTA\nScreenSpot-Pro 59.3"
    }
  ];

  cols.forEach(c => {
    // 列底框
    s.addShape(pres.shapes.RECTANGLE, {
      x: c.x, y: colY, w: colW, h: colH,
      fill: { color: c.bgFill },
      line: { color: c.accent, width: 1.5 }
    });
    // 标题
    s.addText(c.title, {
      x: c.x + 0.1, y: colY + 0.08, w: colW - 0.2, h: 0.32,
      color: c.accent, bold: true, fontSize: 13, fontFace: FONT.zh
    });
    s.addText(c.subtitle, {
      x: c.x + 0.1, y: colY + 0.40, w: colW - 0.2, h: 0.30,
      color: COLOR.darkInk, fontSize: 10, italic: true, fontFace: FONT.zh
    });
    // 4 个 block,垂直堆叠
    const blockTop = colY + 0.80;
    const blockH = 0.65;
    c.blocks.forEach((b, i) => {
      const y = blockTop + i * (blockH + 0.08);
      // block 框
      s.addShape(pres.shapes.RECTANGLE, {
        x: c.x + 0.15, y, w: colW - 0.30, h: blockH,
        fill: { color: "0F1525" },
        line: { color: b.color, width: 0.75 }
      });
      // 左侧色条
      s.addShape(pres.shapes.RECTANGLE, {
        x: c.x + 0.15, y, w: 0.08, h: blockH,
        fill: { color: b.color },
        line: { color: b.color, width: 0 }
      });
      s.addText([
        { text: b.label, options: { color: b.color, bold: true, fontSize: 11, breakLine: true } },
        { text: b.detail, options: { color: COLOR.darkInk, fontSize: 9 } }
      ], { x: c.x + 0.30, y: y + 0.04, w: colW - 0.45, h: blockH - 0.08, margin: 0, fontFace: FONT.zh });
    });
    // 底部度量框
    const mY = blockTop + 4 * (blockH + 0.08) - 0.04;
    s.addShape(pres.shapes.RECTANGLE, {
      x: c.x + 0.15, y: mY, w: colW - 0.30, h: 0.55,
      fill: { color: c.accent },
      line: { color: c.accent, width: 0 }
    });
    s.addText(c.metric, {
      x: c.x + 0.20, y: mY + 0.04, w: colW - 0.40, h: 0.50,
      color: "FFFFFF", bold: true, fontSize: 10, align: "center", fontFace: FONT.zh
    });
  });

  // 中间分隔箭头(逻辑流向)
  // 从 LongCat 指向 Qwen3.5(表示后者击败前者)
  // 不画箭头避免拥挤,改用底部小注

  addRedConclusionBox(s, [
    { tag: "❶ ARIA 击败 dual-channel",
      body: "Qwen3.5 显式否定自家 Qwen3-Omni 的双轨生成,改单通道",
      warn: " 单调累计比约束 ",
      bold: "替代 TMRoPE,",
      tail: "对齐开销大降" },
    { tag: "❷ 多码本 RVQ 标准化",
      body: "Qwen3.5 多码本 + MTP 残差头与 LongCat 8 级 RVQ × ",
      warn: "16,384 ",
      bold: "codebook 形成事实标准",
      tail: "" },
    { tag: "❸ Unified 退守少数派",
      body: "三派里 ",
      bold: "仅 LongCat ",
      warn: "走 unified discrete,2/3 SOTA 选独立 Talker;",
      tail: "scaling 优劣需 H2 验证" }
  ], 6.20);

  addSources(s, [
    { name: "Qwen3.5-Omni: ARIA + Code2Wav + 多码本 RVQ", tail: " (2026.04)" },
    { name: "LongCat-Next: DiNA 8 级 RVQ × 16K", tail: " (2026.03)" },
    { name: "Nemotron 3 Nano Omni: 无 Talker", tail: " (2026.04)" }
  ]);
}

// ============================================================
// SLIDE 3 — 多段 RL 时代 (Prototype C 流程矩阵)
// ============================================================
function slide3() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };

  addTitleBand(s, "多段 RL 时代",
    "GSPO 三连发,SFT-only 退出 omni 前沿,RL 阶段 ≥5 段成新基线");

  // 左侧:阶段轴(纵向)
  const stageX = 0.4;
  const stageY = 0.85;
  const stageW = 2.6;
  const stageH = 5.05;
  s.addShape(pres.shapes.RECTANGLE, {
    x: stageX, y: stageY, w: stageW, h: stageH,
    fill: { color: COLOR.cardGray },
    line: { color: COLOR.inkFaint, width: 0.5 }
  });
  s.addText("RL 阶段轴(Nemotron 范式)", {
    x: stageX + 0.10, y: stageY + 0.05, w: stageW - 0.20, h: 0.30,
    color: COLOR.ink, bold: true, fontSize: 12, fontFace: FONT.zh
  });

  const stages = [
    { num: "1", name: "MPO", detail: "DPO + BCO\n混合偏好优化" },
    { num: "2", name: "Text-RL Stage 1", detail: "多环境 RLVR/RLHF\n冻结 token embedding" },
    { num: "3", name: "Image-RL", detail: "74K 视觉推理\nGSPO + pass-rate filter" },
    { num: "4", name: "Omni-RL", detail: "120K prompts × 113 子集\nverifier: 1-WER 等" },
    { num: "5", name: "Text-RL Stage 2", detail: "修文本回归\n最后一段必跑" }
  ];

  const stageItemH = 0.85;
  stages.forEach((st, i) => {
    const y = stageY + 0.45 + i * (stageItemH + 0.05);
    // 编号圆
    s.addShape(pres.shapes.OVAL, {
      x: stageX + 0.10, y: y + 0.18, w: 0.40, h: 0.40,
      fill: { color: COLOR.red },
      line: { color: COLOR.red, width: 0 }
    });
    s.addText(st.num, {
      x: stageX + 0.10, y: y + 0.18, w: 0.40, h: 0.40,
      color: "FFFFFF", bold: true, fontSize: 14, align: "center", valign: "middle", fontFace: FONT.zh
    });
    // 名称 + 描述
    s.addText([
      { text: st.name, options: { color: COLOR.ink, bold: true, fontSize: 11, breakLine: true } },
      { text: st.detail, options: { color: COLOR.inkSoft, fontSize: 9 } }
    ], { x: stageX + 0.55, y: y + 0.05, w: stageW - 0.65, h: stageItemH - 0.10, margin: 0, fontFace: FONT.zh });
    // 阶段间箭头
    if (i < stages.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: stageX + 0.30, y: y + stageItemH - 0.05, w: 0, h: 0.10,
        line: { color: COLOR.red, width: 1.0 }
      });
    }
  });

  // 右侧:三家 RL 配方对比(卡片矩阵 3 列)
  const rightX = 3.10;
  const rightY = 0.85;
  const rightW = 9.80;
  const cardW = 3.18;
  const cardH = 5.05;
  const vendors = [
    {
      x: rightX,
      name: "Nemotron 3 Nano Omni",
      color: COLOR.ink,
      lines: [
        { tag: "RL 段数", val: "5 段(全栈)", color: COLOR.warn },
        { tag: "算法", val: "GSPO + MPO(DPO+BCO)", color: COLOR.ink },
        { tag: "集群", val: "B200 + H100 / NeMo-RL", color: COLOR.ink },
        { tag: "BS / rollouts", val: "4096 global / 16 rollouts", color: COLOR.ink },
        { tag: "Verifier", val: "string-match / mathruler /\ngui-coordinate / 1-WER", color: COLOR.ink },
        { tag: "Pass-rate filter", val: "0.1-0.9 (AudioQA 0.3-0.7)", color: COLOR.warn },
        { tag: "Image-RL 数据", val: "~74K(chart/STEM/games/\ngrounding/VQA)", color: COLOR.ink },
        { tag: "Omni-RL 数据", val: "~120K, 113 sub-datasets", color: COLOR.warn },
        { tag: "拒答样本", val: "含 unanswerable 训 abstention", color: COLOR.good }
      ]
    },
    {
      x: rightX + (cardW + 0.10),
      name: "Qwen3.5-Omni",
      color: COLOR.ink,
      lines: [
        { tag: "RL 段数", val: "Thinker 3 + Talker 4 = 7 段", color: COLOR.warn },
        { tag: "算法", val: "GSPO + DPO + 规则奖励", color: COLOR.ink },
        { tag: "Thinker S1", val: "Specialist Distillation\n(text/vision/audio 多专家)", color: COLOR.warn },
        { tag: "Thinker S2", val: "On-Policy Distillation\n(text→audio 行为对齐)", color: COLOR.warn },
        { tag: "Thinker S3", val: "Interaction-Aligned RL\n(多轮 / persona / code-switch)", color: COLOR.ink },
        { tag: "Talker DPO", val: "多语种偏好对 + GSPO\n稳定化", color: COLOR.ink },
        { tag: "Talker S4", val: "Speaker FT\n(轻量化 speaker 适配)", color: COLOR.ink },
        { tag: "数据格式", val: "ChatML 全程", color: COLOR.inkSoft },
        { tag: "开放度", val: "API only(无权重)", color: COLOR.red }
      ]
    },
    {
      x: rightX + 2 * (cardW + 0.10),
      name: "LongCat-Next",
      color: COLOR.ink,
      lines: [
        { tag: "RL 段数", val: "未细化(主要 SFT)", color: COLOR.inkSoft },
        { tag: "算法", val: "DPO 风格(论文未明示 GSPO)", color: COLOR.inkSoft },
        { tag: "Pretrain", val: "DiNA 2T+ token\n联合预训练", color: COLOR.brandA },
        { tag: "Mid-train", val: "Cluster-based Rebalancing\n(替代显式 RL 模态分段)", color: COLOR.brandA },
        { tag: "SFT", val: "指令多模态 + 任务特化", color: COLOR.ink },
        { tag: "Tokenizer 训练", val: "Commitment + 语义重建\n+ flow-matching 细化", color: COLOR.brandA },
        { tag: "Audio 蒸馏", val: "L_audio = λ₁L_recon\n+ λ₂L_commit + λ₃L_llm", color: COLOR.brandA },
        { tag: "结构观察", val: "RVQ 替代 RL 模态分段\n=「数据驱动」分流", color: COLOR.warn },
        { tag: "开放度", val: "全开源(GitHub + HF)", color: COLOR.good }
      ]
    }
  ];

  vendors.forEach(v => {
    // 卡片框
    s.addShape(pres.shapes.RECTANGLE, {
      x: v.x, y: rightY, w: cardW, h: cardH,
      fill: { color: "FFFFFF" },
      line: { color: COLOR.inkFaint, width: 0.5 }
    });
    // 顶部色条
    s.addShape(pres.shapes.RECTANGLE, {
      x: v.x, y: rightY, w: cardW, h: 0.42,
      fill: { color: COLOR.fillBlue },
      line: { color: COLOR.inkFaint, width: 0 }
    });
    s.addText(v.name, {
      x: v.x + 0.08, y: rightY + 0.05, w: cardW - 0.16, h: 0.32,
      color: COLOR.ink, bold: true, fontSize: 12, valign: "middle", fontFace: FONT.zh
    });
    // 9 行 tag : val
    const lineH = 0.49;
    v.lines.forEach((ln, i) => {
      const y = rightY + 0.50 + i * lineH;
      s.addText([
        { text: ln.tag + " ", options: { color: COLOR.red, bold: true, fontSize: 9, breakLine: true } },
        { text: ln.val, options: { color: ln.color, fontSize: 9 } }
      ], { x: v.x + 0.10, y, w: cardW - 0.20, h: lineH - 0.05, margin: 0, fontFace: FONT.zh });
      if (i < v.lines.length - 1) {
        s.addShape(pres.shapes.LINE, {
          x: v.x + 0.10, y: y + lineH - 0.04, w: cardW - 0.20, h: 0,
          line: { color: COLOR.inkFaint, width: 0.25 }
        });
      }
    });
  });

  addRedConclusionBox(s, [
    { tag: "❶ GSPO 三连发",
      body: "Nemotron + Qwen3.5 显式 GSPO,LongCat 隐式同向;DPO 单跑在 omni 已 ",
      warn: "事实退役",
      tail: "" },
    { tag: "❷ 模态分段 RL 是杠杆",
      body: "Nemotron 的 Image-RL → Omni-RL → ",
      bold: "Text-RL Stage 2 ",
      warn: "是文本不漂移的关键,",
      tail: "5 段不可跳" },
    { tag: "❸ Specialist Distillation",
      body: "Qwen3.5 公开 ",
      bold: "「先专才后通才」",
      warn: " 配方,Nemotron 隐式同构(text-RL→image-RL→omni-RL)",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Nemotron 3 Nano Omni RL pipeline", tail: " (2026.04)" },
    { name: "Qwen3.5-Omni: Specialist + OPD + Interaction-RL", tail: " (2026.04)" },
    { name: "LongCat-Next: 2T+ token DiNA pretrain", tail: " (2026.03)" }
  ]);
}

// ============================================================
// SLIDE 4 — Qwen3.5 配方深潜(Prototype E 三列图文卡)
// ============================================================
function slide4() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };

  addTitleBand(s, "Qwen3.5 配方",
    "AuT 40M 小时+OPD 蒸馏+ARIA 单通道,文本仅损 0.9 点的代价压舱物");

  const colW = 4.10;
  const colY = 0.95;
  const colH = 4.95;
  const colXs = [0.4, 4.60, 8.80];

  const cols = [
    {
      x: colXs[0],
      tag: "AuT",
      title: "音频 encoder 自研",
      subtitle: "替代 Whisper / Parakeet 路线",
      bigNum: "40M",
      bigUnit: "小时监督音对",
      params: [
        { k: "Token rate", v: "6.25 Hz / 160 ms" },
        { k: "下采样", v: "4 层 Conv2D × 16×" },
        { k: "训练比例", v: "中:英:其他 = 3.5:3.5:3" },
        { k: "覆盖语种", v: "20+ 语言" },
        { k: "注意力", v: "动态窗口(实时↔离线)" }
      ],
      note: "vs Whisper-v3 (~5M 小时),vs Parakeet-TDT-0.6B(12.5 t/s)。AuT 选稀疏化 + 自研策略"
    },
    {
      x: colXs[1],
      tag: "ARIA",
      title: "Adaptive Rate Interleave Alignment",
      subtitle: "替代 dual-channel + TMRoPE",
      bigNum: "1",
      bigUnit: "通道(原 2)",
      params: [
        { k: "约束", v: "speech/text 累计比 ≤ 全局比" },
        { k: "替代对象", v: "Qwen3-Omni 双轨生成" },
        { k: "解决问题", v: "漏字 / 错音 / 数字念错" },
        { k: "调度", v: "monotonic interleaving" },
        { k: "对齐机制", v: "比例约束(非时间 ID)" }
      ],
      note: "ARIA 是对自家 TMRoPE 的显式否定,信号:业界向更轻对齐机制收敛"
    },
    {
      x: colXs[2],
      tag: "OPD",
      title: "On-Policy Distillation",
      subtitle: "audio-query 行为向 text-query 对齐",
      bigNum: "≤0.9",
      bigUnit: "MMLU-Pro 文本损",
      params: [
        { k: "配对方式", v: "同 query 的 (audio, text) 对" },
        { k: "蒸馏目标", v: "用 text response 监督 audio" },
        { k: "修补问题", v: "「问同问题语音答错」" },
        { k: "复用门槛", v: "低,可独立加进 SFT" },
        { k: "搭配", v: "Specialist Distillation 之后" }
      ],
      note: "三个 trick 合力把 omni 文本损降到 ~1 点;Nemotron 1 点、LongCat 5.3 点为对照"
    }
  ];

  cols.forEach(c => {
    // 卡片底
    s.addShape(pres.shapes.RECTANGLE, {
      x: c.x, y: colY, w: colW, h: colH,
      fill: { color: "FFFFFF" },
      line: { color: COLOR.inkFaint, width: 0.5 }
    });
    // 顶部红色 tag 条
    s.addShape(pres.shapes.RECTANGLE, {
      x: c.x, y: colY, w: colW, h: 0.50,
      fill: { color: COLOR.red },
      line: { color: COLOR.red, width: 0 }
    });
    s.addText(c.tag, {
      x: c.x + 0.10, y: colY + 0.05, w: colW - 0.20, h: 0.40,
      color: "FFFFFF", bold: true, fontSize: 18, valign: "middle", fontFace: FONT.zh
    });
    // 子标题
    s.addText(c.title, {
      x: c.x + 0.12, y: colY + 0.55, w: colW - 0.24, h: 0.32,
      color: COLOR.ink, bold: true, fontSize: 13, fontFace: FONT.zh
    });
    s.addText(c.subtitle, {
      x: c.x + 0.12, y: colY + 0.86, w: colW - 0.24, h: 0.26,
      color: COLOR.inkSoft, italic: true, fontSize: 10, fontFace: FONT.zh
    });
    // 大数字
    s.addShape(pres.shapes.RECTANGLE, {
      x: c.x + 0.20, y: colY + 1.20, w: colW - 0.40, h: 1.10,
      fill: { color: COLOR.cardYellow },
      line: { color: COLOR.warn, width: 0.75 }
    });
    s.addText([
      { text: c.bigNum, options: { color: COLOR.warn, bold: true, fontSize: 36 } }
    ], { x: c.x + 0.20, y: colY + 1.22, w: colW - 0.40, h: 0.78, align: "center", valign: "middle", fontFace: FONT.zh });
    s.addText(c.bigUnit, {
      x: c.x + 0.20, y: colY + 1.96, w: colW - 0.40, h: 0.30,
      color: COLOR.ink, bold: true, fontSize: 11, align: "center", fontFace: FONT.zh
    });
    // 参数行(5 行 k:v)
    const paramTop = colY + 2.45;
    const paramH = 0.36;
    c.params.forEach((p, i) => {
      const y = paramTop + i * paramH;
      s.addText([
        { text: "▸ " + p.k + " ", options: { color: COLOR.red, bold: true, fontSize: 10 } },
        { text: p.v, options: { color: COLOR.ink, fontSize: 9.5 } }
      ], { x: c.x + 0.15, y, w: colW - 0.30, h: paramH - 0.04, margin: 0, fontFace: FONT.zh });
      if (i < c.params.length - 1) {
        s.addShape(pres.shapes.LINE, {
          x: c.x + 0.15, y: y + paramH - 0.04, w: colW - 0.30, h: 0,
          line: { color: COLOR.inkFaint, width: 0.25 }
        });
      }
    });
    // 底部红色注解
    const noteY = paramTop + 5 * paramH + 0.10;
    s.addShape(pres.shapes.RECTANGLE, {
      x: c.x + 0.15, y: noteY, w: colW - 0.30, h: 0.62,
      fill: { color: COLOR.fillRed },
      line: { color: COLOR.red, width: 0.5 }
    });
    s.addText(c.note, {
      x: c.x + 0.20, y: noteY + 0.04, w: colW - 0.40, h: 0.54,
      color: COLOR.ink, fontSize: 9, italic: true, fontFace: FONT.zh
    });
  });

  addRedConclusionBox(s, [
    { tag: "❶ AuT 是隐藏门槛",
      body: "40M 小时音频是 Qwen3.5 ASR 击败 Gemini-3.1 的护城河;",
      bold: "开源 Whisper 仅 ~5M 小时",
      warn: ",门槛差 8×",
      tail: "" },
    { tag: "❷ ARIA 对齐降阶",
      body: "把 dual-channel 退化为 ",
      bold: "single-channel 单调比例约束 ",
      warn: ",同步开销大降,",
      tail: "对齐机制收敛信号已现" },
    { tag: "❸ OPD 是即插即用 trick",
      body: "无需完整 specialist 蒸馏,",
      bold: "复用门槛低,",
      warn: " 任何 omni 团队可独立加进 SFT 段",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Qwen3.5-Omni Tech Report", tail: " — AuT / ARIA / OPD / Specialist Distillation (2026.04)" },
    { name: "Qwen3-Omni / Qwen2.5-Omni", tail: " — TMRoPE / dual-channel 对照" }
  ]);
}

// ============================================================
// SLIDE 5 — LongCat DiNA 公式分解(Prototype D)
// ============================================================
function slide5() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };

  addTitleBand(s, "LongCat 文本税",
    "DiNA 8 级 RVQ × 16K 码本换图像生成,文本损 5.3 个 MMLU 点");

  // 顶部公式带:DiNA 三流
  const fY = 0.85;
  const fH = 1.15;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: fY, w: 12.5, h: fH,
    fill: { color: COLOR.cardGray },
    line: { color: COLOR.ink, width: 0.5 }
  });
  s.addText("DiNA(Discrete Native Autoregressive)三流统一", {
    x: 0.50, y: fY + 0.05, w: 12.30, h: 0.30,
    color: COLOR.ink, bold: true, fontSize: 12, fontFace: FONT.zh
  });

  // 三个因子:Text / dNaViT / Audio-RVQ
  const facX = [0.55, 4.80, 9.05];
  const facW = 4.05;
  const facY = fY + 0.40;
  const facH = 0.65;
  const facs = [
    { name: "Text", expr: "原生离散 token", detail: "标准 LLM 词表,无变化", color: COLOR.brandB },
    { name: "Vision (dNaViT)", expr: "SAE → RVQ × 8 级",
      detail: "16,384 codebook × 8 / EMA 更新 / ≤28× 压缩", color: COLOR.brandA },
    { name: "Audio (Whisper+RVQ)", expr: "Whisper → 4× → 8 层 RVQ",
      detail: "12.5 Hz token rate / mel + flow + HiFi-GAN", color: COLOR.warn }
  ];
  facs.forEach((f, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: facX[i], y: facY, w: facW, h: facH,
      fill: { color: "FFFFFF" },
      line: { color: f.color, width: 1.0 }
    });
    s.addText([
      { text: f.name + " ", options: { color: f.color, bold: true, fontSize: 11 } },
      { text: "= " + f.expr, options: { color: COLOR.ink, bold: true, fontSize: 11, breakLine: true } },
      { text: f.detail, options: { color: COLOR.inkSoft, fontSize: 9 } }
    ], { x: facX[i] + 0.10, y: facY + 0.06, w: facW - 0.20, h: facH - 0.10, margin: 0, fontFace: FONT.zh });
    if (i < 2) {
      // ⊕ 号
      s.addText("⊕", {
        x: facX[i] + facW - 0.02, y: facY + 0.10, w: 0.18, h: 0.45,
        color: COLOR.red, bold: true, fontSize: 22, align: "center", valign: "middle",
        fontFace: FONT.serif
      });
    }
  });
  // 底部统一指向
  s.addText("→  统一 NTP 目标(无模态特化设计)→  Modality-Agnostic MoE Backbone(LongCat-Flash-Lite A3B,68.5B / 3B 活跃)",
  {
    x: 0.55, y: fY + 0.70, w: 12.30, h: 0.40,
    color: COLOR.ink, bold: true, fontSize: 11, align: "center", fontFace: FONT.zh
  });

  // 左侧:文本回归代价表(纵向)
  const lX = 0.4;
  const lY = 2.18;
  const lW = 5.30;
  const lH = 3.85;
  const leftTbl = [
    [
      headerCell("文本基准"),
      headerCell("LongCat-Next\n(omni)"),
      headerCell("Qwen3-Next-80B\n(text-only base)"),
      headerCell("Δ")
    ],
    [
      rowLabelCell("MMLU"),
      metricCell("83.95", "—", COLOR.ink),
      metricCell("89.28", "—", COLOR.ink),
      metricCell("-5.33", "点", COLOR.red)
    ],
    [
      rowLabelCell("MMLU-Pro"),
      metricCell("77.02", "—", COLOR.ink),
      metricCell("82.93", "—", COLOR.ink),
      metricCell("-5.91", "点", COLOR.red)
    ],
    [
      rowLabelCell("C-Eval"),
      metricCell("86.80", "—", COLOR.ink),
      metricCell("90.91", "—", COLOR.ink),
      metricCell("-4.11", "点", COLOR.red)
    ],
    [
      rowLabelCell("Tau2-Telecom", COLOR.ink),
      metricCell("62.06", "—", COLOR.good),
      metricCell("—", "(Qwen3-Omni 4.39)", COLOR.inkSoft),
      metricCell("+57.7", "vs Qwen3-Omni", COLOR.good)
    ],
    [
      rowLabelCell("SWE-Bench", COLOR.ink),
      metricCell("43.00", "—", COLOR.good),
      metricCell("37.60", "—", COLOR.ink),
      metricCell("+5.4", "(超基座)", COLOR.good)
    ],
    [
      rowLabelCell("文本税中位数", COLOR.red),
      metricCell("—", "三项 MMLU 类", COLOR.ink),
      metricCell("—", "—", COLOR.ink),
      metricCell("≈ -5.3", "MMLU 点", COLOR.red)
    ]
  ];
  s.addTable(leftTbl, {
    x: lX, y: lY, w: lW, h: lH,
    colW: [1.40, 1.30, 1.55, 1.05],
    rowH: [0.55, 0.50, 0.50, 0.50, 0.60, 0.50, 0.65],
    border: { pt: 0.5, color: COLOR.inkFaint },
    fontFace: FONT.zh
  });

  // 右侧:换来的能力(矩阵 4 行)
  const rX = 5.85;
  const rY = 2.18;
  const rW = 7.05;
  const rH = 3.85;
  const benefitTbl = [
    [
      headerCell("换来的生成能力"),
      headerCell("LongCat"),
      headerCell("FLUX.1-dev\n(T2I 专长)"),
      headerCell("Qwen-Image-2507"),
      headerCell("Gemini-2.5-Flash")
    ],
    [
      rowLabelCell("GenEval", COLOR.warn),
      metricCell("84.44", "↑18 vs FLUX", COLOR.good),
      metricCell("66.00", "—", COLOR.ink),
      metricCell("87.00", "略高", COLOR.ink),
      metricCell("79.67", "—", COLOR.ink)
    ],
    [
      rowLabelCell("DPG", COLOR.warn),
      metricCell("84.66", "—", COLOR.good),
      metricCell("84.00", "—", COLOR.ink),
      metricCell("88.32", "—", COLOR.ink),
      metricCell("85.82", "—", COLOR.ink)
    ],
    [
      rowLabelCell("LongText-EN", COLOR.warn),
      metricCell("93.15", "↑33 vs FLUX", COLOR.good),
      metricCell("60.70", "—", COLOR.ink),
      metricCell("94.30", "—", COLOR.ink),
      metricCell("86.04", "—", COLOR.ink)
    ],
    [
      rowLabelCell("CVTG-2K", COLOR.warn),
      metricCell("76.36", "↑27 vs FLUX", COLOR.good),
      metricCell("49.65", "—", COLOR.ink),
      metricCell("82.88", "—", COLOR.ink),
      metricCell("73.64", "—", COLOR.ink)
    ],
    [
      rowLabelCell("理解综合(MMMU)", COLOR.ink),
      metricCell("70.6", "—", COLOR.warn),
      metricCell("—", "(无理解)", COLOR.inkSoft),
      metricCell("—", "(无理解)", COLOR.inkSoft),
      metricCell("74.9", "—", COLOR.warn)
    ],
    [
      rowLabelCell("生成-理解杠杆", COLOR.red),
      metricCell("✓", "唯一兼具", COLOR.good),
      metricCell("✗", "仅生成", COLOR.red),
      metricCell("✗", "仅生成", COLOR.red),
      metricCell("✓", "(闭源)", COLOR.warn)
    ]
  ];
  s.addTable(benefitTbl, {
    x: rX, y: rY, w: rW, h: rH,
    colW: [1.65, 1.20, 1.30, 1.40, 1.50],
    rowH: [0.55, 0.50, 0.50, 0.50, 0.50, 0.50, 0.65],
    border: { pt: 0.5, color: COLOR.inkFaint },
    fontFace: FONT.zh
  });

  addRedConclusionBox(s, [
    { tag: "❶ 文本税 ≈ 5.3 点",
      body: "三项 MMLU 类基准 omni 平均损 ",
      warn: "5.3 ",
      bold: "个点;",
      tail: "对纯理解场景这是不可承受代价" },
    { tag: "❷ 生成端杠杆显著",
      body: "GenEval 84.44(超 FLUX.1-dev 18 点)+ CVTG-2K 76.36(超 27 点),",
      bold: "唯一兼具理解+生成的开源",
      tail: "" },
    { tag: "❸ 适用窄但深",
      body: "若产品要 ",
      bold: "图像/语音生成 + 理解一体化,",
      warn: "LongCat 是当下唯一开源选项;",
      tail: "纯理解场景请避开" }
  ]);

  addSources(s, [
    { name: "LongCat-Next: DiNA + dNaViT + Audio RVQ", tail: " (arxiv 2603.27538, 2026.03)" },
    { name: "Qwen3-Next-80B 文本基座对照", tail: "" },
    { name: "FLUX.1-dev / Qwen-Image-2507 / Gemini-2.5-Flash", tail: " 公开评测" }
  ]);
}

// ============================================================
// SLIDE 6 — 后训练 stack 横向公式分解(Prototype D 二号)
// ============================================================
function slide6() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };

  addTitleBand(s, "Nemotron 7+5",
    "7 阶段 SFT(466.9B token)+5 段 RL,16K→48K→256K 上下文渐进");

  // 顶部公式条:Nemotron 总训练栈
  const fY = 0.85;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: fY, w: 12.5, h: 0.85,
    fill: { color: COLOR.cardGray },
    line: { color: COLOR.ink, width: 0.5 }
  });
  s.addText([
    { text: "总栈 = ", options: { color: COLOR.ink, bold: true, fontSize: 12 } },
    { text: "Stage 0~6 SFT", options: { color: COLOR.warn, bold: true, fontSize: 12 } },
    { text: "(466.9B token)", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "  +  ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "5 段 RL", options: { color: COLOR.brandA, bold: true, fontSize: 12 } },
    { text: "(MPO → Text-RL₁ → Image-RL → Omni-RL → Text-RL₂)", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "  ⇒  ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "GSPO + 模态分段 + 文本回归修复", options: { color: COLOR.red, bold: true, fontSize: 12 } }
  ], { x: 0.50, y: fY + 0.10, w: 12.30, h: 0.70, valign: "middle", fontFace: FONT.zh });

  // 7 阶段 SFT 表(横向 7 列)
  const tY = 1.95;
  const tH = 1.85;
  const headers = [
    "Stage 0\nVision Proj", "Stage 1\nVision SFT", "Stage 2\nAudio Proj",
    "Stage 3\nAudio Enc", "Stage 4\nOmni 16K", "Stage 5\nOmni 48K", "Stage 6\nOmni 256K"
  ];
  const trainable = ["仅 V-Proj", "LLM+ViT", "仅 A-Proj", "Audio Enc+Proj", "全参数", "全参数", "冻 Audio"];
  const tokens = ["15.5B", "214.8B", "11.4B", "100.5B", "57.3B", "33.5B", "34.0B"];
  const samples = ["9.35M", "86.3M", "59.2M", "242.0M", "30.5M", "6.08M", "623K"];
  const ctx = ["16K", "16K", "16K", "16K", "16K", "48K", "256K"];

  const tblData = [
    headers.map(headerCell),
    trainable.map(t => metricCell(t, "解冻", COLOR.warn)),
    tokens.map(t => metricCell(t, "token", COLOR.ink)),
    samples.map(t => metricCell(t, "样本", COLOR.ink)),
    ctx.map(t => metricCell(t, "ctx", COLOR.brandB)),
    [
      metricCell("warmup", "对齐", COLOR.inkSoft),
      metricCell("主能力", "+CoT", COLOR.good),
      metricCell("warmup", "对齐", COLOR.inkSoft),
      metricCell("主能力", "音频", COLOR.good),
      metricCell("联合", "全栈", COLOR.warn),
      metricCell("中长", "rebal.", COLOR.warn),
      metricCell("长文档", "多页", COLOR.warn)
    ]
  ];
  s.addTable(tblData, {
    x: 0.4, y: tY, w: 12.5, h: tH,
    colW: [1.78, 1.78, 1.78, 1.78, 1.79, 1.79, 1.80],
    rowH: [0.55, 0.30, 0.25, 0.25, 0.25, 0.25],
    border: { pt: 0.5, color: COLOR.inkFaint },
    fontFace: FONT.zh
  });
  // 表行标签(在表格左侧外不好放,用一行小标在表上方说明)
  s.addText("各列依次:可训练范围 / token 量 / 样本数 / 上下文 / 阶段角色",
  { x: 0.4, y: tY + tH + 0.02, w: 12.5, h: 0.20,
    color: COLOR.inkSoft, italic: true, fontSize: 8.5, fontFace: FONT.zh });

  // 量化 + 推理收益(底部小条)
  const qY = 4.10;
  const qH = 1.95;
  // 左:量化对比表
  const qLeftTbl = [
    [
      headerCell("量化方案"),
      headerCell("Size"),
      headerCell("Effective bpw"),
      headerCell("Δ vs BF16(中位)"),
      headerCell("典型基准:MathVista")
    ],
    [
      rowLabelCell("BF16", COLOR.ink),
      metricCell("61.5 GB", "原始", COLOR.ink),
      metricCell("16.00", "—", COLOR.ink),
      metricCell("0.00", "基线", COLOR.ink),
      metricCell("71.90", "—", COLOR.ink)
    ],
    [
      rowLabelCell("FP8", COLOR.warn),
      metricCell("32.8 GB", "↓47%", COLOR.good),
      metricCell("8.50", "↓", COLOR.good),
      metricCell("-0.37", "几乎零损", COLOR.good),
      metricCell("71.05", "—", COLOR.ink)
    ],
    [
      rowLabelCell("NVFP4", COLOR.red),
      metricCell("20.9 GB", "↓66%", COLOR.good),
      metricCell("4.98", "↓", COLOR.good),
      metricCell("-0.40", "几乎零损", COLOR.good),
      metricCell("71.30", "—", COLOR.ink)
    ]
  ];
  s.addTable(qLeftTbl, {
    x: 0.4, y: qY, w: 8.6, h: qH,
    colW: [1.20, 1.70, 1.70, 1.95, 2.05],
    rowH: [0.45, 0.50, 0.50, 0.50],
    border: { pt: 0.5, color: COLOR.inkFaint },
    fontFace: FONT.zh
  });

  // 右:推理收益小卡
  const rX2 = 9.2;
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX2, y: qY, w: 3.7, h: qH,
    fill: { color: COLOR.fillRed },
    line: { color: COLOR.red, width: 1.0 }
  });
  s.addText("NVFP4 推理收益(B200)", {
    x: rX2 + 0.10, y: qY + 0.05, w: 3.5, h: 0.30,
    color: COLOR.red, bold: true, fontSize: 12, fontFace: FONT.zh
  });
  const gains = [
    { k: "iso-interactivity 提升", v: "7.5×", desc: "vs BF16,150 tok/s/user" },
    { k: "vs Qwen3-Omni(长视频)", v: "9×", desc: "iso-interactivity throughput" },
    { k: "vs Nemotron Nano V2 VL", v: "3×", desc: "iso 50 tok/s/user" },
    { k: "Single-stream", v: ">500 tok/s", desc: "2.4-2.9× vs Qwen3-Omni" }
  ];
  gains.forEach((g, i) => {
    const y = qY + 0.40 + i * 0.36;
    s.addText([
      { text: "▸ " + g.k + " ", options: { color: COLOR.ink, bold: true, fontSize: 9.5 } },
      { text: g.v, options: { color: COLOR.warn, bold: true, fontSize: 13 } },
      { text: " " + g.desc, options: { color: COLOR.inkSoft, fontSize: 8.5, italic: true } }
    ], { x: rX2 + 0.12, y, w: 3.5, h: 0.32, margin: 0, fontFace: FONT.zh });
  });

  addRedConclusionBox(s, [
    { tag: "❶ 渐进式上下文",
      body: "16K→48K→256K 三档,",
      bold: "Stage 5/6 加 context-parallel(2-way / 16-way)",
      warn: ",256K 时冻 audio 防漂移",
      tail: "" },
    { tag: "❷ NVFP4 几乎零损",
      body: "20.9GB 模型(原 61.5GB,",
      warn: "↓66%",
      bold: "),中位精度损 <1 点,",
      tail: "RTX 5090 可载入" },
    { tag: "❸ 推理 9× iso-throughput",
      body: "B200 + NVFP4 ",
      warn: "+ Conv3D + EVS",
      bold: " 三件套对长视频/多文档场景达 9× vs Qwen3-Omni",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Nemotron 3 Nano Omni — 7 阶段 SFT × 5 段 RL", tail: " (arxiv 2604.24954, 2026.04)" },
    { name: "Megatron-Bridge / NeMo-RL / DataDesigner", tail: " (NVIDIA, 2026)" },
    { name: "vLLM nightly 2026-04-19 测试基准", tail: "" }
  ]);
}

// ============================================================
// SLIDE 7 — 开源资源全景(Prototype A 二号:盘点)
// ============================================================
function slide7() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };

  addTitleBand(s, "开源底座 2026.05",
    "Megatron-Bridge+NeMo-RL+LongCat 重写「自研可用」起步线");

  // 左侧:模型 / 代码 / 数据 三类资源(纵向卡片堆)
  const lX = 0.4;
  const lY = 0.85;
  const lW = 6.30;
  const lH = 5.05;

  // 资源卡片 3 张
  const resources = [
    {
      title: "▶ 可直接复用的模型权重",
      items: [
        { name: "nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning", v: "BF16 / FP8 / NVFP4 三档", color: COLOR.warn, src: "HuggingFace" },
        { name: "meituan-longcat/LongCat-Next + tokenizers", v: "A3B 68.5B,含 dNaViT", color: COLOR.brandA, src: "HuggingFace + GitHub" },
        { name: "Qwen3.5-Omni-Plus / Flash", v: "仅 API,无权重", color: COLOR.red, src: "通义千问 API" }
      ]
    },
    {
      title: "▶ 可直接跑的训练 / RL 代码",
      items: [
        { name: "NVIDIA/Megatron-Bridge", v: "Nemotron 3 Omni 完整训练代码", color: COLOR.warn, src: "GitHub NVIDIA-NeMo" },
        { name: "NVIDIA/NeMo-RL", v: "GSPO + MPO + 模态分段 RL 实现", color: COLOR.warn, src: "GitHub NVIDIA-NeMo" },
        { name: "NVIDIA/DataDesigner", v: "长文档数据生成 runnable pipeline", color: COLOR.warn, src: "GitHub NVIDIA-NeMo" },
        { name: "vLLM nightly + VLMEvalKit", v: "推理 + 评测", color: COLOR.brandB, src: "OSS" }
      ]
    },
    {
      title: "▶ 可直接训的数据集",
      items: [
        { name: "nvidia/Nemotron-Image-Training-v3", v: "6.9M 视觉训练样本", color: COLOR.warn, src: "HF (NeMo)" },
        { name: "Granary v1.1 ASR", v: "59.2M 样本,Nemotron Stage 2/3 用", color: COLOR.warn, src: "公开" },
        { name: "LLaVA-OneVision-Data / Cambrian-7M / Cauldron", v: "视觉指令通用底座", color: COLOR.brandB, src: "HF / GitHub" },
        { name: "MMC4 / OBELICS", v: "交错图文(关键稀缺资源)", color: COLOR.brandB, src: "公开" },
        { name: "RLHF-V / VLFeedback / POVID", v: "多模态偏好数据", color: COLOR.ink, src: "公开" }
      ]
    }
  ];

  // 计算总高度均分
  const cardGap = 0.10;
  const cardH = (lH - 2 * cardGap) / 3;
  resources.forEach((r, idx) => {
    const y = lY + idx * (cardH + cardGap);
    s.addShape(pres.shapes.RECTANGLE, {
      x: lX, y, w: lW, h: cardH,
      fill: { color: "FFFFFF" },
      line: { color: COLOR.inkFaint, width: 0.5 }
    });
    // 顶部色条
    s.addShape(pres.shapes.RECTANGLE, {
      x: lX, y, w: lW, h: 0.32,
      fill: { color: COLOR.fillBlue },
      line: { color: COLOR.inkFaint, width: 0 }
    });
    s.addText(r.title, {
      x: lX + 0.10, y: y + 0.04, w: lW - 0.20, h: 0.26,
      color: COLOR.ink, bold: true, fontSize: 12, fontFace: FONT.zh
    });
    // items
    const itemH = (cardH - 0.40) / r.items.length;
    r.items.forEach((it, j) => {
      const iY = y + 0.36 + j * itemH;
      s.addText([
        { text: "● " + it.name + " ", options: { color: it.color, bold: true, fontSize: 10 } },
        { text: it.v + " ", options: { color: COLOR.ink, fontSize: 9.5 } },
        { text: "[" + it.src + "]", options: { color: COLOR.inkSoft, italic: true, fontSize: 8.5 } }
      ], { x: lX + 0.10, y: iY, w: lW - 0.20, h: itemH - 0.04, margin: 0, fontFace: FONT.zh });
    });
  });

  // 右侧:必跑评测清单(分模态)
  const rX = 6.85;
  const rY = 0.85;
  const rW = 6.05;
  const rH = 5.05;
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: rH,
    fill: { color: "FFFFFF" },
    line: { color: COLOR.red, width: 1.0 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: 0.40,
    fill: { color: COLOR.red },
    line: { color: COLOR.red, width: 0 }
  });
  s.addText("2026-05 必跑评测清单 — 8 维度 36 项", {
    x: rX + 0.10, y: rY + 0.05, w: rW - 0.20, h: 0.30,
    color: "FFFFFF", bold: true, fontSize: 13, valign: "middle", fontFace: FONT.zh
  });

  const evalGroups = [
    { tag: "视觉理解", items: "MMMU / MMLongBench-Doc / OCRBench-V2 / CharXiv / OCR-Reasoning / AI2D / ChartQA / DocVQA", color: COLOR.brandB },
    { tag: "数学推理", items: "MathVista-Mini / MathVision / MathVerse / We-Math", color: COLOR.brandB },
    { tag: "Agent / GUI ★", items: "ScreenSpot-Pro(Nemotron 59.3 vs Qwen3-Omni 5.5)/ OSWorld-G / OSWorld", color: COLOR.red },
    { tag: "视频", items: "VideoMME / LongVideoBench / DailyOmni / MVBench / EgoSchema", color: COLOR.brandB },
    { tag: "Omni 端到端", items: "DailyOmni / WorldSense / AVUT / OmniCloze / OmniGAIA", color: COLOR.warn },
    { tag: "音频理解", items: "OpenASR(8 子集)/ MMAU / MMAR / MMSU / VoiceBench(9 子集)", color: COLOR.brandB },
    { tag: "TTS / 语音生成", items: "SEED-TTS WER + speaker similarity / SeedTTS-zh / SeedTTS-en", color: COLOR.warn },
    { tag: "文本回归 ★必跑", items: "MMLU-Pro / MMLU-Redux / SuperGPQA / IFBench / AA-LCR / LiveCodeBench v6 / BFCL-V4 / TAU2Bench", color: COLOR.red }
  ];
  const groupTop = rY + 0.50;
  const groupH = (rH - 0.55) / evalGroups.length;
  evalGroups.forEach((g, i) => {
    const y = groupTop + i * groupH;
    // tag 框
    s.addShape(pres.shapes.RECTANGLE, {
      x: rX + 0.10, y: y + 0.02, w: 1.20, h: groupH - 0.06,
      fill: { color: g.color },
      line: { color: g.color, width: 0 }
    });
    s.addText(g.tag, {
      x: rX + 0.10, y: y + 0.02, w: 1.20, h: groupH - 0.06,
      color: "FFFFFF", bold: true, fontSize: 9.5, align: "center", valign: "middle", fontFace: FONT.zh
    });
    s.addText(g.items, {
      x: rX + 1.40, y: y + 0.02, w: rW - 1.50, h: groupH - 0.06,
      color: COLOR.ink, fontSize: 9.5, valign: "middle", fontFace: FONT.zh
    });
    if (i < evalGroups.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: rX + 0.10, y: y + groupH - 0.02, w: rW - 0.20, h: 0,
        line: { color: COLOR.inkFaint, width: 0.25 }
      });
    }
  });

  addRedConclusionBox(s, [
    { tag: "❶ 三件套已开源",
      body: "Megatron-Bridge + NeMo-RL + Nemotron-Image-Training-v3 ",
      warn: "(6.9M)",
      bold: " 是 omni 后训练的「工程起步线」",
      tail: "" },
    { tag: "❷ Qwen3.5 闭源但配方公开",
      body: "ARIA / OPD / Specialist Distillation 三个 trick ",
      bold: "无需权重也可复用,",
      warn: "落地到 Nemotron 代码上即可",
      tail: "" },
    { tag: "❸ ScreenSpot-Pro 是新区分线",
      body: "Nemotron 59.3 vs Qwen3-Omni 5.5,",
      warn: "差 50+ 个点,",
      bold: "GUI agent 能力是 2026 SOTA 试金石",
      tail: "" }
  ]);

  addSources(s, [
    { name: "NVIDIA/Megatron-Bridge + NVIDIA/NeMo-RL", tail: " (GitHub, 2026)" },
    { name: "meituan-longcat/LongCat-Next", tail: " (HF + GitHub, 2026.03)" },
    { name: "评测清单整合自三篇报告", tail: " (Nemotron / LongCat / Qwen3.5)" }
  ]);
}

// ============================================================
// SLIDE 8 — 决策矩阵 (Prototype A 三号)
// ============================================================
function slide8() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };

  addTitleBand(s, "路径决策",
    "用例-架构-资源三维匹配,GSPO 与文本回归测试是新硬门槛");

  // 主表:5 用例 × 4 维度
  const mtbl = [
    [
      headerCell("你的用例 / 约束"),
      headerCell("推荐路径"),
      headerCell("直接复用对象"),
      headerCell("最小可行 SFT"),
      headerCell("RL 段最低配置"),
      headerCell("文本回归门槛")
    ],
    [
      rowLabelCell("理解-only + agentic\n+ 长文档", COLOR.warn),
      metricCell("Nemotron 路径", "全开源,模块化 Thinker", COLOR.warn),
      metricCell("Megatron-Bridge", "+ NeMo-RL + v3 数据", COLOR.ink),
      metricCell("Stage 0/1/4", "16K SFT 够用", COLOR.ink),
      metricCell("MPO + Image-RL", "+ Text-RL S2(必)", COLOR.warn),
      metricCell("MMLU-Pro 损 ≤2 点", "ScreenSpot-Pro >50", COLOR.red)
    ],
    [
      rowLabelCell("需图像/语音生成\n一体化", COLOR.brandA),
      metricCell("LongCat 路径", "Native unified", COLOR.brandA),
      metricCell("LongCat-Next", "+ dNaViT + 8 级 RVQ", COLOR.brandA),
      metricCell("DiNA 联合预训", "或 continue-pretrain", COLOR.ink),
      metricCell("DPO + 数据 rebal", "(论文未细化)", COLOR.brandA),
      metricCell("接受 5 点损", "GenEval >75 为底线", COLOR.warn)
    ],
    [
      rowLabelCell("仅语音生成\n+ 端到端对话", COLOR.warn),
      metricCell("Nemotron + 自建 Talker", "借 Qwen3.5 配方", COLOR.warn),
      metricCell("Nemotron base", "+ 自实现 ARIA + RVQ", COLOR.ink),
      metricCell("加 Talker 4 段", "(general→CPT→DPO→FT)", COLOR.warn),
      metricCell("Talker DPO + GSPO", "Speaker FT 可选", COLOR.warn),
      metricCell("文本损 ≤1 点", "SEED-TTS WER < 2", COLOR.red)
    ],
    [
      rowLabelCell("闭源 API 集成\n(产品快速上线)", COLOR.ink),
      metricCell("调 Qwen3.5-Omni API", "Plus / Flash 两档", COLOR.red),
      metricCell("通义千问 API", "无需训练", COLOR.red),
      metricCell("无", "—", COLOR.inkSoft),
      metricCell("无", "—", COLOR.inkSoft),
      metricCell("产品端 SLA 验证", "TTFC 54-56ms 标定", COLOR.ink)
    ],
    [
      rowLabelCell("算力极限\n(单机 / 小集群)", COLOR.red),
      metricCell("Nemotron NVFP4", "20.9GB 单卡可载", COLOR.warn),
      metricCell("nvidia/Nemotron-Omni\n-NVFP4", "RTX 5090 可推理", COLOR.warn),
      metricCell("仅 Stage 0/1", "跳过 audio + 长上下文", COLOR.warn),
      metricCell("MPO 一段", "其余跳过", COLOR.warn),
      metricCell("MMLU-Pro 损 ≤3 点", "可放宽,但必须测", COLOR.red)
    ]
  ];

  s.addTable(mtbl, {
    x: 0.4, y: 0.85, w: 12.5, h: 4.65,
    colW: [1.85, 2.10, 2.10, 2.05, 2.10, 2.30],
    rowH: [0.55, 0.85, 0.85, 0.85, 0.75, 0.80],
    border: { pt: 0.5, color: COLOR.inkFaint },
    fontFace: FONT.zh
  });

  // 底部:三个不变量(invariants)
  const iY = 5.62;
  const iH = 0.50;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: iY, w: 12.5, h: iH,
    fill: { color: COLOR.cardYellow },
    line: { color: COLOR.warn, width: 0.75 }
  });
  s.addText([
    { text: "三篇贯穿的不变量(选哪条都必须满足):", options: { color: COLOR.red, bold: true, fontSize: 11 } },
    { text: "  ① MoE A3B 已成默认骨干", options: { color: COLOR.ink, bold: true, fontSize: 10 } },
    { text: " · dense base 必须先 upcycle  ", options: { color: COLOR.inkSoft, fontSize: 9.5, italic: true } },
    { text: "② 多阶段渐进 ≠ joint training", options: { color: COLOR.ink, bold: true, fontSize: 10 } },
    { text: " · modality-by-modality 加  ", options: { color: COLOR.inkSoft, fontSize: 9.5, italic: true } },
    { text: "③ GSPO + 模态分段 RL 是新 SOTA 配方", options: { color: COLOR.ink, bold: true, fontSize: 10 } }
  ], { x: 0.50, y: iY + 0.05, w: 12.30, h: iH - 0.10, valign: "middle", fontFace: FONT.zh });

  addRedConclusionBox(s, [
    { tag: "❶ 用例驱动选型",
      body: "理解-only → Nemotron;要图像生成 → LongCat;只要语音生成 → ",
      bold: "Nemotron + 自建 Talker(借 Qwen3.5 配方);",
      warn: " 不存在通吃方案",
      tail: "" },
    { tag: "❷ 文本回归是心电图",
      body: "任何阶段 ",
      bold: "MMLU-Pro 掉 >2 点立即 rollback ",
      warn: "或加 Text-RL S2 修复段;",
      tail: "Qwen3.5 0.9 / Nemotron 1 / LongCat 5.3 是分位线" },
    { tag: "❸ NVFP4 是部署门槛降低",
      body: "30B-A3B-NVFP4 仅 ",
      warn: "20.9GB,",
      bold: "RTX 5090 / DGX Spark 可推理,",
      tail: "降低单机 omni 的部署门槛" }
  ]);

  addSources(s, [
    { name: "三篇报告综合分析", tail: " — Nemotron(2604.24954)+ LongCat(2603.27538)+ Qwen3.5(2604.15804)" },
    { name: "MoE upcycling / context parallel / NVFP4 量化", tail: " 配套工程实践 (NVIDIA + Meituan + Alibaba 公开数据,2026.03-04)" }
  ]);
}

// ============================================================
// 生成
// ============================================================
slide1();
slide2();
slide3();
slide4();
slide5();
slide6();
slide7();
slide8();

pres.writeFile({ fileName: "D:/work/omni_insight_deck/Omni_PostTraining_Insight_2026.pptx" })
  .then(name => console.log("Generated:", name));
