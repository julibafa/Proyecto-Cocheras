import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CocherasService {
  cargar() {
    throw new Error('Method not implemented.');
  }

auth = inject(AuthService)
  eliminar: any;

cocheras(){
  return fetch('http://localhost:4000/cocheras',{
    method: 'GET',
    headers: {
      authorization: "Bearer " + (this.auth.getToken() ?? ''),
  },
}).then(r => r.json());
}



}
