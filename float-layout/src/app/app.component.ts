import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3Array from 'd3-array';
import * as d3Drag from 'd3-drag';
import * as d3Chromatic from 'd3-scale-chromatic';
import * as d3Force from 'd3-force';
import * as d3Scale from 'd3-scale';
import * as d3Zoom from 'd3-zoom';
import { ChangeDetectorRef } from '@angular/core'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  circleSize = 10;
  currentId = '';

  data = {
    'nodes': [
      {'id': 'application1', 'group': 1, 'value': 3},
      {'id': 'application2', 'group': 1, 'value': 0},
      {'id': 'application3', 'group': 1, 'value': 0},
      {'id': 'application4', 'group': 1, 'value': 4},
      {'id': 'application5', 'group': 1, 'value': 1},
      {'id': 'app1.data1', 'group': 2, 'value': 0},
      {'id': 'app1.data2', 'group': 2, 'value': 0},
      {'id': 'app1.data3', 'group': 2, 'value': 0},
      {'id': 'app4.data1', 'group': 3, 'value': 0},
      {'id': 'app4.data2', 'group': 3, 'value': 0},
      {'id': 'app4.data3', 'group': 3, 'value': 0},
      {'id': 'app4.data4', 'group': 3, 'value': 0},
      {'id': 'app5.data1', 'group': 4, 'value': 0},
    ],
    'links': [
      {'source': 'application1', 'target': 'application2', 'value': 1, 'relation': ''},
      {'source': 'application2', 'target': 'application3', 'value': 1, 'relation': ''},
      {'source': 'application3', 'target': 'application4', 'value': 1, 'relation': ''},
      {'source': 'application4', 'target': 'application5', 'value': 1, 'relation': ''},
      {'source': 'application1', 'target': 'application5', 'value': 1, 'relation': ''},
      {'source': 'app1.data1', 'target': 'application1', 'value': 2, 'relation': '关系'},
      {'source': 'app1.data2', 'target': 'application1', 'value': 2, 'relation': '关系'},
      {'source': 'app1.data3', 'target': 'application1', 'value': 2, 'relation': '关系'},
      {'source': 'app4.data1', 'target': 'application4', 'value': 2, 'relation': '关系'},
      {'source': 'app4.data2', 'target': 'application4', 'value': 2, 'relation': '关系'},
      {'source': 'app4.data3', 'target': 'application4', 'value': 2, 'relation': '关系'},
      {'source': 'app4.data4', 'target': 'application4', 'value': 2, 'relation': '关系'},
      {'source': 'app5.data1', 'target': 'application5', 'value': 2, 'relation': '关系'},
    ]
  };

  height = 240;
  width = 300;
  color = d3Scale
  .scaleOrdinal()
  .domain(d3Array.range(this.data.nodes.length))
  .range(d3Chromatic.schemeCategory10);

  R = 88;


  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.chartInit();
  }

  chartInit() {
    console.log(this.data);
    const links = this.data.links.map(d => Object.create(d));
    const nodes = this.data.nodes.map(d => Object.create(d));
    const simulation = this.forceSimulation(nodes, links).on('tick', ticked);
    console.log('simulation', simulation);

    const svg = d3.select('#svg').append('svg')
        .attr('viewBox', [-this.width / 2, -this.height / 2, this.width, this.height])
        .call(d3Zoom.zoom().on('zoom', function() {
          svg.attr('transform', d3.event.transform);
        })
        .scaleExtent([0.5, 3]));

    // add defs-marker
    // add defs-markers
    svg.append('svg:defs').selectAll('marker')
    .data([{id: 'end-arrow', opacity: 1}, {id: 'end-arrow-fade', opacity: 0.075}])
    .enter().append('marker')
    .attr('id', function(d) { return d.id; })
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 2 + this.R)
    .attr('refY', 5)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,0 L0,10 L10,5 z')
    .style('opacity', function(d) { return d.opacity; });

    // phantom marker
    svg.append('svg:defs')
    .append('svg:marker')
    .attr('id', 'end-arrow-phantom')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 2 + this.R)
    .attr('refY', 5)
    .attr('markerWidth', 4)
    .attr('markerHeight', 4)
    .attr('orient', 'auto')
    .attr('fill', '#EEE')
    .append('svg:path')
    .attr('d', 'M0,0 L0,10 L10,5 z');

    const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke-width', d => Math.pow((1 / d.value), 0.5))
        .attr('marker-end', 'url(#end-arrow)');

    const linksText = svg.selectAll('text')
        .data(links)
        .enter().append('text')
        .style('font-size', '6px')
        .attr('fill', 'white')
        .text(d => d.relation);

    const node = svg.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', function(d) {
          console.log(d, d.value);
          return (d.value + 1) * 5;
        })
        .attr('fill', (d, i) => this.color(i))
        .on('click', function(d, i) {
          // console.log(d, i, d.value, d.id);
          this.currentId = d.id;
          console.log(this.currentId);
          // this.changeDetectorRef.markForCheck();
          // this.changeDetectorRef.detectChanges();
        })
        .call(this.drag(simulation));

    const texts = svg.selectAll('text.node-label')
        .data(nodes)
        .enter().append('text')
        // .attr('class', 'node-label')
        .style('font-size', '8px')
        .attr('fill', 'white')
        .attr('x', -10)
        .attr('y', -20)
        .attr('dy', 10)
        .text(function(d) { return d.id; });

    function ticked() {
      link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

      node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);

      texts
          .attr('transform', d => 'translate(' + d.x + ',' + d.y + ')');

      linksText
          .attr('x', d => (d.source.x + d.target.x) / 2 )
          .attr('y', d => (d.source.y + d.target.y) / 2 );
    }

    return svg.node();
  }

  drag = simulation => {

    function dragstarted(d) {
      if (!d3.event.active) { simulation.alphaTarget(0.3).restart(); }
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) { simulation.alphaTarget(0); }
      d.fx = null;
      d.fy = null;
    }

    return d3Drag.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
  }

  forceSimulation(nodes, links) {
    console.log('links', links);
    return d3Force.forceSimulation(nodes)
        .force('link', d3Force.forceLink(links).id(d => d.id))
        .force('link', d3Force.forceLink(links).distance(50))
        .force('charge', d3Force.forceManyBody())
        .force('center', d3Force.forceCenter());
  }


}
