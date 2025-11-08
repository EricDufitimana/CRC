import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const body = await request.json();
    const { workshopId, classId, adminId, attendanceRecords } = body;

    if (!workshopId || !classId || !adminId || !attendanceRecords) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create attendance session
    const { data: sessionData, error: sessionError } = await supabase
      .from('attendance_sessions')
      .insert({
        workshop_id: workshopId,
        crc_class_id: classId,
        taken_by: adminId
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create attendance session' },
        { status: 500 }
      );
    }

    // Create attendance records for each student
    const recordsToInsert = attendanceRecords.map((record) => ({
      session_id: sessionData.id,
      student_id: record.studentId,
      status: record.status
    }));

    const { error: recordsError } = await supabase
      .from('attendance_records')
      .insert(recordsToInsert);

    if (recordsError) {
      console.error('Records creation error:', recordsError);
      return NextResponse.json(
        { error: 'Failed to create attendance records' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionData.id,
      message: 'Attendance recorded successfully'
    });

  } catch (error) {
    console.error('Attendance recording error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const workshopId = searchParams.get('workshopId');
    const date = searchParams.get('date');

    console.log('🔍 Attendance API called with params:', { classId, workshopId, date });

    // If no filters are provided, fetch all records directly
    if (!classId && !workshopId) {
      let query = supabase
        .from('attendance_records')
        .select(`
          *,
          student:students(
            id,
            student_id,
            first_name,
            last_name,
            major_short,
            grade,
            profile_picture
          ),
          session:attendance_sessions(
            id,
            crc_class_id,
            workshop_id,
            workshop:workshops(title, date),
            class:crc_class(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.gte('created_at', `${date}T00:00:00`).lt('created_at', `${date}T23:59:59`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Attendance fetch error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch attendance records', details: error.message },
          { status: 500 }
        );
      }

      console.log(`✅ Fetched ${data?.length || 0} attendance records (no filters)`);
      return NextResponse.json({ data: data || [] });
    }

    // If filters are provided, use two-step approach
    // First, get session IDs that match the filters
    let sessionQuery = supabase
      .from('attendance_sessions')
      .select('id');

    if (classId) {
      sessionQuery = sessionQuery.eq('crc_class_id', classId);
    }

    if (workshopId) {
      sessionQuery = sessionQuery.eq('workshop_id', workshopId);
    }

    const { data: sessions, error: sessionError } = await sessionQuery;

    if (sessionError) {
      console.error('Session fetch error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to fetch attendance sessions', details: sessionError.message },
        { status: 500 }
      );
    }

    // If no sessions match the filters, return empty array
    if (!sessions || sessions.length === 0) {
      console.log('⚠️ No sessions found matching filters');
      return NextResponse.json({ data: [] });
    }

    const sessionIds = sessions.map(s => s.id);
    console.log(`📋 Found ${sessionIds.length} matching sessions`);

    // Now fetch attendance records for those sessions
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        student:students(
          id,
          student_id,
          first_name,
          last_name,
          major_short,
          grade,
          profile_picture
        ),
        session:attendance_sessions(
          id,
          crc_class_id,
          workshop_id,
          workshop:workshops(title, date),
          class:crc_class(name)
        )
      `)
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false });

    if (date) {
      query = query.gte('created_at', `${date}T00:00:00`).lt('created_at', `${date}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Attendance fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch attendance records', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Fetched ${data?.length || 0} attendance records`);

    return NextResponse.json({ data: data || [] });

  } catch (error) {
    console.error('Attendance fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
