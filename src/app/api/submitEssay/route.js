import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try{
    data = await req.json()
    
    const result = await prisma.essay_requests.create({
      data: data
    })
    return NextResponse.json({
      success: true,
      message: 'Essay submitted successfully',
      data: result
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
    })
  }
}