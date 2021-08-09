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
  state: Clinic[];
}

export interface Clinic {
  url: string;
  name: string;
  id_string: string;
  street_address: string;
  next_appointment?: string;
  appointment_status: 'pending' | 'found' | 'call-clinic' | 'error' | 'bad-time';
}
export type OurWindow = Window & GlobalState & typeof globalThis;
