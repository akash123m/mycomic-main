"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import { queryKeys, requestJson } from "@/lib/api";

type Submission = { id: string; title: string; description: string; storyContent?: string; contentUrl?: string; coverUrl?: string; status: string; reviewNote?: string; user: { name: string; email: string }; comic?: { id: string; slug: string; title: string } };

export default function AdminSubmissionsPage() {
  const qc = useQueryClient(); const [status, setStatus] = useState("PENDING");
  const { data = [], isLoading, isError } = useQuery({ queryKey: queryKeys.adminSubmissions(status), queryFn: () => requestJson<Submission[]>(`/api/admin/submissions?status=${status}`) });
  const review = useMutation({ mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) => requestJson(`/api/admin/submissions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) }), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "submissions"] }) });
  return <div><SectionHeader title="Comic Submissions" subtitle="Review stories submitted by readers" /><div style={{ display: "flex", gap: 8, marginBottom: 20 }}>{["PENDING", "APPROVED", "REJECTED", "ALL"].map((value) => <button key={value} onClick={() => setStatus(value)} style={{ padding: "8px 12px", borderRadius: "var(--radius-full)", border: "1px solid var(--color-border)", background: status === value ? "var(--color-primary)" : "var(--color-bg-surface)" }}>{value}</button>)}</div>
    {isLoading ? <p>Loading submissions…</p> : isError ? <p style={{ color: "var(--color-error)" }}>Unable to load submissions.</p> : data.length === 0 ? <p>No {status.toLowerCase()} submissions.</p> : <div style={{ display: "grid", gap: 16 }}>{data.map((item) => <article key={item.id} style={{ padding: 20, borderRadius: "var(--radius-lg)", background: "var(--color-bg-surface)", border: "1px solid var(--color-border)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><h3>{item.title}</h3><p style={{ color: "var(--color-text-secondary)" }}>By {item.user.name} · {item.user.email}</p></div><strong style={{ color: "var(--color-primary)" }}>{item.status}</strong></div><p style={{ margin: "14px 0" }}>{item.description}</p>{item.storyContent && <details><summary>Read story</summary><p style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>{item.storyContent}</p></details>}<div style={{ display: "flex", gap: 10, marginTop: 16 }}>{item.status === "PENDING" && <><Button size="sm" onClick={() => review.mutate({ id: item.id, nextStatus: "APPROVED" })}>Approve</Button><Button size="sm" variant="secondary" onClick={() => review.mutate({ id: item.id, nextStatus: "REJECTED" })}>Reject</Button></>}{item.status === "APPROVED" && !item.comic && <Button size="sm" href={`/admin/comics/new?submission=${item.id}`}>Publish as comic</Button>}{item.comic && <Button size="sm" href={`/comic/${item.comic.slug}`}>View comic</Button>}</div></article>)}</div>}
  </div>;
}
