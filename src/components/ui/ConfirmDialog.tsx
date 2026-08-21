"use client";

import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type ConfirmState = { title:string; description:string; confirmLabel?:string; tone?:"danger"|"warning"|"default"; onConfirm:()=>void } | null;

export function ConfirmDialog({state,onClose,busy=false}:{state:ConfirmState;onClose:()=>void;busy?:boolean}){
  if(!state)return null; const Icon=state.tone==="danger"?AlertTriangle:Info;
  return <div className="confirm-backdrop" role="presentation" onMouseDown={e=>e.target===e.currentTarget&&!busy&&onClose()}><section className={`confirm-dialog ${state.tone??"default"}`} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><button className="confirm-close" onClick={onClose} disabled={busy} aria-label="Close dialog"><X size={18}/></button><span className="confirm-icon"><Icon size={22}/></span><h2 id="confirm-title">{state.title}</h2><p id="confirm-description">{state.description}</p><div className="confirm-actions"><button onClick={onClose} disabled={busy}>Cancel</button><button className="confirm-primary" onClick={()=>state.onConfirm()} disabled={busy}>{busy?"Working…":state.confirmLabel??"Confirm"}</button></div></section></div>
}

export function ActionToast({message,tone="success",onClose}:{message:string;tone?:"success"|"error";onClose:()=>void}){return <div className={`action-toast ${tone}`} role="status"><CheckCircle2 size={18}/><span>{message}</span><button onClick={onClose} aria-label="Dismiss notification"><X size={15}/></button></div>}
