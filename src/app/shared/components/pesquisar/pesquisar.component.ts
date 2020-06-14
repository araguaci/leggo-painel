import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pesquisar',
  templateUrl: './pesquisar.component.html',
  styleUrls: ['./pesquisar.component.scss']
})
export class PesquisarComponent implements OnInit {

  @Input() placeHolder:string;
  searchInput:string;

  constructor() { }

  ngOnInit(): void {
  }

}
