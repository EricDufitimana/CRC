import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

// Helper to serialize BigInt
function serialize(obj) {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
  )
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')
    const selectedClassId = searchParams.get('selectedClassId')

    console.log('🔍 DEBUG - Assignments route called with:', {
      assignmentId,
      selectedClassId,
      searchParams: Object.fromEntries(searchParams),
      url: request.url
    })

    // Always provide a lightweight list of assignments for selectors
    const assignments = await prisma.assignments.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        submission_idate: true,
        submission_style: true,
        created_at: true,
        workshops: { 
          select: { 
            id: true, 
            title: true,
            workshop_to_crc: {
              include: {
                crc_class: {
                  select: { id: true, name: true }
                }
              }
            }
          } 
        },
        _count: { select: { submissions: true } },
      },
    })

    console.log('📚 DEBUG - Found assignments:', {
      count: assignments.length,
      firstAssignment: assignments[0] ? {
        id: assignments[0].id.toString(),
        title: assignments[0].title,
        description: assignments[0].description,
        submission_idate: assignments[0].submission_idate,
        workshop: assignments[0].workshops
      } : null
    })

    const studentsCount = await prisma.students.count()

    if (!assignmentId) {
      // List mode
      console.log('📝 DEBUG - List mode - returning assignments list')
      const list = assignments.map((a) => ({
        id: a.id.toString(),
        title: a.title,
        description: a.description,
        submission_idate: a.submission_idate,
        submission_style: a.submission_style,
        created_at: a.created_at,
        workshop_title: a.workshops?.title ?? null,
        workshop_id: a.workshops?.id?.toString() ?? null,
        workshop_crc_class: a.workshops?.workshop_to_crc?.[0]?.crc_class?.name ?? null,
        crc_class_id: a.workshops?.workshop_to_crc?.[0]?.crc_class?.id?.toString() ?? null,
        crc_class_name: a.workshops?.workshop_to_crc?.[0]?.crc_class?.name ?? null,
        total_submitted: a._count.submissions,
        total_students: studentsCount,
      }))
      
      console.log('📋 DEBUG - List response:', {
        assignmentsCount: list.length,
        firstListItem: list[0]
      })
      
      return NextResponse.json({ assignments: serialize(list) })
    }

    // Detail mode for one assignment
    console.log('🎯 DEBUG - Detail mode for assignment:', assignmentId)
    
    const assignment = await prisma.assignments.findUnique({
      where: { id: BigInt(assignmentId) },
      select: {
        id: true,
        title: true,
        description: true,
        submission_idate: true,
        submission_style: true,
        created_at: true,
        workshops: { 
          select: { 
            id: true, 
            title: true,
            workshop_to_crc: {
              include: {
                crc_class: {
                  select: { id: true, name: true }
                }
              }
            }
          } 
        },
      },
    })

    console.log('📄 DEBUG - Assignment found:', {
      exists: !!assignment,
      assignment: assignment ? {
        id: assignment.id.toString(),
        title: assignment.title,
        description: assignment.description,
        submission_idate: assignment.submission_idate,
        submission_style: assignment.submission_style,
        workshop: assignment.workshops
      } : null
    })

    if (!assignment) {
      console.log('❌ DEBUG - Assignment not found')
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const submissions = await prisma.submissions.findMany({
      where: { assignment_id: BigInt(assignmentId) },
      select: {
        id: true,
        student_id: true,
        google_doc_link: true,
        file_upload_link: true,
        submitted_at: true,
      },
      orderBy: { submitted_at: 'desc' },
    })

    console.log('📥 DEBUG - Submissions found:', {
      count: submissions.length,
      firstSubmission: submissions[0] ? {
        id: submissions[0].id.toString(),
        student_id: submissions[0].student_id.toString(),
        google_doc_link: submissions[0].google_doc_link,
        file_upload_link: submissions[0].file_upload_link,
        submitted_at: submissions[0].submitted_at
      } : null
    })

    const submissionByStudent = new Map(
      submissions.map((s) => [s.student_id.toString(), s])
    )

    // Use selectedClassId if provided, otherwise fall back to workshop's first CRC class
    const targetClassId = selectedClassId || assignment.workshops?.workshop_to_crc?.[0]?.crc_class?.id?.toString()
    console.log('🎯 DEBUG - Target class ID for filtering:', {
      selectedClassId,
      fallbackClassId: assignment.workshops?.workshop_to_crc?.[0]?.crc_class?.id?.toString(),
      finalTargetClassId: targetClassId,
      assignmentWorkshop: assignment.workshops?.title,
      workshopCrcClasses: assignment.workshops?.workshop_to_crc?.map(wtc => ({
        id: wtc.crc_class.id.toString(),
        name: wtc.crc_class.name
      }))
    })
    
    // Build the where clause for student filtering
    let studentWhereClause = {};
    
    if (targetClassId) {
      studentWhereClause = {
        crc_class_id: BigInt(targetClassId)
      };
    }
    
    console.log('🎯 DEBUG - Student where clause:', studentWhereClause)
    
    const students = await prisma.students.findMany({
      where: studentWhereClause,
      select: { 
        id: true, 
        first_name: true, 
        last_name: true, 
        email: true,
        crc_class: {
          select: { name: true }
        }
      },
      orderBy: [{ first_name: 'asc' }, { last_name: 'asc' }],
    })

    console.log('👥 DEBUG - Students found:', {
      count: students.length,
      targetClassId,
      studentWhereClause,
      firstStudent: students[0] ? {
        id: students[0].id.toString(),
        name: `${students[0].first_name} ${students[0].last_name}`,
        crc_class: students[0].crc_class
      } : null
    })

    const rows = students.map((s) => {
      const sub = submissionByStudent.get(s.id.toString())
      const submitted = Boolean(sub)
      const submittedAt = sub?.submitted_at ?? null
      const onTime = submittedAt
        ? new Date(submittedAt).getTime() <= new Date(assignment.submission_idate).getTime()
        : null
      const submissionType = submitted
        ? sub?.file_upload_link
                          ? 'File upload'
          : sub?.google_doc_link
          ? 'Google link'
          : 'Unknown'
        : 'N/A'

      return serialize({
        student_id: s.id.toString(),
        name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim(),
        email: s.email ?? '',
        status: submitted ? 'submitted' : 'not_yet_submitted',
        submitted_at: submittedAt,
        submission_type: submissionType,
        on_time: onTime,
        google_doc_link: sub?.google_doc_link ?? null,
        file_upload_link: sub?.file_upload_link ?? null,
        view_url: sub?.file_upload_link ?? sub?.google_doc_link ?? null,
        crc_class_name: s.crc_class?.name ?? null,
      })
    })

    const result = {
      assignment: serialize({
        id: assignment.id.toString(),
        title: assignment.title,
        description: assignment.description,
        submission_idate: assignment.submission_idate,
        submission_style: assignment.submission_style,
        created_at: assignment.created_at,
        workshop_title: assignment.workshops?.title ?? null,
        workshop_crc_class: assignment.workshops?.workshop_to_crc?.[0]?.crc_class?.name ?? null,
      }),
      metrics: {
        total_students: students.length,
        total_submitted: submissions.length,
      },
      rows,
      assignments: assignments.map((a) => ({ 
        id: a.id.toString(), 
        title: a.title, 
        workshop_title: a.workshops?.title ?? null,
        workshop_crc_class: a.workshops?.workshop_to_crc?.[0]?.crc_class?.name ?? null
      })),
    }

    console.log('✅ DEBUG - Final result:', {
      assignmentData: {
        id: result.assignment.id,
        title: result.assignment.title,
        description: result.assignment.description,
        submission_idate: result.assignment.submission_idate,
        workshop_title: result.assignment.workshop_title
      },
      metrics: result.metrics,
      rowsCount: result.rows.length,
      firstRow: result.rows[0] || null,
      assignmentsListCount: result.assignments.length
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('💥 DEBUG - Error in assignments route:', {
      error: err,
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    })
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


