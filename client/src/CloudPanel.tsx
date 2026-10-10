import { useEffect, useRef, useState, type FormEvent } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import {
  portfolioSchema,
  publishableSchema,
  slugSchema,
  type PortfolioData,
} from "@folionest/shared";
import { ConfirmDialog } from "./Dialog";

const url = import.meta.env.VITE_SUPABASE_URL,
  key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
function optionalAuth() {
  if (!url || !key) return null;
  try {
    const endpoint = new URL(url);
    if (
      endpoint.protocol !== "https:" ||
      endpoint.username ||
      endpoint.password ||
      endpoint.pathname !== "/" ||
      endpoint.search ||
      endpoint.hash
    )
      return null;
    return createClient(url, key, {
      auth: { flowType: "pkce", detectSessionInUrl: true },
    });
  } catch {
    return null;
  }
}
const supabase = optionalAuth();
export interface CloudLink {
  id: string;
  owner: string;
}
interface CloudRecord {
  id: string;
  title: string;
  slug: string | null;
  is_published: boolean;
  is_indexable: boolean;
  updated_at: string;
}
export default function CloudPanel({
  data,
  link,
  onLink,
  onLoad,
  onClose,
}: {
  data: PortfolioData;
  link: CloudLink | null;
  onLink: (link: CloudLink | null) => void;
  onLoad: (data: PortfolioData, link: CloudLink) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState<boolean | null>(null);
  const [records, setRecords] = useState<CloudRecord[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
  const [indexable, setIndexable] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    title: string;
    description: string;
    label: string;
    action: () => Promise<void>;
  } | null>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    void fetch("/api/config", { signal: AbortSignal.timeout(8000) })
      .then(async (response) => {
        if (!response.ok) throw Error();
        setReady(Boolean((await response.json()).cloud) && Boolean(supabase));
      })
      .catch(() => {
        setReady(false);
      });
    if (!supabase) return () => node?.close();
    let active = true;
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        const callback = new URL(location.href);
        for (const key of ["code", "error", "error_code", "error_description"])
          callback.searchParams.delete(key);
        history.replaceState(null, "", callback.pathname + callback.search);
        if (active) {
          setSession(data.session);
          if (error)
            setMessage("Your session could not be restored. Sign in again.");
        }
      })
      .catch(() => {
        if (active)
          setMessage("Your session could not be restored. Sign in again.");
      });
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, next) => {
        setSession(next);
      },
    );
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
      node?.close();
    };
  }, []);
  async function api(path: string, method = "GET", body?: unknown) {
    if (!session) throw new Error("Sign in to continue.");
    const response = await fetch(path, {
      method,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    const result = response.status === 204 ? {} : await response.json();
    if (!response.ok)
      throw new Error(
        result.error?.message || "Cloud request failed. Try again.",
      );
    return result;
  }
  async function refresh() {
    const result = await api("/api/portfolios/me");
    setRecords(result.portfolios);
  }
  useEffect(() => {
    if (!session || !ready) {
      setRecords([]);
      return;
    }
    let active = true;
    void fetch("/api/portfolios/me", {
      headers: { Authorization: `Bearer ${session.access_token}` },
      signal: AbortSignal.timeout(15000),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error?.message || "Could not load your portfolios.",
          );
        if (active) setRecords(result.portfolios);
      })
      .catch((error) => {
        if (active)
          setMessage(
            error instanceof Error ? error.message : "Cloud is unavailable.",
          );
      });
    return () => {
      active = false;
    };
  }, [session, ready]);
  const activeRecord = records.find(
    (record) => record.id === link?.id && session?.user.id === link.owner,
  );
  useEffect(() => {
    if (activeRecord) {
      setSlug(activeRecord.slug || "");
      setIndexable(activeRecord.is_indexable);
    }
  }, [activeRecord?.id, activeRecord?.slug, activeRecord?.is_indexable]);
  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Request failed. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function authenticate(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    await perform(async () => {
      const result = signup
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${location.origin}/builder` },
          })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw new Error(result.error.message);
      setPassword("");
      setMessage(
        signup && !result.data.session
          ? "Check your email to confirm your account, then sign in."
          : "Signed in. Your local draft is ready to save.",
      );
    });
  }
  async function save() {
    const parsed = portfolioSchema.safeParse(data);
    if (!parsed.success)
      throw new Error(
        "Fix the highlighted editor fields before saving to the cloud.",
      );
    const current = link && session?.user.id === link.owner ? link : null;
    const result = await api(
      current ? `/api/portfolios/${current.id}` : "/api/portfolios",
      current ? "PUT" : "POST",
      { data: parsed.data },
    );
    onLink({ id: result.portfolio.id, owner: session!.user.id });
    await refresh();
    return result.portfolio as CloudRecord;
  }
  function requestPublish() {
    const check = publishableSchema.safeParse(data);
    if (!check.success) {
      setMessage(
        "Add your name and headline and fix highlighted fields before publishing.",
      );
      return;
    }
    if (data.sample) {
      setMessage(
        "Replace the sample introduction with your own before publishing.",
      );
      return;
    }
    const parsed = slugSchema.safeParse(slug);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0].message);
      return;
    }
    setConfirmation({
      title: "Publish this portfolio?",
      description: `Anyone with the link can see the information in your visible sections. ${indexable ? "You are allowing search engines to index it." : "Search engines will be asked not to index it; the link is still public."} Saving later edits will not change the live page until you publish again.`,
      label: "Publish portfolio",
      action: async () => {
        const saved = await save();
        await api(`/api/portfolios/${saved.id}/publish`, "POST", {
          slug: parsed.data,
          indexable,
          confirm: true,
        });
        await refresh();
        setMessage("Published. Your portfolio link is ready below.");
      },
    });
  }
  return (
    <dialog
      ref={dialog}
      className="cloud-dialog"
      onCancel={onClose}
      aria-labelledby="cloud-title"
    >
      <div className="cloud-heading">
        <div>
          <p className="eyebrow">Your story, beyond this device</p>
          <h2 id="cloud-title">A home for your portfolio.</h2>
        </div>
        <button
          className="secondary"
          autoFocus
          onClick={onClose}
          aria-label="Close cloud panel"
        >
          Close
        </button>
      </div>
      {ready === null ? (
        <p role="status">Checking cloud availability…</p>
      ) : !ready ? (
        <div className="empty">
          <h3>Cloud services aren’t connected yet.</h3>
          <p>
            You can keep editing and exporting for free. To enable accounts and
            publishing, the site owner needs to connect Supabase Auth and the
            portfolio database.
          </p>
        </div>
      ) : !session ? (
        <>
          <p className="step-intro">
            An account is only needed for cloud saving and publishing. Your
            local draft stays here while you sign in.
          </p>
          <form onSubmit={(event) => void authenticate(event)}>
            <div className="field">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                maxLength={254}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={signup ? "new-password" : "current-password"}
                minLength={8}
                maxLength={128}
                required
              />
            </div>
            <button className="button" disabled={busy} type="submit">
              {signup ? "Create free account" : "Sign in"}
            </button>
            <button
              className="text-button auth-switch"
              type="button"
              disabled={busy}
              onClick={() => {
                setSignup(!signup);
                setMessage("");
              }}
            >
              {signup
                ? "Already have an account? Sign in"
                : "New here? Create a free account"}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="cloud-session">
            <span>Signed in</span>
            <button
              className="text-button"
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  const result = await supabase!.auth.signOut();
                  if (result.error)
                    throw new Error("Could not sign out. Try again.");
                  setMessage(
                    "Signed out. Local editing and exports remain available.",
                  );
                })
              }
            >
              Sign out
            </button>
          </div>
          <button
            className="button"
            disabled={busy}
            onClick={() =>
              void perform(async () => {
                await save();
                setMessage(
                  "Cloud draft saved. Your published page is unchanged.",
                );
              })
            }
          >
            Save current draft to cloud
          </button>
          <section className="publish-controls">
            <h3>Publish your current draft</h3>
            <div className="field">
              <label htmlFor="publish-slug">Portfolio address</label>
              <div className="slug-input">
                <span>/p/</span>
                <input
                  id="publish-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  minLength={3}
                  maxLength={64}
                  placeholder="your-name"
                  aria-describedby="slug-hint"
                />
              </div>
              <small id="slug-hint" className="field-hint">
                3–64 lowercase letters, numbers and single hyphens. Addresses
                are unique.
              </small>
            </div>
            <label className="indexing-option">
              <input
                type="checkbox"
                checked={indexable}
                onChange={(e) => setIndexable(e.target.checked)}
              />
              Allow search engines to index my published portfolio
            </label>
            <button
              className="secondary"
              disabled={busy}
              onClick={requestPublish}
            >
              {activeRecord?.is_published
                ? "Review & publish changes"
                : "Publish online"}
            </button>
            {activeRecord?.is_published && (
              <p className="live-link">
                <a
                  href={`/p/${activeRecord.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open your published portfolio
                </a>
              </p>
            )}
          </section>
          <section className="cloud-list">
            <h3>Your cloud portfolios</h3>
            {records.length === 0 ? (
              <p className="empty">
                No cloud drafts yet. Save this portfolio to keep it across
                devices.
              </p>
            ) : (
              records.map((record) => (
                <article className="cloud-row" key={record.id}>
                  <div>
                    <strong>{record.title}</strong>
                    <small>
                      {record.is_published ? "Published" : "Private draft"} ·{" "}
                      {new Date(record.updated_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="cloud-row-actions">
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() =>
                        setConfirmation({
                          title: "Open this cloud draft?",
                          description:
                            "This replaces your local draft. Save a JSON backup first if you want to keep it.",
                          label: "Open draft",
                          action: async () => {
                            const result = await api(
                              `/api/portfolios/${record.id}`,
                            );
                            onLoad(
                              portfolioSchema.parse(result.portfolio.data),
                              { id: record.id, owner: session.user.id },
                            );
                            setMessage("Cloud draft opened in the editor.");
                          },
                        })
                      }
                    >
                      Open
                    </button>
                    {record.is_published && (
                      <button
                        className="text-button"
                        disabled={busy}
                        onClick={() =>
                          setConfirmation({
                            title: "Unpublish this portfolio?",
                            description:
                              "Its public link will return a missing-page response and it will be removed from the sitemap. Your cloud draft is kept.",
                            label: "Unpublish",
                            action: async () => {
                              await api(
                                `/api/portfolios/${record.id}/unpublish`,
                                "POST",
                                {},
                              );
                              await refresh();
                              setMessage(
                                "Unpublished. Your cloud draft is still available.",
                              );
                            },
                          })
                        }
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() =>
                        setConfirmation({
                          title: "Delete this cloud portfolio?",
                          description:
                            "This permanently removes the cloud draft and its published page. Your current local draft is kept.",
                          label: "Delete portfolio",
                          action: async () => {
                            await api(
                              `/api/portfolios/${record.id}`,
                              "DELETE",
                              {},
                            );
                            if (link?.id === record.id) onLink(null);
                            await refresh();
                            setMessage("Cloud portfolio deleted.");
                          },
                        })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        </>
      )}
      {busy && (
        <p className="notice" role="status">
          Working… Your local draft is safe.
        </p>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {confirmation && (
        <ConfirmDialog
          title={confirmation.title}
          onClose={() => setConfirmation(null)}
          confirmLabel={confirmation.label}
          onConfirm={() => {
            const action = confirmation.action;
            setConfirmation(null);
            void perform(action);
          }}
        >
          <p>{confirmation.description}</p>
        </ConfirmDialog>
      )}
    </dialog>
  );
}
