import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserProfile } from '@models/loginModel';

@Injectable({ providedIn: 'root' })
export class AvatarService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/me/avatar`;

  upload(file: File): Observable<UserProfile> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UserProfile>(this.apiUrl, formData);
  }

  remove(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}
