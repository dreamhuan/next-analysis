import * as d3 from "d3";
import { IEvt, TData, TLink, TNode } from "./interface";
import noop from "lodash/noop";
import { isEmpty } from "lodash";

const getColor = d3.scaleOrdinal(d3.schemeCategory10);

const chart = (
  ele: HTMLElement | null,
  data: TData | null,
  width = 600,
  height = 600,
  eventBus: (e: IEvt) => void = noop
) => {
  if (isEmpty(ele)) return;
  if (isEmpty(data)) return;
  const links = data.links.map((d) => Object.create(d));
  const nodes = data.nodes.map((d) => Object.create(d));

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d: any) => d.id)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  const svg = d3
    .select(ele)
    .html("")
    .append("svg")
    .attr("viewBox", [0, 0, width, height] as any);

  const arrow = svg
    .append("defs")
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 20)
    .attr("refY", 0)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#666");

  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => Math.sqrt(d.value))
    .attr("marker-end", "url(#arrow)");

  const behavior = d3
    .drag()
    .on("start", (e) => {
      const id = e.subject.id;
      eventBus({ type: "click", data: { id } });
      if (!e.active) simulation.alphaTarget(0.3).restart();
      e.subject.fx = e.subject.x;
      e.subject.fy = e.subject.y;
    })
    .on("drag", (e) => {
      e.subject.fx = e.x;
      e.subject.fy = e.y;
    });
  // .on("end", (e) => {
  //   if (!e.active) simulation.alphaTarget(0);
  //   e.subject.fx = null;
  //   e.subject.fy = null;
  // });

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
    .attr("fill", (d) => (d.group === 0 ? "#000" : getColor(`${d.group}`)))
    .call(behavior);

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
