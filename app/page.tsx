'use client';

import { useState, FormEvent } from 'react';

const PRODUCTS = [
  { id: 'feasibility', label: 'Feasibility Assessment', price: '$999' },
  { id: 'culturePpt', label: 'Culture Deck (PPT)', price: '$399' },
  { id: 'culture doc', label: 'Culture Document', price: '$99' },
] as const;

type ProductId = (typeof PRODUCTS)[number]['id'];

const QUESTIONS: { key: string; label: string; description: string }[] = [
  {
    key: 'Q1: Integration end state',
    label: 'Q1 — Integration End State',
    description: 'Describe the intended end state of the combined organisation post-integration. What does success look like operationally, culturally, and strategically?',
  },
  {
    key: 'Q2: Operational control level',
    label: 'Q2 — Operational Control Level',
    description: 'How much operational control does the acquirer intend to exert over the target? Full consolidation, light-touch oversight, or something in between?',
  },
  {
    key: 'Q3: Transaction structure',
    label: 'Q3 — Transaction Structure',
    description: 'Describe the transaction structure — asset purchase, stock purchase, merger, carve-out, etc. — and any relevant deal mechanics that affect integration scope.',
  },
  {
    key: 'Q4: Integration timeline',
    label: 'Q4 — Integration Timeline',
    description: 'What is the target timeline for integration milestones? Note any hard deadlines driven by regulatory, contractual, or board commitments.',
  },
  {
    key: 'Q5: Synergy targets',
    label: 'Q5 — Synergy Targets',
    description: 'What are the committed synergy targets (revenue, cost, or both)? Over what time horizon are they expected to be realised?',
  },
  {
    key: 'Q6: Value drivers',
    label: 'Q6 — Value Drivers',
    description: 'What are the primary value drivers behind this transaction? What capabilities, markets, or assets were the strategic rationale for the acquisition?',
  },
  {
    key: 'Q7: Dedicated integration resources',
    label: 'Q7 — Dedicated Integration Resources',
    description: 'Has a dedicated integration management office (IMO) or integration team been established? What internal resources are committed to the programme?',
  },
  {
    key: 'Q8: Concurrent integrations/change',
    label: 'Q8 — Concurrent Integrations / Change',
    description: 'Is the acquirer managing any other concurrent integrations, transformations, or significant organisational change programmes that could compete for resources or leadership attention?',
  },
  {
    key: 'Q9: Wider acquirer change triggered',
    label: 'Q9 — Wider Acquirer Change Triggered',
    description: 'Does this transaction trigger broader change within the acquiring organisation — restructuring, rebranding, leadership changes, or operating model shifts?',
  },
  {
    key: 'Q10: Carve-out functions/TSAs',
    label: 'Q10 — Carve-Out Functions / TSAs',
    description: 'Are there any functions being carved out, or transition service agreements (TSAs) in place? Identify scope, duration, and any interdependencies with integration workstreams.',
  },
];

interface FormState {
  dealName: string;
  acquirerName: string;
  targetName: string;
  email: string;
  answers: Record<string, string>;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function Page() {
  const [form, setForm] = useState<FormState>({
    dealName: '',
    acquirerName: '',
    targetName: '',
    email: '',
    answers: Object.fromEntries(QUESTIONS.map((q) => [q.key, ''])),
  });
  const [selectedProducts, setSelectedProducts] = useState<Set<ProductId>>(new Set());
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
          <p className="text-xs text-[#9a9aaa] uppercase tracking-widest">Echelon M&A Advisory</p>
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
            Complete the questionnaire below to initiate your deal analysis. Detailed responses enable a more precise assessment of integration complexity, cultural alignment, and delivery risk.
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
                  placeholder="Project Titan"
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
              {QUESTIONS.map((q) => (
                <Field key={q.key} label={q.label} required description={q.description}>
                  <textarea
                    required
                    rows={4}
                    value={form.answers[q.key]}
                    onChange={(e) => setAnswer(q.key, e.target.value)}
                    className={`${inputClass} resize-none leading-relaxed`}
                  />
                </Field>
              ))}
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
                {status === 'submitting' ? 'Submitting…' : 'Submit Deal'}
              </button>
            </div>
          </div>

        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2438] px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-[#6a6a7a] text-center tracking-widest uppercase">Echelon M&A Advisory · Confidential</p>
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

function Field({
  label,
  required,
  hint,
  description,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-base text-[#ffffff]">
        {label}
        {required && <span className="text-[#c9a84c] ml-0.5"> *</span>}
        {hint && <span className="text-[#e8e6e0] text-sm ml-2">{hint}</span>}
      </label>
      {description && (
        <p className="text-base text-[#e8e6e0] leading-relaxed">{description}</p>
      )}
      {children}
    </div>
  );
}

const inputClass =
  'w-full bg-[#111625] border border-[#1e2438] rounded px-4 py-3 text-sm text-[#e8e6e0] placeholder-[#3a3a52] focus:outline-none focus:border-[#c9a84c]/50 focus:ring-1 focus:ring-[#c9a84c]/20 transition-colors';
