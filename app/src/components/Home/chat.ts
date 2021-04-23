import * as d3 from "d3";
import { TData, TLink, TNode } from "./interface";

const getColor = d3.scaleOrdinal(d3.schemeCategory10);

const drag = (simulation) => {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

const chart = (
  ele: HTMLElement | null,
  data: TData,
  width = 600,
  height = 600
) => {
  if (!ele) return;
  const links = data.links.map((d) => Object.create(d));
  const nodes = data.nodes.map((d) => Object.create(d));

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  // const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
  const svg = d3
    .select(ele)
    .html("")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => Math.sqrt(d.value));

  const node = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    // .attr("r", 5)
    // 入口设置为15，其他按反比例函数放缩到5-10（x∈[0,500]，y∈[5,10]）,undefined设为5
    .attr("r", (d) => (d.group === 0 ? 15 : 5000 / (d.group + 500) || 5))
    .attr("fill", (d) => getColor(`${d.group}`))
    .call(drag(simulation));

  node.append("title").text((d) => d.id);

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  return svg.node();
};

export default chart;
