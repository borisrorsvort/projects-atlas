import * as topojson from "topojson";

export const topoFeatures = geojson =>
  topojson.feature(geojson, geojson.objects.countries).features;

export const bordersTexture = geojson =>
  topojson.mesh(geojson, geojson.objects.countries, (a, b) => a !== b);
