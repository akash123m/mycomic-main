import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){if(!(await getAdminSession()))return NextResponse.json({error:"Unauthorized"},{status:401});const{id}=await params;const{status,reviewNote}=await request.json();if(!["APPROVED","REJECTED"].includes(status))return NextResponse.json({error:"Invalid decision"},{status:400});return NextResponse.json(await db.chapter.update({where:{id},data:{approvalStatus:status,isVisible:status==="APPROVED",reviewNote:String(reviewNote??"").trim()||null}}));}
