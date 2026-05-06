// Omni 后训练实验计划 v4 —— 框架交付 + 多客户 + 双 demo
// 项目本质:外部算法团队搭建 omni 后训练 framework,在 Qwen3.5-4B + 自家 10B-A2B
// 上各跑一个 demo 模型(公开 benchmark 证明能力),把流水线移交给内部多个潜在
// omni 客户(广告内容审核为首发,后续可能教育/UI/医疗等),客户改 yaml 即可继续训。

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
pres.title = "Omni 后训练框架计划 v4 — Framework + 双 Demo";

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
// SLIDE 1 — v4 任务定位(重写)
// ============================================================
function slide1() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "v4 任务定位",
    "omni 后训练框架 + 双 demo,服务公司内多个潜在 omni 客户");

  const lX = 0.4, lY = 0.85, lW = 6.30, lH = 5.05;
  s.addShape(pres.shapes.RECTANGLE, { x: lX, y: lY, w: lW, h: lH, fill: { color: "FFFFFF" }, line: { color: COLOR.good, width: 1.0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: lX, y: lY, w: lW, h: 0.42, fill: { color: COLOR.good }, line: { color: COLOR.good, width: 0 } });
  s.addText("✓ 项目交付物(In-Scope)", {
    x: lX + 0.10, y: lY + 0.05, w: lW - 0.20, h: 0.32, color: "FFFFFF", bold: true, fontSize: 13, valign: "middle", fontFace: FONT.zh
  });
  const inScope = [
    { tag: "Framework(主交付)", goal: "可移交的 omni 后训练流水线代码包", target: "Data/Train/RL/Eval/Deploy 5 层全 yaml 配置,客户改配置即可继续训" },
    { tag: "Demo A(proxy)", goal: "Qwen3.5-4B-base + V/A 训出 omni", target: "Phase A T-12→T,验证流水线 + alpha 版交付" },
    { tag: "Demo B(real)", goal: "自家 10B-A2B + V/A 训出 omni", target: "Phase B T→T+18,beta 版交付,真实骨干效果" },
    { tag: "能力维度", goal: "V / A / Vid / T 多模态理解(无生成)", target: "8 维公开 benchmark 全覆盖,多客户用例都需要" },
    { tag: "上下文长度", goal: "16K 起步,扩到 48K", target: "60s 视频 + EVS 压缩需 30-50K 实测,Stage 5 必跑" },
    { tag: "客户体验", goal: "git clone → 改 yaml → 训 → 评 → 部署", target: "我方多承担(配置/文档/dry-run),客户工作越少越好" }
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

  const rX = 6.85, rY = 0.85, rW = 6.05;
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: rY, w: rW, h: 1.85, fill: { color: "FFFFFF" }, line: { color: COLOR.red, width: 1.0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: rY, w: rW, h: 0.42, fill: { color: COLOR.red }, line: { color: COLOR.red, width: 0 } });
  s.addText("✗ 明确不做(Out-of-Scope)", {
    x: rX + 0.10, y: rY + 0.05, w: rW - 0.20, h: 0.32, color: "FFFFFF", bold: true, fontSize: 13, valign: "middle", fontFace: FONT.zh
  });
  const outScope = [
    { k: "任何模态生成", v: "图像 / 语音 / 视频 / TTS,全部不做" },
    { k: "256K 长上下文", v: "Stage 6 跳过,广告/UI 等场景 48K 已够" },
    { k: "客户业务数据接触", v: "我方无访问,框架交付后客户自训" },
    { k: "业务指标", v: "P/R/F1/上线判定 = 客户决定,不归我方" }
  ];
  outScope.forEach((it, i) => {
    s.addText([
      { text: "✗ " + it.k + " ", options: { color: COLOR.red, bold: true, fontSize: 10 } },
      { text: it.v, options: { color: COLOR.inkSoft, fontSize: 9.5 } }
    ], { x: rX + 0.12, y: rY + 0.50 + i * 0.32, w: rW - 0.24, h: 0.30, margin: 0, fontFace: FONT.zh });
  });

  const cY = rY + 2.00;
  const cH = 3.05;
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: cY, w: rW, h: cH, fill: { color: "FFFFFF" }, line: { color: COLOR.warn, width: 1.0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: rX, y: cY, w: rW, h: 0.42, fill: { color: COLOR.warn }, line: { color: COLOR.warn, width: 0 } });
  s.addText("⚙ 多客户假设 + 技术栈", {
    x: rX + 0.10, y: cY + 0.05, w: rW - 0.20, h: 0.32, color: "FFFFFF", bold: true, fontSize: 13, valign: "middle", fontFace: FONT.zh
  });
  const stack = [
    { tag: "首发客户", v: "广告内容审核(图/视频/音频 → 违规分类)" },
    { tag: "潜在客户", v: "教育(题目识别)/ UI 测试 / 医疗影像 / 电商商品识别等" },
    { tag: "数据", v: "100% 公开数据(LLaVA-OV / Cambrian / Granary 等),客户自带数据继续训" },
    { tag: "评测", v: "100% 公开 benchmark 做能力证明(MMMU/VideoMME/OpenASR/...)" },
    { tag: "Phase A base", v: "Qwen3.5-4B-base(dense)" },
    { tag: "Phase B base", v: "自家 10B-A2B(MoE 新架构)" },
    { tag: "训练栈", v: "HF transformers + FSDP2(避开 Megatron)" },
    { tag: "RL 栈", v: "verl(volcengine/verl)+ FSDP + vLLM rollout" },
    { tag: "Tokenizer", v: "Qwen3.5-4B 词表 + ~25 MM special token" }
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
    { tag: "❶ 项目本质改写",
      body: "v4 不是「训一个模型」,而是 ",
      bold: "「建一个可移交的 omni 后训练框架」+ 双 demo 证明能力,",
      warn: " 多客户 + 我方多承担",
      tail: "" },
    { tag: "❷ 不为单一客户裁剪",
      body: "8 维能力全保留(广告需视觉/视频/OCR/中文,",
      bold: "教育需 math,UI 需 GUI agent",
      warn: ",医疗需文档),",
      tail: "去掉一维就少一类客户" },
    { tag: "❸ 上下文修正",
      body: "16K 不够装 60s 视频 + EVS 压缩(实测 30-50K),",
      warn: "48K 是必须 ",
      bold: "(广告 + 长广告图 + 视频客户都需要),Stage 5 主线保留",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Qwen3.5-4B-base 模型卡", tail: " (HuggingFace)" },
    { name: "verl(volcengine/verl)", tail: " (OSS RL 框架)" },
    { name: "三篇 reference design", tail: " (Nemotron / LongCat / Qwen3.5)" }
  ]);
}

