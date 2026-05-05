# Omni Post-Training Insight (2026.05)

A high-density tech-insight deck and supporting thesis-tree analysis on **Omni post-training methods** as of 2026-05, anchored on three reference reports:

- **Nemotron 3 Nano Omni** (NVIDIA, 2026.04) — [arxiv 2604.24954](https://arxiv.org/abs/2604.24954)
- **LongCat-Next** (Meituan, 2026.03) — [arxiv 2603.27538](https://arxiv.org/abs/2603.27538)
- **Qwen3.5-Omni** (Alibaba, 2026.04) — [arxiv 2604.15804](https://arxiv.org/abs/2604.15804)

## Core thesis (L0)

> **By 2026-04, Thinker-Talker has converged as the dominant architectural pattern across open and closed SOTA omni models. The real split is no longer "modular vs native unified" — it is *Talker design*: Qwen3.5's independent-MoE Talker + multi-codebook RVQ + ARIA wins on both text fidelity (≤1 pt loss) and speech generation; LongCat's unified discrete tokenization trades 5.3 MMLU points for image+speech generation; Nemotron's modular-understanding-only path skips generation entirely. The choice is not architecture vs architecture — it is use-case vs use-case.**

## What's in this repo

```
.
├── deck.js                                    # pptxgenjs source (re-runnable)
├── Omni_PostTraining_Insight_2026.pptx        # 8-slide deck (built)
├── analysis/
│   └── thesis-tree.md                         # Full L0–L5 thesis-tree analysis
├── package.json
└── README.md
```

## Deck structure (8 slides)

| # | Topic | Layout |
|---|---|---|
| 1 | Three-camp landscape (table + quadrant) | A |
| 2 | Talker convergence (dark architecture topology) | B |
| 3 | Multi-stage RL era (process matrix) | C |
| 4 | Qwen3.5 recipe deep-dive: AuT / ARIA / OPD | E |
| 5 | LongCat text-tax: DiNA formula breakdown | D |
| 6 | Nemotron 7+5 stack: SFT + RL + NVFP4 | D |
| 7 | Open-source resources + benchmark checklist | A |
| 8 | Path-decision matrix (5 use cases × 6 dimensions) | A |

Each slide follows the white-paper-per-slide discipline:
- Title with anchor word + judgment + quantified consequence (≤36 chars)
- Main visual region (one of 6 prototypes A–F)
- Bottom red conclusion box (3 conclusions, each with vendor + number)
- Sources line with red-underlined institution names

## Reproducing the deck

```bash
npm install
node deck.js
# → Omni_PostTraining_Insight_2026.pptx
```

Requires Node ≥ 18.

## Key data points (from the three reports)

| Metric | Nemotron 3 Nano Omni | LongCat-Next | Qwen3.5-Omni |
|---|---|---|---|
| Backbone | 30B-A3B MoE | 68.5B-A3B MoE | hundreds of B (Hybrid-Attn MoE) |
| Architecture | Modular Thinker | Native unified discrete | Thinker + independent MoE Talker |
| Text loss vs base | ~1 pt (MMLU-Pro 77.3 vs 78.3) | ~5.3 pt (MMLU 83.95 vs 89.28) | ~0.9 pt (MMLU-Pro 85.9 vs 86.8) |
| RL stages | 5 (MPO → Text-RL₁ → Image-RL → Omni-RL → Text-RL₂) | not detailed | 3 (Thinker) + 4 (Talker) |
| RL algorithm | GSPO + MPO | DPO-style | GSPO + DPO + rule-based |
| Speech generation | none | unified discrete | independent Talker + multi-codebook RVQ + ARIA |
| Image generation | none | GenEval 84.44 (beats FLUX.1-dev) | none |
| Context length | 256K | not detailed | 256K |
| Open-source | full (weights + code + data) | full (weights + tokenizer) | API only |

## Industry invariants (true across all three)

1. **MoE A3B has become the default omni backbone** — dense base must be upcycled before omni post-training.
2. **Multi-stage progressive training, not joint training** — modality-by-modality addition is universal.
3. **GSPO + modality-segmented RL is the new SOTA recipe** — DPO standalone is no longer at the frontier.
4. **Text-regression testing is the omni training "EKG"** — any stage that drops MMLU-Pro by >2 pt requires rollback or a Text-RL repair stage.

## License & attribution

Analysis and deck content are derivative summaries of public technical reports. Original papers belong to their respective authors (NVIDIA / Meituan / Alibaba). Refer to each report for primary citation.
