import "./stylesheets/main.css";

import * as THREE from "three";

import { json, tsv } from "d3";

import World from "./world";

function initWorld(geojson, countryNames) {
  console.log(geojson, countryNames);

  var webglEl = document.getElementById("webgl");
  var world = new World();

  world.init();

  webglEl.appendChild(world.renderer.domElement);

  render();

  function render() {
    world.sphere.rotation.y += 0.0005;
    world.clouds.rotation.y += 0.0005;
    requestAnimationFrame(render);
    world.render();
  }
}

(function() {
  window.addEventListener("DOMContentLoaded", function() {
    json("world.json").then(geojson => {
      tsv("world-country-names.tsv").then(countryNames =>
        initWorld(geojson, countryNames),
      );
    });
  });
})();

// Enable LiveReload
document.write(
  '<script src="http://' +
    (location.host || "localhost").split(":")[0] +
    ':35729/livereload.js?snipver=1"></' +
    "script>",
);
