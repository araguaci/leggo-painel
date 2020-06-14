import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'

import { AtividadeParlamentarRoutingModule } from './atividade-parlamentar-routing.module';
import { AtividadeParlamentarComponent } from './atividade-parlamentar.component';
import { CardAtividadeComponent } from './card-atividade/card-atividade.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';

@NgModule({
  declarations: [
    AtividadeParlamentarComponent,
    CardAtividadeComponent
  ],
  imports: [
    CommonModule,
    AtividadeParlamentarRoutingModule,
    FormsModule,
    SharedComponentsModule
  ]
})
export class AtividadeParlamentarModule { }
