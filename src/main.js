import "./stylesheets/main.css";

import * as THREE from "three";

// Created by Bjorn Sandvik - thematicmapping.org
(function() {
  var webglEl = document.getElementById("webgl");

  // if (!Detector.webgl) {
  //   Detector.addGetWebGLMessage(webglEl);
  //   return;
  // }

  let width = window.innerWidth;
  let height = window.innerHeight;

  // Earth params
  let radius = 0.5;
  let segments = 32;
  let rotation = 10.5;

  let scene = new THREE.Scene();

  let camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.position.z = 1.5; // How far from us

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  scene.add(new THREE.AmbientLight(0xcccccc));

  var light = new THREE.DirectionalLight(0xffffff, 0.2);
  light.position.set(5, 3, 5);
  scene.add(light);

  var sphere = createSphere(radius, segments);
  sphere.rotation.y = rotation;
  scene.add(sphere);

  var clouds = createClouds(radius, segments);
  clouds.rotation.y = rotation;
  scene.add(clouds);

  var stars = createStars(90, 64);
  scene.add(stars);

  // var controls = new THREE.TrackballControls(camera);

  webglEl.appendChild(renderer.domElement);

  render();

  function render() {
    // controls.update();
    sphere.rotation.y += 0.0005;
    clouds.rotation.y += 0.0005;
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  function createSphere(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load("./images/2_no_clouds_4k.jpg"),
        bumpMap: new THREE.TextureLoader().load("./images/elev_bump_4k.jpg"),
        bumpScale: 0.005,
        specularMap: new THREE.TextureLoader().load("./images/water_4k.png"),
        specular: new THREE.Color("grey"),
      }),
    );
  }

  function createClouds(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius + 0.003, segments, segments),
      new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load("./images/fair_clouds_4k.png"),
        transparent: true,
      }),
    );
  }

  function createStars(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("./images/galaxy_starfield.png"),
        side: THREE.BackSide,
      }),
    );
  }
})();

if (ENV !== "production") {
  // Enable LiveReload
  document.write(
    '<script src="http://' +
      (location.host || "localhost").split(":")[0] +
      ':35729/livereload.js?snipver=1"></' +
      "script>",
  );
}
