import { Injectable } from '@angular/core';

import { forkJoin, BehaviorSubject, Observable } from 'rxjs';

import { AtorService } from '../../shared/services/ator.service';
import { ProposicoesService } from 'src/app/shared/services/proposicoes.service';
import { ComissaoService } from 'src/app/shared/services/comissao.service';
import { PesoPoliticoService } from 'src/app/shared/services/peso-politico.service';
import { RelatoriaService } from 'src/app/shared/services/relatoria.service';
import { AutoriasService } from 'src/app/shared/services/autorias.service';
import { AtorDetalhado } from '../models/atorDetalhado.model';

@Injectable({
  providedIn: 'root'
})
export class ParlamentarDetalhadoService {

  private parlamentarDetalhado = new BehaviorSubject<AtorDetalhado>(null);

  constructor(
    private atorService: AtorService,
    private proposicaoService: ProposicoesService,
    private comissaoService: ComissaoService,
    private relatoriaService: RelatoriaService,
    private autoriasService: AutoriasService,
    private pesoService: PesoPoliticoService) { }

  getParlamentarDetalhado(idParlamentar: string, interesse: string): Observable<AtorDetalhado> {
    this.parlamentarDetalhado.next(null);
    forkJoin(
      [
        this.atorService.getAtor(interesse, idParlamentar),
        this.pesoService.getPesoPoliticoById(idParlamentar),
        this.relatoriaService.getRelatoriasDetalhadaById(interesse, idParlamentar),
        this.comissaoService.getComissaoDetalhadaById(interesse, idParlamentar),
        this.autoriasService.getAutoriasOriginais(Number(idParlamentar), interesse)
      ]
    )
      .subscribe(data => {
        const ator = data[0][0];
        const pesoPolitico = data[1];
        const relatorias = data[2];
        const comissoesPresidencia = data[3];
        const autorias = data[4];

        const comissoesInfo = this.getComissoesProcessadas(comissoesPresidencia);

        const parlamentarDetalhado = ator;
        parlamentarDetalhado.urlFoto = this.getUrlFoto(ator);
        parlamentarDetalhado.autorias = autorias;
        parlamentarDetalhado.relatorias = relatorias;
        parlamentarDetalhado.comissoes = comissoesInfo;
        if (pesoPolitico.length) {
          parlamentarDetalhado.pesoPolitico = pesoPolitico[0].peso_politico;
        }

        this.parlamentarDetalhado.next(parlamentarDetalhado);
      },
        error => {
          console.log(error);
        }
      );

    return this.parlamentarDetalhado.asObservable();
  }

  private getComissoesProcessadas(comissao) {
    let infoComissao = {};

    if (comissao.length !== 0) {
      infoComissao = {
        idComissao: comissao[0].id_comissao,
        info_comissao: comissao[0].info_comissao,
        quantidade_comissao_presidente: comissao[0].quantidade_comissao_presidente
      };
    }

    return infoComissao;
  }

  private getUrlFoto(parlamentar): string {
    const urlSenado = `https://www.senado.leg.br/senadores/img/fotos-oficiais/senador${parlamentar.id_autor}.jpg`;
    const urlCamara = `https://www.camara.leg.br/internet/deputado/bandep/${parlamentar.id_autor}.jpg`;
    const urlFoto = parlamentar.casa_autor === 'camara' ? urlCamara : urlSenado;

    return urlFoto;
  }
}
