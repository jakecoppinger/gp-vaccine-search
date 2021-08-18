export interface Suburb {
    id: number;
    name: string;
    state: string;
    postcode: string;
    slug: string;
}

export interface Match {
    entity_id: number;
    entity_type: string;
    suburb_id: number;
}

export interface SuburbSearchObject {
    suburbs: Suburb[];
    matches: Match[];
}

interface GlobalState {
  clinics: Clinic[];
  coordinates?: {
    latitude: number,
    longitude: number
  },
  suburb_code?: string;
  /** If true, and if currently in a loop loading availability times, cancel */
  cancel_loading_times?: boolean;
  currently_loading_times?: boolean;
}

export interface Clinic {
  url: string;
  name: string;
  id_string: string;
  street_address: string;
  suburb_name: string;
  next_appointment?: string | null;
  appointment_status: 'pending' | 'found' | 'call-clinic' | 'error' | 'bad-time';
}
export type OurWindow = Window & GlobalState & typeof globalThis;
