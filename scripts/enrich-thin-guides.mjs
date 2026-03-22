import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const dirs = [
  { dir: path.join(ROOT, 'src/content/docs'), lang: 'en' },
  { dir: path.join(ROOT, 'src/content/zhdocs'), lang: 'zh' },
];

function splitFrontmatter(source) {
  const m = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  return {
    frontmatter: m[0].trimEnd(),
    body: source.slice(m[0].length).trim(),
  };
}

function profileFor(slug) {
  if (slug.includes('sop') || slug.includes('operations')) return 'operations';
  if (slug.includes('marketing') || slug.includes('content-engine')) return 'marketing';
  if (slug.includes('support') || slug.includes('escalation')) return 'support';
  if (slug.includes('roi') || slug.includes('dashboard')) return 'roi';
  if (slug.includes('agent')) return 'agents';
  if (slug.includes('privacy')) return 'privacy';
  if (slug.includes('rag')) return 'rag';
  if (slug.includes('90-day') || slug.includes('roadmap')) return 'roadmap';
  if (slug.includes('prompt')) return 'prompt';
  if (slug.includes('meeting')) return 'meeting';
  if (slug.includes('scorecard') || slug.includes('model-selection')) return 'tooling';
  if (slug.includes('literacy')) return 'literacy';
  if (slug.includes('25-high-roi')) return 'workflow-portfolio';
  return 'general';
}

