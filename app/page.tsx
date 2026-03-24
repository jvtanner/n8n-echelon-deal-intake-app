'use client';

import { useState, FormEvent } from 'react';

const PRODUCTS = [
  { id: 'feasibility', label: 'Feasibility Assessment', price: '$999' },
  { id: 'culturePpt', label: 'Culture Deck (PPT)', price: '$399' },
  { id: 'culture doc', label: 'Culture Document', price: '$99' },
] as const;

type ProductId = (typeof PRODUCTS)[number]['id'];

const DEAL_STAGES = ['Pre-LOI', 'Pre-sign', 'Pre-completion', 'Post-completion'] as const;

interface Question {
  key: string;
  label: string;
  description: string;
  priority: 'mandatory' | 'recommended' | 'conditional';
  guidance: string;
}

const QUESTIONS: Question[] = [
  {
    key: 'Q1: Integration end state',
    label: 'Q1 — Integration End State',
    description: 'Describe the intended end state of the combined organisation post-integration (standalone, selective integration, full absorption, or transformational). Does achieving this end state require changes to the acquirer\'s own organisation?',
    priority: 'mandatory',
    guidance: 'Please indicate which end state best describes the acquirer\'s integration intention for the target post-close:\n\n• Standalone: Target continues to operate independently with minimal change\n• Selective integration: Specific functions or systems are integrated (e.g. finance, IT) while the target retains its own brand, customer-facing operations, or identity\n• Full absorption: Target is fully absorbed into the acquirer\'s operating model, systems, and brand\n• Transformational: Both organisations change significantly\n\nIf the end state is not yet confirmed, please note the options under consideration and any constraints or preferences driving the decision.\n\nAlso note if achieving this end state requires the acquirer to change its own operations — e.g. restructuring teams, building new capabilities, changing products or go-to-market approach, or making organisational design decisions before integration planning can begin.',
  },
  {
    key: 'Q2: Operational control level',
    label: 'Q2 — Operational Control Level',
    description: 'How much operational control does the acquirer intend to take over the target? Consider management retention, governance, reporting lines, and decision-making authority.',
    priority: 'mandatory',
    guidance: 'This is about how much the acquirer intends to direct or change how the target operates day-to-day. Please consider:\n\n• Intent on management team retention\n• Will the target retain its own management team and decision-making authority?\n• Will the acquirer impose its own policies, governance, reporting lines, or approval processes?\n• Are there specific areas where the acquirer requires control (e.g. financial reporting, compliance, procurement) and others where the target retains autonomy?\n\nA short description of the intended operating relationship is sufficient.',
  },
  {
    key: 'Q3: Transaction structure',
    label: 'Q3 — Transaction Structure',
    description: 'Confirm the anticipated deal structure (share purchase, asset deal, carve-out, NewCo/JV) and any shared infrastructure with the seller.',
    priority: 'mandatory',
    guidance: 'Please confirm the anticipated deal structure:\n\n• Share purchase\n• Asset deal\n• Carve-out\n• NewCo / JV formation\n\nIf this is a carve-out or asset deal, please also note whether the target currently shares infrastructure, systems, or services with the seller (e.g. shared IT, shared finance team, shared office space). Note if entanglements between buyer and seller are not known.',
  },
  {
    key: 'Q4: Integration timeline',
    label: 'Q4 — Integration Timeline',
    description: 'What is the expected integration timeline? Note any target dates for milestones and whether deadlines are hard or flexible.',
    priority: 'mandatory',
    guidance: 'Please indicate the acquirer\'s expectation for the pace of integration:\n\n• Is there a target date for key milestones (e.g. Day 1 readiness, systems migration, synergy realisation)?\n• Is the timeline driven by external factors (e.g. regulatory deadlines, fund lifecycle, contract renewal dates)?\n• Is there flexibility on timing, or are any of these a hard deadline?\n\nEven a rough indication is helpful (e.g. "full integration within 12 months" or "phased over 2 years, finance first").',
  },
  {
    key: 'Q5: Synergy targets',
    label: 'Q5 — Synergy Targets',
    description: 'What are the expected synergy targets (revenue, cost, or both)? If synergies are not a primary driver, note the investment rationale.',
    priority: 'mandatory',
    guidance: 'Please provide any available information on the synergy case, even if still indicative:\n\n• Revenue synergies: Are there cross-sell, up-sell, or market access assumptions? If so, what is the estimated value or % of target revenue?\n• Cost synergies: Are there expected savings from headcount reduction, procurement consolidation, property rationalisation, or systems consolidation? If so, what is the estimated value or % of target cost base?\n• If a formal synergy model exists, a summary or extract is helpful. If not, even a directional indication is useful.\n\nIf synergies are not a primary driver of the deal, please note what is driving the investment rationale instead.',
  },
  {
    key: 'Q6: Value drivers',
    label: 'Q6 — Value Drivers',
    description: 'What are the specific value drivers in this target? Note how dependent each is on specific people, systems, or relationships.',
    priority: 'recommended',
    guidance: 'Please identify what the acquirer considers to be the primary sources of value in the target:\n\n• Brand or reputation\n• Key individuals or specialist teams\n• Client relationships (and whether they are personal or contractual)\n• Proprietary technology, IP, or data assets\n• Market position or regulatory licences\n• Physical assets or infrastructure\n\nWhere possible, note how dependent each value driver is on specific people, systems, or relationships.',
  },
  {
    key: 'Q7: Dedicated integration resources',
    label: 'Q7 — Dedicated Integration Resources',
    description: 'Does the acquirer have dedicated integration resources? Describe the team, prior experience, and budget for external support.',
    priority: 'recommended',
    guidance: 'Please describe the acquirer\'s capacity to manage the integration:\n\n• Is there a dedicated integration team, PMO, or named integration lead?\n• Will integration be managed alongside existing responsibilities (i.e. "day job plus integration") or will dedicated resource be provided?\n• Has the acquirer run integrations before? If so, how many and how recently?\n• Is there budget allocated for external integration support?\n\nThis is not a judgement on readiness. It helps calibrate the feasibility assessment.',
  },
  {
    key: 'Q8: Concurrent integrations/change',
    label: 'Q8 — Concurrent Integrations / Change',
    description: 'Is the acquirer currently running other integrations or major change programmes that may compete for resources?',
    priority: 'recommended',
    guidance: 'Please note any concurrent activity that may compete for leadership attention or resources:\n\n• Other recent or in-flight acquisitions\n• Major system implementations (e.g. ERP, CRM)\n• Restructuring, cost reduction, or transformation programmes\n• Significant hiring or expansion activity\n\nA brief description is sufficient.',
  },
  {
    key: 'Q9: Carve-out functions/TSAs',
    label: 'Q9 — Carve-Out Functions / TSAs',
    description: 'What functions or services sit outside the transaction perimeter, and what transitional support is expected from the seller?',
    priority: 'conditional',
    guidance: 'This question only applies if the transaction is a carve-out or asset deal (see Q3). Please describe:\n\n• Which functions, systems, or services does the target currently rely on from the seller/parent? (e.g. shared IT, HR, finance, procurement, office space, contracts)\n• Are Transitional Service Agreements (TSAs) anticipated? If so, for which services and for how long?\n• What is the seller\'s likely willingness and capability to provide transitional support?\n• Are there any shared contracts, licences, or assets that need to be separated or duplicated?\n\nIf the deal is not a carve-out, this question can be skipped.',
  },
];