// ============================================================
// SLIDE 2 — 框架架构总览(NEW)
// ============================================================
function slide2() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "框架架构 5 层",
    "客户改 yaml 即可继续 SFT/RL,五层全模块化");

  // 左:5 层架构图(纵向堆叠)
  const lX = 0.4, lY = 0.85, lW = 7.50, lH = 5.05;
  s.addShape(pres.shapes.RECTANGLE, {
    x: lX, y: lY, w: lW, h: lH,
    fill: { color: "FFFFFF" }, line: { color: COLOR.ink, width: 0.5 }
  });
  s.addText("5 层架构 + 模块化交付", {
    x: lX + 0.10, y: lY + 0.05, w: lW - 0.20, h: 0.30,
    color: COLOR.ink, bold: true, fontSize: 12, fontFace: FONT.zh
  });

  const layers = [
    {
      name: "L5 Deploy Layer", color: COLOR.brandA,
      modules: ["vLLM serve template", "Dockerfile + K8s yaml", "REST API + health check"],
      yaml: "deploy.yaml"
    },
    {
      name: "L4 Eval Layer", color: COLOR.good,
      modules: ["VLMEvalKit fork", "8 维公开 benchmark 全套", "客户自定义 eval interface"],
      yaml: "eval.yaml"
    },
    {
      name: "L3 RL Layer", color: COLOR.red,
      modules: ["verl + FSDP + vLLM rollout", "GSPO / GRPO 切换", "MPO / Image-RL / Text-RL S2"],
      yaml: "rl.yaml"
    },
    {
      name: "L2 Training Layer", color: COLOR.warn,
      modules: ["HF transformers + FSDP2", "Stage 0-5 全 yaml", "MoE-aware wrap policy + ctx-parallel"],
      yaml: "train.yaml"
    },
    {
      name: "L1 Data Layer", color: COLOR.brandB,
      modules: ["Webdataset + tokenize", "Encoder hot-swap", "OPD 配对生成 + Cluster Rebal"],
      yaml: "data.yaml"
    }
  ];
  const layerTop = lY + 0.45;
  const layerH = (lH - 0.55) / layers.length;
  layers.forEach((l, i) => {
    const y = layerTop + i * layerH;
    // Layer 框
    s.addShape(pres.shapes.RECTANGLE, {
      x: lX + 0.10, y, w: lW - 0.20, h: layerH - 0.05,
      fill: { color: "FFFFFF" }, line: { color: l.color, width: 1.0 }
    });
    // 左侧色块
    s.addShape(pres.shapes.RECTANGLE, {
      x: lX + 0.10, y, w: 1.50, h: layerH - 0.05,
      fill: { color: l.color }, line: { color: l.color, width: 0 }
    });
    s.addText(l.name, {
      x: lX + 0.15, y, w: 1.40, h: layerH - 0.05,
      color: "FFFFFF", bold: true, fontSize: 11, align: "center", valign: "middle", fontFace: FONT.zh
    });
    // 中间 modules
    s.addText(l.modules.map(m => "▸ " + m).join("    "), {
      x: lX + 1.70, y: y + 0.05, w: lW - 3.30, h: layerH - 0.15,
      color: COLOR.ink, fontSize: 10, valign: "middle", fontFace: FONT.zh
    });
    // 右侧 yaml 名
    s.addShape(pres.shapes.RECTANGLE, {
      x: lX + lW - 1.55, y: y + 0.10, w: 1.40, h: layerH - 0.25,
      fill: { color: COLOR.cardYellow }, line: { color: l.color, width: 0.75 }
    });
    s.addText(l.yaml, {
      x: lX + lW - 1.55, y: y + 0.10, w: 1.40, h: layerH - 0.25,
      color: l.color, bold: true, fontSize: 11, align: "center", valign: "middle",
      fontFace: FONT.mono
    });
  });

  // 右:客户工作流图
  const rX = 8.05, rY = 0.85, rW = 4.85, rH = 5.05;
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: rH,
    fill: { color: "FFFFFF" }, line: { color: COLOR.red, width: 1.0 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: 0.42,
    fill: { color: COLOR.red }, line: { color: COLOR.red, width: 0 }
  });
  s.addText("☞ 客户工作流(目标:< 5 步)", {
    x: rX + 0.10, y: rY + 0.05, w: rW - 0.20, h: 0.32,
    color: "FFFFFF", bold: true, fontSize: 12, valign: "middle", fontFace: FONT.zh
  });

  const workflow = [
    { num: "1", action: "git clone <我方框架>", detail: "拿到完整代码 + 双 demo ckpt + docs", color: COLOR.brandB },
    { num: "2", action: "准备数据(按格式)", detail: "python prepare_data.py --input my.jsonl\n→ 自动 tokenize + webdataset 分片", color: COLOR.brandB },
    { num: "3", action: "改 yaml 配置", detail: "configs/sft.yaml + rl.yaml\n选 stage / 算力 / 模态权重", color: COLOR.warn },
    { num: "4", action: "一键训练", detail: "python train.py --config sft.yaml\n训完自动 eval + WandB log", color: COLOR.warn },
    { num: "5", action: "一键评测 + 部署", detail: "python eval.py + python serve.py\n或 docker compose up", color: COLOR.good }
  ];
  const wTop = rY + 0.55;
  const wH = (rH - 0.65) / workflow.length;
  workflow.forEach((w, i) => {
    const y = wTop + i * wH;
    s.addShape(pres.shapes.OVAL, {
      x: rX + 0.15, y: y + 0.15, w: 0.42, h: 0.42,
      fill: { color: w.color }, line: { color: w.color, width: 0 }
    });
    s.addText(w.num, {
      x: rX + 0.15, y: y + 0.15, w: 0.42, h: 0.42,
      color: "FFFFFF", bold: true, fontSize: 14, align: "center", valign: "middle", fontFace: FONT.zh
    });
    s.addText([
      { text: w.action, options: { color: w.color, bold: true, fontSize: 11, breakLine: true } },
      { text: w.detail, options: { color: COLOR.inkSoft, fontSize: 9 } }
    ], { x: rX + 0.65, y: y + 0.05, w: rW - 0.75, h: wH - 0.10, margin: 0, fontFace: FONT.zh });
    if (i < workflow.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: rX + 0.36, y: y + wH - 0.05, w: 0, h: 0.10,
        line: { color: COLOR.red, width: 1.5 }
      });
    }
  });

  addRedConclusionBox(s, [
    { tag: "❶ 5 层 + 5 yaml",
      body: "Data/Train/RL/Eval/Deploy 各 ",
      bold: "1 个 yaml 配置文件,",
      warn: " 客户改配置即换数据/算力/模态权重,无需改代码",
      tail: "" },
    { tag: "❷ 客户工作流 5 步",
      body: "git clone → prepare_data → 改 yaml → train → eval/serve;",
      bold: "我方多承担:",
      warn: " 配置默认值合理 / 文档完整 / dry-run 跑通 2 个 mock 客户场景",
      tail: "" },
    { tag: "❸ Encoder/Specialist 也是模块",
      body: "SigLIP / InternViT / Whisper / 自家 specialist ",
      bold: "都通过 data.yaml 切换,",
      warn: " 客户可换 encoder 不动训练代码",
      tail: "" }
  ]);

  addSources(s, [
    { name: "5 层架构 = 业界 OSS framework 通用模式", tail: " (参考 LLaMA-Factory / Axolotl / verl)" },
    { name: "客户工作流目标", tail: " (我方多承担,客户工作 < 5 步)" }
  ]);
}

// ============================================================
// SLIDE 3 — 路径选型推理
// ============================================================
function slide3() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "路径选型推理",
    "工程主线选 Nemotron,Qwen3.5/LongCat 配方按 ROI 吸收");

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
      metricCell("Nemotron 给工程骨架", "其它两家给配方", COLOR.warn)
    ],
    [
      rowLabelCell("匹配理解-only"),
      metricCell("✓ 完美", "本就只做理解", COLOR.good),
      metricCell("◐ 整路径不适用", "5.3 pt 文本税换\n图像生成(我方不要)", COLOR.warn),
      metricCell("◐ Talker 不适用", "Thinker 部分仍可借鉴", COLOR.warn),
      metricCell("Nemotron 整体走,", "其它两家拆方法借", COLOR.warn)
    ],
    [
      rowLabelCell("Audio encoder"),
      metricCell("Whisper / Parakeet", "我方可用", COLOR.good),
      metricCell("Whisper + RVQ", "RVQ 不需要", COLOR.warn),
      metricCell("AuT 自研 40M 小时", "我方无此规模", COLOR.red),
      metricCell("Nemotron 同档", "Whisper 即可", COLOR.good)
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
      metricCell("Qwen3.5 配方对文本最友好", "OPD 是关键", COLOR.warn)
    ],
    [
      rowLabelCell("配方公开度"),
      metricCell("公开充分", "5 段 RL 全细节", COLOR.good),
      metricCell("中等", "Cluster Rebal 公开,RL 段未细化", COLOR.warn),
      metricCell("公开充分", "Specialist + OPD 细节充分", COLOR.good),
      metricCell("三家配方均可消融", "见 Slide 4", COLOR.warn)
    ],
    [
      rowLabelCell("我方采纳决定", COLOR.red),
      metricCell("✓ 工程主线", "7+5 阶段配方逻辑", COLOR.good),
      metricCell("◐ 选择性吸收", "Cluster-rebal / MoE 路由 / random delay", COLOR.warn),
      metricCell("◐ 选择性吸收", "OPD / Specialist Distill / 数据配比", COLOR.warn),
      metricCell("Nemotron-Lite + 多 trick 消融", "全部在 HF/verl 上重做", COLOR.red)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: 0.85, w: 12.5, h: 4.30,
    colW: [1.95, 2.50, 2.50, 2.55, 3.00],
    rowH: [0.50, 0.55, 0.65, 0.55, 0.50, 0.55, 0.50, 0.55],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  const dY = 5.30;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: dY, w: 12.5, h: 0.82,
    fill: { color: COLOR.cardYellow }, line: { color: COLOR.warn, width: 0.75 }
  });
  s.addText([
    { text: "v4 决策同 v3 但叙事更紧: ", options: { color: COLOR.red, bold: true, fontSize: 12 } },
    { text: "整路径选 Nemotron(代码骨架)。", options: { color: COLOR.ink, bold: true, fontSize: 11 } },
    { text: "单方法层面三家可借鉴点见 Slide 4 消融矩阵。", options: { color: COLOR.warn, fontSize: 10 } },
    { text: "  →  ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "Framework 设计选择:Nemotron 工程纪律 ⊕ 多 trick 选择性吸收 ⊕ HF 栈重做", options: { color: COLOR.red, bold: true, fontSize: 11 } }
  ], { x: 0.50, y: dY + 0.05, w: 12.30, h: 0.70, valign: "middle", fontFace: FONT.zh });

  addRedConclusionBox(s, [
    { tag: "❶ 整路径 vs 单方法",
      body: "整路径选 Nemotron(代码可借鉴);",
      bold: "单方法层面 Qwen3.5 / LongCat 各有可吸收点,",
      warn: " 不能以「路径不选」一并丢弃",
      tail: "" },
    { tag: "❷ Framework 不绑死任何一家",
      body: "5 层架构允许 ",
      bold: "data.yaml 切换 specialist / rl.yaml 切换算法 / train.yaml 切换 stage,",
      warn: " 客户可按需启用任一家配方",
      tail: "" },
    { tag: "❸ 三家代码均不直接复用",
      body: "Megatron / NeMo-RL / 内部框架都不在我方栈,",
      bold: "全部在 HF transformers + FSDP2 + verl 上重做,",
      warn: " 这是 framework 的核心工程任务",
      tail: "" }
  ]);

  addSources(s, [
    { name: "三篇 reference design 原报告", tail: "" },
    { name: "下页消融矩阵详细推导", tail: " (Slide 4)" }
  ]);
}

