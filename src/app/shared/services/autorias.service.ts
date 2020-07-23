import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AutoriaAgregada } from '../models/autoriaAgregada.model';
import { Autoria } from '../models/autoria.model';

@Injectable({
  providedIn: 'root'
})
export class AutoriasService {

  private autoriaUrl = `${environment.baseUrl}/autorias`;

  constructor(private http: HttpClient) { }

  getAutoriasAgregadas(interesse: string): Observable<AutoriaAgregada[]> {
    return this.http.get<AutoriaAgregada[]>(`${this.autoriaUrl}/agregadas?interesse=${interesse}`);
  }

  getAutoriasAgregadasById(interesse: string, idAutor: number): Observable<AutoriaAgregada[]> {
    return this.http.get<AutoriaAgregada[]>(`${this.autoriaUrl}/agregadas/${idAutor}/?interesse=${interesse}`);
  }

  getAcoes(interesse: string): Observable<any[]> {
    return this.http.get<Autoria[]>(`${this.autoriaUrl}/acoes/?interesse=${interesse}`);
  }

}
