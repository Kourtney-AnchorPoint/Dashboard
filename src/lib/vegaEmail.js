const defaultGoal = "Introduce AnchorPoint and request a short conversation about CensusGuard.";

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function normalizeKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function readField(row, keys) {
  const normalized = Object.entries(row).reduce((acc, [key, value]) => {
    acc[normalizeKey(key)] = value;
    return acc;
  }, {});

  for (const key of keys) {
    const value = normalized[normalizeKey(key)];
    if (value) return value;
  }

  return "";
}

export function parseApolloContacts(rawText) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const header = parseCsvLine(lines[0]);
  const hasHeader = header.some((cell) => /email|first|last|company|organization|title/i.test(cell));
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const fallbackHeader = ["first_name", "last_name", "email", "title", "company"];
  const keys = hasHeader ? header : fallbackHeader;

  return dataLines
    .map((line, index) => {
      const values = parseCsvLine(line);
      const row = keys.reduce((acc, key, cellIndex) => {
        acc[key] = values[cellIndex] || "";
        return acc;
      }, {});

      const firstName = readField(row, ["first_name", "first name", "firstname", "first"]);
      const lastName = readField(row, ["last_name", "last name", "lastname", "last"]);
      const email = readField(row, ["email", "email address", "work email", "person email"]);
      const title = readField(row, ["title", "job title", "position"]);
      const company = readField(row, ["company", "organization", "account name", "company name"]);
      const name = [firstName, lastName].filter(Boolean).join(" ") || readField(row, ["name", "full name"]) || `Contact ${index + 1}`;

      return {
        id: `${email || name}-${index}`,
        name,
        firstName: firstName || name.split(" ")[0],
        email,
        title,
        company,
      };
    })
    .filter((contact) => contact.email);
}

export function buildOutreachDraft(contact, goal = defaultGoal, tone = "warm") {
  const safeContact = contact || {};
  const firstName = safeContact.firstName || safeContact.name?.split(" ")[0] || "there";
  const companyLine = safeContact.company ? ` at ${safeContact.company}` : "";
  const subject = `Quick question${safeContact.company ? ` for ${safeContact.company}` : ""}`;
  const toneLine = tone === "direct"
    ? "I will keep this brief."
    : "I hope your week is going well.";

  const body = [
    `Hi ${firstName},`,
    "",
    toneLine,
    "",
    `I am reaching out because I am building AnchorPoint Health Systems, and our first platform, CensusGuard, helps SUD treatment teams identify patients at elevated AMA risk early enough for staff to intervene.`,
    "",
    safeContact.title || safeContact.company
      ? `Given your work${companyLine}, I thought this might be worth a quick conversation.`
      : "I thought this might be worth a quick conversation.",
    "",
    `Goal for this note: ${goal || defaultGoal}`,
    "",
    "Would you be open to a short call next week?",
    "",
    "Warmly,",
    "Kourtney",
  ].join("\n");

  return {
    to: safeContact.email || "",
    subject,
    body,
  };
}
