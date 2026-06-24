import { describe, expect, it } from "vitest";
import { buildOutreachDraft, parseApolloContacts } from "./vegaEmail";

describe("parseApolloContacts", () => {
  it("parses Apollo-style CSV contacts", () => {
    const contacts = parseApolloContacts([
      "First Name,Last Name,Email,Title,Company",
      "Jane,Doe,jane@example.com,Clinical Director,North Recovery",
    ].join("\n"));

    expect(contacts).toEqual([
      expect.objectContaining({
        name: "Jane Doe",
        firstName: "Jane",
        email: "jane@example.com",
        title: "Clinical Director",
        company: "North Recovery",
      }),
    ]);
  });

  it("ignores rows without emails", () => {
    const contacts = parseApolloContacts("First Name,Last Name,Email\nNo,Email,");

    expect(contacts).toHaveLength(0);
  });
});

describe("buildOutreachDraft", () => {
  it("creates a Gmail draft payload without sending anything", () => {
    const draft = buildOutreachDraft({
      firstName: "Jane",
      email: "jane@example.com",
      title: "Clinical Director",
      company: "North Recovery",
    }, "Ask for feedback on pilot fit.");

    expect(draft.to).toBe("jane@example.com");
    expect(draft.subject).toContain("North Recovery");
    expect(draft.body).toContain("Hi Jane,");
    expect(draft.body).toContain("Ask for feedback on pilot fit.");
  });
});
