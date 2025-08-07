/**
 * Utility functions for fetching workshops data
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Fetch all workshops
 * @param {Object} options - Query options
 * @param {string} options.crcClass - Filter by CRC class
 * @param {boolean} options.includeAssignments - Include assignment data
 * @returns {Promise<Object>} - Workshops data
 */
export async function fetchWorkshops(options = {}) {
  const { crcClass, includeAssignments = true } = options;
  
  const params = new URLSearchParams();
  if (crcClass) {
    params.append('crc_class', crcClass);
  }
  if (includeAssignments) {
    params.append('include_assignments', 'true');
  }

  const url = `${API_BASE_URL}/api/workshops?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch workshops');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching workshops:', error);
    throw error;
  }
}

/**
 * Fetch workshops by CRC class
 * @param {string} crcClass - CRC class to filter by
 * @param {boolean} includeAssignments - Include assignment data
 * @returns {Promise<Object>} - Workshops data
 */
export async function fetchWorkshopsByClass(crcClass, includeAssignments = true) {
  const params = new URLSearchParams();
  if (includeAssignments) {
    params.append('include_assignments', 'true');
  }

  const url = `${API_BASE_URL}/api/workshops/${crcClass}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch workshops');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching workshops by class:', error);
    throw error;
  }
}

/**
 * Fetch a single workshop by ID
 * @param {string|number} id - Workshop ID
 * @param {boolean} includeAssignments - Include assignment data
 * @returns {Promise<Object>} - Workshop data
 */
export async function fetchWorkshopById(id, includeAssignments = true) {
  const params = new URLSearchParams();
  if (includeAssignments) {
    params.append('include_assignments', 'true');
  }

  const url = `${API_BASE_URL}/api/workshops/${id}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch workshop');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching workshop by ID:', error);
    throw error;
  }
}

/**
 * Create a new workshop
 * @param {Object} workshopData - Workshop data
 * @returns {Promise<Object>} - Created workshop data
 */
export async function createWorkshop(workshopData) {
  const url = `${API_BASE_URL}/api/workshops`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workshopData),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create workshop');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating workshop:', error);
    throw error;
  }
}

/**
 * Update a workshop
 * @param {string|number} id - Workshop ID
 * @param {Object} workshopData - Updated workshop data
 * @returns {Promise<Object>} - Updated workshop data
 */
export async function updateWorkshop(id, workshopData) {
  const url = `${API_BASE_URL}/api/workshops/${id}`;
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workshopData),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update workshop');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating workshop:', error);
    throw error;
  }
}

/**
 * Delete a workshop
 * @param {string|number} id - Workshop ID
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteWorkshop(id) {
  const url = `${API_BASE_URL}/api/workshops/${id}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete workshop');
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting workshop:', error);
    throw error;
  }
}

/**
 * Get CRC class options for dropdowns
 * @returns {Array} - Array of CRC class options
 */
export const CRC_CLASS_OPTIONS = [
  { value: 'ey', label: 'EY' },
  { value: 'senior_4', label: 'Senior 4' },
  { value: 'senior_5_group_a_b', label: 'Senior 5 - Group A+B' },
  { value: 'senior_5_customer_care', label: 'Senior 5 - Customer Care' },
  { value: 'senior_6_group_a_b', label: 'Senior 6 - Group A+B' },
  { value: 'senior_6_group_c', label: 'Senior 6 - Group C' },
  { value: 'senior_6_group_d', label: 'Senior 6 - Group D' },
];

/**
 * Format workshop date for display
 * @param {string|Date} date - Workshop date
 * @returns {string} - Formatted date string
 */
export function formatWorkshopDate(date) {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get workshop group label from CRC class
 * @param {string} crcClass - CRC class value
 * @returns {string} - Human-readable label
 */
export function getWorkshopGroupLabel(crcClass) {
  const option = CRC_CLASS_OPTIONS.find(opt => opt.value === crcClass);
  return option ? option.label : crcClass;
} 