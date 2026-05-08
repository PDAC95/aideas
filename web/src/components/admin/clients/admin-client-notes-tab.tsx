import type { AdminClientNoteEntry } from "@/lib/admin/types";

interface AdminClientNotesTabProps {
  notes: AdminClientNoteEntry[];
  locale: string;
  translations: {
    empty: string;
    writtenBy: string; // template "{name} on {date}"
    edited: string; // "(edited)"
    /**
     * Plan 21-03 will REMOVE this key + its render when the editor ships.
     * Flagged in the 21-02 SUMMARY so the next plan does not leave a dead
     * key.
     */
    comingSoon: string;
  };
}

/**
 * Read-only Notes tab body for /admin/clients/[id]. Plan 21-03 will replace
 * this body with the create/edit/delete editor; the `comingSoon` footer
 * flags this as the read-only-only milestone.
 *
 * SECURITY: note bodies are rendered as plain JSX text inside a
 * `whitespace-pre-wrap` paragraph. React's default escaping is the entire
 * XSS protection — DO NOT introduce any HTML-injection prop. CONTEXT.md
 * "Plain text ... escape HTML on render".
 */
export function AdminClientNotesTab({
  notes,
  locale,
  translations,
}: AdminClientNotesTabProps) {
  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="space-y-4">
      {notes.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {translations.empty}
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const authorLabel = note.authorFullName ?? note.authorEmail;
            const meta = translations.writtenBy
              .replace("{name}", authorLabel)
              .replace("{date}", dateFmt.format(new Date(note.createdAt)));
            // Compare timestamps with a 1s tolerance to absorb DB trigger
            // jitter (updated_at trigger fires within microseconds of insert,
            // but clocks can skew across read replicas).
            const wasEdited =
              new Date(note.updatedAt).getTime() >
              new Date(note.createdAt).getTime() + 1000;
            return (
              <article
                key={note.id}
                className="space-y-2 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
              >
                <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                  {note.body}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span>{meta}</span>
                  {wasEdited && (
                    <span className="ml-2 italic">{translations.edited}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="text-xs italic text-gray-500 dark:text-gray-400">
        {translations.comingSoon}
      </p>
    </section>
  );
}
