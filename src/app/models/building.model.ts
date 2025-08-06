export interface Building {
    id: number;
    building_id: string;
    status: string;
    footprint: {
      type: string;
      coordinates: number[][][];
    };
    longitude: number;
    latitude: number;
    province: string;
    sector: string;
    district: string;
    cell: string;
    village: string;
    data_source: string;
    created_at: string;
    updated_at: string;
    parcel_id?: string;
    permit_id?: string;
  }
  
export interface BuildingSearchResponse {
  building: Building | null;
  found: boolean;
  message?: string;
}
  