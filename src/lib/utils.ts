import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return inputs.filter(Boolean).join(' ');
}

// We use a simple cn utility instead of tailwind-merge to avoid extra dependency
// clsx is imported as a lightweight utility
export { clsx };

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '…';
}

export function slugify(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export async function computeFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

export function isValidFileType(file: File, allowed: string[]): boolean {
    return allowed.includes(file.type);
}

export function getCategoryLabel(value: string): string {
    const map: Record<string, string> = {
        textbook_scan: 'Textbook Scan',
        notice_scan: 'Notice / Circular',
        pamphlet_scan: 'Pamphlet / Leaflet',
        newspaper_scan: 'Newspaper / Magazine',
        form_scan: 'Form / Application',
        register_scan: 'Register / Ledger',
        archive_scan: 'Archive / Old Document',
        photocopy_scan: 'Photocopy',
        worksheet_scan: 'Worksheet / Exercise',
        church_bulletin_scan: 'Church Bulletin',
        community_document_scan: 'Community Document',
        other_printed_scan: 'Other Printed',
    };
    return map[value] || value;
}

export function getStatusColor(status: string): string {
    const map: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700',
        submitted: 'bg-blue-100 text-blue-700',
        under_review: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-red-100 text-red-700',
        needs_revision: 'bg-orange-100 text-orange-700',
        archived: 'bg-slate-100 text-slate-700',
        pending: 'bg-yellow-100 text-yellow-700',
        active: 'bg-emerald-100 text-emerald-700',
        suspended: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
}
