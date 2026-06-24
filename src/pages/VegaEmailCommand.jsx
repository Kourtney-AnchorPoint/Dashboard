import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, FileUp, MailPlus, RefreshCw, Send, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { buildOutreachDraft, parseApolloContacts } from "@/lib/vegaEmail";
import { cn } from "@/lib/utils";

const VEGA_API_URL = import.meta.env.VITE_VEGA_API_URL || "http://localhost:8080";

const sampleContacts = [
  "First Name,Last Name,Email,Title,Company",
  "Maya,Rivera,maya.rivera@example.com,Clinical Director,North Star Recovery",
  "Jordan,Hayes,jordan.hayes@example.com,VP Partnerships,Alliance Behavioral Health",
].join("\n");

export function VegaEmailCommand() {
  const fileInputRef = useRef(null);
  const [gmailStatus, setGmailStatus] = useState({ connected: false, loading: true, error: "" });
  const [rawContacts, setRawContacts] = useState(sampleContacts);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [goal, setGoal] = useState("Invite them to discuss whether CensusGuard could support SUD treatment retention and AMA prevention.");
  const [tone, setTone] = useState("warm");
  const [isCreating, setIsCreating] = useState(false);

  const contacts = useMemo(() => parseApolloContacts(rawContacts), [rawContacts]);
  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) || contacts[0];
  const draft = useMemo(() => buildOutreachDraft(selectedContact, goal, tone), [goal, selectedContact, tone]);

  useEffect(() => {
    if (!selectedContactId && contacts[0]) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);

  async function refreshStatus() {
    setGmailStatus((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await fetch(`${VEGA_API_URL}/api/auth/gmail/status`);
      if (!response.ok) throw new Error(`Status check failed (${response.status})`);
      const status = await response.json();
      setGmailStatus({ connected: Boolean(status.connected), loading: false, error: "", updatedAt: status.updatedAt });
    } catch (error) {
      setGmailStatus({ connected: false, loading: false, error: "Backend offline or Gmail not configured yet." });
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  function connectGmail() {
    window.open(`${VEGA_API_URL}/api/auth/google`, "_blank", "noopener,noreferrer");
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setRawContacts(text);
    setSelectedContactId("");
    toast.success("Apollo contact file loaded");
  }

  async function createGmailDraft() {
    if (!draft.to || !draft.subject || !draft.body) {
      toast.error("Pick a contact with an email before creating a draft");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`${VEGA_API_URL}/api/drafts/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Draft creation failed");
      toast.success("Draft created in Gmail");
    } catch (error) {
      toast.error(error.message || "Draft creation failed");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-clinic text-foreground">
      <header className="border-b border-line bg-panel/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg border border-primary/40 bg-primary/10 text-primary shadow-[0_0_30px_rgba(16,216,240,0.14)]">
              <Sparkles aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">VEGA Operator Console</div>
              <h1 className="text-2xl font-semibold tracking-tight">Email Draft Command Center</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={gmailStatus.connected ? "low" : "critical"}>
              {gmailStatus.connected ? "Gmail Connected" : "Gmail Not Connected"}
            </Badge>
            <Badge variant="outline" className="border-primary/40 text-primary">No Send Scope</Badge>
            <Button variant="clinical" onClick={connectGmail}>
              <ShieldCheck data-icon="inline-start" />
              Securely Connect Google Account
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-5 py-5 xl:grid-cols-[370px_minmax(0,1fr)_420px]">
        <Card className="border-primary/20 bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="text-primary" aria-hidden="true" />
              Apollo Contacts
            </CardTitle>
            <CardDescription>Paste CSV rows or upload an Apollo export. VEGA only needs contact context to draft.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <FileUp data-icon="inline-start" />
                Upload CSV
              </Button>
              <Button variant="ghost" onClick={() => setRawContacts(sampleContacts)}>Load Sample</Button>
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
            </div>
            <Textarea
              value={rawContacts}
              onChange={(event) => {
                setRawContacts(event.target.value);
                setSelectedContactId("");
              }}
              className="min-h-[260px] font-mono text-xs"
              aria-label="Apollo contact CSV"
            />
            <div className="text-sm text-muted-foreground">{contacts.length} usable contacts found</div>
          </CardContent>
        </Card>

        <Card className="border-accent/30 bg-card/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailPlus className="text-accent" aria-hidden="true" />
              Draft Brief
            </CardTitle>
            <CardDescription>Pick a contact, set the goal, and preview exactly what VEGA will place in Gmail Drafts.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-2">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedContactId(contact.id)}
                  className={cn(
                    "rounded-lg border border-line bg-background p-3 text-left transition hover:border-primary/40 hover:bg-primary/5",
                    selectedContact?.id === contact.id && "border-primary/60 bg-primary/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-foreground">{contact.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{contact.title || "Contact"}{contact.company ? ` - ${contact.company}` : ""}</div>
                    </div>
                    {selectedContact?.id === contact.id ? <CheckCircle2 className="text-primary" aria-hidden="true" /> : null}
                  </div>
                  <div className="mt-2 truncate text-xs text-primary">{contact.email}</div>
                </button>
              ))}
            </div>

            <Separator />

            <div className="grid gap-3">
              <label className="grid gap-2 text-sm font-semibold">
                Outreach goal
                <Textarea value={goal} onChange={(event) => setGoal(event.target.value)} className="min-h-[92px]" />
              </label>
              <div className="flex flex-wrap gap-2" aria-label="Tone selector">
                {["warm", "direct"].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={tone === option ? "clinical" : "outline"}
                    size="sm"
                    onClick={() => setTone(option)}
                  >
                    {option === "warm" ? "Warm" : "Direct"}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-card/95 shadow-[0_0_45px_rgba(16,216,240,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="text-primary" aria-hidden="true" />
              Gmail Draft Preview
            </CardTitle>
            <CardDescription>Creates a draft only. You still physically review and click Send in Gmail.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-lg border border-line bg-background p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">To</div>
              <div className="mt-1 break-words text-sm text-primary">{draft.to || "No contact selected"}</div>
              <Separator className="my-3" />
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject</div>
              <div className="mt-1 text-sm font-semibold">{draft.subject}</div>
              <Separator className="my-3" />
              <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground/85">{draft.body}</pre>
            </div>

            <div className="rounded-lg border border-line bg-background p-3 text-sm text-muted-foreground">
              {gmailStatus.loading ? "Checking Gmail connection..." : gmailStatus.error || (gmailStatus.connected ? "Secure token found. Draft creation is ready." : "Connect Gmail before creating real drafts.")}
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Button variant="outline" onClick={refreshStatus}>
                <RefreshCw data-icon="inline-start" />
                Refresh Status
              </Button>
              <Button onClick={createGmailDraft} disabled={gmailStatus.loading || !gmailStatus.connected || isCreating || !draft.to}>
                {isCreating ? "Creating..." : "Create Gmail Draft"}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
