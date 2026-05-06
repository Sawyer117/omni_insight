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
├── deck.js                                              # Insight deck source (pptxgenjs)
├── Omni_PostTraining_Insight_2026.pptx                  # 8-slide market-insight deck
├── experiment_plan.js                                   # Internal experiment plan v3 source
├── Omni_Understanding_Experiment_Plan_2026H2.pptx       # v1 (8 slides, generic)
├── Omni_Understanding_Experiment_Plan_2026H2_v2.pptx    # v2 (10 slides, Qwen3.5-4B proxy)
├── Omni_Understanding_Experiment_Plan_2026H2_v3.pptx    # v3 (11 slides, with ablation) ★
├── analysis/
│   └── thesis-tree.md                                   # Full L0–L5 thesis-tree analysis
├── package.json
└── README.md
```

## Two decks, two audiences

### Deck 1 — Market insight (`Omni_PostTraining_Insight_2026.pptx`)
External-facing white-paper-style analysis of where the omni post-training field stands as of 2026-05. Reads as a CTO briefing.

### Deck 2 — Internal experiment plan v1 (`Omni_Understanding_Experiment_Plan_2026H2.pptx`)
First draft of an experiment plan for omni understanding post-training. Superseded by v2 — kept for diff comparison.

### Deck 3 — Internal experiment plan v2 (`Omni_Understanding_Experiment_Plan_2026H2_v2.pptx`)
First "Qwen3.5-4B proxy + 10B-A2B target" version. Superseded by v3 — kept for diff.

### Deck 4 — Internal experiment plan v3 (`Omni_Understanding_Experiment_Plan_2026H2_v3.pptx`) ★ current
**11 slides.** Two corrections from v2 based on team review:

1. **Method ablation matrix added (Slide 3, NEW)** — v2 had a logical hole: ruling out LongCat / Qwen3.5 *as paths* doesn't mean their *methods* are unusable. v3 adds a 9-row × 6-column ablation matrix that systematically catalogues which methods to take (P1 priority), which to ablate (P2/P3), and which to genuinely skip:
   - **P1 (high ROI)**: Qwen3.5 Specialist Distillation (5-teacher full version) — explains why Qwen3.5's text loss is only 0.9 pt
   - **P1 (main line)**: Qwen3.5 OPD audio-text pairing — already in Stage 4
   - **P2 (medium ROI)**: LongCat Cluster-based Rebalancing + Modality-Agnostic MoE routing — directly applicable to 10B-A2B
   - **P3 (incremental)**: LongCat random-delay audio-text training, Qwen3.5 multilingual ratio
   - **Skip**: AuT (40M-hr data unreachable), ARIA/Talker/Code2Wav/dNaViT (no generation), Hybrid Attn+GDN (architecture-layer decision by pretraining team)

2. **Tokenizer operations rewritten (Slide 6)** — v2 was right about *what* but vague on *how*. v3 spells out the 5-step operational flow:
   - Step 1: `tokenizer.add_special_tokens(...)` — skip Qwen3.5 already-existing ChatML tokens, only add ~15-18 truly new ones
   - Step 2: `model.resize_token_embeddings(len(tokenizer), pad_to_multiple_of=256)` — pad to 256 multiple for GPU performance
   - Step 3: Initialize new token embeddings as mean of semantically-related text tokens (fallback: σ=0.02 random)
   - Step 4: At Stage 0, freeze LLM but unfreeze [Vision-Proj + the 25 new embedding rows] — protect already-learned semantics
   - Step 5: Data preprocessing inserts `<|vision_start|> + N×<|image_pad|> + <|vision_end|>` into text streams

## Insight deck structure (8 slides)

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

## Experiment plan v3 deck structure (11 slides)

| # | Topic | Layout |
|---|---|---|
| 1 | Background + constraints (Qwen3.5-4B proxy, 10B-A2B target, HF/FSDP/verl/vLLM) | A |
| 2 | Path selection rationale — engineering line vs method line distinction | A |
| 3 | **★ Method ablation matrix** — 9 methods × P1/P2/P3 priority, ROI, eval points | A |
| 4 | Two-phase roadmap with ablation lanes | swimlane |
| 5 | Phase A deliverable — working omni proxy + Specialist pre-training kicked off | C |
| 6 | **Tokenizer 5-step operational flow + 3 switching cases** | D |
| 7 | SFT recipe rescaled — ~200B token derivation for 10B-A2B | D |
| 8 | Data plan — 200B token budget by modality | A |
| 9 | RL stack — verl + FSDP + vLLM, 3 stages, GSPO with GRPO fallback | C |
| 10 | Evaluation red lines — 3 phase-gates × 8 dimensions + ablation tracking | A |
| 11 | Risks + ckpt swap SOP — 5 risks, 3 gates, Day-1 swap protocol | A |

### Key plan parameters

- **Proxy base** (Phase A): Qwen3.5-4B-base (dense), to validate the full pipeline before real ckpt arrives
- **Real ckpt** (Phase B): MoE ~10B-A2B (new architecture, in-house pretraining)
- **Token budget**: ~200B (vs Nemotron 466.9B, scaled by active-params ratio + stage skip)
- **Timeline**: 12 weeks Phase A + 18 weeks Phase B = 30 weeks total
- **Stack**: HF transformers + FSDP2 + verl + vLLM + VLMEvalKit (no Megatron, no NeMo-RL)
- **Tokenizer**: reuse Qwen3.5-4B vocab + 25 special tokens; Phase A→B switch protocol covers 3 compatibility cases
- **Skipped stages** (with rationale): Stage 6 256K, Text-RL S1, Omni-RL, Audio-RL
- **Hard red line**: MMLU-Pro drop ≤ 2 pt vs base; if exceeded, immediate rollback or Text-RL S2 repair

## Reproducing the decks

```bash
npm install
node deck.js              # → Omni_PostTraining_Insight_2026.pptx
node experiment_plan.js   # → Omni_Understanding_Experiment_Plan_2026H2_v3.pptx
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
