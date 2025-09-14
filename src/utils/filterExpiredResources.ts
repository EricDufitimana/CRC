/**
 * Filters out resources that have deadlines more than a week old
 * @param resources Array of resources with opportunity_deadline field
 * @returns Filtered array with only current resources
 */
export function filterExpiredResources<T extends { opportunity_deadline?: string }>(
  resources: T[]
): T[] {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return resources.filter((resource) => {
    // If no deadline is set, keep the resource
    if (!resource.opportunity_deadline) {
      return true;
    }

    // Parse the deadline date
    const deadlineDate = new Date(resource.opportunity_deadline);
    
    // If deadline is invalid, keep the resource
    if (isNaN(deadlineDate.getTime())) {
      return true;
    }

    // Only keep resources with deadlines within the last week or in the future
    return deadlineDate >= oneWeekAgo;
  });
}
