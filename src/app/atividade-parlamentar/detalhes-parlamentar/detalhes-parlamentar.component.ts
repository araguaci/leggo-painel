import { Component, OnInit, ɵSWITCH_COMPILE_DIRECTIVE__POST_R3__ } from '@angular/core';

import { AtorService } from '../../shared/services/ator.service';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Ator } from 'src/app/shared/models/ator.model';
import { Autoria, ArvoreAutorias } from 'src/app/shared/models/autoria.model';

// Importa componentes do d3
import { select, selectAll } from 'd3-selection';
import { group } from 'd3-array';
import { hierarchy, treemap, treemapBinary, HierarchyRectangularNode } from 'd3-hierarchy';
const d3 = Object.assign({}, {
  select,
  selectAll,
  group,
  hierarchy,
  treemap,
  treemapBinary
});

@Component({
  selector: 'app-detalhes-parlamentar',
  templateUrl: './detalhes-parlamentar.component.html',
  styleUrls: ['./detalhes-parlamentar.component.scss']
})
export class DetalhesParlamentarComponent implements OnInit {

  private unsubscribe = new Subject();
  private autorias: Map<number, Autoria[]>;

  public parlamentar: Ator;
  public idAtor: string;
  public urlFoto: string;
  public proposicoes: Autoria[] = null;

  constructor(
    private atorService: AtorService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(params => {
        this.idAtor = params.get('id');
      });
    this.getDadosParlamentar();
    this.renderVisAtividade();
  }

  getDadosParlamentar(): void {
    this.atorService.getAtor(this.idAtor)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(parlamentar => {
        this.parlamentar = parlamentar[0];
        this.getUrlFoto();
      });
  }

  getUrlFoto(): void {
    const urlSenado = `https://www.senado.leg.br/senadores/img/fotos-oficiais/senador${this.parlamentar.id_autor}.jpg`;
    const urlCamara = `https://www.camara.leg.br/internet/deputado/bandep/${this.parlamentar.id_autor}.jpg`;
    this.urlFoto = this.parlamentar.casa === 'camara' ? urlCamara : urlSenado;
  }

  renderVisAtividade(): void {
    const W = window.innerWidth;
    const H = W > 700 ? 350 : 500;

    const svg = d3.select('#vis-atividade-parlamentar')
      .append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`);

    this.atorService.getAutorias(this.idAtor)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(autorias => {
        this.autorias = d3.group(autorias, documento => documento.id_leggo);

        // Cria dados compatíveis com o treemap
        const arvoreAutorias: ArvoreAutorias = {parent: 'root', children: []};
        this.autorias.forEach((filhos, id) => {
          arvoreAutorias.children.push({
            parent: id.toString(),
            id_leggo: id,
            value: filhos.length
          });
        });

        // Cria função de treemap
        const tm = data => d3.treemap()
          .tile(d3.treemapBinary)
          .size([W, H])
          .padding(1)
          .round(true)
          (d3.hierarchy(arvoreAutorias)
          .sum(d => d.value)
          .sort((a, b) => b.value - a.value));

        // Desenha treemap
        const root: HierarchyRectangularNode<ArvoreAutorias> = tm(arvoreAutorias);
        console.log(root.leaves());
        svg
          .selectAll('g')
          .data(root.leaves())
          .join('g')
          .attr('transform', d => `translate(${d.x0},${d.y0})`)
          .attr('cursor', 'pointer')
          .call(g => {
            g.append('rect')
            .attr('class', 'tile-atividade')
            .attr('id', d => `leaf-${d.data.parent}`)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .style('stroke', 'white')
            .style('fill', '#43a467');
          })
          .call(g => {
            g.append('clipPath')
            .attr('id', d => `clip-${d.data.parent}`)
            .append('use')
            .attr('xlink:href', d => `leaf-${d.data.parent}`);
          })
          .call(g => {
            g.append('text')
            .attr('clip-path', d => `clip-${d.data.parent}`)
            .selectAll('tspan')
            .data(d => `Proposição ${d.data.parent} (${d.data.value})`.split(/(?=[A-Z][a-z])|\s+/g))
            .join('tspan')
              .attr('x', 3)
              .attr('y', (d, i, nodes) => `${(i === nodes.length - 1 ? 0.3 : 0) + 1.1 + i}em`)
              .style('fill-opacity', (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
              .style('fill', 'white')
              .style('text-decoration', (d, i, nodes) => i !== nodes.length - 1 ? 'underline' : null)
              .text(d => d);
          })
          .on('mouseover', (d, i, nodes) => {
            d3.select(nodes[i])
              .select('rect')
              .style('fill', (dd, ii, nnodes) => {
                return !d3.select(nnodes[ii])
                  .classed('tile-atividade-ativo') ? '#65b681' : '#398251';
              });
          })
          .on('click', (d, i, nodes) => {
            const tileAtivo = d3.select(nodes[i]).select('rect');
            const eraAtivo = tileAtivo.classed('tile-atividade-ativo');

            d3.selectAll('.tile-atividade')
              .classed('tile-atividade-ativo', false)
              .style('fill', '#43a467');

            if (eraAtivo) {
              this.atualizaListaProposicoes(null);
            } else {
              tileAtivo
                .classed('tile-atividade-ativo', true)
                .style('fill', '#398251');
              this.atualizaListaProposicoes(d.data.id_leggo);
            }
          })
          .on('mouseout', (d, i, nodes) => {
            d3.select(nodes[i])
              .select('rect')
              .style('fill', (dd, ii, nnodes) => {
                return !d3.select(nnodes[ii])
                  .classed('tile-atividade-ativo') ? '#43a467' : '#398251';
              });
          });
    });

  }
  atualizaListaProposicoes(idLeggo: number): void {
    this.proposicoes = this.autorias.get(idLeggo);
  }
}
