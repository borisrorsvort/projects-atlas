import * as THREE from "three";

export default class World {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.radius = 0.5;
    this.segments = 32;
    this.rotation = 10.5;
    this.scene = new THREE.Scene();
    this.sphere = this.createSphere();
    this.clouds = this.createClouds();
    this.stars = this.createStars();
    this.camera = this.createCamera();
    this.renderer = new THREE.WebGLRenderer();
  }

  createCamera() {
    return new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.01,
      1000,
    );
  }

  createSphere() {
    return new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, this.segments, this.segments),
      new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load("./images/2_no_clouds_4k.jpg"),
        bumpMap: new THREE.TextureLoader().load("./images/elev_bump_4k.jpg"),
        bumpScale: 0.005,
        specularMap: new THREE.TextureLoader().load("./images/water_4k.png"),
        specular: new THREE.Color("grey"),
      }),
    );
  }

  createClouds() {
    return new THREE.Mesh(
      new THREE.SphereGeometry(
        this.radius + 0.003,
        this.segments,
        this.segments,
      ),
      new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load("./images/fair_clouds_4k.png"),
        transparent: true,
      }),
    );
  }

  createStars(radius = 90, segments = 64) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("./images/galaxy_starfield.png"),
        side: THREE.BackSide,
      }),
    );
  }

  initRenderer() {
    this.renderer.setSize(this.width, this.height);
  }

  initCamera() {
    this.camera.position.z = 1.5;
  }

  initSphere() {
    this.sphere.rotation.y = this.rotation;
    this.scene.add(this.sphere);
  }

  initClouds() {
    this.clouds.rotation.y = this.rotation;
    this.scene.add(this.clouds);
  }

  initStars() {
    this.scene.add(this.stars);
  }

  initLightings() {
    const light = new THREE.DirectionalLight(0xffffff, 0.2);
    light.position.set(5, 3, 5);
    this.scene.add(new THREE.AmbientLight(0xcccccc));
    this.scene.add(light);
  }

  init() {
    this.initCamera();
    this.initRenderer();
    this.initSphere();
    this.initClouds();
    this.initStars();
    this.initLightings();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
