import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResponse, ProjectDto } from '@fullstack/types';
import { environment } from '../../../environments/environment';

export interface ProjectFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/projects`;

  list(filters: ProjectFilters = {}): Observable<PaginatedResponse<ProjectDto>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<ProjectDto>>(this.baseUrl, { params });
  }

  findOne(id: string): Observable<ProjectDto> {
    return this.http.get<ProjectDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<ProjectDto>): Observable<ProjectDto> {
    return this.http.post<ProjectDto>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<ProjectDto>): Observable<ProjectDto> {
    return this.http.put<ProjectDto>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
