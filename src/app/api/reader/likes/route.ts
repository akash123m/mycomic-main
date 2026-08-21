import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getReaderSession } from "@/lib/auth";
export async function GET(){const session=await getReaderSession();if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json(await db.userLike.findMany({where:{userId:session.id},orderBy:{createdAt:"desc"},include:{comic:{select:{id:true,slug:true,title:true,coverImage:true,author:true}}}}));}
