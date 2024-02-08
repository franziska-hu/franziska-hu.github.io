(function () {
    function e(n) {
      if (o[n]) {
        return o[n].exports;
      }
      var r = o[n] = {exports: {}, id: n, loaded: false};
      t[n].call(r.exports, r, r.exports, e);
      r.loaded = true;
      return r.exports;
    }
    var t = [function (t, e) {
      var o = AFRAME.utils.debug;
      var n = AFRAME.utils.coordinates;
      var r = o("components:look-at:warn");
      var i = n.isCoordinates || n.isCoordinate;
      delete AFRAME.components["look-at"];
      AFRAME.registerComponent("look-at", {schema: {default: "", parse: function (t) {
        if (i(t) || typeof t == "object") {
          return n.parse(t);
        } else {
          return t;
        }
      }, stringify: function (t) {
        if (typeof t == "object") {
          return n.stringify(t);
        } else {
          return t;
        }
      }}, init: function () {
        this.target3D = null;
        this.vector = new THREE.Vector3;
      }, update: function () {
        var t;
        var e = this;
        var o = e.data;
        var n = e.el.object3D;
        if (!o || typeof o == "object" && !Object.keys(o).length) {
          return e.remove();
        } else if (typeof o == "object") {
          return n.lookAt(new THREE.Vector3(o.x, o.y, o.z));
        } else {
          t = e.el.sceneEl.querySelector(o);
          if (t) {
            if (t.hasLoaded) {
              return e.beginTracking(t);
            } else {
              return t.addEventListener("loaded", function () {
                e.beginTracking(t);
              });
            }
          } else {
            r('"' + o + '" does not point to a valid entity to look-at');
            return;
          }
        }
      }, tick: function () {
        var t = new THREE.Vector3;
        return function (e) {
          var o = this.target3D;
          var n = this.el.object3D;
          var r = this.vector;
          if (o) {
            o.getWorldPosition(t);
            if (!this.el.getObject3D("camera")) {
              r = t;
            }
            n.lookAt(r);
          }
        };
      }(), beginTracking: function (t) {
        this.target3D = t.object3D;
      }});
    }];
    var o = {};
    e.m = t;
    e.c = o;
    e.p = "";
    return e(0);
  }());
  