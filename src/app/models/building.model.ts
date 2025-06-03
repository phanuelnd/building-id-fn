export interface Building {
    id: number;
    building_id: string;
    parcel_id: string;
    permit_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    footprint?: string | null;
  }
  