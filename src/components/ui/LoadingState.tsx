import { LoaderCircle } from "lucide-react";

export default function LoadingState({label="Loading",variant="section"}:{label?:string;variant?:"inline"|"section"|"page"}){
  return <div className={`loading-state loading-${variant}`} role="status" aria-live="polite"><span className="loading-mark"><LoaderCircle aria-hidden size={variant==="inline"?16:22}/><i/></span><span>{label}</span><span className="sr-only">Please wait</span></div>
}
