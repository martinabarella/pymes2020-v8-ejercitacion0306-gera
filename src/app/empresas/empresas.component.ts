import { Component, OnInit } from '@angular/core';
import { Empresas } from '../models/Empresas'
import { EmpresasService } from '../empresas.service';

import { FormBuilder, FormGroup, Validators } from "@angular/forms";


@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css']
})
export class EmpresasComponent implements OnInit {

  TituloAccionABMC = {
    A: "(Agregar)",
    B: "(Eliminar)",
    M: "(Modificar)",
    C: "(Consultar)",
    L: "(Listado)"
  };
  AccionABMC = "L"; 

  submitted = false;

  Items: Empresas[] = [];

  FormReg: FormGroup;
  constructor(private empresasService:  EmpresasService, public formBuilder: FormBuilder) { }

  ngOnInit() {
    this.GetEmpresas();

    this.FormReg = this.formBuilder.group({
      IdEmpresa: [0],

      RazonSocial: [
        "",
        [Validators.required, Validators.minLength(4), Validators.maxLength(55)]
      ],

      CantidadEmpleados: [null, [Validators.required, Validators.pattern("[0-9]{1,7}")]],

      FechaFundacion: [
        "",
        [Validators.required,Validators.pattern("(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}")]
      ]
    });
  }

  GetEmpresas() {
    this.empresasService.get()
    .subscribe((res:Empresas[]) => {
      this.Items = res;
    });
}


  Agregar() {
    this.AccionABMC = "A";
    //this.FormReg.reset(this.FormReg.value);
    this.FormReg.reset();
    //this.FormReg.controls['IdEmpresa'].setValue(0);

    this.submitted = false;
    //this.FormReg.markAsPristine();
    this.FormReg.markAsUntouched();
  }

  Modificar(item) {

    this.submitted = false;
    this.FormReg.markAsPristine();
    this.FormReg.markAsUntouched();
    this.BuscarPorId(item, "A");
  }

  BuscarPorId(item, AccionABMC) {
    window.scroll(0, 0); // ir al incio del scroll

    this.empresasService.getById(item.IdEmpresa).subscribe((res: any) => {
      this.FormReg.patchValue(res);

      //formatear fecha de  ISO 8061 a string dd/MM/yyyy
      var arrFecha = res.FechaFundacion.substr(0, 10).split("-");
      this.FormReg.controls.FechaFundacion.patchValue(
        arrFecha[2] + "/" + arrFecha[1] + "/" + arrFecha[0]
      );

      this.AccionABMC = AccionABMC;
    });
  }

  Cancelar() {
    this.AccionABMC = "L";
    this.submitted = false;

    this.GetEmpresas();
  }

  Eliminar(IdEmpresa)
  {
    this.empresasService.delete(IdEmpresa).subscribe((res: string) =>
    {
      this.Cancelar();

      this.GetEmpresas();
      window.alert("Registro eliminado");
    })
  }
   Grabar() {

    this.submitted = true;

    // verificar que los validadores esten OK
     if (this.FormReg.invalid) {
      window.alert("Revisar Datos");
      return;
    }

    //hacemos una copia de los datos del formulario, para modificar la fecha y luego enviarlo al servidor
    const itemCopy = { ...this.FormReg.value };

    //convertir fecha de string dd/MM/yyyy a ISO para que la entienda webapi
    var arrFecha = itemCopy.FechaFundacion.substr(0, 10).split("/");
    if (arrFecha.length == 3)
      itemCopy.FechaFundacion = 
          new Date(
            arrFecha[2],
            arrFecha[1] - 1,
            arrFecha[0]
          ).toISOString();

    // agregar post
    if (itemCopy.IdEmpresa == 0 || itemCopy.IdEmpresa == null) {
      itemCopy.IdEmpresa = 0;
      console.log(itemCopy);
      this.empresasService.post(itemCopy).subscribe((res: any) => {

        this.Cancelar();
        window.alert("Registro grabado");
        // this.modalDialogService.Alert('Registro agregado correctamente.');
        // this.Buscar();
      });
    } else {
      // modificar put
      this.empresasService
        .put(itemCopy.IdEmpresa, itemCopy)
        .subscribe((res: any) => {
          this.Cancelar();
          window.alert("Registro modificado");
        });
    }

    this.GetEmpresas();
  }

}