// ============================================================
// SLIDE 4 — 关键方法消融矩阵
// ============================================================
function slide4() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "关键方法消融",
    "Qwen3.5/LongCat 配方按 ROI 选择性吸收,P1-P3 排序");

  const tbl = [
    [
      headerCell("方法"),
      headerCell("来源"),
      headerCell("我方决策"),
      headerCell("预期 ROI"),
      headerCell("工作量"),
      headerCell("评测验证点")
    ],
    [
      rowLabelCell("OPD audio-text 配对", COLOR.warn),
      metricCell("Qwen3.5", "On-Policy Distill", COLOR.warn),
      metricCell("✓ 主线", "Stage 4 起 20% mix", COLOR.good),
      metricCell("高", "+1-3 pt audio 任务", COLOR.good),
      metricCell("数据合成 ~5B", "+ 训练 1 周", COLOR.warn),
      metricCell("VoiceBench / MMAU", "audio-vs-text 一致性", COLOR.ink)
    ],
    [
      rowLabelCell("Specialist Distillation Hybrid(2T)", COLOR.warn),
      metricCell("Qwen3.5 + 自研", "35B-A3B + Vision specialist", COLOR.warn),
      metricCell("✓ 主线", "Phase A 末启动 Vision spec", COLOR.good),
      metricCell("中-高", "+1-2 pt 视觉 + 文本保真", COLOR.good),
      metricCell("Vision spec 训 4 周", "+ 35B teacher 接 1 周", COLOR.warn),
      metricCell("MMMU + DocVQA", "+ 文本回归测试", COLOR.ink)
    ],
    [
      rowLabelCell("Specialist Distillation 完整版(5T)", COLOR.red),
      metricCell("Qwen3.5", "5 teacher → 1 student", COLOR.red),
      metricCell("◐ P2 消融", "(代价高,多客户 ROI 摊薄)", COLOR.warn),
      metricCell("高(关键)", "+2-5 pt 综合", COLOR.warn),
      metricCell("训 5 specialist", "+ 蒸馏 4-6 周", COLOR.red),
      metricCell("MMMU/MathVista/", "DocVQA/Audio 综合", COLOR.ink)
    ],
    [
      rowLabelCell("Cluster-based Rebalancing", COLOR.brandA),
      metricCell("LongCat", "mid-train 数据重平衡", COLOR.brandA),
      metricCell("◐ P2 消融", "Stage 4 之前", COLOR.warn),
      metricCell("中", "防 audio 长尾欠拟合", COLOR.warn),
      metricCell("数据 cluster 1 周", "+ 调度修改 1 周", COLOR.warn),
      metricCell("Audio 各子任务", "OpenASR / MMAU 平衡", COLOR.ink)
    ],
    [
      rowLabelCell("Modality-Agnostic MoE 路由", COLOR.brandA),
      metricCell("LongCat", "expert 不为模态特化", COLOR.brandA),
      metricCell("◐ P2 消融", "vs 模态分离路由", COLOR.warn),
      metricCell("中", "10B-A2B 容量利用", COLOR.warn),
      metricCell("改 MoE 路由 1-2 周", "+ 重训 Stage 4", COLOR.warn),
      metricCell("DailyOmni / WorldSense", "+ expert 利用率", COLOR.ink)
    ],
    [
      rowLabelCell("Random delay audio-text", COLOR.brandA),
      metricCell("LongCat", "[1, len(text)] 随机延迟", COLOR.brandA),
      metricCell("◐ P3 消融", "训练健壮性 trick", COLOR.warn),
      metricCell("低-中", "audio 时序鲁棒性", COLOR.warn),
      metricCell("数据脚本改 1 周", "—", COLOR.good),
      metricCell("Audio 长样本", "/ 流式 / 截断鲁棒性", COLOR.ink)
    ],
    [
      rowLabelCell("EVS + Conv3D 视频压缩", COLOR.brandB),
      metricCell("Nemotron", "token 压缩 ~70%", COLOR.brandB),
      metricCell("✓ 主线", "Stage 4/5 视频", COLOR.good),
      metricCell("中-高", "TTFT 5984→5313ms", COLOR.good),
      metricCell("已开源,集成", "—", COLOR.good),
      metricCell("VideoMME + LongVB", "+ 推理 latency", COLOR.ink)
    ],
    [
      rowLabelCell("16K→48K 渐进 + 跳 256K", COLOR.warn),
      metricCell("Nemotron", "节省 30% 算力", COLOR.warn),
      metricCell("✓ 主线", "Stage 5 用 48K", COLOR.good),
      metricCell("中", "节省 4 周", COLOR.good),
      metricCell("—", "—", COLOR.good),
      metricCell("MMLongBench-Doc", "+ LongVideoBench", COLOR.ink)
    ],
    [
      rowLabelCell("⊘ 明确不用", COLOR.inkSoft),
      metricCell("跨三家", "—", COLOR.inkSoft),
      metricCell("AuT 自训(40M 小时无法)", "ARIA/Talker(不做生成)\ndNaViT RVQ / Hybrid Attn+GDN(架构层)", COLOR.red),
      metricCell("—", "—", COLOR.red),
      metricCell("—", "—", COLOR.red),
      metricCell("—", "—", COLOR.inkSoft)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: 0.85, w: 12.5, h: 4.40,
    colW: [2.50, 1.65, 2.10, 1.60, 2.00, 2.65],
    rowH: [0.45, 0.45, 0.55, 0.55, 0.45, 0.45, 0.45, 0.45, 0.45, 0.55],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  // 优先级排序
  const pY = 5.40;
  const pH = 0.70;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: pY, w: 4.10, h: pH,
    fill: { color: COLOR.fillRed }, line: { color: COLOR.red, width: 1.0 }
  });
  s.addText([
    { text: "P1 主线吸收(已纳入): ", options: { color: COLOR.red, bold: true, fontSize: 11, breakLine: true } },
    { text: "Hybrid 2T Specialist + OPD + EVS + 48K 渐进", options: { color: COLOR.ink, bold: true, fontSize: 10 } }
  ], { x: 0.50, y: pY + 0.05, w: 3.90, h: pH - 0.10, fontFace: FONT.zh });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 4.60, y: pY, w: 4.20, h: pH,
    fill: { color: COLOR.fillOrange }, line: { color: COLOR.warn, width: 1.0 }
  });
  s.addText([
    { text: "P2 消融候选(T+12 前完成): ", options: { color: COLOR.warn, bold: true, fontSize: 11, breakLine: true } },
    { text: "完整 5T Specialist + Cluster Rebal + Modality MoE", options: { color: COLOR.ink, bold: true, fontSize: 10 } }
  ], { x: 4.70, y: pY + 0.05, w: 4.00, h: pH - 0.10, fontFace: FONT.zh });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 8.90, y: pY, w: 4.00, h: pH,
    fill: { color: COLOR.fillGreen }, line: { color: COLOR.good, width: 1.0 }
  });
  s.addText([
    { text: "P3 增量消融(T+18 前如有空): ", options: { color: COLOR.good, bold: true, fontSize: 11, breakLine: true } },
    { text: "Random delay + 中英多语配比", options: { color: COLOR.ink, bold: true, fontSize: 10 } }
  ], { x: 9.00, y: pY + 0.05, w: 3.80, h: pH - 0.10, fontFace: FONT.zh });

  addRedConclusionBox(s, [
    { tag: "❶ Hybrid 2T 主线",
      body: "v4 把 Hybrid Specialist Distillation(35B-A3B 通才 + 1 Vision specialist)",
      bold: "提升为主线,",
      warn: " 完整 5T 降为 P2(多客户场景下 5T ROI 摊薄)",
      tail: "" },
    { tag: "❷ Framework 把消融做成开关",
      body: "P1 默认开启;",
      bold: "P2/P3 通过 yaml 开关,",
      warn: " 客户可按需启用对照实验",
      tail: "" },
    { tag: "❸ 消融与主线并行",
      body: "P2 在 Phase B SFT 期间分支验证 ",
      bold: "(同一份数据 + 同一份代码,只换 yaml),",
      warn: " 不阻塞主线",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Qwen3.5-Omni: Specialist Distillation + OPD", tail: " (arxiv 2604.15804)" },
    { name: "LongCat-Next: Cluster Rebal + Modality-Agnostic MoE", tail: " (arxiv 2603.27538)" },
    { name: "Nemotron 3 Nano Omni: EVS + 渐进上下文", tail: " (arxiv 2604.24954)" }
  ]);
}

