export interface Suburb {
    id: number;
    name: string;
    state: string;
    postcode: string;
    slug: string;
}

export interface Segment {
    spec?: number;
}

export interface Doctor {
    id: number;
    slug: string;
    full_name: string;
    gender?: string;
    pre_triage_availability_type_id: string;
    profile_image_url: string;
    accepts_new_patients: boolean;
    does_not_accept_new_patients_call_to_discuss: boolean;
    does_not_accept_new_patients_message_html: string;
    statement?: string;
    statement_html?: string;
    position: number;
    call_to_book: boolean;
    visible_on_hot_doc: boolean;
    languages: any[];
    qualifications: string[];
    detail: boolean;
    segment: Segment;
    clinic_id: number;
    doctor_reason_ids: number[];
    doctor_interest_ids: any[];
    earliest_available?: string;
    has_bookings_support?: boolean;
    education?: any[];
    specialty?: string;
}

export interface DoctorReason {
    id: number;
    availability_type_id: number;
    duration: number;
    is_for_new: boolean;
    message: string;
    message_html: string;
    doctor_id: number;
    reason_id: number;
    deleted_at?: any;
    has_stipulations: boolean;
}

export interface Reason {
    id: number;
    name: string;
    position: number;
    bookable: boolean;
    message: string;
    message_html: string;
    deleted_at?: any;
    clinic_id: number;
    referral_prompted: boolean;
    referral_required: boolean;
    referral_collect: boolean;
    referral_collect_required: boolean;
    referral_upload: boolean;
    referral_upload_required: boolean;
    referral_absent_message_html?: any;
    does_not_perform_message_html: string;
    does_not_perform_call_to_discuss: boolean;
    reason_group_id?: number;
}

export interface ReasonGroup {
    id: number;
    name: string;
    slug: string;
    purpose: string;
    only_show_with_purpose: boolean;
}

export interface Theme {
    id: number;
    name: string;
    color_banner: string;
    color_buttons: string;
    color_links: string;
}

export interface Hour {
    label: string;
}

export interface Recurring {
    label: string;
    hours: Hour[];
}

export interface OpeningHours {
    recurring: Recurring[];
    seldom: any[];
}

export interface Segment2 {
    pms: number;
}

export interface Clinic {
    id: number;
    name: string;
    slug: string;
    street_address: string;
    phone: string;
    website: string;
    latitude: number;
    longitude: number;
    timezone: string;
    blurb: string;
    blurb_html: string;
    alert_message: string;
    alert_message_html: string;
    thumb_image_url: string;
    active: boolean;
    hidden: boolean;
    company_name?: any;
    has_mobile_check_in: boolean;
    uses_repeats_product: boolean;
    google_maps_url: string;
    google_maps_image_url: string;
    has_remote_walk_ins_support: boolean;
    has_remote_walk_ins_availability: boolean;
    remote_walk_ins_wait_time_min?: any;
    remote_walk_ins_wait_time_max?: any;
    remote_walk_ins_wait_time_urgency?: any;
    remote_walk_ins_contact_time_min?: any;
    remote_walk_ins_contact_time_max?: any;
    flags: string[];
    detail: boolean;
    maintenance_message_html?: any;
    opening_hours: OpeningHours;
    segment: Segment2;
    accepts_dva_card: boolean;
    accepts_healthcare_card: boolean;
    billing_type: string;
    wheelchair_access: boolean;
    payment_methods: string[];
    facilities: string[];
    accreditations: string[];
    suburb_id: number;
    doctor_ids: number[];
    reason_ids: number[];
    theme_id: number;
}

export interface RootObject {
    suburb: Suburb[];
    doctors: Doctor[];
    doctor_reasons: DoctorReason[];
    doctor_interests: any[];
    reasons: Reason[];
    reason_groups: ReasonGroup[];
    themes: Theme[];
    clinic: Clinic;
    errors?: ClinicError[]
}
export interface ClinicError {
    code: string;
    detail:string;
}

declare module namespace {

  export interface TimeSlot {
      id: string;
      day: string;
      label: string;
      start_time: string;
      end_time: string;
      duration: number;
      availability_type_id: string;
  }

  export interface Day {
      date: string;
  }

  export interface Doctor {
      id: number;
      detail: boolean;
  }

  export interface RootObject {
      time_slots: TimeSlot[];
      days: Day[];
      doctors: Doctor[];
  }
}
////////////////

export interface TimeSlot {
    id: string;
    day: string;
    label: string;
    start_time: string;
    end_time: string;
    duration: number;
    availability_type_id: string;
}

export interface TimeSlotDay {
    date: string;
}

export interface TimeSlotDoctor {
    id: number;
    detail: boolean;
    next_available?: string | null;
    /** Not sure if accurate */
    prev_available?: string | null;
}

export interface TimeSlotRootObject {
    time_slots: TimeSlot[];
    days: TimeSlotDay[];
    doctors: TimeSlotDoctor[];
}

export interface Label {
    long: string;
    short: string;
}

export interface OpenState {
    is_open: boolean;
    label: Label;
}

export interface ClinicSearch {
    id: number;
    image: string;
    name: string;
    slug: string;
    street_address: string;
    open_state: OpenState;
    suburb_id: number;
}

export interface SuburbSearch {
    id: number;
    name: string;
    state: string;
    postcode: string;
    slug: string;
}

export interface FeaturedInfoSearch {
    title: string;
    description: string;
    tone: string;
    icon: string;
}

export interface Match {
    entity_id: number;
    entity_type: string;
    distance: string;
    featured_infos: FeaturedInfoSearch[];
    clinic_id: number;
    doctor_id?: any;
    suburb_id: number;
}

export interface Paging {
    next_cursor: string;
}

export interface Meta {
    paging: Paging;
}

export interface ClinicSearchRootObject {
    clinics: ClinicSearch[];
    doctors: any[];
    suburbs: SuburbSearch[];
    matches: Match[];
    meta: Meta;
}

//////////

export interface FrontendClinicData {
    name: string,
    street_address: string,
    url: string,
    id_string: string

}
