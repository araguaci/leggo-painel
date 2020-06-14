import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'


import { NavbarComponent } from './navbar/navbar.component';
import { ProgressComponent } from './progress/progress.component';
import { AvaliacaoComponent } from './avaliacao/avaliacao.component';
import { PesquisarComponent } from './pesquisar/pesquisar.component';

@NgModule({
  declarations: [
    NavbarComponent,
    ProgressComponent,
    AvaliacaoComponent,
    PesquisarComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    NavbarComponent,
    ProgressComponent,
    AvaliacaoComponent,
    PesquisarComponent
  ]
})
export class SharedComponentsModule { }