// ============================================================
// SLIDE 5 — 两阶段路线图(双 demo 强调)
// ============================================================
function slide5() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "两阶段路线图",
    "Phase A → 双 demo 各 1 个,framework alpha → beta 渐进");

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
    { x: 0.34, label: "T-4", desc: "Demo A SFT 跑通", color: COLOR.brandB },
    { x: 0.42, label: "T-2", desc: "Demo A α 版交付", color: COLOR.warn },
    { x: 0.48, label: "T = 0", desc: "实 ckpt 到达", color: COLOR.red },
    { x: 0.55, label: "T+2", desc: "Sanity + 切换", color: COLOR.warn },
    { x: 0.68, label: "T+8", desc: "Demo B SFT 完", color: COLOR.warn },
    { x: 0.83, label: "T+14", desc: "RL + 消融完", color: COLOR.warn },
    { x: 1.0, label: "T+18", desc: "β 版交付 + 上线评估", color: COLOR.good }
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
  const ckptX = tlX + 0.48 * tlW;
  s.addShape(pres.shapes.LINE, {
    x: ckptX, y: tlY - 0.10, w: 0, h: 0.95,
    line: { color: COLOR.red, width: 2.0, dashType: "dash" }
  });

  const swimY = 1.95;
  const swimH = 1.20;
  const lanes = [
    {
      y: swimY, label: "Phase A\nDemo A 训练\n(Qwen3.5-4B)\n+ Framework α", color: COLOR.brandB,
      blocks: [
        { x: 0.0, w: 0.18, text: "数据 + tokenizer\n+ 评测 harness\n+ 5 yaml 模板", c: COLOR.brandB },
        { x: 0.18, w: 0.16, text: "encoder + projector\n+ HF/FSDP 代码\n+ Vision specialist 启动", c: COLOR.brandB },
        { x: 0.34, w: 0.14, text: "Demo A 全流水线\nSFT+RL 跑通\n→ α 版交付", c: COLOR.warn }
      ]
    },
    {
      y: swimY + swimH + 0.10, label: "Phase B\nDemo B 训练\n(自家 10B-A2B)", color: COLOR.warn,
      blocks: [
        { x: 0.48, w: 0.07, text: "Sanity\n+ vLLM 类\n适配", c: COLOR.red },
        { x: 0.55, w: 0.13, text: "实 ckpt 走 SFT 5 段\n含 Hybrid 2T Specialist\n+ OPD + EVS", c: COLOR.warn }
      ]
    },
    {
      y: swimY + 2 * (swimH + 0.10), label: "Framework\nβ + 移交\n(T+8 → T+18)", color: COLOR.good,
      blocks: [
        { x: 0.68, w: 0.10, text: "verl 3 段 RL\n+ P2 消融分支", c: COLOR.red },
        { x: 0.78, w: 0.05, text: "P2\nMoE 路由\nRebal", c: COLOR.brandA },
        { x: 0.83, w: 0.07, text: "P3 + 评测\n+ 文档完善", c: COLOR.warn },
        { x: 0.90, w: 0.10, text: "β 版交付\n+ 客户 onboarding", c: COLOR.good }
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
      color: "FFFFFF", bold: true, fontSize: 10.5, align: "center", valign: "middle", fontFace: FONT.zh
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
    { tag: "❶ 双 demo 双交付",
      body: "T-2 Demo A α 版可给客户先体验(",
      bold: "Qwen3.5-4B-omni 公开 ckpt 类),",
      warn: " T+18 Demo B β 版加自家骨干,客户拿到完整框架",
      tail: "" },
    { tag: "❷ Framework 是连续交付",
      body: "α(T-2 跑通)→ β(T+18 完整),",
      bold: "yaml + docs + tutorial 持续完善;",
      warn: " 客户从 α 阶段就能开始读代码 / 试用",
      tail: "" },
    { tag: "❸ 消融并行不阻塞主线",
      body: "P1 已在主线;P2 在 Phase B 期间 ",
      bold: "yaml 切分支跑,",
      warn: " 同一份数据 + 同一份代码,只换配置",
      tail: "" }
  ]);

  addSources(s, [
    { name: "内部 Phase 切换协议", tail: " (T+0 → T+2 设 1 道 Sanity gate)" },
    { name: "α/β 渐进交付模式", tail: " (业界常见 framework 交付节奏)" }
  ]);
}

// ============================================================
// SLIDE 6 — Phase A 5 流(framework 视角)
// ============================================================
function slide6() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "Phase A 交付物",
    "12 周内训出 Demo A + framework α 版,五流并行有 owner");

  const streams = [
    {
      tag: "①", title: "数据流水线 + data.yaml", color: COLOR.brandB,
      owner: "Data team (2-3 人)",
      tasks: [
        "Vision: LLaVA-OneVision-Data + Cambrian-7M + Cauldron 全量",
        "Audio: Granary v1.1 + AudioCaps + WavCaps + Common Voice",
        "Video: ShareGPT4Video + LLaVA-Video-178K(短中视频为主)",
        "Tokenize 用 Qwen3.5-4B + 25 MM token + webdataset 分片",
        "data.yaml 模板:配置数据混合比例 + encoder 选型 + OPD 配对"
      ],
      deliverable: "T-8 前:数据池 + data.yaml 模板 + prepare_data.py",
      dependency: "无(完全独立)"
    },
    {
      tag: "②", title: "评测 harness + eval.yaml", color: COLOR.good,
      owner: "Eval team (1-2 人)",
      tasks: [
        "VLMEvalKit fork + 内部分支(支持自建 base + custom model class)",
        "8 维 36 项整合(MMMU/DocVQA/VideoMME/OpenASR/SS-Pro/...)",
        "文本回归套件 + 每 1B token mini-eval 自动触发",
        "vLLM serving 接 eval pipeline,WandB 仪表盘",
        "eval.yaml 模板:客户可定制 eval 子集 + 自定义任务"
      ],
      deliverable: "T-10 前:harness + eval.yaml + Qwen2.5-VL 基线对照",
      dependency: "无"
    },
    {
      tag: "③", title: "训练代码(HF/FSDP) + train.yaml", color: COLOR.warn,
      owner: "Eng team (2 人)",
      tasks: [
        "HF transformers + FSDP2 训练 loop(避开 Megatron)",
        "MoE-aware FSDP wrap policy(为 Phase B 实 ckpt 准备)",
        "Encoder hot-swap + projector 模板 + 25 MM token resize 脚本",
        "verl 接入 + GSPO 自实现验证(GRPO 兜底)+ rl.yaml",
        "vLLM 模型类 stub(为 Phase B 自家 MoE 架构预留)"
      ],
      deliverable: "T-6 前:train.yaml + rl.yaml + Demo A Stage 0 训出",
      dependency: "Tokenizer 决策(⑤)"
    },
    {
      tag: "④", title: "Encoder + Hybrid 2T Specialist", color: COLOR.brandA,
      owner: "Research (1-2 人)",
      tasks: [
        "Vision: SigLIP-SO400M vs InternViT-300M 对照",
        "Audio: Whisper-large-v3 + MLP projector",
        "Video: 复用 Vision encoder + Conv3D + EVS",
        "T-2 前完成 Demo A Stage 0/1(Qwen3.5-4B 上)",
        "T-2 起启动 Hybrid 2T Specialist(35B-A3B 接入 + Vision specialist 自训)"
      ],
      deliverable: "T-2 前:Demo A α 版(MMMU ≥ 50)+ 2T Specialist 启动",
      dependency: "②(评测)+ ③(代码)"
    },
    {
      tag: "⑤", title: "Tokenizer 决策 + 文档", color: COLOR.red,
      owner: "Cross-team (1 人) + Doc owner",
      tasks: [
        "复用 Qwen3.5-4B-base tokenizer(~151,936 vocab)",
        "添加 ~25 MM special token + mean-init 脚本(详见 Slide 7)",
        "对齐预训练 team:实 ckpt 是否同 tokenizer 家族(T-10 SLA)",
        "若不同:retokenize 应急脚本预备",
        "★ 文档:README + Quickstart + Tutorial(客户 onboarding 用)"
      ],
      deliverable: "T-12 前:tokenizer 规范 + Quickstart + 5 yaml 模板",
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
    { tag: "❶ T 时刻有完整 framework α",
      body: "5 流并行交付:5 个 yaml 模板 + Demo A 模型 + 完整文档,",
      bold: "客户 T-2 起即可读代码试用",
      warn: "",
      tail: "" },
    { tag: "❷ 文档是 first-class deliverable",
      body: "Slide 6 ⑤ 中 ",
      bold: "Doc owner 必须独立配 1 人,",
      warn: " 框架交付不附文档 = 客户跑不起来 = 项目失败",
      tail: "" },
    { tag: "❸ Hybrid 2T Specialist 主线启动",
      body: "T-2 起 Vision specialist 在 Qwen3.5-4B 上训出,",
      bold: "实 ckpt 来后 Specialist 直接复用,",
      warn: " 节省 4 周",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Qwen3.5-4B-base + SigLIP-SO400M / Whisper-v3", tail: " (HF model hub)" },
    { name: "verl + vLLM 集成模式", tail: " (GitHub 文档)" },
    { name: "5 yaml 模板设计", tail: " (内部 framework 规范)" }
  ]);
}

