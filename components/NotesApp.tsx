'use client';

import { useEffect, useState, useCallback } from 'react';
import { ensureSignedInWithFabric } from '@microsoft/rayfin-auth-provider-fabric';
import { getBrowserClient, fabricOptions } from '../lib/rayfinBrowser';
import type { RayfinConfig } from '../lib/serverConfig';

type Note = {
  id: string;
  author: string;
  message: string;
  createdAt: string | Date;
};

export default function NotesApp({ config }: { config: RayfinConfig | null }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!config) return;
    const client = getBrowserClient(config);
    const rows = await client.data.Note.select(['id', 'author', 'message', 'createdAt'])
      .orderBy({ createdAt: 'desc' })
      .execute();
    setNotes(rows as Note[]);
  }, [config]);

  // On load, restore any existing session (no UI) and load notes if signed in.
  useEffect(() => {
    if (!config) {
      setReady(true);
      return;
    }
    (async () => {
      try {
        const client = getBrowserClient(config);
        const session = client.auth.getSession();
        if (session.isAuthenticated && session.user) {
          setSignedIn(true);
          setUser(session.user.email ?? session.user.id);
          await refresh();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setReady(true);
      }
    })();
  }, [config, refresh]);

  const signIn = useCallback(async () => {
    if (!config) return;
    setError(null);
    setBusy(true);
    try {
      const client = getBrowserClient(config);
      const session = await ensureSignedInWithFabric(client.auth, {
        ...fabricOptions(config),
        returnOrigin: window.location.origin,
      });
      if (!session.isAuthenticated || !session.user) {
        throw new Error('Fabric sign-in completed but no session was established.');
      }
      setSignedIn(true);
      setUser(session.user.email ?? session.user.id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [config, refresh]);

  const addNote = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!config) return;
      const text = message.trim();
      if (!text) return;
      setBusy(true);
      setError(null);
      try {
        const client = getBrowserClient(config);
        const session = client.auth.getSession();
        const author = session.user?.email ?? session.user?.id ?? 'unknown';
        await client.data.Note.create({
          author: author.slice(0, 60),
          message: text.slice(0, 280),
          createdAt: new Date(),
        });
        setMessage('');
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [config, message, refresh]
  );

  if (!config) {
    return (
      <p className="warn">
        Backend not configured. Set <code>RAYFIN_API_URL</code>,{' '}
        <code>RAYFIN_PUBLISHABLE_KEY</code>, <code>FABRIC_WORKSPACE_ID</code>, and{' '}
        <code>FABRIC_ITEM_ID</code> (via <code>embr variables set</code> on Embr, or
        the <code>NEXT_PUBLIC_*</code> equivalents in <code>.env.local</code> for
        local dev) after running <code>rayfin up</code>.
      </p>
    );
  }

  if (!ready) return <p className="sub">Loading…</p>;

  if (!signedIn) {
    return (
      <div className="card">
        <p>Sign in with your Microsoft Fabric account to read and post notes.</p>
        <button onClick={signIn} disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in with Fabric'}
        </button>
        {error && <p className="warn">{error}</p>}
      </div>
    );
  }

  return (
    <>
      <p className="sub">
        Signed in as <strong>{user}</strong>. Notes are read and written through the
        Rayfin Data API and stored, governed, in Microsoft Fabric.
      </p>

      <form onSubmit={addNote} className="card form">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave a note…"
          maxLength={280}
        />
        <button type="submit" disabled={busy}>
          Post
        </button>
      </form>

      {error && <p className="warn">{error}</p>}

      <ul className="notes">
        {notes.map((n) => (
          <li key={n.id} className="card">
            <div className="meta">
              <strong>{n.author}</strong>
              <span>{new Date(n.createdAt).toLocaleString()}</span>
            </div>
            <p>{n.message}</p>
          </li>
        ))}
        {notes.length === 0 && <li className="empty">No notes yet — be the first.</li>}
      </ul>
    </>
  );
}
