import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request) {
  try {
    console.log('🔍 API: update-profile route called');
    
    // Check if the request contains form data (for file uploads) or JSON data
    const contentType = request.headers.get('content-type');
    let requestData;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle form data (for file uploads)
      const formData = await request.formData();
      requestData = {
        studentId: formData.get('student_id'),
        userId: formData.get('user_id'),
        avatarFile: formData.get('avatar'),
        academicReportFile: formData.get('academic_report'),
        resumeLink: formData.get('resume_link'),
        avatarPath: formData.get('avatar_path'),
        profileBackground: formData.get('profile_background')
      };
    } else {
      // Handle JSON data
      requestData = await request.json();
    }

    console.log('🔍 API: Received data:', {
      studentId: requestData.studentId ? 'Present' : 'Missing',
      userId: requestData.userId ? 'Present' : 'Missing',
      avatarFile: requestData.avatarFile ? 'Present' : 'Missing',
      academicReportFile: requestData.academicReportFile ? 'Present' : 'Missing',
      resumeLink: requestData.resumeLink ? 'Present' : 'Missing',
      avatarPath: requestData.avatarPath ? 'Present' : 'Missing',
      profileBackground: requestData.profileBackground ? 'Present' : 'Missing'
    });

    // Validate required fields
    if (!requestData.studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    if (!requestData.userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify the student exists and belongs to the user
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, first_name, last_name, user_id')
      .eq('id', requestData.studentId)
      .eq('user_id', requestData.userId)
      .single();

    if (studentError || !student) {
      console.error('❌ API: Student verification failed:', studentError);
      return NextResponse.json({ error: "Student not found or unauthorized" }, { status: 404 });
    }

    console.log('✅ API: Student verified:', { id: student.id, name: `${student.first_name} ${student.last_name}` });

    const updateData = {};
    const results = {};

    // Handle avatar file upload
    if (requestData.avatarFile && requestData.avatarFile.name) {
      console.log('🔍 API: Processing avatar file upload...');
      
      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(requestData.avatarFile.type)) {
          return NextResponse.json({ error: "Only JPEG, PNG, GIF, and WebP images are allowed for avatars" }, { status: 400 });
        }

        // Validate file size (2MB limit for avatars)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (requestData.avatarFile.size > maxSize) {
          return NextResponse.json({ error: "Avatar file size must be less than 2MB" }, { status: 400 });
        }

        const studentName = `${student.first_name}_${student.last_name}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        const ext = requestData.avatarFile.name.split('.').pop() ?? 'jpg';
        const key = crypto.randomUUID();
        const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const path = `personal/${studentName}_${requestData.studentId}/${currentDate}/${key}.${ext}`;

        console.log('🔍 API: Avatar upload details:', {
          originalName: requestData.avatarFile.name,
          extension: ext,
          generatedKey: key,
          currentDate,
          uploadPath: path,
          fileSize: requestData.avatarFile.size,
          fileType: requestData.avatarFile.type
        });

        console.log('🔍 API: Uploading avatar to Supabase storage...');
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, requestData.avatarFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: requestData.avatarFile.type || "image/jpeg",
          });

        if (uploadError) {
          console.error('❌ API: Avatar upload failed:', uploadError);
          return NextResponse.json({ error: uploadError.message || "Avatar upload failed" }, { status: 500 });
        }

        console.log('✅ API: Avatar uploaded successfully to path:', path);

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);
        const avatarUrl = publicUrlData?.publicUrl || null;

        updateData.profile_picture = path;
        results.avatarUpload = {
          success: true,
          avatarPath: path,
          avatarUrl: avatarUrl
        };

      } catch (uploadError) {
        console.error('❌ API: Avatar upload error:', uploadError);
        return NextResponse.json({ error: uploadError.message || "Avatar upload failed" }, { status: 500 });
      }
    }

    // Handle avatar path (for existing avatars)
    if (requestData.avatarPath) {
      console.log('🔍 API: Setting avatar path...');
      updateData.profile_picture = requestData.avatarPath;
      results.avatarPath = {
        success: true,
        avatarPath: requestData.avatarPath
      };
    }

    // Handle profile background
    if (requestData.profileBackground) {
      console.log('🔍 API: Setting profile background...');
      updateData.profile_background = requestData.profileBackground;
      results.profileBackground = {
        success: true,
        profileBackground: requestData.profileBackground
      };
    }

    // Handle document uploads using the uploadDocuments action
    if (requestData.academicReportFile && requestData.academicReportFile.name) {
      console.log('🔍 API: Processing documents using uploadDocuments action...');
      
      try {
        // Import the uploadDocuments action
        const { uploadStudentDocuments } = await import('@/actions/students/uploadDocuments');
        
        // Create FormData for the uploadDocuments action
        const documentFormData = new FormData();
        documentFormData.append('student_id', requestData.studentId);
        documentFormData.append('user_id', requestData.userId);
        documentFormData.append('academic_report', requestData.academicReportFile);
        
        if (requestData.resumeLink && requestData.resumeLink.trim()) {
          documentFormData.append('resume_link', requestData.resumeLink.trim());
        }

        console.log('🔍 API: Calling uploadStudentDocuments action...');
        const documentResult = await uploadStudentDocuments(null, documentFormData);
        
        if (documentResult.success) {
          console.log('✅ API: Document processing completed:', documentResult.data);
          
          // Update the results with document processing info
          results.academicReport = {
            success: true,
            reportPath: documentResult.data.academicReportPath,
            extractedGPA: documentResult.data.extractedGPA,
            gpaConfidence: documentResult.data.gpaConfidence,
            gpaReasoning: documentResult.data.gpaReasoning
          };
          
          if (documentResult.data.resumeLink) {
            results.resumeLink = {
              success: true,
              resumeLink: documentResult.data.resumeLink
            };
          }
          
          // Note: The uploadDocuments action already updates the database with the document paths and GPA
          // So we don't need to add them to updateData here
          
        } else {
          console.error('❌ API: Document processing failed:', documentResult.message);
          return NextResponse.json({ 
            error: `Document processing failed: ${documentResult.message}` 
          }, { status: 500 });
        }

      } catch (documentError) {
        console.error('❌ API: Document processing error:', documentError);
        return NextResponse.json({ 
          error: `Document processing error: ${documentError.message || 'Unknown error'}` 
        }, { status: 500 });
      }
    } else if (requestData.resumeLink && requestData.resumeLink.trim()) {
      // Handle resume link only (no academic report)
      console.log('🔍 API: Setting resume link only...');
      updateData.resume_link = requestData.resumeLink.trim();
      results.resumeLink = {
        success: true,
        resumeLink: requestData.resumeLink.trim()
      };
    }

    // Update student record with all the changes
    if (Object.keys(updateData).length > 0) {
      console.log('🔍 API: Updating student record with data:', updateData);
      const { error: updateError } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', requestData.studentId);

      if (updateError) {
        console.error('❌ API: Failed to update student record:', updateError);
        return NextResponse.json({ error: "Failed to update student record" }, { status: 500 });
      }

      console.log('✅ API: Student record updated successfully');
    }

    console.log('✅ API: Profile update completed successfully');
    return NextResponse.json({ 
      success: true, 
      message: "Profile updated successfully",
      data: results
    });

  } catch (error) {
    console.error('❌ API: Unexpected error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    }, { status: 500 });
  }
}