// ============================================================
// SLIDE 7 — Tokenizer 操作流
// ============================================================
function slide7() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "Tokenizer 操作流",
    "Qwen3.5-4B 词表 + 25 MM token,resize 脚本 + 切换协议");

  const fY = 0.85;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: fY, w: 12.5, h: 0.85,
    fill: { color: COLOR.cardGray }, line: { color: COLOR.ink, width: 0.5 }
  });
  s.addText([
    { text: "我方 Tokenizer = ", options: { color: COLOR.ink, bold: true, fontSize: 12 } },
    { text: "Qwen3.5-4B-base ", options: { color: COLOR.brandB, bold: true, fontSize: 12 } },
    { text: "(151,936 BPE,中英多语,ChatML 已含 <|im_start|>/<|im_end|>)", options: { color: COLOR.ink, fontSize: 10 } },
    { text: "  ⊕  ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "+25 MM special tokens ", options: { color: COLOR.warn, bold: true, fontSize: 12 } },
    { text: "(其中 ~10 是 Qwen3.5 原生缺失,需新增 ~15-18,可调 ±5)", options: { color: COLOR.inkSoft, italic: true, fontSize: 10 } },
    { text: "  ⇒  ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "~151,955 ", options: { color: COLOR.warn, bold: true, fontSize: 12 } },
    { text: "tokens(可调到 256 倍数对齐 GPU)", options: { color: COLOR.inkSoft, italic: true, fontSize: 10 } }
  ], { x: 0.50, y: fY + 0.10, w: 12.30, h: 0.70, valign: "middle", fontFace: FONT.zh });

  const lX = 0.4, lY = 1.95, lW = 6.30, lH = 4.05;
  s.addShape(pres.shapes.RECTANGLE, {
    x: lX, y: lY, w: lW, h: lH,
    fill: { color: "FFFFFF" }, line: { color: COLOR.brandB, width: 1.0 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: lX, y: lY, w: lW, h: 0.40,
    fill: { color: COLOR.brandB }, line: { color: COLOR.brandB, width: 0 }
  });
  s.addText("⚙ 5 步操作流(Phase A 第 1 周完成)", {
    x: lX + 0.10, y: lY + 0.05, w: lW - 0.20, h: 0.32,
    color: "FFFFFF", bold: true, fontSize: 12, valign: "middle", fontFace: FONT.zh
  });

  const steps = [
    {
      step: "Step 1",
      action: "tokenizer.add_special_tokens({'additional_special_tokens': [...]}) 添加 25 个新 token",
      detail: "去重:跳过 Qwen3.5 已有的(<|im_start|>/<|im_end|>/<|tool_call|> 等)\n实际新增 ~15-18:vision/audio/video placeholder + grounding/bbox/ocr"
    },
    {
      step: "Step 2",
      action: "model.resize_token_embeddings(len(tokenizer), pad_to_multiple_of=256) 扩 embedding",
      detail: "embedding + LM head 同步扩(weight tied 时一次扩);pad to 256 倍数避免 GPU 性能掉"
    },
    {
      step: "Step 3",
      action: "新 token embedding 用「近义文本 token mean」初始化",
      detail: "<|vision_start|> 用 image/img/picture 平均;<|audio_start|> 用 audio/sound 平均\nfallback:小方差随机 σ=0.02"
    },
    {
      step: "Step 4",
      action: "Stage 0 训练时,LLM 全冻 + 仅解冻 [Vision-Proj, 25 个新 token 的 embedding 行]",
      detail: "其它 151,936 个 token 的 embedding 行保持冻结,防止已学语义漂移"
    },
    {
      step: "Step 5",
      action: "数据预处理时把 image/audio/video 占位插入文本流",
      detail: "<|vision_start|> + N 个 <|image_pad|> + <|vision_end|>\n音频/视频同结构,N 由 encoder 输出 token 数决定"
    }
  ];
  const stepTop = lY + 0.50;
  const stepH = (lH - 0.60) / steps.length;
  steps.forEach((st, i) => {
    const y = stepTop + i * stepH;
    s.addText([
      { text: st.step + "  ", options: { color: COLOR.red, bold: true, fontSize: 10 } },
      { text: st.action, options: { color: COLOR.ink, bold: true, fontSize: 10, breakLine: true } },
      { text: "    " + st.detail, options: { color: COLOR.inkSoft, fontSize: 8.5, italic: true } }
    ], { x: lX + 0.12, y, w: lW - 0.24, h: stepH - 0.04, margin: 0, fontFace: FONT.zh });
    if (i < steps.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: lX + 0.12, y: y + stepH - 0.04, w: lW - 0.24, h: 0,
        line: { color: COLOR.inkFaint, width: 0.25 }
      });
    }
  });

  const rX = 6.85, rY = 1.95, rW = 6.05, rH = 4.05;
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: rH,
    fill: { color: "FFFFFF" }, line: { color: COLOR.red, width: 1.0 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: rX, y: rY, w: rW, h: 0.40,
    fill: { color: COLOR.red }, line: { color: COLOR.red, width: 0 }
  });
  s.addText("⚠ Phase B 实 ckpt 到达 — Tokenizer 切换协议", {
    x: rX + 0.10, y: rY + 0.05, w: rW - 0.20, h: 0.32,
    color: "FFFFFF", bold: true, fontSize: 12, valign: "middle", fontFace: FONT.zh
  });

  const switchPlan = [
    {
      cond: "Case 1: 实 ckpt 用 Qwen3.5 同一 tokenizer ★最理想",
      action: "tokenizer 完全复用,把 Step 1-3 在新 ckpt 上重做(分钟级);数据无需 retokenize",
      cost: "0 周(零返工)",
      color: COLOR.good
    },
    {
      cond: "Case 2: 同家族,词表略有差异(±5%)",
      action: "对比 vocab.json,补缺漏 + retokenize 受影响样本(<10%)",
      cost: "1-2 周",
      color: COLOR.warn
    },
    {
      cond: "Case 3: 完全不同 tokenizer ★最坏",
      action: "全量 retokenize 170B token 数据池;评测脚本/RL prompt template 全部重做",
      cost: "3-4 周(严重)",
      color: COLOR.red
    },
    {
      cond: "对预训练 team 的 SLA 请求(T-10 前必须确认)",
      action: "实 ckpt 词表与 Qwen3.5 兼容性;不兼容需提前 4 周通告",
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
    { tag: "❶ 5 步是机械操作",
      body: "Step 1-5 全部是 ",
      bold: "transformers / HF API 直接调用,",
      warn: " 第 1 周内完成,无 R&D 风险",
      tail: "" },
    { tag: "❷ 客户也走同样 5 步",
      body: "Framework 把 5 步打包成 ",
      bold: "prepare_data.py 一个脚本,",
      warn: " 客户加自己的 special token 也是改 yaml + 跑脚本",
      tail: "" },
    { tag: "❸ Case 3 是 R2 风险",
      body: "若实 ckpt 用全新 tokenizer,",
      warn: "数据 retokenize 4 周 + RL prompt 重做,",
      bold: "Phase B 整体延 4 周,T-10 必须签 SLA",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Qwen3.5 / Qwen3-VL tokenizer 设计", tail: " (HF tokenizer.json)" },
    { name: "Qwen2-VL / Qwen3-Omni MM token 列表", tail: " (开源代码参考)" },
    { name: "HF transformers resize_token_embeddings", tail: " (官方 API)" }
  ]);
}

