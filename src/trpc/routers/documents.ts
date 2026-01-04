import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const documentsRouter = createTRPCRouter({
  updateStudentDocuments: baseProcedure
    .input(z.object({
      studentId: z.number(),
      academicReportPath: z.string().optional(),
      resumeLink: z.string().optional(),
      extractedGPA: z.number().optional(),
      gpaConfidence: z.number().optional(),
      gpaReasoning: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        console.log('🔍 [tRPC Documents] Updating student documents:', input);
        
        const updateData: any = {};
        
        if (input.academicReportPath) {
          updateData.academic_report_path = input.academicReportPath;
        }
        
        if (input.resumeLink && input.resumeLink.trim()) {
          updateData.resume_link = input.resumeLink.trim();
        }
        
        // Update GPA if provided
        if (input.extractedGPA !== null && input.extractedGPA !== undefined) {
          updateData.gpa = input.extractedGPA;
          console.log('✅ [tRPC Documents] Updating student GPA to:', input.extractedGPA);
        }

        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('students')
            .update(updateData)
            .eq('id', input.studentId);

          if (updateError) {
            console.error('❌ [tRPC Documents] Failed to update student record:', updateError);
            throw new Error("Failed to update student record");
          }

          console.log('✅ [tRPC Documents] Student record updated successfully');
        }

        return { 
          success: true, 
          message: "Documents updated successfully"
        };

      } catch (error) {
        console.error('❌ [tRPC Documents] Error:', error);
        throw new Error(error instanceof Error ? error.message : "An unexpected error occurred");
      }
    }),

  getStudentDocuments: baseProcedure
    .input(z.object({
      studentId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('academic_report_path, resume_link, gpa')
          .eq('id', input.studentId)
          .single();

        if (error) {
          throw new Error('Failed to fetch student documents');
        }

        return data;
      } catch (error) {
        console.error('❌ [tRPC Documents] Error fetching documents:', error);
        throw new Error(error instanceof Error ? error.message : "Failed to fetch documents");
      }
    }),

  processReportCard: baseProcedure
    .input(z.object({
      filePath: z.string(),
      useFallback: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      try {
        console.log('🔍 [tRPC Documents] Processing report card:', input.filePath);
        
        const reportProcessingResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/scan_report_card_ai`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({
            filePath: input.filePath,
            useFallback: input.useFallback,
          })
        });

        if (!reportProcessingResponse.ok) {
          throw new Error(`Report processing failed with status: ${reportProcessingResponse.status}`);
        }

        const reportData = await reportProcessingResponse.json();
        console.log('📊 [tRPC Documents] Report processing result:', reportData);
        
        return reportData;
      } catch (error) {
        console.error('❌ [tRPC Documents] Report processing error:', error);
        throw new Error(error instanceof Error ? error.message : "Report processing failed");
      }
    }),
});
