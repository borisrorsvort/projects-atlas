import * as THREE from "three";
import * as topojson from "topojson";

import { geoEquirectangular, geoPath } from "d3";

export const topoFeatures = geojson =>
  topojson.feature(geojson, geojson.objects.countries).features;

export const bordersTexture = geojson =>
  topojson.mesh(geojson, geojson.objects.countries, (a, b) => a !== b);

var projection = geoEquirectangular()
  .translate([window.innerWidth / 2, window.innerHeight / 2])
  .scale(325);

export const mapTexture = (geojson, color) => {
  let texture, context, canvas;

  canvas = select("body")
    .append("canvas")
    .style("display", "none")
    .attr("width", window.innerWidth)
    .attr("height", window.innerHeight);

  context = canvas.node().getContext("2d");

  var path = geoPath()
    .projection(projection)
    .context(context);

  context.strokeStyle = "#333";
  context.lineWidth = 1;
  context.fillStyle = color || "#CDB380";

  context.beginPath();

  path(geojson);

  if (color) {
    context.fill();
  }

  context.stroke();

  // DEBUGGING - Really expensive, disable when done.
  // console.log(canvas.node().toDataURL());

  texture = new THREE.Texture(canvas.node());
  texture.needsUpdate = true;

  canvas.remove();

  return texture;
};
