
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cochera } from '../../interfaces/cochera'
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from "../../components/header/header.component";
import { CocherasService } from '../../services/cocheras.service';
import { Estacionamiento } from '../../interfaces/estacionamiento';
import Swal from 'sweetalert2';
import { EstacionamientosService } from '../../services/estacionamientos.service';

@Component({
	selector: 'app-estado-cocheras',
	standalone: true,
	imports: [RouterModule, CommonModule, HeaderComponent],
	templateUrl: './estado-cocheras.component.html',
	styleUrl: './estado-cocheras.component.scss'
})
export class EstadoCocherasComponent implements OnInit {
	esAdmin: boolean = false;
	titulo: string = 'Estado de cochera';
	header: { nro: string; disponibilidad: string; ingreso: string; acciones: string } = {
		nro: 'Número',
		disponibilidad: 'Disponibilidad',
		ingreso: 'Ingreso',
		acciones: 'Acciones'
	};

	filas:Cochera[]=new  Array();

	siguienteNumero: number = 1;

	cocheras = inject(CocherasService);
	auth = inject(AuthService);
	estacionamientos = inject(EstacionamientosService);

	
	async agregarFila() {
		const { value: nombreCochera} = await Swal.fire({
			title: "Ingresa un nombre de cochera",
			input: "text",
			inputValue: '',
			showCancelButton: true,
		});
		console.log(nombreCochera)
		if (nombreCochera) {
			fetch('http://localhost:4000/cocheras/', {
				method: 'POST',
				headers: {
					Authorization: 'Bearer ' + this.auth.getToken(),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					descripcion: nombreCochera,
				})
			}).then(() => {
				this.getCocheras().then((filas) => {
					this.filas = filas;
				});
			}).catch(error => {
				console.error('Error en la solicitud:', error);
			});
			this.siguienteNumero += 1;
		}
	}





	getCocheras() {
		return fetch('http://localhost:4000/cocheras/', {
			method: 'GET',
			headers: {
				authorization: 'Bearer ' + this.auth.getToken()
			}
		}).then((response) => response.json())
			.then((filas) => {
				this.filas = filas; 
				console.log("Lista de cocheras traída del servidor:", this.filas);
				return filas;
			});
	}



	borrarFila(cocheraId: number) {
		fetch('http://localhost:4000/cocheras/' + cocheraId, {
			method: 'DELETE',
			headers: {
				Authorization: 'Bearer ' + this.auth.getToken() 
			}
		}).then(() => {
			this.getCocheras().then((filas) => {
				this.filas = filas;
			});
		});
	}



	

habilitarCochera(cocheraId: number) {
    fetch(`http://localhost:4000/cocheras/${cocheraId}/enable`, {
        method: 'POST',
        headers: {
            authorization: 'Bearer ' + this.auth.getToken(),
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error en el servidor");
        } else {
            this.getCocheras(); 
        }
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
    });
}


inhabilitarCochera(cocheraId: number) {
    
    const data = { deshabilitado: true };

    
    fetch(`http://localhost:4000/cocheras/${cocheraId}/disable`, {
        method: 'POST',
        headers: {
            authorization: 'Bearer ' + this.auth.getToken(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error en el servidor");
        }
        this.getCocheras(); 
    })
    .catch(error => {
        console.error('Error en la solicitud:', error);
    });
}



	ngOnInit() {
		this.getCocheras().then((filas) => {
			this.filas = filas;
		});
	}





async abrirModalNuevoEstacionamiento(idCochera: number) {
	const result = await Swal.fire({
	  title: "Ingresa patente",
	  input: "text",
	  showCancelButton: true,
	  inputValidator: (value) => {
		if (!value) {
		  return "Ingresa una patente válida";
		}
		return null;
	  }
	});
  
	if (result.isConfirmed) {
	  const patente = result.value;
  
	  
	  const cocheraIndex = this.filas.findIndex(fila => fila.id === idCochera);
	  const horaIngreso = new Date().toLocaleTimeString();
  
	  if (cocheraIndex !== -1) {
		this.filas[cocheraIndex].patente = patente;
		this.filas[cocheraIndex].deshabilitada = false; 
		this.filas[cocheraIndex].horaIngreso = horaIngreso;

		const data = {
		  idCochera: idCochera,
		  patente: patente,
		  horaIngreso: horaIngreso
		};
		console.log(data)
  
		
		try {
			const response = await fetch('http://localhost:4000/estacionamientos/abrir', {
			  method: 'POST',
			  headers: {
				authorization: 'Bearer ' + this.auth.getToken(),
				'Content-Type': 'application/json',
			  },
			  body: JSON.stringify(data)
			});
			
			if (!response.ok) {
			  const errorData = await response.json();
			  console.error("Error del servidor:", errorData);
			}
		  } catch (error) {
			console.error("Error en la solicitud:", error);
		  }
	  }}
	}
		  



async cerrarEstacionamiento(patente: string) {
	const result = await Swal.fire({
		title: "¿Cerrar estacionamiento?",
		text: "En caso de aceptar, la cochera quedará disponible",
		icon: "warning",
		showCancelButton: true,
		confirmButtonText: "Sí, cerrar",
		cancelButtonText: "Cancelar"
	});

	if (result.isConfirmed) {
		try {
			const response = await fetch(`http://localhost:4000/estacionamientos/cerrar`, {
				method: 'PATCH',
				headers: {
					Authorization: 'Bearer ' + this.auth.getToken(),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ patente: patente }),
			});

			if (!response.ok) {
				throw new Error("Error al cerrar la cochera en el servidor");
			}

			const data = await response.json();
			await Swal.fire({
				title: "Se ha cerrado el estacionamiento",
				text: `Se ha cobrado el total de $${data.costo}.`,
				icon: "success",
				confirmButtonText: "Aceptar"
			});

			this.getCocheras();

		} catch (error) {
			console.error('Error en la solicitud:', error);
			await Swal.fire({
				title: "Error",
				text: "Ha ocurrido un error",
				icon: "error",
				confirmButtonText: "Aceptar"
			});
		}
	}
}
}