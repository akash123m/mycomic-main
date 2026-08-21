import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
export default async function ReaderDashboardLayout({children}:{children:React.ReactNode}){const session=await getSession();if(session?.role!=="READER")redirect("/signin?next=/dashboard");return children;}
