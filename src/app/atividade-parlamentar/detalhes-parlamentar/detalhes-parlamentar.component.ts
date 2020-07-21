import { Component, OnInit } from '@angular/core';

import { AtorService } from '../../shared/services/ator.service';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { Ator } from 'src/app/shared/models/ator.model';
import { AtorAgregado } from 'src/app/shared/models/atorAgregado.model';
import { Autoria } from 'src/app/shared/models/autoria.model';
import { AutoriaAgregada } from 'src/app/shared/models/autoriaAgregada.model';

@Component({
  selector: 'app-detalhes-parlamentar',
  templateUrl: './detalhes-parlamentar.component.html',
  styleUrls: ['./detalhes-parlamentar.component.scss']
})
export class DetalhesParlamentarComponent implements OnInit {

  private unsubscribe = new Subject();
  p = 1;

  public parlamentar: Ator;
  public nomesRelatorias: string[];
  public autorias: AutoriaAgregada[];
  public idAtor: string;
  public interesse: string;
  public urlFoto: string;
  public nomesComissoes: string[];
  info: any;

  constructor(
    private atorService: AtorService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap
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
        this.atorService.getPesoPolitico(),
        this.atorService.getRelatoriasDetalhadaById(this.interesse, idParlamentar),
        this.atorService.getComissaoDetalhadaById(idParlamentar),
        this.atorService.getAutoriasAgregadasById(this.interesse, idParlamentar),
        this.atorService.getAtorAgregado(this.interesse)
      ]
    ).pipe(takeUntil(this.unsubscribe))
      .subscribe(data => {
        const ator: any = data[0][0];
        const pesoPolitico: any = data[1];
        let ids = [];
        let quant = 0;
        const dataRelatoria = data[2];
        const dataComissao = data[3];
        if (dataRelatoria !== undefined) {
          ids = data[2][0].ids_relatorias;
          quant = data[2][0].quantidade_relatorias;
        }
        let idComissao = 0;
        let info = '';
        let quantComissao = 0;
        if (dataComissao.length !== 0) {
          idComissao = data[3][0].id_comissao;
          info = data[3][0].info_comissao;
          quantComissao = data[3][0].quantidade_comissao_presidente;
        }
        this.nomesComissoes = [];
        const autorias = data[4];

        const atores = data[5];

        const parlamentar = [ator].map(a => ({
          ...pesoPolitico.find(p => a.id_autor_parlametria === p.id_autor_parlametria),
          ...autorias.find(p => a.id_autor_parlametria === p.id_autor_parlametria),
          ...atores.find(p => a.id_autor_parlametria === p.id_autor_parlametria),
          ids_relatorias: ids,
          quantidade_relatorias: quant,
          id_comissao: idComissao,
          quantidade_comissao_presidente: quantComissao,
          ...a
        }));

        const pesos = atores.map(p => {
          if (p.peso_documentos) {
            return +p.peso_documentos;
          }
          return 0;
        });

        const pesosPoliticos = pesoPolitico.map(p => {
          if (p.peso_politico) {
            return +p.peso_politico;
          }
          return 0;
        });

        this.nomesRelatorias = [];
        ids.forEach(id => {
          this.atorService.getProposicoesById(this.interesse, id.id_leggo)
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(idProp => {
              this.nomesRelatorias.push(idProp[0].etapas[0].sigla);
            });
        });

        parlamentar.forEach(p => {
          p.atividade_parlamentar = this.normalizarAtividade(p.peso_documentos, Math.min(...pesos), Math.max(...pesos));
          p.peso_politico = this.normalizarPesoPolitico(p.peso_politico, Math.max(...pesosPoliticos));
        });

        this.parlamentar = parlamentar[0];
        this.getUrlFoto();
        this.nomesComissoes.push(info);
      },
        error => {
          console.log(error);
        }
      );
  }

  normalizarPesoPolitico(metrica: number, max: number): number {
    if (max !== 0) {
      return (metrica / max);
    }
    return 0;
  }

  normalizarAtividade(metrica: number, min: number, max: number): number {
    return (metrica - min) / (max - min);
  }


  getUrlFoto(): void {
    const urlSenado = `https://www.senado.leg.br/senadores/img/fotos-oficiais/senador${this.parlamentar.id_autor}.jpg`;
    const urlCamara = `https://www.camara.leg.br/internet/deputado/bandep/${this.parlamentar.id_autor}.jpg`;
    this.urlFoto = this.parlamentar.casa_autor === 'camara' ? urlCamara : urlSenado;
  }
}