const enBlocks = {
  operations: `## Executive implementation plan (next 30 days)

- Week 1: nominate one process owner per SOP family and lock one source of truth for versions.
- Week 2: run one controlled SOP update sprint on a high-volume process and measure review cycle time.
- Week 3: enforce approval metadata (owner, approver, effective date, rollback contact) before publication.
- Week 4: review defect tickets linked to SOP ambiguity and decide where guardrails need to be tightened.

## Failure modes to avoid

- Publishing AI-generated SOP drafts without owner sign-off.
- Updating templates without updating exception paths and escalation points.
- Measuring output volume but ignoring downstream rework caused by unclear instructions.
`,
  marketing: `## Executive implementation plan (next 30 days)

- Lock one campaign family as the pilot and define conversion, speed, and compliance as the three success metrics.
- Require every AI draft to include audience, claim source, and channel objective before review.
- Establish a two-step review gate: brand voice check first, legal/policy check second.
- Run a Friday performance retro to retire low-performing prompts and keep only reusable assets.

## Failure modes to avoid

- Treating content volume as success while brand consistency declines.
- Running AI drafts without claim verification for numbers, benchmarks, or product statements.
- Scaling channels before the team has a shared QA rubric.
`,
  support: `## Executive implementation plan (next 30 days)

- Define three risk tiers for tickets and connect each tier to approval and escalation rules.
- Build one standard response library for top recurring intents before enabling AI drafting at scale.
- Track false-assurance responses separately from normal QA misses and review them weekly.
- Require support leads to review 20 random outputs per week and publish corrective actions.

## Failure modes to avoid

- Letting AI handle sensitive cases without identity/context verification.
- Measuring only response speed while customer trust metrics decline.
- Treating escalation as failure instead of a safety control.
`,
  roi: `## Executive implementation plan (next 30 days)

- Pick three decision-level metrics (quality, cycle time, rework) before adding productivity metrics.
- Set baseline values from the prior four weeks and freeze metric definitions for one quarter.
- Add one monthly executive review that decides scale, pause, or redesign by workflow.
- Require each workflow owner to submit one-page evidence logs, not narrative-only updates.

## Failure modes to avoid

- Reporting activity metrics without tying them to management decisions.
- Changing metric definitions every month and losing comparability.
- Declaring ROI before quality thresholds are stable.
`,
  agents: `## Executive implementation plan (next 30 days)

- Restrict agent permissions to one bounded workflow with clear stop conditions.
- Require full action logs for every tool call, handoff, and exception event.
- Add a human checkpoint before any external communication or irreversible action.
- Review all failures weekly and classify whether the root cause is policy, prompt, or process design.

## Failure modes to avoid

- Granting broad system access before workflow-level controls are proven.
- Confusing autonomous execution with strategic productivity gains.
- Scaling agent usage without incident taxonomy and rollback rules.
`,
  privacy: `## Executive implementation plan (next 30 days)

- Map restricted data classes to explicit "allowed / prohibited" input rules per workflow.
- Enforce tool-level controls so unapproved models cannot receive sensitive inputs.
- Create a monthly privacy sampling routine with named reviewers and documented findings.
- Require an exception log with closure dates for every policy breach or near miss.

## Failure modes to avoid

- Publishing policy statements without translating them into workflow controls.
- Assuming users can self-police sensitive data handling at scale.
- Treating audits as compliance theater rather than decision inputs.
`,
  rag: `## Executive implementation plan (next 30 days)

- Select one knowledge domain with high repeat demand and curate trusted source documents.
- Define document owners and freshness cadence before connecting retrieval to workflows.
- Require citation visibility in every generated answer used for business decisions.
- Track answer accuracy and "no source / weak source" rates during weekly quality review.

## Failure modes to avoid

- Loading uncurated documents and assuming retrieval quality will self-correct.
- Allowing uncited outputs into customer or policy-facing communication.
- Ignoring source freshness while measuring only response speed.
`,
  roadmap: `## Executive implementation plan (next 90 days)

- Days 1-15: lock pilot scope, owner map, and risk boundaries for each workflow.
- Days 16-45: run two controlled pilots with weekly evidence logs and executive checkpoints.
- Days 46-75: expand only workflows that hit quality and governance thresholds.
- Days 76-90: formalize operating cadence, ownership model, and scale criteria for next quarter.

## Failure modes to avoid

- Launching too many pilots without a common decision framework.
- Scaling teams before quality controls are operationally stable.
- Treating roadmap milestones as delivery events instead of management decisions.
`,
  prompt: `## Executive implementation plan (next 30 days)

- Standardize prompt templates for the top three recurring workflows per function.
- Require every prompt to specify objective, boundary conditions, and output format.
- Record failure examples weekly and update templates based on observed defects.
- Publish a versioned prompt library with owners and change history.

## Failure modes to avoid

- Optimizing prompts for style while ignoring factual reliability.
- Allowing team-level prompt drift without governance.
- Updating prompts without measuring downstream quality impact.
`,
  meeting: `## Executive implementation plan (next 30 days)

- Require one pre-read packet per meeting: signal summary, decision options, risk notes.
- Cap each meeting to three high-impact decisions with explicit owner assignment.
- Add a post-meeting action board with due dates and status checkpoints.
- Review override decisions weekly to improve judgment quality over time.

## Failure modes to avoid

- Turning AI summaries into agenda noise instead of decision input.
- Ending meetings without owner-level accountability and deadlines.
- Accepting AI recommendations without risk and dependency review.
`,
  tooling: `## Executive implementation plan (next 30 days)

- Evaluate tools on the same scorecard across security, workflow fit, reliability, and cost.
- Require two-week pilot evidence before procurement or enterprise rollout.
- Publish non-negotiable red lines (data handling, auditability, vendor controls).
- Re-score approved tools quarterly using production data, not vendor claims.

## Failure modes to avoid

- Selecting tools from demos without workflow-level validation.
- Overweighting features and underweighting governance and adoption risk.
- Locking contracts before teams prove measurable business fit.
`,
  literacy: `## Executive implementation plan (next 30 days)

- Run one leadership literacy baseline survey across strategy, operations, and risk owners.
- Convert literacy gaps into role-based learning priorities tied to active workflows.
- Add a monthly leadership session focused on real decisions, not generic AI news.
- Track whether literacy improvements translate into better governance and decision speed.

## Failure modes to avoid

- Treating literacy as one-off training instead of an operating capability.
- Measuring completion rates but not decision quality improvements.
- Leaving executives out of the learning loop while expecting cross-functional alignment.
`,
  'workflow-portfolio': `## Executive implementation plan (next 30 days)

- Rank candidate workflows by frequency, decision criticality, and quality measurability.
- Start with 3-5 workflows that can show impact within one quarter.
- Assign workflow owners and publish baseline metrics before launch.
- Review portfolio performance monthly and retire low-value use cases quickly.

## Failure modes to avoid

- Launching too many workflows without management ownership.
- Prioritizing novelty use cases over operational bottlenecks.
- Scaling workflows that improve speed but degrade output quality.
`,
  general: `## Executive implementation plan (next 30 days)

- Define one pilot scope, one owner, and one measurable outcome before execution.
- Add weekly review cadence with quality and governance checkpoints.
- Keep evidence logs for decisions, exceptions, and remediation steps.

## Failure modes to avoid

- Expanding usage before controls and ownership are stable.
- Measuring activity without linking outputs to management outcomes.
- Ignoring recurring defects instead of fixing workflow design.
`,
};

