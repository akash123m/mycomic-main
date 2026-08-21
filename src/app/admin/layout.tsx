"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, FileText, LayoutDashboard, LogOut, Mail, Newspaper, Palette, Settings, Users } from "lucide-react";
import LoadingState from "@/components/ui/LoadingState";
import { getSession, queryKeys, requestJson } from "@/lib/api";

const allItems = [["Overview","/admin",LayoutDashboard],["Comics","/admin/comics",BookOpen],["Chapter approvals","/admin/approvals",FileText],["Authors","/admin/authors",Users],["Submissions","/admin/submissions",FileText],["Contacts","/admin/contacts",Mail],["Newsletter","/admin/newsletter",Newspaper],["Users & History","/admin/users",Users],["Theme","/admin/theme",Palette],["Settings","/admin/settings",Settings]] as const;

export default function AdminLayout({children}:{children:React.ReactNode}){
  const path=usePathname(),router=useRouter(),qc=useQueryClient(); const login=path==="/admin/login";
  const {data:session,isLoading}=useQuery({queryKey:queryKeys.session,queryFn:getSession,enabled:!login});
  const authorAllowed=Boolean(session?.role==="AUTHOR"&&path.startsWith("/admin/comics"));
  const unauthorized=!login&&!isLoading&&session?.role!=="ADMIN"&&!authorAllowed;
  useEffect(()=>{if(unauthorized)router.replace(session?.role==="AUTHOR"?"/admin/comics":"/admin/login")},[unauthorized,router,session?.role]);
  const logout=useMutation({mutationFn:()=>requestJson("/api/auth/logout",{method:"POST"}),onSuccess:()=>{qc.clear();router.replace("/admin/login")}});
  if(login)return <>{children}</>;
  if(isLoading||unauthorized)return <LoadingState label={isLoading?"Verifying CMS session":"Redirecting securely"} variant="page"/>;
  const items=session?.role==="AUTHOR"?allItems.filter(([,href])=>href==="/admin/comics"):allItems;
  return <div className="admin-shell"><aside className="admin-sidebar"><div className="admin-brand"><strong>Admin Panel</strong><span>MyComic CMS</span></div><nav>{items.map(([label,href,Icon])=>{const active=href==="/admin"?path===href:path.startsWith(href);return <a key={href} href={href} className={active?"active":""}><span><Icon size={17}/></span>{label}</a>})}</nav><button className="admin-logout" onClick={()=>logout.mutate()} disabled={logout.isPending}><LogOut size={17}/>{logout.isPending?"Signing Out…":"Sign Out"}</button></aside><main className="admin-main">{children}</main><style jsx global>{`.admin-shell{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:calc(100dvh - 64px)}.admin-sidebar{position:sticky;top:64px;height:calc(100dvh - 64px);padding:24px 16px;background:var(--color-bg-surface);border-right:1px solid var(--color-border);display:flex;flex-direction:column}.admin-brand{padding:0 12px 18px}.admin-brand strong,.admin-brand span{display:block}.admin-brand span{font-size:12px;color:var(--color-primary);margin-top:3px}.admin-sidebar nav{display:grid;gap:5px}.admin-sidebar nav a{display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:10px;color:var(--color-text-secondary);text-decoration:none;font-size:13px;font-weight:650;border:1px solid transparent}.admin-sidebar nav a>span{width:29px;height:29px;display:grid;place-items:center;border-radius:8px;background:var(--color-bg-elevated);border:1px solid var(--color-border)}.admin-sidebar nav a.active{color:var(--color-primary);background:rgba(var(--color-primary-rgb),.09);border-color:rgba(var(--color-primary-rgb),.2)}.admin-logout{margin-top:auto;display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:10px;color:#f87171;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.18)}.admin-main{min-width:0;padding:clamp(20px,4vw,48px);background:var(--color-bg-base)}@media(max-width:800px){.admin-shell{grid-template-columns:1fr}.admin-sidebar{position:sticky;top:64px;z-index:20;height:auto;padding:9px;border:0;border-bottom:1px solid var(--color-border)}.admin-brand,.admin-logout{display:none}.admin-sidebar nav{display:flex;overflow-x:auto}.admin-sidebar nav a{flex:0 0 auto;flex-direction:column;gap:3px;padding:6px 9px;font-size:10px}.admin-sidebar nav a>span{width:25px;height:25px}.admin-main{padding:18px 12px}}`}</style></div>;
}
