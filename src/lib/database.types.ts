export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string; full_name: string; email: string; phone: string | null; institute: string | null;
                    district: string | null; state: string | null; preferred_language: string | null; avatar_url: string | null;
                    role: string; status: string; onboarding_completed: boolean; contribution_score: number;
                    created_at: string; updated_at: string;
                };
                Insert: {
                    id: string; full_name: string; email: string; phone?: string | null; institute?: string | null;
                    district?: string | null; state?: string | null; preferred_language?: string | null; avatar_url?: string | null;
                    role?: string; status?: string; onboarding_completed?: boolean; contribution_score?: number;
                };
                Update: {
                    id?: string; full_name?: string; email?: string; phone?: string | null; institute?: string | null;
                    district?: string | null; state?: string | null; preferred_language?: string | null; avatar_url?: string | null;
                    role?: string; status?: string; onboarding_completed?: boolean; contribution_score?: number;
                };
                Relationships: [];
            };
            upload_batches: {
                Row: {
                    id: string; contributor_id: string; category: string; title: string | null; total_pages: number;
                    status: string; submitted_at: string | null; created_at: string; updated_at: string;
                };
                Insert: {
                    id?: string; contributor_id: string; category: string; title?: string | null; total_pages?: number;
                    status?: string; submitted_at?: string | null;
                };
                Update: {
                    id?: string; contributor_id?: string; category?: string; title?: string | null; total_pages?: number;
                    status?: string; submitted_at?: string | null;
                };
                Relationships: [];
            };
            raw_pages: {
                Row: {
                    id: string; batch_id: string; contributor_id: string; category: string; original_file_path: string;
                    preview_file_path: string | null; original_filename: string | null; file_size: number | null;
                    file_hash: string | null; mime_type: string | null; width: number | null; height: number | null;
                    page_number: number | null; status: string; is_gold: boolean; gold_approved_by: string | null;
                    gold_approved_at: string | null; version: number; reviewer_notes: string | null;
                    admin_notes: string | null; created_at: string; updated_at: string;
                };
                Insert: {
                    id?: string; batch_id: string; contributor_id: string; category: string; original_file_path: string;
                    preview_file_path?: string | null; original_filename?: string | null; file_size?: number | null;
                    file_hash?: string | null; mime_type?: string | null; width?: number | null; height?: number | null;
                    page_number?: number | null; status?: string; is_gold?: boolean; version?: number;
                    reviewer_notes?: string | null; admin_notes?: string | null;
                    gold_approved_by?: string | null; gold_approved_at?: string | null;
                };
                Update: {
                    id?: string; batch_id?: string; contributor_id?: string; category?: string; original_file_path?: string;
                    preview_file_path?: string | null; original_filename?: string | null; file_size?: number | null;
                    file_hash?: string | null; mime_type?: string | null; width?: number | null; height?: number | null;
                    page_number?: number | null; status?: string; is_gold?: boolean; version?: number;
                    reviewer_notes?: string | null; admin_notes?: string | null;
                    gold_approved_by?: string | null; gold_approved_at?: string | null;
                };
                Relationships: [];
            };
            raw_page_metadata: {
                Row: {
                    id: string; page_id: string; document_title: string | null; source_type: string | null;
                    capture_type: string | null; language_primary: string | null; district: string | null;
                    source_institution: string | null; document_year: number | null; quality_level: string | null;
                    blur_present: boolean; shadow_present: boolean; skew_present: boolean; low_contrast: boolean;
                    faded_text: boolean; multi_column: boolean; contains_tables: boolean; contains_stamps: boolean;
                    contains_sensitive_info: boolean; consent_given: boolean; contributor_notes: string | null;
                    metadata_json: Json; created_at: string; updated_at: string;
                };
                Insert: {
                    id?: string; page_id: string; document_title?: string | null; source_type?: string | null;
                    capture_type?: string | null; language_primary?: string | null; district?: string | null;
                    source_institution?: string | null; document_year?: number | null; quality_level?: string | null;
                    blur_present?: boolean; shadow_present?: boolean; skew_present?: boolean; low_contrast?: boolean;
                    faded_text?: boolean; multi_column?: boolean; contains_tables?: boolean; contains_stamps?: boolean;
                    contains_sensitive_info?: boolean; consent_given?: boolean; contributor_notes?: string | null;
                    metadata_json?: Json;
                };
                Update: {
                    id?: string; page_id?: string; document_title?: string | null; source_type?: string | null;
                    capture_type?: string | null; language_primary?: string | null; district?: string | null;
                    source_institution?: string | null; document_year?: number | null; quality_level?: string | null;
                    blur_present?: boolean; shadow_present?: boolean; skew_present?: boolean; low_contrast?: boolean;
                    faded_text?: boolean; multi_column?: boolean; contains_tables?: boolean; contains_stamps?: boolean;
                    contains_sensitive_info?: boolean; consent_given?: boolean; contributor_notes?: string | null;
                    metadata_json?: Json;
                };
                Relationships: [];
            };
            review_actions: {
                Row: {
                    id: string; page_id: string; reviewer_id: string; action: string;
                    reason: string | null; notes: string | null; previous_status: string | null;
                    new_status: string | null; created_at: string;
                };
                Insert: {
                    id?: string; page_id: string; reviewer_id: string; action: string;
                    reason?: string | null; notes?: string | null; previous_status?: string | null;
                    new_status?: string | null;
                };
                Update: {
                    id?: string; page_id?: string; reviewer_id?: string; action?: string;
                    reason?: string | null; notes?: string | null; previous_status?: string | null;
                    new_status?: string | null;
                };
                Relationships: [];
            };
            quality_flags: {
                Row: {
                    id: string; page_id: string; flag_type: string; severity: string;
                    details: string | null; auto_detected: boolean; resolved: boolean;
                    resolved_by: string | null; created_at: string;
                };
                Insert: {
                    id?: string; page_id: string; flag_type: string; severity?: string;
                    details?: string | null; auto_detected?: boolean; resolved?: boolean;
                };
                Update: {
                    id?: string; page_id?: string; flag_type?: string; severity?: string;
                    details?: string | null; auto_detected?: boolean; resolved?: boolean;
                };
                Relationships: [];
            };
            detection_annotations: {
                Row: {
                    id: string; page_id: string; annotator_id: string | null; annotation_json: Json;
                    annotation_status: string; reviewed_by: string | null; reviewed_at: string | null;
                    version: number; notes: string | null; created_at: string; updated_at: string;
                };
                Insert: {
                    id?: string; page_id: string; annotator_id?: string | null; annotation_json?: Json;
                    annotation_status?: string; version?: number; notes?: string | null;
                };
                Update: {
                    id?: string; page_id?: string; annotator_id?: string | null; annotation_json?: Json;
                    annotation_status?: string; version?: number; notes?: string | null;
                };
                Relationships: [];
            };
            line_crops: {
                Row: {
                    id: string; page_id: string; crop_image_path: string; line_text: string | null;
                    text_status: string; crop_quality: string | null; source_bbox: Json | null;
                    created_by: string | null; reviewed_by: string | null; version: number;
                    remarks: string | null; created_at: string; updated_at: string;
                };
                Insert: {
                    id?: string; page_id: string; crop_image_path: string; line_text?: string | null;
                    text_status?: string; crop_quality?: string | null; source_bbox?: Json | null;
                    created_by?: string | null; version?: number; remarks?: string | null;
                };
                Update: {
                    id?: string; page_id?: string; crop_image_path?: string; line_text?: string | null;
                    text_status?: string; crop_quality?: string | null; source_bbox?: Json | null;
                    created_by?: string | null; version?: number; remarks?: string | null;
                };
                Relationships: [];
            };
            recognition_labels: {
                Row: {
                    id: string; crop_id: string; label_text: string; confidence: number | null;
                    labeled_by: string | null; verified_by: string | null; status: string; created_at: string;
                };
                Insert: {
                    id?: string; crop_id: string; label_text: string; confidence?: number | null;
                    labeled_by?: string | null; status?: string;
                };
                Update: {
                    id?: string; crop_id?: string; label_text?: string; confidence?: number | null;
                    labeled_by?: string | null; status?: string;
                };
                Relationships: [];
            };
            audit_logs: {
                Row: {
                    id: string; user_id: string | null; action: string; entity_type: string | null;
                    entity_id: string | null; details: Json; ip_address: string | null; created_at: string;
                };
                Insert: {
                    id?: string; user_id?: string | null; action: string; entity_type?: string | null;
                    entity_id?: string | null; details?: Json; ip_address?: string | null;
                };
                Update: {
                    id?: string; user_id?: string | null; action?: string; entity_type?: string | null;
                    entity_id?: string | null; details?: Json; ip_address?: string | null;
                };
                Relationships: [];
            };
            notifications: {
                Row: {
                    id: string; user_id: string; title: string; message: string; type: string;
                    read: boolean; link: string | null; created_at: string;
                };
                Insert: {
                    id?: string; user_id: string; title: string; message: string; type?: string;
                    read?: boolean; link?: string | null;
                };
                Update: {
                    id?: string; user_id?: string; title?: string; message?: string; type?: string;
                    read?: boolean; link?: string | null;
                };
                Relationships: [];
            };
            export_jobs: {
                Row: {
                    id: string; requested_by: string; export_type: string; filters: Json; status: string;
                    file_path: string | null; record_count: number | null; error_message: string | null;
                    created_at: string; completed_at: string | null;
                };
                Insert: {
                    id?: string; requested_by: string; export_type: string; filters?: Json; status?: string;
                };
                Update: {
                    id?: string; requested_by?: string; export_type?: string; filters?: Json; status?: string;
                    file_path?: string | null; record_count?: number | null; error_message?: string | null;
                    completed_at?: string | null;
                };
                Relationships: [];
            };
            system_settings: {
                Row: { key: string; value: Json; description: string | null; updated_by: string | null; updated_at: string; };
                Insert: { key: string; value: Json; description?: string | null; updated_by?: string | null; };
                Update: { key?: string; value?: Json; description?: string | null; updated_by?: string | null; };
                Relationships: [];
            };
        };
        Views: { [_ in never]: never };
        Functions: { [_ in never]: never };
        Enums: { [_ in never]: never };
        CompositeTypes: { [_ in never]: never };
    };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UploadBatch = Database['public']['Tables']['upload_batches']['Row'];
export type RawPage = Database['public']['Tables']['raw_pages']['Row'];
export type RawPageMetadata = Database['public']['Tables']['raw_page_metadata']['Row'];
export type ReviewAction = Database['public']['Tables']['review_actions']['Row'];
export type QualityFlag = Database['public']['Tables']['quality_flags']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type ExportJob = Database['public']['Tables']['export_jobs']['Row'];
