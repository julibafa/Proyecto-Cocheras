import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-precios',
  standalone: true,
  imports: [HeaderComponent, RouterModule],
  templateUrl: './precios.component.html',
  styleUrl: './precios.component.scss'
})
export class PreciosComponent {

}