// ============================================================
// SLIDE 8 — SFT 配方(v4 token 量调整)
// ============================================================
function slide8() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "SFT 配方 (10B-A2B)",
    "5 段 ~170B token,active params + stage 跳过双重缩放");

  const fY = 0.85;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: fY, w: 12.5, h: 0.85,
    fill: { color: COLOR.cardGray }, line: { color: COLOR.ink, width: 0.5 }
  });
  s.addText([
    { text: "Token 缩放: ", options: { color: COLOR.red, bold: true, fontSize: 12 } },
    { text: "Nemotron 30B-A3B = 466.9B  ", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "→ ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "10B-A2B 按 active params 缩(2/3 ≈ 67%)= 312B  ", options: { color: COLOR.ink, fontSize: 11 } },
    { text: "→ ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "扣 Stage 6(-34B)+ 扣 GUI/coding/math 不相关数据(~70B)", options: { color: COLOR.warn, bold: true, fontSize: 10 } },
    { text: "  ≈  ", options: { color: COLOR.red, bold: true, fontSize: 14 } },
    { text: "~170B ", options: { color: COLOR.red, bold: true, fontSize: 13 } },
    { text: "(Nemotron 36%)", options: { color: COLOR.inkSoft, italic: true, fontSize: 10 } }
  ], { x: 0.50, y: fY + 0.10, w: 12.30, h: 0.70, valign: "middle", fontFace: FONT.zh });

  const tY = 1.95;
  const tH = 3.30;
  const tbl = [
    [
      headerCell("阶段"),
      headerCell("Context"),
      headerCell("Nemotron 原值"),
      headerCell("我方 token"),
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
      metricCell("~95B", "去 GUI/math/code 子集", COLOR.warn),
      metricCell("0.44", "明显压缩", COLOR.warn),
      metricCell("16-32 H100", "FSDP, mixed precision", COLOR.warn),
      metricCell("3 周", "—", COLOR.warn)
    ],
    [
      rowLabelCell("Stage 2/3\nAudio Enc+Proj", COLOR.brandA),
      metricCell("16K", "—", COLOR.ink),
      metricCell("11.4 + 100.5\n=112B", "—", COLOR.ink),
      metricCell("~25B", "S2:5B + S3:20B", COLOR.warn),
      metricCell("0.22", "audio 任务相对简单", COLOR.warn),
      metricCell("8-16 H100", "FSDP", COLOR.good),
      metricCell("2 周", "—", COLOR.good)
    ],
    [
      rowLabelCell("Stage 4\nOmni SFT 16K", COLOR.warn),
      metricCell("16K", "联合", COLOR.ink),
      metricCell("57.3B", "—", COLOR.ink),
      metricCell("~30B", "+ OPD 配对样本", COLOR.warn),
      metricCell("0.52", "—", COLOR.warn),
      metricCell("16-32 H100", "FSDP", COLOR.warn),
      metricCell("2-3 周", "—", COLOR.warn)
    ],
    [
      rowLabelCell("Stage 5\nOmni SFT 48K", COLOR.warn),
      metricCell("48K", "扩 3×", COLOR.warn),
      metricCell("33.5B", "—", COLOR.ink),
      metricCell("~15B", "video + 长文档", COLOR.warn),
      metricCell("0.45", "广告 60s 视频必要", COLOR.warn),
      metricCell("16-32 H100", "FSDP + ctx parallel", COLOR.warn),
      metricCell("2 周", "—", COLOR.warn)
    ],
    [
      rowLabelCell("⊘ Stage 6\n256K", COLOR.red),
      metricCell("256K", "跳过", COLOR.red),
      metricCell("34B", "—", COLOR.inkSoft),
      metricCell("0", "—", COLOR.good),
      metricCell("0", "—", COLOR.red),
      metricCell("—", "—", COLOR.inkSoft),
      metricCell("—", "省 4 周", COLOR.good)
    ],
    [
      rowLabelCell("总计", COLOR.red),
      metricCell("—", "—", COLOR.ink),
      metricCell("466.9B", "Nemotron 全栈", COLOR.ink),
      metricCell("~170B", "+ OPD ~5B = 170B", COLOR.warn),
      metricCell("0.36", "符合预期", COLOR.warn),
      metricCell("16-32 H100", "全程", COLOR.warn),
      metricCell("9-10 周", "Phase B SFT", COLOR.warn)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: tY, w: 12.5, h: tH,
    colW: [1.40, 0.90, 1.50, 1.65, 1.40, 2.55, 1.10],
    rowH: [0.45, 0.40, 0.45, 0.45, 0.45, 0.45, 0.40, 0.40],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  const bY = tY + tH + 0.20;
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: bY, w: 12.5, h: 0.55,
    fill: { color: COLOR.cardYellow }, line: { color: COLOR.warn, width: 0.75 }
  });
  s.addText([
    { text: "为什么 ~170B(比 v3 200B 又少): ", options: { color: COLOR.red, bold: true, fontSize: 11 } },
    { text: "(1)v3 还想做 GUI agent / 数学推理,v4 框架场景下这部分数据 ", options: { color: COLOR.ink, fontSize: 10 } },
    { text: "客户自己加更高效  ", options: { color: COLOR.warn, bold: true, fontSize: 10 } },
    { text: "(2)Hybrid 2T Specialist 已主线,数据效率 ↑ ~10%  ", options: { color: COLOR.warn, fontSize: 10 } },
    { text: "(3)Stage 1 缩 14% / Stage 2/3 缩 17%,通用底已够", options: { color: COLOR.ink, bold: true, fontSize: 10 } }
  ], { x: 0.50, y: bY + 0.10, w: 12.30, h: 0.40, valign: "middle", fontFace: FONT.zh });

  addRedConclusionBox(s, [
    { tag: "❶ 缩放有据可依",
      body: "170B = 466.9B × 0.36,与 active params 比例 ",
      bold: "× Stage 跳过 × 数据集裁剪 ",
      warn: "三重折损一致",
      tail: "" },
    { tag: "❷ Phase A 80B 试水",
      body: "Demo A 用 Qwen3.5-4B 做 proxy 时跑 ",
      bold: "~80B token 即可饱和",
      warn: ",更小模型 + 更窄数据,",
      tail: "Demo B 实 ckpt 跑 170B" },
    { tag: "❸ Stage 5 48K 不能跳",
      body: "广告 60s 视频实测 30-50K token,",
      bold: "Stage 5 是必须主线;",
      warn: " 跳了客户拿不到长视频能力",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Nemotron 7 阶段原始 token 量", tail: " (arxiv 2604.24954)" },
    { name: "Chinchilla scaling law + active params 经验", tail: " (内部估算)" },
    { name: "PyTorch FSDP2 / accelerate 文档", tail: "" }
  ]);
}

// ============================================================
// SLIDE 9 — 数据规模(v4 调整)
// ============================================================
function slide9() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "数据规模 + 来源",
    "170B token,100% 公开数据,vision 56% / audio 15% / video 9% / text 20%");

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
      metricCell("LLaVA-OneVision-Data", "+ Cambrian-7M(去 GUI 子集)+ Cauldron + ALLaVA", COLOR.ink),
      metricCell("~22M", "复合指令", COLOR.warn),
      metricCell("~95B", "Stage 1 主战场", COLOR.warn),
      metricCell("✓ 全开源", "+ 自建 CoT 数据", COLOR.good),
      metricCell("Data + Research", "CoT 自合成 ~5B", COLOR.warn)
    ],
    [
      rowLabelCell("Audio Pretrain + SFT\n(Stage 2/3)", COLOR.brandA),
      metricCell("Granary v1.1 ASR", "+ AudioCaps + WavCaps + CV", COLOR.ink),
      metricCell("~20M", "音频任务", COLOR.warn),
      metricCell("~25B", "ASR + AQA + 简单分类", COLOR.warn),
      metricCell("✓ 公开", "Granary HF 直接拉", COLOR.good),
      metricCell("Data team", "AudioSet 仅 label", COLOR.warn)
    ],
    [
      rowLabelCell("Omni 混合\n(Stage 4)", COLOR.warn),
      metricCell("V+A+T 混采", "+ ShareGPT4Video + 安全数据", COLOR.ink),
      metricCell("~5M", "混合", COLOR.warn),
      metricCell("~30B", "5:3:2 + OPD 配对 + Cluster Rebal", COLOR.warn),
      metricCell("⚠ 自建", "比例需调优", COLOR.warn),
      metricCell("Research", "OPD 配对 + Rebal pipeline", COLOR.red)
    ],
    [
      rowLabelCell("中长视频\n(Stage 5)", COLOR.warn),
      metricCell("LLaVA-Video-178K", "+ EgoSchema + LongVideoBench 分布", COLOR.ink),
      metricCell("~1M", "中长视频", COLOR.warn),
      metricCell("~15B", "含视频推理 CoT", COLOR.warn),
      metricCell("⚠ 部分", "需采样长尾", COLOR.warn),
      metricCell("Data + Research", "长视频标注稀缺", COLOR.red)
    ],
    [
      rowLabelCell("Text 保留\n(全程混采)", COLOR.red),
      metricCell("自家文本 SFT 同分布", "(由预训练 team 提供)", COLOR.ink),
      metricCell("—", "按比例混", COLOR.ink),
      metricCell("~35B", "防漂移采样", COLOR.warn),
      metricCell("✗ 待对齐", "需 cross-team SLA", COLOR.red),
      metricCell("Cross-team", "T-12 立项,40% 风险", COLOR.red)
    ],
    [
      rowLabelCell("RL 偏好", COLOR.red),
      metricCell("RLHF-V + VLFeedback", "+ POVID(GUI 偏好不再自标)", COLOR.ink),
      metricCell("~120K", "偏好对", COLOR.warn),
      metricCell("~3B", "短样本", COLOR.warn),
      metricCell("✓ 公开", "GUI 客户自己标", COLOR.good),
      metricCell("Eval team", "标注成本下降", COLOR.good)
    ],
    [
      rowLabelCell("总计", COLOR.red),
      metricCell("—", "—", COLOR.ink),
      metricCell("~52M+120K", "—", COLOR.ink),
      metricCell("~208B", "(SFT 170B + RL 3B + Text 35B)", COLOR.warn),
      metricCell("85% ready", "15% 需自建/谈判", COLOR.warn),
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
    { tag: "❶ 100% 公开数据",
      body: "v4 不需要客户业务数据,",
      bold: "完全公开 + 自建 OPD 配对 + Cluster Rebal,",
      warn: " 数据 100% 可分享给客户(MIT/Apache 兼容)",
      tail: "" },
    { tag: "❷ GUI 偏好不自标",
      body: "v3 自标 30K GUI 偏好为广告场景准备;",
      bold: "v4 客户自己有 UI 测试需求时自己标,",
      warn: " 我方提供标注 pipeline 模板",
      tail: "" },
    { tag: "❸ Text 同分布仍是 R3",
      body: "防漂移的 ",
      warn: "~35B Text 数据 ",
      bold: "必须由预训练 team 提供同分布,",
      tail: "T-12 必须签 SLA;否则退化到公开 Nemotron-text" }
  ]);

  addSources(s, [
    { name: "LLaVA-OneVision / Cambrian / Granary", tail: " (HuggingFace)" },
    { name: "OPD 配对方案 (Qwen3.5-Omni)", tail: " + Cluster Rebal (LongCat)" },
    { name: "公开偏好数据集 RLHF-V / VLFeedback / POVID", tail: "" }
  ]);
}

