import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
export async function GET(){if(!(await getAdminSession()))return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json(await db.chapter.findMany({where:{approvalStatus:"PENDING"},orderBy:{createdAt:"asc"},include:{comic:{select:{id:true,title:true,submittedBy:{select:{name:true,username:true}}}},pages:{orderBy:{pageNumber:"asc"}}}}));}
