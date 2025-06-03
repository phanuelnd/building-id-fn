import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Building } from '../models/building.model';
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
}
