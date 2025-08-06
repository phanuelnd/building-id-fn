import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { Building, BuildingSearchResponse } from '../models/building.model';
import { environment } from '../environments/environment.development';

export interface BuildingListResponse {
  data: Building[];
  total: number;
}

export interface UPISearchResponse {
  buildings: Building[];
  found: boolean;
  message?: string;
}

export interface CoordinateSearchResponse {
  building: Building | null;
  found: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class BuildingsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/buildings`;

  constructor(private http: HttpClient) {}

  getBuildings(params: {
    page?: number;
    limit?: number;
    search?: string;
    statusFilter?: string;
    parcelIdFilter?: string;
    permitIdFilter?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }): Observable<BuildingListResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value as string);
      }
    });
    return this.http.get<BuildingListResponse>(this.baseUrl, { params: httpParams });
  }

  getBuilding(id: number): Observable<Building> {
    return this.http.get<Building>(`${this.baseUrl}/${id}`);
  }

  searchBuildingById(buildingId: string): Observable<BuildingSearchResponse> {
    return this.http.get<Building>(`${this.baseUrl}/building_id/${buildingId}`)
      .pipe(
        map(building => ({
          building,
          found: true
        })),
        catchError(error => {
          console.error('Building search error:', error);
          return of({
            building: null,
            found: false,
            message: error.status === 404 ? 'Building not found' : 'Search failed'
          });
        })
      );
  }

  searchBuildingsByUPI(parcelId: string): Observable<UPISearchResponse> {
    const params = new HttpParams().set('parcel_id', parcelId);
    return this.http.get<Building[]>(`${this.baseUrl}/parcel`, { params })
      .pipe(
        map(buildings => ({
          buildings,
          found: buildings.length > 0
        })),
        catchError(error => {
          console.error('UPI search error:', error);
          return of({
            buildings: [],
            found: false,
            message: error.status === 404 ? 'No buildings found for this UPI' : 'Search failed'
          });
        })
      );
  }

  searchBuildingByCoordinates(latitude: number, longitude: number, tolerance: number = 0.0001): Observable<CoordinateSearchResponse> {
    const params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString())
      .set('tolerance', tolerance.toString());
    
    return this.http.get<Building>(`${this.baseUrl}/coordinates`, { params })
      .pipe(
        map(building => ({
          building,
          found: true
        })),
        catchError(error => {
          console.error('Coordinate search error:', error);
          return of({
            building: null,
            found: false,
            message: error.status === 404 ? 'No building found at this location' : 'Search failed'
          });
        })
      );
  }
}

