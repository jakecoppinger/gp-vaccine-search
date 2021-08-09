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
