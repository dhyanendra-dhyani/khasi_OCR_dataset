// ============================================================
// Khasi OCR Platform — Constants & Enums
// ============================================================

export const DATASET_CATEGORIES = [
    { value: 'textbook_worksheet', label: 'Textbook / Worksheet', description: 'Pages from textbooks, school worksheets, exam papers' },
    { value: 'notice_circular', label: 'Notice / Circular / Pamphlet', description: 'Official notices, circulars, pamphlets, leaflets' },
    { value: 'newspaper_magazine', label: 'Newspaper / Magazine', description: 'Newspaper clippings, magazine pages' },
    { value: 'form_register', label: 'Form / Register', description: 'Printed forms, registers, ledgers, applications' },
    { value: 'archive_old', label: 'Archive / Old / Photocopy', description: 'Historical documents, old archives, photocopies' },
    { value: 'other_printed', label: 'Other Printed', description: 'Any other printed Khasi document' },
] as const;

export const CAPTURE_TYPES = [
    { value: 'flatbed_scan', label: 'Flatbed Scanner' },
    { value: 'mobile_photo', label: 'Mobile Phone Photo' },
    { value: 'photocopy_scan', label: 'Photocopy Scan' },
    { value: 'pdf_render', label: 'PDF / Screenshot Render' },
    { value: 'other', label: 'Other' },
] as const;

// Reviewer/admin-only constants
export const SOURCE_TYPES = [
    { value: 'textbook', label: 'Textbook' },
    { value: 'notice', label: 'Notice' },
    { value: 'pamphlet', label: 'Pamphlet' },
    { value: 'newspaper', label: 'Newspaper' },
    { value: 'form', label: 'Form' },
    { value: 'register', label: 'Register' },
    { value: 'archive', label: 'Archive' },
    { value: 'photocopy', label: 'Photocopy' },
    { value: 'worksheet', label: 'Worksheet' },
    { value: 'church_bulletin', label: 'Church Bulletin' },
    { value: 'community_document', label: 'Community Document' },
    { value: 'other', label: 'Other' },
] as const;

export const QUALITY_LEVELS = [
    { value: 'clean', label: 'Clean', description: 'Clear text, no artifacts, good contrast', color: 'text-emerald-600' },
    { value: 'medium', label: 'Medium', description: 'Mostly readable, minor issues', color: 'text-amber-600' },
    { value: 'noisy', label: 'Noisy', description: 'Visible noise, some text hard to read', color: 'text-orange-600' },
    { value: 'very_noisy', label: 'Very Noisy', description: 'Significant degradation, many issues', color: 'text-red-600' },
] as const;

export const PAGE_STATUSES = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    { value: 'under_review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'approved', label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
    { value: 'needs_revision', label: 'Needs Revision', color: 'bg-orange-100 text-orange-700' },
    { value: 'archived', label: 'Archived', color: 'bg-slate-100 text-slate-700' },
] as const;

export const DISTRICTS_MEGHALAYA = [
    'East Khasi Hills',
    'West Khasi Hills',
    'South West Khasi Hills',
    'Eastern West Khasi Hills',
    'Ri-Bhoi',
    'East Jaintia Hills',
    'West Jaintia Hills',
    'East Garo Hills',
    'West Garo Hills',
    'South Garo Hills',
    'North Garo Hills',
    'South West Garo Hills',
];

export const USER_ROLES = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'reviewer', label: 'Reviewer' },
    { value: 'contributor', label: 'Contributor' },
] as const;

export const CONTRIBUTOR_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'active', label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-700' },
] as const;

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const MIN_IMAGE_WIDTH = 300;
export const MIN_IMAGE_HEIGHT = 300;
export const COMPRESSION_MAX_WIDTH = 2400;
export const COMPRESSION_QUALITY = 0.85;

export const REJECTION_REASONS = [
    'Image too blurry to read',
    'Image too dark / low contrast',
    'Not a Khasi language document',
    'Content is not printed text',
    'Heavy shadow or obstruction',
    'Incomplete page capture',
    'Duplicate of existing page',
    'Sensitive content without proper flagging',
    'Image is rotated or upside down',
    'File appears corrupted',
    'Other (see notes)',
] as const;
