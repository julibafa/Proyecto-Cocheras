import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
esAdmin: boolean = true
auth = inject(AuthService)

abrirModal(){
  Swal.fire({
    title: "Enter your IP address",
    input: "text",
    inputLabel: "Your IP address",
    inputValue: "",
    showCancelButton: true,
}).then((result)=>{
  console.log(result);
})
}

resultadoInput:string = "";




}
