import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getReaderSession } from "@/lib/auth";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){const session=await getReaderSession();if(!session)return NextResponse.json({error:"Reader login required"},{status:401});const{id}=await params;try{const comic=await db.$transaction(async tx=>{await tx.userLike.create({data:{userId:session.id,comicId:id}});return tx.comic.update({where:{id},data:{likes:{increment:1}},select:{likes:true}})});return NextResponse.json({liked:true,likes:comic.likes})}catch(error){if(error instanceof Prisma.PrismaClientKnownRequestError&&error.code==="P2002"){const comic=await db.comic.findUnique({where:{id},select:{likes:true}});return NextResponse.json({liked:true,likes:comic?.likes??0})}return NextResponse.json({error:"Failed to save like"},{status:500})}}