const zhBlocks = {
  operations: `## 管理层执行计划（未来30天）

- 第1周：按SOP族群明确流程负责人，并统一版本源。
- 第2周：在一个高频流程上做受控修订试点，记录审批周期变化。
- 第3周：发布前强制补齐元数据（负责人、审批人、生效日、回滚联系人）。
- 第4周：复盘由SOP歧义引发的返工工单，决定下一轮治理重点。

## 需避免的失败模式

- 未经负责人签字直接发布AI草稿。
- 模板更新了，但异常处理与升级路径未同步更新。
- 只看产出数量，不看下游返工与执行偏差。
`,
  marketing: `## 管理层执行计划（未来30天）

- 先选一个活动类型做试点，并锁定“转化、速度、合规”三项核心指标。
- 要求每份AI草稿必须包含受众、依据来源、渠道目标。
- 建立两级审核：先品牌一致性，再法律/合规审查。
- 每周固定复盘，淘汰低效提示词，保留可复用资产。

## 需避免的失败模式

- 把内容产量当成功，忽视品牌一致性下滑。
- 对数字、对外表述不做事实核验。
- 在团队没有统一质检标准前就扩大渠道规模。
`,
  support: `## 管理层执行计划（未来30天）

- 按风险等级定义工单分层，并绑定审核与升级规则。
- 先建立高频问题标准回复库，再扩大AI草拟范围。
- 将“看似合理但实则错误”的回复单独统计并周复盘。
- 每周随机抽检至少20条输出，形成纠偏动作清单。

## 需避免的失败模式

- 在身份/上下文未确认时让AI处理敏感案例。
- 只追求响应速度，忽视信任和二次追问率。
- 把升级当失败，而不是当安全机制。
`,
  roi: `## 管理层执行计划（未来30天）

- 先锁定三类决策级指标：质量、周期、返工，再补充效率指标。
- 以过去4周作为基线，并冻结口径至少一个季度。
- 设立月度管理层复盘会，明确每个流程“扩展/暂停/重做”结论。
- 要求流程负责人提交一页证据卡，而不是口头汇报。

## 需避免的失败模式

- 只报活动数据，不连接管理决策结果。
- 指标口径频繁变化，导致趋势不可比。
- 在质量门槛未稳定前就宣布ROI成功。
`,
  agents: `## 管理层执行计划（未来30天）

- 将智能体权限限制在单一、边界清晰的流程内。
- 对每一次工具调用、交接、异常都保留日志。
- 对外部沟通或不可逆动作设置人工确认关口。
- 每周复盘失败样本，区分策略问题、提示词问题和流程问题。

## 需避免的失败模式

- 在流程控制未验证前开放广泛系统权限。
- 把“自动执行”误当成“战略价值”本身。
- 没有事故分级和回滚规则就扩展规模。
`,
  privacy: `## 管理层执行计划（未来30天）

- 把受限数据分类映射到每个流程的“允许/禁止输入”规则。
- 用工具级控制确保未批准模型无法接触敏感数据。
- 建立月度隐私抽检制度，明确抽检人和留痕要求。
- 每次违规或险情都进入异常日志并设关闭期限。

## 需避免的失败模式

- 只有政策口号，没有流程控制。
- 假设员工能在高压场景下自行把控敏感输入。
- 把审计当形式动作，而非决策依据。
`,
  rag: `## 管理层执行计划（未来30天）

- 先选择一个高频知识域，建立可信资料池。
- 在接入检索前明确文档负责人和更新频率。
- 业务输出必须显示引用来源，缺引用不进入决策链。
- 每周跟踪准确率与“弱引用/无引用”比例。

## 需避免的失败模式

- 资料未清洗就直接接入检索。
- 无引用内容进入客户或政策相关场景。
- 只看速度，不看来源新鲜度与可追溯性。
`,
  roadmap: `## 管理层执行计划（未来90天）

- 第1-15天：锁定试点边界、负责人、风险边界。
- 第16-45天：运行两条受控流程，按周提交证据日志。
- 第46-75天：仅扩展达到质量和治理门槛的流程。
- 第76-90天：固化节奏、责任模型和下一季度扩展标准。

## 需避免的失败模式

- 试点过多，缺少统一决策框架。
- 质量控制未稳定就扩展团队规模。
- 把里程碑当交付动作，而不是管理决策节点。
`,
  prompt: `## 管理层执行计划（未来30天）

- 为每个职能的前三个高频任务统一提示词模板。
- 每个模板必须明确目标、边界、输出格式。
- 每周收集失败样本，基于缺陷更新模板版本。
- 建立带负责人和变更记录的模板库。

## 需避免的失败模式

- 只优化文风，不优化事实可靠性。
- 团队模板各自为政，缺少治理。
- 更新模板却不验证对质量的真实影响。
`,
  meeting: `## 管理层执行计划（未来30天）

- 每次会议前固定一份预读包：信号摘要、决策选项、风险备注。
- 每次会议最多处理三个高影响决策，并明确负责人。
- 会议后发布行动看板，写清截止时间和检查点。
- 每周复盘接管决策，持续提升判断质量。

## 需避免的失败模式

- 让AI摘要变成信息噪音，而非决策输入。
- 会议结束没有负责人和时间承诺。
- 对AI建议不做风险与依赖审查直接采纳。
`,
  tooling: `## 管理层执行计划（未来30天）

- 所有工具都用同一评分卡比较：安全、适配、稳定、成本。
- 采购前必须完成两周试点并提交证据。
- 先公布不可妥协红线（数据处理、可审计性、供应商控制）。
- 已上线工具按季度复评分，依据生产数据而非厂商材料。

## 需避免的失败模式

- 只看演示效果，不做流程级验证。
- 过度看功能，低估治理与采用风险。
- 在业务适配未证实前锁定长期合同。
`,
  literacy: `## 管理层执行计划（未来30天）

- 先做一次管理层AI理解力基线评估，覆盖战略、运营、风险负责人。
- 把能力缺口转化为角色化学习清单，并绑定在岗流程。
- 设立月度管理层学习会，围绕真实决策案例，不做空泛科普。
- 追踪“理解力提升”是否转化为治理质量和决策速度改善。

## 需避免的失败模式

- 把理解力建设当一次性培训。
- 只看课程完成率，不看决策质量提升。
- 让高层脱离学习过程，却要求组织一致推进。
`,
  'workflow-portfolio': `## 管理层执行计划（未来30天）

- 按频次、决策影响、可衡量性给候选流程排序。
- 先启动3-5个季度内可见效果的流程。
- 上线前明确流程负责人，并冻结基线指标。
- 每月复盘流程组合，快速下线低价值场景。

## 需避免的失败模式

- 场景铺得太多，责任不清。
- 优先做“看起来新”的场景，忽视真实瓶颈。
- 速度有提升但质量下降仍继续扩展。
`,
  general: `## 管理层执行计划（未来30天）

- 先明确一个试点范围、一个负责人、一个可衡量目标。
- 建立周复盘节奏，把质量和治理作为硬门槛。
- 对决策、异常和修复动作全程留痕。

## 需避免的失败模式

- 控制未稳就扩展。
- 只看活动量，不看管理结果。
- 对重复缺陷不做流程级修复。
`,
};

function buildAppendix(slug, lang) {
  const profile = profileFor(slug);
  return lang === 'zh' ? zhBlocks[profile] || zhBlocks.general : enBlocks[profile] || enBlocks.general;
}

function hasAppendix(body, lang) {
  return lang === 'zh'
    ? body.includes('## 管理层执行计划（未来30天）') || body.includes('## 管理层执行计划（未来90天）')
    : body.includes('## Executive implementation plan (next 30 days)') ||
        body.includes('## Executive implementation plan (next 90 days)');
}

let changed = 0;
for (const { dir, lang } of dirs) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  for (const fileName of files) {
    if (fileName.startsWith('weekly-ai-leadership-brief-')) continue;
    const slug = fileName.replace(/\.md$/, '');
    const file = path.join(dir, `${slug}.md`);
    if (!fs.existsSync(file)) continue;
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = splitFrontmatter(raw);
    if (!parsed) continue;
    if (hasAppendix(parsed.body, lang)) continue;
    const appendix = buildAppendix(slug, lang);
    const next = `${parsed.frontmatter}\n\n${parsed.body}\n\n${appendix}\n`;
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(`enriched: ${path.relative(ROOT, file)}`);
  }
}

console.log(`\nDone. Updated ${changed} files.`);
