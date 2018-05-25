import "./stylesheets/main.css";

import * as THREE from "three";

import World from "./world";

(function() {
  var webglEl = document.getElementById("webgl");
  var world = new World();

  const { camera, scene, sphere, clouds, renderer } = world;

  world.init();

  webglEl.appendChild(renderer.domElement);

  render();

  function render() {
    sphere.rotation.y += 0.0005;
    clouds.rotation.y += 0.0005;
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
})();

// Enable LiveReload
document.write(
  '<script src="http://' +
    (location.host || "localhost").split(":")[0] +
    ':35729/livereload.js?snipver=1"></' +
    "script>",
);
