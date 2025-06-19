import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { Building, BuildingSearchResponse } from '../models/building.model';
import { environment } from '../environments/environment';

export interface BuildingListResponse {
  data: Building[];
  total: number;
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
}

