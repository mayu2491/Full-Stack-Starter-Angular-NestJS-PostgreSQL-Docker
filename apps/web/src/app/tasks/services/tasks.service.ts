import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResponse, TaskDto } from '@fullstack/types';
import { environment } from '../../../environments/environment';

export interface TaskFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  projectId?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  list(filters: TaskFilters = {}): Observable<PaginatedResponse<TaskDto>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<TaskDto>>(this.baseUrl, { params });
  }

  findOne(id: string): Observable<TaskDto> {
    return this.http.get<TaskDto>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<TaskDto>): Observable<TaskDto> {
    return this.http.post<TaskDto>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<TaskDto>): Observable<TaskDto> {
    return this.http.put<TaskDto>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
