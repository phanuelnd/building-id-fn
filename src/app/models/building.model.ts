export interface Building {
    id: number;
    building_id: string;
    status: string;
    province: string;
    district: string;
    sector: string;
    cell: string;
    village: string;
    longitude: number;
    latitude: number;
    data_source: string;
    created_at: string;
    updated_at: string;
    footprint: {
      type: string;
      coordinates: number[][][];
    };
    parcel_id?: string;
    permit_id?: string;
  }
  