// ============================================================
// SLIDE 10 — RL 栈
// ============================================================
function slide10() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "RL 栈 verl/FSDP",
    "3 段 GSPO,verl rollout 用 vLLM,GRPO 兜底,跳 Audio/Omni-RL");

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
    { num: "1", name: "MPO 偏好优化", detail: "DPO + BCO 混合(verl 内置 DPO + 自加 BCO)\n~120K 偏好对(RLHF-V + VLFeedback + POVID)\n2 周 / 16 H100,FSDP", color: COLOR.warn },
    { num: "2", name: "Image-RL", detail: "GSPO(verl + 我方贡献)\n~50K 视觉推理,客户场景可加自家 GUI 偏好\nverifier: string/math/format(GUI 客户自加)\n3 周 / B200 + vLLM rollout", color: COLOR.red },
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

  const arch = [
    { y: 0, h: 0.55, text: "verl Trainer", subtext: "GRPO / GSPO / DPO 算法层", color: COLOR.red },
    { y: 0.60, h: 0.55, text: "FSDP2 Worker", subtext: "策略模型 + 参考模型", color: COLOR.warn },
    { y: 1.20, h: 0.55, text: "Ray Cluster", subtext: "rollout / actor / critic 编排", color: COLOR.brandA },
    { y: 1.80, h: 0.55, text: "vLLM Rollout", subtext: "并行 generate(PagedAttn)", color: COLOR.brandB },
    { y: 2.40, h: 0.55, text: "Reward Verifiers", subtext: "string/math/GUI/format 可插拔", color: COLOR.good },
    { y: 3.00, h: 0.55, text: "rl.yaml 配置", subtext: "客户改 yaml 切算法 / 数据 / verifier", color: COLOR.ink }
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
    { k: "兜底方案", v: "GRPO 在 omni 已被验证,损失约 1-2 pt 稳定性", color: COLOR.warn },
    { k: "Global BS / rollouts", v: "4096 / 16 rollouts(vLLM 并行 = 16-32 副本)", color: COLOR.ink },
    { k: "⊘ Text-RL S1 跳过", v: "Nemotron 用于多环境 RLVR,我方场景无需多环境", color: COLOR.inkSoft },
    { k: "⊘ Omni-RL 跳过", v: "Image-RL + audio benchmark 已可覆盖 DailyOmni\n若 T+14 不达标可后补 2-3 周", color: COLOR.inkSoft },
    { k: "⊘ Audio-RL 跳过", v: "ASR/分类 SFT 已逼近上限,RL 边际收益低", color: COLOR.inkSoft },
    { k: "Text-RL S2 必跑", v: "Stage 4/5 后必有 1-2 pt 漂移,这是修复段", color: COLOR.red },
    { k: "Verifier", v: "复用 verl 内置 + 客户可加自定义(rl.yaml)", color: COLOR.ink }
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
      bold: "OSS 第一梯队 RL 框架,",
      warn: " 原生 FSDP+vLLM,与我方栈对齐",
      tail: "" },
    { tag: "❷ GSPO 自实现风险可控",
      body: "GRPO → GSPO 主要差别在 ",
      bold: "sequence-level 重要性比",
      warn: ",~300 行,2 人 1 周;",
      tail: "若延迟用 GRPO 兜底" },
    { tag: "❸ Verifier 可插拔",
      body: "RL pipeline 留 verifier 接口,",
      bold: "客户可加自定义 reward(违规分类 / GUI 准确率 / 等),",
      warn: " 不动核心代码",
      tail: "" }
  ]);

  addSources(s, [
    { name: "verl(volcengine/verl)", tail: " GitHub" },
    { name: "GSPO 算法", tail: " (Qwen 团队 2025 公开)" },
    { name: "Nemotron 5 段 RL pipeline + GSPO 超参", tail: " (arxiv 2604.24954)" }
  ]);
}

