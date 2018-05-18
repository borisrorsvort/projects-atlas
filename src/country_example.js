/*
 *  demonstrates
 *    genning textures with topojson and d3
 *    using d3 for transitions and interpolation,
 *    and three.js for rendering the globe
 *
 *  adapted from Mike Bostock's World Tour, http://bl.ocks.org/mbostock/4183330
 *  and Steve Hall's Interactive WebGL Globes with THREE.js and D3,
 *    http://www.delimited.io/blog/2015/5/16/interactive-webgl-globes-with-threejs-and-d3
 *  all cruft and smells are mine.
 */

import "./stylesheets/main.css";

import * as THREE from "three";
import * as topojson from "topojson";

import {
  json as d3json,
  tsv as d3tsv,
  geoEquirectangular as equirectangular,
  geoCentroid,
  geoPath,
  interpolateObject,
  rgb,
  select,
  transition,
} from "d3";

import { queue } from "d3-queue";

(function() {
  var genKey = function(arr) {
    var key = "";
    arr.forEach(function(str) {
      key += str.toLowerCase().replace(/[^a-z0-9]/g, "");
    });
    return key;
  };

  // used for working with three.js globe and lat/lon
  var twoPI = Math.PI * 2;
  var halfPI = Math.PI / 2;

  var world = {
    glEl: {},
    sunColor: "#fbfccc",
    countryColor: rgb("orange")
      .darker()
      .darker()
      .toString(),
    waterColor: "#0419a0",
    landColor: "#185f18",
    borderColor: "",
    d3Canvas: select("#d3-canvas"),
    projection: equirectangular()
      .translate([1024, 512])
      .scale(325),

    geoCache: {
      keys: {},
      textures: [],
      init: function(countries, names) {
        var self = this;
        this.countries = countries
          .filter(function(d) {
            return names.some(function(n) {
              if (d.id == n.name) {
                d.name = d.id;
                return (d.id = n.id);
              }
            });
          })
          .sort(function(a, b) {
            return a.name.localeCompare(b.name);
          });
        this.countries.forEach(function(country, cx) {
          country.key = genKey([country.name, country.id]);
          self.keys[country.id] = { name: country.name, idx: cx };
        });
      },
    },

    init: function(opts) {
      this.glEl = select(opts.selector);
      this.slug = select("#slug");

      this.borderColor = rgb(this.landColor)
        .darker()
        .toString();

      var countries = topojson.feature(opts.data, opts.data.objects.countries)
        .features;

      this.geoCache.init(countries, opts.names);

      this.initD3(opts);
    },

    initD3: function(opts) {
      // will create textures for three.js globe
      var borders = topojson.mesh(
        opts.data,
        opts.data.objects.countries,
        function(a, b) {
          return a !== b;
        },
      );
      this.initThree({
        selector: opts.selector,
        land: this.geoCache.countries,
        borders: borders,
      });
    },

    scene: new THREE.Scene(),
    globe: new THREE.Object3D(),

    initThree: function(opts) {
      var segments = 155; // number of vertices. Higher = better mouse accuracy, slower loading

      // Set up cache for country textures
      var glRect = this.glEl.node().getBoundingClientRect();
      var canvas = this.glEl
        .append("canvas")
        .attr("width", glRect.width)
        .attr("height", glRect.height);

      canvas.node().getContext("webgl");

      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas.node(),
        antialias: true,
      });
      this.renderer.setSize(glRect.width, glRect.height);
      this.renderer.setClearColor(0x000000);
      this.glEl.node().appendChild(this.renderer.domElement);

      this.camera = new THREE.PerspectiveCamera(
        70,
        glRect.width / glRect.height,
        1,
        5000,
      );
      this.camera.position.z = 1000;

      var ambientLight = new THREE.AmbientLight(this.sunColor);
      this.scene.add(ambientLight);

      var light = new THREE.DirectionalLight(this.sunColor, 0.85);
      light.position.set(
        this.camera.position.x,
        this.camera.position.y + glRect.height / 2,
        this.camera.position.z,
      );
      this.scene.add(light);

      // base globe with 'water'
      var waterMaterial = new THREE.MeshPhongMaterial({
        color: this.waterColor,
        transparent: true,
      });
      var sphere = new THREE.SphereGeometry(200, segments, segments);
      var baseGlobe = new THREE.Mesh(sphere, waterMaterial);
      baseGlobe.rotation.y = Math.PI + halfPI; // centers inital render at lat 0, lon 0

      // base map with land, borders, graticule
      var baseMap = this.genMesh({ land: opts.land, borders: opts.borders });

      // add the two meshes to the container object
      this.globe.scale.set(2.5, 2.5, 2.5);
      this.globe.add(baseGlobe);
      this.globe.add(baseMap);
      this.scene.add(this.globe);
      this.renderer.render(this.scene, this.camera);

      this.rotateTo(this.geoCache.countries, 0, this.geoCache.countries.length);

      var that = this;
      window.addEventListener("resize", function(evt) {
        requestAnimationFrame(function() {
          var glRect = that.glEl.node().getBoundingClientRect();
          that.camera.aspect = glRect.width / glRect.height;
          that.camera.updateProjectionMatrix();
          that.renderer.setSize(glRect.width, glRect.height);
          that.renderer.render(that.scene, that.camera);
        });
      });
    },

    rotateTo: function(countries, cx, cLen) {
      var self = this;
      var globe = this.globe;
      var country = countries[cx];
      var mesh = this.genMesh({ country: country });
      var from = {
        x: globe.rotation.x,
        y: globe.rotation.y,
      };
      // debugger;
      var centroid = geoCentroid(country);
      var to = {
        x: this.latToX3(centroid[1]),
        y: this.lonToY3(centroid[0]),
      };
      globe.add(mesh);

      var hasta = globe.getObjectByName(this.currentId);
      // this.setSlug(country.name);

      if (hasta) {
        globe.remove(hasta);
        requestAnimationFrame(function() {
          self.renderer.render(self.scene, self.camera);
        });
      }
      this.currentId = country.key;

      requestAnimationFrame(function() {
        self.renderer.render(self.scene, self.camera);
      });
      debugger;
      transition()
        .delay(500)
        .duration(1250)
        .each("start", function() {
          self.terpObj = interpolateObject(from, to);
        })
        .tween("rotate", function() {
          return function(t) {
            debugger;
            globe.rotation.x = self.terpObj(t).x;
            globe.rotation.y = self.terpObj(t).y;
            requestAnimationFrame(function() {
              self.renderer.render(self.scene, self.camera);
            });
          };
        })
        .transition()
        .each("end", function() {
          cx += 1;
          if (cx >= cLen) {
            cx = 0;
          }
          self.rotateTo(countries, cx, cLen);
        });
    },

    genMesh: function(opts) {
      console.log("genMesh");
      var rotation;
      var segments = 155;
      var texture = this.genTexture(opts);
      var material = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true,
      });
      var mesh = new THREE.Mesh(
        new THREE.SphereGeometry(200, segments, segments),
        material,
      );

      if (opts.land) {
        mesh.name = "land";
        mesh.rotation.y = Math.PI + halfPI;
      } else {
        mesh.name = opts.country.key;
        rotation = this.globe.getObjectByName("land").rotation;
        mesh.rotation.x = rotation.x;
        mesh.rotation.y = rotation.y;
      }
      return mesh;
    },

    setSlug: function(countryname) {
      // debugger;
      // const that = this;
      // that.slug
      //   .transition()
      //   .duration(500)
      //   .style("opacity", 0)
      //   .each("end", function() {
      //     that.slug.text(countryname);
      //   })
      //   .transition()
      //   .duration(1250)
      //   .style("opacity", 1);
    },

    genTexture: function(opts) {
      var ctx = this.d3Canvas.node().getContext("2d");
      ctx.clearRect(0, 0, 2048, 1024);
      var path = geoPath(this.projection, ctx);

      if (opts.land) {
        (ctx.fillStyle = this.landColor),
          ctx.beginPath(),
          path(opts.land),
          ctx.fill();
        (ctx.strokeStyle = this.borderColor),
          (ctx.lineWidth = 0.5),
          ctx.beginPath(),
          path(opts.borders),
          ctx.stroke();
      }
      if (opts.country) {
        (ctx.fillStyle = this.countryColor),
          ctx.beginPath(),
          path(opts.country),
          ctx.fill();
      }

      var texture = new THREE.Texture(this.d3Canvas.node());
      texture.needsUpdate = true;

      return texture;
    },

    /*
          x3ToLat & y3ToLon adapted from Peter Lux,
          http://www.plux.co.uk/converting-radians-in-degrees-latitude-and-longitude/
          convert three.js rotation.x & rotation.y (radians) to lat/lon

          globe.rotation.x + blah === northward
          globe.rotation.y - blah === southward
          globe.rotation.y + blah === westward
          globe.rotation.y - blah === eastward
        */
    x3ToLat: function(rad) {
      // convert radians into latitude
      // 90 to -90

      // first, get everthing into the range -2pi to 2pi
      rad = rad % (Math.PI * 2);

      // convert negatives to equivalent positive angle
      if (rad < 0) {
        rad = twoPI + rad;
      }

      // restrict to 0 - 180
      var rad180 = rad % Math.PI;

      // anything above 90 is subtracted from 180
      if (rad180 > Math.PI / 2) {
        rad180 = Math.PI - rad180;
      }
      // if greater than 180, make negative
      if (rad > Math.PI) {
        rad = -rad180;
      } else {
        rad = rad180;
      }

      return rad / Math.PI * 180;
    },

    latToX3: function(lat) {
      return lat / 90 * halfPI;
    },

    y3ToLon: function(rad) {
      // convert radians into longitude
      // 180 to -180
      // first, get everything into the range -2pi to 2pi
      rad = rad % twoPI;
      if (rad < 0) {
        rad = twoPI + rad;
      }
      // convert negatives to equivalent positive angle
      var rad360 = rad % twoPI;

      // anything above 90 is subtracted from 360
      if (rad360 > Math.PI) {
        rad360 = twoPI - rad360;
      }

      // if greater than 180, make negative
      if (rad > Math.PI) {
        rad = -rad360;
      } else {
        rad = rad360;
      }
      return rad / Math.PI * 180;
    },

    lonToY3: function(lon) {
      return -(lon / 180) * Math.PI;
    },
  };

  var loaded = function(geojson, names) {
    var worldOpts = {
      selector: "#three-box",
      data: geojson,
      names: names,
    };
    world.init(worldOpts);
  };

  window.addEventListener("DOMContentLoaded", function() {
    d3json("world.json", function(d) {
      return d;
    }).then(function(geojson) {
      d3tsv("world-country-names.tsv", function(d) {
        return d;
      }).then(function(names) {
        loaded(geojson, names);
      });
    });
  });
})();
