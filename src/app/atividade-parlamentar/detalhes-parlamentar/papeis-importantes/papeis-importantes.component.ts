import { Component, OnInit, OnDestroy } from '@angular/core';

import { AtorService } from 'src/app/shared/services/ator.service';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { Ator } from 'src/app/shared/models/ator.model';
import { AtorAgregado } from 'src/app/shared/models/atorAgregado.model';
import { Autoria } from 'src/app/shared/models/autoria.model';

@Component({
  selector: 'app-papeis-importantes',
  templateUrl: './papeis-importantes.component.html',
  styleUrls: ['./papeis-importantes.component.scss']
})
export class PapeisImportantesComponent implements OnInit, OnDestroy {

  private unsubscribe = new Subject();
  public parlamentar: Ator;
  public nomesRelatorias: string[];
  public autorias: Autoria[];
  public idAtor: string;
  public interesse: string;
  public urlFoto: string;
  public nomesComissoes: string[];
  info: any;

  constructor(
    private atorService: AtorService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.parent.paramMap
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(params => {
        this.idAtor = params.get('id');
        this.interesse = params.get('interesse');
      });
    this.getDadosParlamentar(this.idAtor, this.interesse);
  }

  getDadosParlamentar(idParlamentar, interesse) {
    forkJoin(
      [
        this.atorService.getAtor(idParlamentar),
        this.atorService.getRelatoriasDetalhadaById(this.interesse, idParlamentar),
        this.atorService.getComissaoDetalhadaById(idParlamentar),
        this.atorService.getAutorias(idParlamentar)
      ]
    ).pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        const ator: any = data[0][0];
        const dataRelatoria = data[1];
        const dataComissao = data[2];

        let ids = [];
        let quant = 0;
        if (dataRelatoria !== undefined) {
          ids = dataRelatoria[0].ids_relatorias;
          quant = dataRelatoria[0].quantidade_relatorias;
        }

        let idComissao = 0;
        let info = '';
        let quantComissao = 0;
        if (dataComissao.length !== 0) {
          idComissao = dataComissao[0].id_comissao;
          info = dataComissao[0].info_comissao;
          quantComissao = dataComissao[0].quantidade_comissao_presidente;
        }
        this.nomesComissoes = [];
        this.autorias = data[3];

        const parlamentar = [ator].map(a => ({
          ids_relatorias: ids,
          quantidade_relatorias: quant,
          id_comissao: idComissao,
          quantidade_comissao_presidente: quantComissao,
          ...a
        }));

        this.nomesRelatorias = [];
        ids.forEach(id => {
          this.atorService.getProposicoesById(this.interesse, id.id_leggo)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(idProp => {
              this.nomesRelatorias.push(idProp[0].etapas[0].sigla);
            });
        });

        this.parlamentar = parlamentar[0];
        this.nomesComissoes.push(info);
      },
        error => {
          console.log(error);
        }
      );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
