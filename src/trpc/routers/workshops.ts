import { baseProcedure, createTRPCRouter } from '../init';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const workshopsRouter = createTRPCRouter({
  getWorkshopsByGroup: baseProcedure
    .input(z.object({
      group: z.string(),
    }))
    .query(async ({ input }) => {
      console.log('🔍 tRPC: Fetching workshops for group:', input.group);

      // Group mappings directly in the router
      const groupMappings: Record<string, string[]> = {
        'ey': ['EY A', 'EY B', 'EY C', 'EY D'],
        'senior_4': ['S4MPC + S4MEG', 'S4MCE', 'S4HGL + S4PCB'],
        'senior_5_group_a_b': ['S5 Group A+B'],
        'senior_5_customer_care': ['S5 Customer Care'],
        'senior_6_group_a_b': ['S6 Group A+B'],
        'senior_6_group_c': ['S6 Group C'],
        'senior_6_group_d': ['S6 Group D']
      };

      const classNames = groupMappings[input.group];
      if (!classNames) {
        console.log('🔍 tRPC: No group mapping found for:', input.group);
        return { success: true, data: [], count: 0 };
      }

      const crcClasses = await prisma.crc_class.findMany({
        where: {
          name: {
            in: classNames
          }
        }
      });

      const crcClassIds = crcClasses.map(c => c.id);
      
      if (crcClassIds.length === 0) {
        console.log('🔍 tRPC: No CRC classes found for group:', input.group);
        return { success: true, data: [], count: 0 };
      }

      const workshops = await prisma.workshops.findMany({
        where: {
          workshop_to_crc: {
            some: {
              crc_class_id: {
                in: crcClassIds
              }
            }
          }
        },
        include: {
          assignments: true,
          workshop_to_crc: {
            include: {
              crc_class: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      console.log(`✅ tRPC: Found ${workshops.length} workshops for group ${input.group}`);

      // Serialize the data to handle Date objects and BigInt fields
      const serializedWorkshops = workshops.map(workshop => ({
        ...workshop,
        id: workshop.id.toString(),
        created_at: workshop.created_at?.toISOString(),
        date: workshop.date?.toISOString(),
        assignments: workshop.assignments?.map(assignment => ({
          ...assignment,
          id: assignment.id.toString(),
          workshop_id: assignment.workshop_id?.toString(),
          created_at: assignment.created_at?.toISOString(),
          submission_idate: assignment.submission_idate?.toISOString()
        })),
        crc_classes: workshop.workshop_to_crc?.map(wtc => ({
          id: wtc.crc_class.id.toString(),
          name: wtc.crc_class.name
        })) || [],
        // Remove BigInt fields that can't be serialized
        workshop_to_crc: undefined
      }));

      return {
        success: true,
        data: serializedWorkshops,
        count: serializedWorkshops.length
      };
    }),

  getAllWorkshops: baseProcedure
    .query(async () => {
      console.log('🔍 tRPC: Fetching all workshops');

      const workshops = await prisma.workshops.findMany({
        include: {
          assignments: true,
          workshop_to_crc: {
            include: {
              crc_class: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      console.log(`✅ tRPC: Found ${workshops.length} workshops`);

      // Serialize the data to handle Date objects and BigInt fields
      const serializedWorkshops = workshops.map(workshop => ({
        ...workshop,
        id: workshop.id.toString(),
        created_at: workshop.created_at?.toISOString(),
        date: workshop.date?.toISOString(),
        assignments: workshop.assignments?.map(assignment => ({
          ...assignment,
          id: assignment.id.toString(),
          workshop_id: assignment.workshop_id?.toString(),
          created_at: assignment.created_at?.toISOString(),
          submission_idate: assignment.submission_idate?.toISOString()
        })),
        crc_classes: workshop.workshop_to_crc?.map(wtc => ({
          id: wtc.crc_class.id.toString(),
          name: wtc.crc_class.name
        })) || [],
        // Remove BigInt fields that can't be serialized
        workshop_to_crc: undefined
      }));

      return {
        success: true,
        data: serializedWorkshops,
        count: serializedWorkshops.length
      };
    }),
});