interface FormState {
  dealName: string;
  acquirerName: string;
  targetName: string;
  email: string;
  dealStage: string;
  answers: Record<string, string>;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function Page() {
  const [form, setForm] = useState<FormState>({
    dealName: '',
    acquirerName: '',
    targetName: '',
    email: '',
    dealStage: '',
    answers: Object.fromEntries(QUESTIONS.map((q) => [q.key, ''])),
  });
  const [selectedProducts, setSelectedProducts] = useState<Set<ProductId>>(new Set());
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedGuidance, setExpandedGuidance] = useState<Set<string>>(new Set());

  function toggleGuidance(key: string) {
    setExpandedGuidance((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleProduct(id: ProductId) {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function setField(field: keyof Omit<FormState, 'answers'>, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setAnswer(key: string, value: string) {
    setForm((prev) => ({ ...prev, answers: { ...prev.answers, [key]: value } }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (selectedProducts.size === 0) {
      setErrorMsg('Please select at least one product.');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const payload: Record<string, string> = {
      'Deal Name': form.dealName,
      'Acquirer Name': form.acquirerName,
      'Target Name': form.targetName,
      'Email': form.email,
      'Deal Stage': form.dealStage,
      'Products requested': Array.from(selectedProducts).join(','),
      ...form.answers,
    };

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Submission failed (${res.status})`);
      }

      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-light text-[#e8e6e0] tracking-wide">Deal Submitted</h2>
            <p className="text-[#e8e6e0] leading-relaxed">
              Your deal has been submitted. You&apos;ll receive a notification when the analysis is ready.
            </p>
          </div>
          <div className="pt-2">
            <div className="h-px bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent" />
          </div>
          <p className="text-xs text-[#9a9aaa] uppercase tracking-widest">Echelon M&A Integration Advisory</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a]">
      {/* Header */}
      <header className="border-b border-[#1e2438] px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#c9a84c] rounded-full" />
            <span className="text-sm font-medium tracking-[0.2em] uppercase text-[#e8e6e0]">Echelon</span>
          </div>
          <span className="text-xs text-[#9a9aaa] tracking-widest uppercase">Deal Intake</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 pb-24">
        {/* Intro */}
        <div className="mb-12 space-y-3">
          <h1 className="text-3xl font-light text-[#e8e6e0] tracking-wide">
            Integration Assessment
          </h1>
          <p className="text-[#e8e6e0] leading-relaxed text-base max-w-xl">
            Complete the questionnaire below to initiate your deal analysis. Detailed responses enable a more precise assessment of integration complexity, cultural alignment, and delivery risk. Questions marked as mandatory are required to run the assessment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* Section 1 — Deal Information */}
          <section className="space-y-6">
            <SectionLabel>Deal Information</SectionLabel>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Deal Name" required>
                <input
                  type="text"
                  required
                  placeholder="Project Falcon"
                  value={form.dealName}
                  onChange={(e) => setField('dealName', e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Email" required>
                <input
                  type="email"
                  required
                  placeholder="you@firm.com"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Acquirer Name" required>
                <input
                  type="text"
                  required
                  placeholder="Acquirer entity"
                  value={form.acquirerName}
                  onChange={(e) => setField('acquirerName', e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Target Name" required>
                <input
                  type="text"
                  required
                  placeholder="Target entity"
                  value={form.targetName}
                  onChange={(e) => setField('targetName', e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Deal Cycle Stage" required>
                <select
                  required
                  value={form.dealStage}
                  onChange={(e) => setField('dealStage', e.target.value)}
                  className={`${inputClass} ${!form.dealStage ? 'text-[#3a3a52]' : ''}`}
                >
                  <option value="" disabled>Select stage...</option>
                  {DEAL_STAGES.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-[#1e2438]" />

          {/* Section 2 — Products */}
          <section className="space-y-6">
            <div className="space-y-1">
              <SectionLabel>Products Requested</SectionLabel>
              <p className="text-base text-[#e8e6e0]">Select all deliverables required for this engagement.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {PRODUCTS.map((p) => {
                const active = selectedProducts.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className={`px-4 py-2.5 rounded text-sm font-medium transition-all duration-150 border ${
                      active
                        ? 'bg-[#c9a84c]/15 border-[#c9a84c]/60 text-[#c9a84c]'
                        : 'bg-[#111625] border-[#1e2438] text-[#9a9aaa] hover:border-[#2e3858] hover:text-[#e8e6e0]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors ${
                        active ? 'border-[#c9a84c] bg-[#c9a84c]/20' : 'border-[#2e3858]'
                      }`}>
                        {active && (
                          <svg className="w-2 h-2 text-[#c9a84c]" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        )}
                      </span>
                      <span className="flex flex-col items-start gap-0.5">
                        <span>{p.label}</span>
                        <span className={`text-xs font-normal ${active ? 'text-[#c9a84c]/70' : 'text-[#7a7a8a]'}`}>{p.price}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-[#1e2438]" />

          {/* Section 3 — Integration Questions */}
          <section className="space-y-8">
            <div className="space-y-1">
              <SectionLabel>Integration Assessment</SectionLabel>
              <p className="text-base text-[#e8e6e0]">Answer each question with as much detail as available. These responses directly inform the quality of the analysis.</p>
            </div>

            <div className="space-y-8">
              {QUESTIONS.map((q) => {
                const isMandatory = q.priority === 'mandatory';
                const isGuidanceOpen = expandedGuidance.has(q.key);
                return (
                  <div key={q.key} className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <label className="block text-base text-[#ffffff]">
                        {q.label}
                        {isMandatory && <span className="text-[#c9a84c] ml-0.5"> *</span>}
                        <PriorityBadge priority={q.priority} />
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleGuidance(q.key)}
                        className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border border-[#2e3858] flex items-center justify-center text-[#9a9aaa] hover:border-[#c9a84c]/50 hover:text-[#c9a84c] transition-colors"
                        title="View guidance notes"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-base text-[#e8e6e0] leading-relaxed">{q.description}</p>
                    {isGuidanceOpen && (
                      <div className="rounded border border-[#1e2438] bg-[#0d1220] px-4 py-3 text-sm text-[#c8c8d4] leading-relaxed whitespace-pre-line">
                        {q.guidance}
                      </div>
                    )}
                    <textarea
                      required={isMandatory}
                      rows={4}
                      value={form.answers[q.key]}
                      onChange={(e) => setAnswer(q.key, e.target.value)}
                      className={`${inputClass} resize-none leading-relaxed`}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Submit */}
          <div className="pt-2 space-y-4">
            {errorMsg && (
              <div className="rounded border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <p className="text-base text-[#e8e6e0]">
                All fields marked with * are required.
              </p>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex items-center gap-2.5 px-7 py-3 rounded bg-[#c9a84c] text-[#0b0f1a] text-sm font-semibold tracking-wide hover:bg-[#d4b45e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'submitting' && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {status === 'submitting' ? 'Submitting\u2026' : 'Submit Deal'}
              </button>
            </div>
          </div>

        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2438] px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-[#6a6a7a] text-center tracking-widest uppercase">Echelon M&A Integration Advisory &middot; Confidential</p>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a84c]">
      {children}
    </p>
  );
}

function PriorityBadge({ priority }: { priority: 'mandatory' | 'recommended' | 'conditional' }) {
  const styles = {
    mandatory: 'border-[#c9a84c]/40 text-[#c9a84c] bg-[#c9a84c]/10',
    recommended: 'border-[#4a8ac9]/40 text-[#4a8ac9] bg-[#4a8ac9]/10',
    conditional: 'border-[#7a7a8a]/40 text-[#7a7a8a] bg-[#7a7a8a]/10',
  };
  const labels = {
    mandatory: 'MANDATORY',
    recommended: 'RECOMMENDED',
    conditional: 'CONDITIONAL',
  };
  return (
    <span className={`ml-2 inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border ${styles[priority]}`}>
      {labels[priority]}
    </span>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-base text-[#ffffff]">
        {label}
        {required && <span className="text-[#c9a84c] ml-0.5"> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-[#111625] border border-[#1e2438] rounded px-4 py-3 text-sm text-[#e8e6e0] placeholder-[#3a3a52] focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20 transition-colors';
