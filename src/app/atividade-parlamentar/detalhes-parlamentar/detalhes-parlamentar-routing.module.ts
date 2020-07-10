import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PesoPolitico} from './src/app/shared/components/peso/peso.component';
import { PapeisImportantes } from './cargos/cargos.component';
import { AtividadeNoCongresso } from './trajetoria/trajetoria.component';

const routes: Routes = [
      {
        path: '',
        redirectTo: 'peso',
        pathMatch: 'full'
      },
      {
        path: 'peso',
        component: PesoPolitico
      },
      {
        path: 'papeisImportantes',
        component: PapeisImportantes
      },
      {
        path: 'atividades',
        component: AtividadeNoCongresso
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetalhesParlamentarRoutingModule { }
