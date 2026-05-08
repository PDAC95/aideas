import type { AdminClientNoteEntry as AdminClientNoteEntryData } from "@/lib/admin/types";
import { AdminClientNoteCreate } from "./admin-client-note-create";
import { AdminClientNoteEntry } from "./admin-client-note-entry";

interface AdminClientNotesTabProps {
  organizationId: string;
  notes: AdminClientNoteEntryData[];
  locale: string;
  translations: {
    empty: string;
    create: {
      placeholder: string;
      save: string;
      saving: string;
      cancel: string;
      addLabel: string;
      errorTooShort: string;
      errorTooLong: string;
      errorGeneric: string;
      charCounter: string;
    };
    entry: {
      edit: string;
      delete: string;
      save: string;
      saving: string;
      cancel: string;
      confirmDelete: string;
      confirmDeleteBody: string;
      deleting: string;
      edited: string;
      writtenBy: string;
      errorTooShort: string;
      errorTooLong: string;
      errorGeneric: string;
      charCounter: string;
    };
  };
}

/**
 * Notes tab body for /admin/clients/[id] (CLNT-05).
 *
 * Server-rendered shell: hosts the AdminClientNoteCreate client form at the
 * top, then either an empty placeholder or the list of AdminClientNoteEntry
 * client components (one per existing note).
 *
 * The client components invoke server actions (createNote / updateNote /
 * deleteNote) which call revalidatePath, so this server component re-renders
 * with fresh `notes` props after each mutation — no manual state coordination
 * here.
 *
 * SECURITY: note bodies are rendered as plain JSX text inside the entry
 * component's `whitespace-pre-wrap` <p>. React's default escaping is the
 * entire XSS protection.
 */
export function AdminClientNotesTab({
  organizationId,
  notes,
  locale,
  translations,
}: AdminClientNotesTabProps) {
  return (
    <section className="space-y-4">
      <AdminClientNoteCreate
        organizationId={organizationId}
        translations={translations.create}
      />
      {notes.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {translations.empty}
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <AdminClientNoteEntry
              key={note.id}
              note={note}
              locale={locale}
              translations={translations.entry}
            />
          ))}
        </div>
      )}
    </section>
  );
}
