import { useState, useEffect } from "react";
import { Task, MoneyTracker } from "@/api/entities";

const PRIORITY_ORDER = { "🔴 Critical": 0, "🟡 High": 1, "🟢 Medium": 2, "⚪ Low": 3 };
const STATUS_COLORS = {
  "To Do": "bg-gray-700 text-gray-200",
  "In Progress": "bg-blue-900 text-blue-200",
  "Waiting": "bg-yellow-900 text-yellow-200",
  "Done": "bg-green-900 text-green-200",
  "Blocked": "bg-red-900 text-red-200",
};
const CATEGORY_ICONS = {
  "Investor/Funding": "💰",
  "Pilot/Sales": "🎯",
  "Product": "⚙️",
  "Personal": "🏠",
  "Legal": "⚖️",
  "Operations": "🔧",
  "Event": "🎪",
};
const MONEY_STATUS_COLORS = {
  Confirmed: "text-green-400",
  Pending: "text-yellow-400",
  Projected: "text-cyan-400",
  Paid: "text-green-300",
  Overdue: "text-red-400",
};

export default function Command() {
  const [tasks, setTasks] = useState([]);
  const [money, setMoney] = useState([]);
  const [activeTab, setActiveTab] = useState("tasks");
  const [filter, setFilter] = useState("All");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", category: "Operations", priority: "🟡 High", status: "To Do", due_date: "", notes: "", contact: "" });
  const [newMoney, setNewMoney] = useState({ label: "", category: "Expense", amount: "", date: "", status: "Pending", notes: "", recurs: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([Task.list(), MoneyTracker.list()]).then(([t, m]) => {
      setTasks(t.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)));
      setMoney(m);
      setLoading(false);
    });
  }, []);

  const activeTasks = tasks.filter(t => t.status !== "Done");
  const criticalCount = tasks.filter(t => t.priority === "🔴 Critical" && t.status !== "Done").length;
  const pendingMoney = money.filter(m => m.status === "Pending" || m.status === "Projected").reduce((s, m) => s + (m.amount || 0), 0);
  const confirmedMoney = money.filter(m => m.status === "Confirmed" || m.status === "Paid").reduce((s, m) => s + (m.amount || 0), 0);

  const categories = ["All", "Investor/Funding", "Pilot/Sales", "Product", "Event", "Legal", "Personal", "Operations"];
  const filteredTasks = filter === "All" ? activeTasks : activeTasks.filter(t => t.category === filter);

  const handleStatusChange = async (id, status) => {
    await Task.update(id, { status });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleAddTask = async () => {
    if (!newTask.title) return;
    const created = await Task.create(newTask);
    setTasks(prev => [...prev, created].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4)));
    setNewTask({ title: "", category: "Operations", priority: "🟡 High", status: "To Do", due_date: "", notes: "", contact: "" });
    setShowAddTask(false);
  };

  const handleAddMoney = async () => {
    if (!newMoney.label) return;
    const created = await MoneyTracker.create({ ...newMoney, amount: parseFloat(newMoney.amount) || 0 });
    setMoney(prev => [...prev, created]);
    setNewMoney({ label: "", category: "Expense", amount: "", date: "", status: "Pending", notes: "", recurs: false });
    setShowAddMoney(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#07070F] flex items-center justify-center">
      <div className="text-[#D4159A] text-xl animate-pulse">Loading command center...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#07070F] text-white font-sans">
      {/* Header */}
      <div className="border-b border-[#D4159A]/30 bg-[#0d0d1a]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-[#D4159A] uppercase tracking-widest mb-1">AnchorPoint Health Systems</div>
            <h1 className="text-2xl font-bold text-white">⚡ Command Center</h1>
            <div className="text-gray-400 text-sm mt-0.5">Lyra's Mission Control · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="bg-red-950/60 border border-red-700/50 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
              <div className="text-xs text-red-300">Critical Tasks</div>
            </div>
            <div className="bg-yellow-950/60 border border-yellow-700/50 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold text-yellow-400">{activeTasks.length}</div>
              <div className="text-xs text-yellow-300">Active Tasks</div>
            </div>
            <div className="bg-cyan-950/60 border border-cyan-700/50 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold text-cyan-400">${(pendingMoney / 1000).toFixed(0)}K</div>
              <div className="text-xs text-cyan-300">Pending/Projected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-6">
          {[["tasks","📋 Task Flow"],["money","💵 Money Dashboard"],["roi","📈 Investor ROI"]].map(([tab,label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${activeTab === tab ? "bg-[#D4159A] text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* TASKS TAB */}
        {activeTab === "tasks" && (
          <div>
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap mb-5">
              {categories.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filter === c ? "bg-[#8844E8] text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                  {c}
                </button>
              ))}
              <button onClick={() => setShowAddTask(true)}
                className="ml-auto px-4 py-1 rounded-full text-xs font-semibold bg-[#D4159A]/20 text-[#D4159A] border border-[#D4159A]/30 hover:bg-[#D4159A]/30 transition-all">
                + Add Task
              </button>
            </div>

            {/* Task list */}
            <div className="space-y-3">
              {filteredTasks.length === 0 && (
                <div className="text-center text-gray-500 py-10">No active tasks in this category.</div>
              )}
              {filteredTasks.map(task => (
                <div key={task.id} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 hover:border-[#D4159A]/30 transition-all">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-xl mt-0.5 shrink-0">{CATEGORY_ICONS[task.category] || "📌"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm">{task.title}</span>
                          <span className="text-xs">{task.priority}</span>
                        </div>
                        {task.contact && <div className="text-xs text-[#10D8F0] mt-0.5">👤 {task.contact}</div>}
                        {task.notes && <div className="text-xs text-gray-400 mt-1 leading-relaxed">{task.notes}</div>}
                        {task.due_date && <div className="text-xs text-gray-500 mt-1">📅 Due: {task.due_date}</div>}
                      </div>
                    </div>
                    <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-3 py-1 border-0 cursor-pointer shrink-0 ${STATUS_COLORS[task.status] || "bg-gray-700 text-gray-200"}`}>
                      {["To Do", "In Progress", "Waiting", "Done", "Blocked"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Done tasks */}
            {tasks.filter(t => t.status === "Done").length > 0 && (
              <details className="mt-6">
                <summary className="text-gray-500 text-sm cursor-pointer hover:text-gray-300">
                  ✅ {tasks.filter(t => t.status === "Done").length} completed tasks
                </summary>
                <div className="space-y-2 mt-3">
                  {tasks.filter(t => t.status === "Done").map(task => (
                    <div key={task.id} className="bg-white/3 border border-white/5 rounded-xl p-3 opacity-50">
                      <div className="text-sm text-gray-400 line-through">{task.title}</div>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Add task modal */}
            {showAddTask && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-[#0d0d1a] border border-[#D4159A]/30 rounded-2xl p-6 w-full max-w-lg">
                  <h3 className="text-lg font-bold text-white mb-4">Add Task</h3>
                  <div className="space-y-3">
                    <input placeholder="Task title *" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#D4159A]/50" />
                    <div className="grid grid-cols-2 gap-3">
                      <select value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                        {["Investor/Funding","Pilot/Sales","Product","Personal","Legal","Operations","Event"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                        {["🔴 Critical","🟡 High","🟢 Medium","⚪ Low"].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <input placeholder="Contact" value={newTask.contact} onChange={e => setNewTask({...newTask, contact: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
                    <input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
                    <textarea placeholder="Notes" value={newTask.notes} onChange={e => setNewTask({...newTask, notes: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none h-20 resize-none" />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleAddTask} className="flex-1 bg-[#D4159A] text-white rounded-xl py-2 text-sm font-semibold hover:bg-[#D4159A]/80">Add Task</button>
                    <button onClick={() => setShowAddTask(false)} className="flex-1 bg-white/5 text-gray-400 rounded-xl py-2 text-sm hover:bg-white/10">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MONEY TAB */}
        {activeTab === "money" && (
          <div>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-green-950/40 border border-green-700/30 rounded-xl p-4 text-center">
                <div className="text-xs text-green-400 uppercase tracking-wider mb-1">Confirmed</div>
                <div className="text-2xl font-bold text-green-400">${confirmedMoney.toLocaleString()}</div>
              </div>
              <div className="bg-yellow-950/40 border border-yellow-700/30 rounded-xl p-4 text-center">
                <div className="text-xs text-yellow-400 uppercase tracking-wider mb-1">Pending</div>
                <div className="text-2xl font-bold text-yellow-400">${money.filter(m=>m.status==="Pending").reduce((s,m)=>s+(m.amount||0),0).toLocaleString()}</div>
              </div>
              <div className="bg-cyan-950/40 border border-cyan-700/30 rounded-xl p-4 text-center">
                <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Projected</div>
                <div className="text-2xl font-bold text-cyan-400">${money.filter(m=>m.status==="Projected").reduce((s,m)=>s+(m.amount||0),0).toLocaleString()}</div>
              </div>
              <div className="bg-purple-950/40 border border-purple-700/30 rounded-xl p-4 text-center">
                <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">Total Pipeline</div>
                <div className="text-2xl font-bold text-purple-400">${money.reduce((s,m)=>s+(m.amount||0),0).toLocaleString()}</div>
              </div>
            </div>

            {/* Add money button */}
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowAddMoney(true)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#D4159A]/20 text-[#D4159A] border border-[#D4159A]/30 hover:bg-[#D4159A]/30 transition-all">
                + Add Entry
              </button>
            </div>

            {/* Money entries */}
            <div className="space-y-3">
              {["Grant", "Investment", "Income", "Expense", "Pending"].map(cat => {
                const items = money.filter(m => m.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-4">{cat}</div>
                    {items.map(item => (
                      <div key={item.id} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 mb-2 flex items-start justify-between gap-3 flex-wrap hover:border-[#8844E8]/30 transition-all">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm">{item.label}</span>
                            {item.recurs && <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">🔄 Recurring</span>}
                          </div>
                          {item.notes && <div className="text-xs text-gray-400 mt-1">{item.notes}</div>}
                          {item.date && <div className="text-xs text-gray-600 mt-1">📅 {item.date}</div>}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold text-white">{item.amount ? `$${item.amount.toLocaleString()}` : "TBD"}</div>
                          <div className={`text-xs font-semibold ${MONEY_STATUS_COLORS[item.status] || "text-gray-400"}`}>{item.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Add money modal */}
            {showAddMoney && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-[#0d0d1a] border border-[#8844E8]/30 rounded-2xl p-6 w-full max-w-lg">
                  <h3 className="text-lg font-bold text-white mb-4">Add Money Entry</h3>
                  <div className="space-y-3">
                    <input placeholder="Label *" value={newMoney.label} onChange={e => setNewMoney({...newMoney, label: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#8844E8]/50" />
                    <div className="grid grid-cols-2 gap-3">
                      <select value={newMoney.category} onChange={e => setNewMoney({...newMoney, category: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                        {["Income","Expense","Grant","Investment","Pending"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={newMoney.status} onChange={e => setNewMoney({...newMoney, status: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none">
                        {["Confirmed","Pending","Projected","Paid","Overdue"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" placeholder="Amount ($)" value={newMoney.amount} onChange={e => setNewMoney({...newMoney, amount: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
                      <input type="date" value={newMoney.date} onChange={e => setNewMoney({...newMoney, date: e.target.value})}
                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none" />
                    </div>
                    <textarea placeholder="Notes" value={newMoney.notes} onChange={e => setNewMoney({...newMoney, notes: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none h-20 resize-none" />
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={newMoney.recurs} onChange={e => setNewMoney({...newMoney, recurs: e.target.checked})} className="accent-[#D4159A]" />
                      Recurring
                    </label>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleAddMoney} className="flex-1 bg-[#8844E8] text-white rounded-xl py-2 text-sm font-semibold hover:bg-[#8844E8]/80">Add Entry</button>
                    <button onClick={() => setShowAddMoney(false)} className="flex-1 bg-white/5 text-gray-400 rounded-xl py-2 text-sm hover:bg-white/10">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* INVESTOR ROI TAB */}
        {activeTab === "roi" && (
          <div className="space-y-6 pb-10">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Investor ROI — CensusGuard SaaS</div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label:"ARR at 10 Clients", val:"$780K", sub:"$6,500/mo avg × 10", color:"#D4159A" },
                { label:"ARR at 25 Clients", val:"$1.95M", sub:"$6,500/mo avg × 25", color:"#8844E8" },
                { label:"ARR at 50 Clients", val:"$3.9M", sub:"$6,500/mo avg × 50", color:"#10D8F0" },
                { label:"Gross Margin", val:"~85%", sub:"SaaS, no hardware", color:"#D4159A" },
              ].map(({ label, val, sub, color }) => (
                <div key={label} style={{borderLeft:`3px solid ${color}`, backgroundColor:"#0d0d1a"}} className="rounded-xl p-4 border border-white/10">
                  <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</div>
                  <div className="text-2xl font-black" style={{color}}>{val}</div>
                  <div className="text-xs text-gray-500 mt-1">{sub}</div>
                </div>
              ))}
            </div>

            {/* Return scenarios */}
            <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-6">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Return Scenarios — $500K SAFE · $8–10M Cap</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-widest border-b border-white/10">
                      <th className="pb-3 pr-6">Exit Valuation</th>
                      <th className="pb-3 pr-6">Investor Ownership</th>
                      <th className="pb-3 pr-6">Investor Return</th>
                      <th className="pb-3">Multiple</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { exit:"$25M", ownership:"5–6.25%", ret:"$1.25M–$1.56M", multiple:"2.5–3.1x", color:"#555" },
                      { exit:"$50M", ownership:"5–6.25%", ret:"$2.5M–$3.1M", multiple:"5–6.2x", color:"#10D8F0" },
                      { exit:"$100M", ownership:"5–6.25%", ret:"$5M–$6.25M", multiple:"10–12.5x", color:"#8844E8" },
                      { exit:"$250M", ownership:"5–6.25%", ret:"$12.5M–$15.6M", multiple:"25–31x 🚀", color:"#D4159A" },
                    ].map(row => (
                      <tr key={row.exit} className="text-sm">
                        <td className="py-3 pr-6 font-bold" style={{color:row.color}}>{row.exit}</td>
                        <td className="py-3 pr-6 text-gray-300">{row.ownership}</td>
                        <td className="py-3 pr-6 font-semibold text-white">{row.ret}</td>
                        <td className="py-3 font-black" style={{color:row.color}}>{row.multiple}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-gray-600">Based on $500K SAFE note · $8M–$10M valuation cap · Pre-dilution estimate</div>
            </div>

            {/* Use of funds */}
            <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-6">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-4">Use of $500K Raise</div>
              <div className="space-y-3">
                {[
                  { label:"Product Development & Vertex AI endpoint", pct:35, amount:"$175K", color:"#D4159A" },
                  { label:"Pilot Launch & Clinical Partnerships", pct:25, amount:"$125K", color:"#8844E8" },
                  { label:"Team (CTO / Clinical Ops hire)", pct:25, amount:"$125K", color:"#10D8F0" },
                  { label:"Marketing & BD", pct:10, amount:"$50K", color:"#D4159A" },
                  { label:"Legal & Operations", pct:5, amount:"$25K", color:"#555" },
                ].map(({ label, pct, amount, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{label}</span>
                      <span className="font-bold" style={{color}}>{amount} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{width:`${pct}%`, backgroundColor:color}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aldwyn / VA angle */}
            <div className="bg-[#0a0a18] border border-[#D4159A]/30 rounded-2xl p-6">
              <div className="text-xs text-[#D4159A] uppercase tracking-widest mb-3">🎖️ VA Opportunity — Aldwyn Angle</div>
              <div className="space-y-2 text-sm text-gray-300 leading-relaxed">
                <p>Veterans are <span className="text-white font-bold">1.5x more likely</span> to develop SUD than civilians. The VA treats 600,000+ veterans for SUD annually.</p>
                <p>The <span className="text-white font-bold">MISSION Act</span> expanded VA community care — meaning veterans can now receive SUD treatment at private facilities that could use CensusGuard.</p>
                <p>VA + DOD behavioral health budget exceeds <span className="text-white font-bold">$10B annually</span>. CensusGuard retention data is exactly what VA-contracted facilities need to prove outcomes for continued funding.</p>
                <p className="text-[#10D8F0] font-semibold mt-2">→ Pitch to Aldwyn: CensusGuard as the retention layer for VA-contracted SUD facilities. One federal contract = network effect across hundreds of facilities.</p>
              </div>
            </div>
          </div>
        )}

        <div className="h-20" />
      </div>
    </div>
  );
}
