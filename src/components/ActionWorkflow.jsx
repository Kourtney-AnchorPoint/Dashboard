import { useState } from "react";
import { ClipboardCheck } from "lucide-react";

const actions = ["Acknowledged", "Assigned", "Intervention documented", "Escalated", "Resolved", "Override/false positive"];

export function ActionWorkflow({ alert, patient, onApplyAction }) {
  const [action, setAction] = useState("Intervention documented");
  const [user, setUser] = useState("Maya LCSW");
  const [note, setNote] = useState("Completed retention check-in and documented patient response.");

  if (!alert || !patient) return null;

  function handleSubmit(event) {
    event.preventDefault();
    onApplyAction({ alert, action, user, note });
  }

  return (
    <section className="border border-line bg-white shadow-panel" aria-labelledby="action-workflow-title">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h2 id="action-workflow-title" className="text-lg font-semibold text-ink">Action Workflow</h2>
          <p className="text-sm text-ink/60">Close the loop from AMA alert to documented staff intervention.</p>
        </div>
        <ClipboardCheck className="h-5 w-5 text-pine" aria-hidden="true" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div className="border border-line bg-field p-3 text-sm text-ink/75">
          <span className="font-semibold text-ink">Selected alert:</span> {patient.displayName} - {alert.requiredAction}
        </div>
        <label className="block text-sm font-semibold text-ink">
          Action
          <select value={action} onChange={(event) => setAction(event.target.value)} className="mt-2 w-full border border-line bg-white px-3 py-2 text-sm font-normal text-ink outline-none focus:border-pine">
            {actions.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold text-ink">
          Staff member
          <input value={user} onChange={(event) => setUser(event.target.value)} className="mt-2 w-full border border-line bg-white px-3 py-2 text-sm font-normal text-ink outline-none focus:border-pine" />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Intervention note
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} className="mt-2 w-full resize-none border border-line bg-white px-3 py-2 text-sm font-normal leading-5 text-ink outline-none focus:border-pine" />
        </label>
        <button type="submit" className="inline-flex w-full items-center justify-center bg-pine px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink">
          Save action and audit event
        </button>
      </form>
    </section>
  );
}
