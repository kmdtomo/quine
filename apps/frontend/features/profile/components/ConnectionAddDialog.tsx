"use client";

import { useState } from "react";

import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";

import { GlassModal } from "@/components/glass-modal";
import { Button } from "@/components/ui/button";

import { getConnectionErrorMessage } from "../lib/profile-errors";
import { normalizeUsername } from "../lib/profile-links";

export function ConnectionAddDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const addConnection = useMutation(api.connections.add);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername) {
      setError("Username is required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await addConnection({ username: normalizedUsername });
      onClose();
    } catch (unknownError: unknown) {
      setError(getConnectionErrorMessage(unknownError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassModal
      className="max-w-[440px] p-6"
      contentClassName="text-left"
      open
      onOpenChange={(open) => {
        if (!open && !saving) {
          onClose();
        }
      }}
      showCloseButton={false}
      titleId="connection-add-dialog-title"
    >
      <h3
        className="text-xl font-bold tracking-tight text-white"
        id="connection-add-dialog-title"
      >
        Add connection
      </h3>
      <p className="mt-1.5 text-xs text-white/50">
        Enter a Quine username
      </p>

      <div className="mt-5 space-y-3">
        <input
          type="text"
          className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary/70 focus:bg-white/[0.06]"
          placeholder="@username"
          autoComplete="off"
          autoFocus
          disabled={saving}
          value={username}
          onChange={(event) => setUsername(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleAdd();
            }
          }}
        />
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1.5">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-full border-white/10 bg-white/[0.04] px-4 text-white/60 hover:bg-white/[0.08] hover:text-white"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 rounded-full bg-white px-4 font-semibold text-zinc-950 shadow-lg hover:bg-zinc-100"
            disabled={saving || username.trim().length === 0}
            onClick={() => void handleAdd()}
          >
            {saving ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>
    </GlassModal>
  );
}