// ============================================================
// SLIDE 11 — 评测红线
// ============================================================
function slide11() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "评测红线",
    "对标同 size 开源(Qwen2.5-VL-4B),无具体数字约定,仍设 3 阶段");

  const tbl = [
    [
      headerCell("评测维度"),
      headerCell("代表 benchmark"),
      headerCell("Phase A (Demo A)\n对照基准"),
      headerCell("Phase B (Demo B)\n对照基准"),
      headerCell("能力证明门槛"),
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
      metricCell("≈ Qwen2.5-VL-4B", "(MMMU ~50)", COLOR.warn),
      metricCell("≈ 同 size 开源", "(对标 4B/7B)", COLOR.warn),
      metricCell("打平 baseline", "(±2 pt)", COLOR.good),
      metricCell("差 > 5 pt", "Phase 中点不通过", COLOR.red)
    ],
    [
      rowLabelCell("OCR / 文档", COLOR.brandB),
      metricCell("OCRBench-V2 / DocVQA / ChartQA", "CharXiv RQ", COLOR.ink),
      metricCell("DocVQA ≈ baseline", "(~85)", COLOR.warn),
      metricCell("DocVQA ≈ 90", "对标 Qwen2.5-VL-7B", COLOR.warn),
      metricCell("打平 baseline", "—", COLOR.good),
      metricCell("差 > 5 pt", "Phase 上线不达标", COLOR.red)
    ],
    [
      rowLabelCell("Agent / GUI", COLOR.warn),
      metricCell("ScreenSpot-Pro / OSWorld-G", "(留给 UI 客户用)", COLOR.ink),
      metricCell("SS-Pro ≥ 25", "Phase A 验证 RL 流程", COLOR.warn),
      metricCell("SS-Pro ≥ 35", "RL 后", COLOR.warn),
      metricCell("能跑通(框架证明)", "客户用自家数据继续训", COLOR.good),
      metricCell("跑不通", "RL pipeline 失败", COLOR.red)
    ],
    [
      rowLabelCell("音频理解", COLOR.brandA),
      metricCell("OpenASR / MMAU / MMAR", "VoiceBench", COLOR.ink),
      metricCell("ASR WER ≈ 8", "—", COLOR.warn),
      metricCell("WER ≈ 7 / MMAU ≈ 65", "—", COLOR.warn),
      metricCell("打平 baseline", "—", COLOR.good),
      metricCell("WER > 10", "Audio SFT 不达标", COLOR.red)
    ],
    [
      rowLabelCell("视频理解", COLOR.brandB),
      metricCell("VideoMME / LongVideoBench", "MVBench / NextQA", COLOR.ink),
      metricCell("VideoMME ≈ 55", "短视频", COLOR.warn),
      metricCell("VideoMME ≈ 60", "—", COLOR.warn),
      metricCell("打平同 size 开源", "—", COLOR.good),
      metricCell("差 > 5 pt", "Stage 5 不达标", COLOR.warn)
    ],
    [
      rowLabelCell("Omni 端到端 ★", COLOR.warn),
      metricCell("DailyOmni / WorldSense", "AVUT", COLOR.ink),
      metricCell("DailyOmni ≈ 60", "Phase A 含 omni 数据", COLOR.warn),
      metricCell("DailyOmni ≈ 65", "—", COLOR.warn),
      metricCell("打平同 size 开源", "—", COLOR.good),
      metricCell("差 > 8 pt", "整体不达 SOTA", COLOR.red)
    ],
    [
      rowLabelCell("幻觉(必跑)", COLOR.red),
      metricCell("POPE / HallusionBench", "MMHal-Bench", COLOR.ink),
      metricCell("POPE ≥ 88", "—", COLOR.warn),
      metricCell("POPE ≥ 90", "—", COLOR.warn),
      metricCell("POPE ≥ 90", "幻觉是审核客户核心关切", COLOR.good),
      metricCell("POPE < 85", "上线不达标", COLOR.red)
    ]
  ];
  s.addTable(tbl, {
    x: 0.4, y: 0.85, w: 12.5, h: 5.05,
    colW: [1.65, 2.55, 1.85, 1.85, 2.05, 2.55],
    rowH: [0.50, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  addRedConclusionBox(s, [
    { tag: "❶ 对标同 size 开源,无数字约定",
      body: "我方与客户没有约定具体 benchmark 数字,",
      bold: "「打平同 size 开源」是能力证明标准 ",
      warn: "(MMMU 60+ / DocVQA 90+ / VideoMME 60+ 是 4B 档参考)",
      tail: "" },
    { tag: "❷ 幻觉显式加",
      body: "POPE / HallusionBench 显式加为必跑 ★,",
      bold: "广告/医疗/UI 客户对幻觉零容忍,",
      warn: " 上线门槛 POPE ≥ 90",
      tail: "" },
    { tag: "❸ 客户可定制 eval.yaml",
      body: "Framework 允许 ",
      bold: "客户在 eval.yaml 加自定义 task,",
      warn: " 公开 benchmark 是能力证明,自家 task 是业务验证(客户的事)",
      tail: "" }
  ]);

  addSources(s, [
    { name: "三篇报告评测整合", tail: " (Nemotron / LongCat / Qwen3.5)" },
    { name: "Qwen2.5-VL-4B / 7B 公开 benchmark", tail: " (HF model card)" },
    { name: "POPE / HallusionBench", tail: " (开源 hallucination benchmark)" }
  ]);
}

// ============================================================
// SLIDE 12 — 风险 + 交付清单(NEW)
// ============================================================
function slide12() {
  const s = pres.addSlide();
  s.background = { color: "FFFFFF" };
  addTitleBand(s, "风险 + 交付清单",
    "5 大风险 + 8 项交付物 + 客户 onboarding 流程");

  // 上半:5 大风险
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
      metricCell("T-4 未提供 stub", "—", COLOR.red),
      metricCell("Phase A 第 8 周起预留", "vLLM 模型类接口", COLOR.warn)
    ],
    [
      rowLabelCell("R2: Tokenizer Case 3", COLOR.red),
      metricCell("低-中", "20%", COLOR.warn),
      metricCell("高", "+3-4 周", COLOR.red),
      metricCell("T-10 SLA 未签", "—", COLOR.red),
      metricCell("retokenize 应急脚本", "+ 数据双备份", COLOR.warn)
    ],
    [
      rowLabelCell("R3: 预训练 team 不给 text 同分布", COLOR.red),
      metricCell("中高", "40%", COLOR.red),
      metricCell("高", "文本必漂移", COLOR.red),
      metricCell("T-8 仍未到位", "—", COLOR.red),
      metricCell("退化到公开 Nemotron-text", "数据,损 ~3 pt 接受", COLOR.red)
    ],
    [
      rowLabelCell("R4-NEW: Framework 可移交性不达标", COLOR.red),
      metricCell("中", "30%", COLOR.warn),
      metricCell("高(项目失败)", "客户跑不起", COLOR.red),
      metricCell("内部 dry-run 不通过", "—", COLOR.warn),
      metricCell("2 个 mock 客户场景内测", "+ 文档完备性 review", COLOR.warn)
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
    x: 0.4, y: 0.85, w: 12.5, h: 2.85,
    colW: [3.10, 1.30, 1.50, 2.40, 4.20],
    rowH: [0.45, 0.50, 0.50, 0.50, 0.50, 0.50],
    border: { pt: 0.5, color: COLOR.inkFaint }, fontFace: FONT.zh
  });

  // 下半:交付清单 + onboarding
  const dY = 3.85;
  // 左:交付清单
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: dY, w: 7.50, h: 2.30,
    fill: { color: "FFFFFF" }, line: { color: COLOR.good, width: 1.0 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: dY, w: 7.50, h: 0.40,
    fill: { color: COLOR.good }, line: { color: COLOR.good, width: 0 }
  });
  s.addText("☑ 8 项交付物清单(T+18 框架 β 版)", {
    x: 0.5, y: dY + 0.05, w: 7.30, h: 0.32,
    color: "FFFFFF", bold: true, fontSize: 12, valign: "middle", fontFace: FONT.zh
  });

  const deliverables = [
    "代码包(Apache/MIT 内部 license),HF transformers + FSDP2 + verl",
    "5 yaml 配置模板:data / train / rl / eval / deploy 各 1",
    "双 demo ckpt:Qwen3.5-4B-omni + 自家 10B-A2B-omni",
    "Benchmark 报告(自动生成的 markdown,8 维 36 项 + 训练曲线)",
    "完整文档:README + Architecture + Quickstart + Tutorial + API ref",
    "Demo Jupyter notebook(端到端 SFT+RL+eval 演示)",
    "服务化模板:vLLM serve + REST API + Dockerfile + K8s yaml",
    "客户 onboarding 培训(2 小时技术分享 + 1 周 office hours)"
  ];
  const dTop = dY + 0.45;
  const dH = (2.30 - 0.50) / Math.ceil(deliverables.length / 2);
  deliverables.forEach((d, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    s.addText([
      { text: "✓ ", options: { color: COLOR.good, bold: true, fontSize: 10 } },
      { text: d, options: { color: COLOR.ink, fontSize: 9.5 } }
    ], {
      x: 0.50 + col * 3.70, y: dTop + row * dH,
      w: 3.60, h: dH - 0.04, margin: 0, fontFace: FONT.zh
    });
  });

  // 右:客户 onboarding 流程
  s.addShape(pres.shapes.RECTANGLE, {
    x: 8.10, y: dY, w: 4.80, h: 2.30,
    fill: { color: "FFFFFF" }, line: { color: COLOR.warn, width: 1.0 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 8.10, y: dY, w: 4.80, h: 0.40,
    fill: { color: COLOR.warn }, line: { color: COLOR.warn, width: 0 }
  });
  s.addText("☞ 客户 onboarding 5 步", {
    x: 8.20, y: dY + 0.05, w: 4.60, h: 0.32,
    color: "FFFFFF", bold: true, fontSize: 12, valign: "middle", fontFace: FONT.zh
  });

  const onboard = [
    { num: "1", text: "T+18 交付:代码 + 文档 + 双 demo + 培训" },
    { num: "2", text: "客户 W1:阅读 docs + 跑 demo notebook" },
    { num: "3", text: "客户 W2:准备数据 + 改 yaml 跑 sanity SFT" },
    { num: "4", text: "客户 W3-W6:用自家数据全量 SFT + RL" },
    { num: "5", text: "T+24 起 office hours:每周 2h 答疑 + bug fix" }
  ];
  const oTop = dY + 0.45;
  const oH = (2.30 - 0.50) / onboard.length;
  onboard.forEach((o, i) => {
    const y = oTop + i * oH;
    s.addShape(pres.shapes.OVAL, {
      x: 8.20, y: y + 0.04, w: 0.30, h: 0.30,
      fill: { color: COLOR.warn }, line: { color: COLOR.warn, width: 0 }
    });
    s.addText(o.num, {
      x: 8.20, y: y + 0.04, w: 0.30, h: 0.30,
      color: "FFFFFF", bold: true, fontSize: 11, align: "center", valign: "middle", fontFace: FONT.zh
    });
    s.addText(o.text, {
      x: 8.55, y: y + 0.04, w: 4.30, h: 0.30,
      color: COLOR.ink, fontSize: 9.5, valign: "middle", fontFace: FONT.zh
    });
  });

  addRedConclusionBox(s, [
    { tag: "❶ R4 是新增最大风险",
      body: "Framework 移交不达标 = 项目失败,",
      bold: "T+12 起内部 dry-run 2 个 mock 客户场景,",
      warn: " 检验文档 + yaml + tutorial 是否真能让陌生人跑起来",
      tail: "" },
    { tag: "❷ 8 项交付物 ≠ 8 个 git commit",
      body: "代码 + 文档 + demo + 服务模板 ",
      bold: "都是 first-class deliverable,",
      warn: " 缺一项就视为框架未完成",
      tail: "" },
    { tag: "❸ 客户工作 < 5 步",
      body: "Onboarding 设计目标:",
      bold: "客户工程师 1 周内能跑通 demo,2 周内能改自家数据训出第一个版本,",
      warn: " 这是「我方多承担」的硬指标",
      tail: "" }
  ]);

  addSources(s, [
    { name: "Phase A→B 切换 SOP", tail: " (内部协议)" },
    { name: "verl + vLLM 集成", tail: " (开源文档)" },
    { name: "Framework 交付 best practice", tail: " (LLaMA-Factory / Axolotl 参考)" }
  ]);
}

// ============================================================
// 生成
// ============================================================
slide1(); slide2(); slide3(); slide4(); slide5(); slide6();
slide7(); slide8(); slide9(); slide10(); slide11(); slide12();

pres.writeFile({ fileName: "D:/work/omni_insight_deck/Omni_Understanding_Experiment_Plan_2026H2_v4.pptx" })
  .then(name => console.log("Generated:", name));
