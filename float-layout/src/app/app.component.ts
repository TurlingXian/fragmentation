import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3Fetch from 'd3-Fetch';
import * as d3Chromatic from 'd3-scale-chromatic';
import * as d3Force from 'd3-force';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  data = d3Fetch.json('https://gist.githubusercontent.com/mbostock/4062045/raw/5916d145c8c048a6e3086915a6be464467391c62/miserables.json');

  height = 600;
  width = 600;
  color;
  scale;

  constructor() {

  }

  ngOnInit() {
    this.chartInit();
  }

  chartInit() {

    this.color = {
      // const scale = d3.scaleOrdinal(d3.schemeCategory10);
      // return d => scale(d.group);
    };
    const links = this.data.links.map(d => Object.create(d));
    const nodes = this.data.nodes.map(d => Object.create(d));
    const simulation = this.forceSimulation(nodes, links).on('tick', ticked);

    const svg = d3.select(DOM.svg(this.width, this.height))
        .attr('viewBox', [-this.width / 2, -this.height / 2, this.width, this.height]);

    const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke-width', d => Math.sqrt(d.value));

    const node = svg.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', 5)
        .attr('fill', this.color)
        .call(this.drag(simulation));

    node.append('title')
        .text(d => d.id);

    function ticked() {
      link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

      node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
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

    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
  }

  forceSimulation(nodes, links) {
    return d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter());
  }



}
