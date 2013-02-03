(function() {
  window.anima = {
    init: function() {
      this.world = new World();
      return this.world;
    }
  };
  var easings = function() {
    var fn = {
      quad: function(p) {
        return Math.pow(p, 2);
      },
      cubic: function(p) {
        return Math.pow(p, 2);
      },
      quart: function(p) {
        return Math.pow(p, 4);
      },
      quint: function(p) {
        return Math.pow(p, 5);
      },
      expo: function(p) {
        return Math.pow(p, 6);
      },
      sine: function(p) {
        return 1 - Math.cos(p * Math.PI / 2);
      },
      circ: function(p) {
        return 1 - Math.sqrt(1 - p * p);
      },
      back: function(p) {
        return p * p * (3 * p - 2);
      }
    };
    var easings = {
      linear: function(p) {
        return p;
      }
    };
    Object.keys(fn).forEach(function(name) {
      var ease = fn[name];
      easings["ease-in-" + name] = ease;
      easings["ease-out-" + name] = function(p) {
        return 1 - ease(1 - p);
      };
      easings["ease-in-out-" + name] = function(p) {
        return p < .5 ? ease(p * 2) / 2 : 1 - ease(p * -2 + 2) / 2;
      };
    });
    return easings;
  }();
  function EventEmitter() {
    this.handlers = {};
  }
  EventEmitter.prototype.on = function(event, handler) {
    (this.handlers[event] = this.handlers[event] || []).push(handler);
    return this;
  };
  EventEmitter.prototype.off = function(event, handler) {
    var handlers = this.handlers[event];
    if (handler) {
      handlers.splice(handlers.indexOf(handler), 1);
    } else {
      handlers = [];
    }
    return this;
  };
  EventEmitter.prototype.emit = function(event) {
    var args = Array.prototype.slice.call(arguments, 1), handlers = this.handlers[event], len;
    if (handlers) {
      len = handlers.length;
      for (var i = 0; i < len; ++i) {
        handlers[i].apply(this, args);
      }
    }
    return this;
  };
  function Animation(item, transform, duration, easing, delay) {
    EventEmitter.call(this);
    this.item = item;
    this.translate = transform.translate;
    this.rotate = transform.rotate;
    this.scale = transform.scale;
    this.start = null;
    this.duration = duration || 500;
    this.delay = delay || 0;
    this.easing = easings[easing] || easings.linear;
  }
  Animation.prototype = new EventEmitter();
  Animation.prototype.constructor = Animation;
  Animation.prototype.init = function init() {
    if (this.start !== null) return;
    this.start = Date.now();
    var state = this.item.state;
    this.initial = {
      translate: state.translate,
      rotate: state.rotate,
      scale: state.scale
    };
  };
  Animation.prototype.animation = function animaiton() {
    return this.item.animation.apply(this.item, arguments);
  };
  Animation.prototype.run = function run(timestamp) {
    var percent = (timestamp - this.start) / this.duration;
    if (percent < 0) percent = 0;
    percent = this.easing(percent);
    this.transform(percent);
  };
  Animation.prototype.transform = function change(percent) {
    var state = this.item.state, initial = this.initial;
    if (this.translate && (this.translate[0] || this.translate[1] || this.translate[2])) {
      state.translate = [ initial.translate[0] + this.translate[0] * percent, initial.translate[1] + this.translate[1] * percent, initial.translate[2] + this.translate[2] * percent ];
    }
    if (this.rotate && (this.rotate[0] || this.rotate[1] || this.rotate[2])) {
      state.rotate = [ initial.rotate[0] + this.rotate[0] * percent, initial.rotate[1] + this.rotate[1] * percent, initial.rotate[2] + this.rotate[2] * percent ];
    }
    if (this.scale && (this.scale[0] || this.scale[1] || this.scale[2])) {
      state.scale = [ initial.scale[0] + this.scale[0] * percent, initial.scale[1] + this.scale[1] * percent, initial.scale[2] + this.scale[2] * percent ];
    }
  };
  Animation.prototype.end = function end(abort) {
    !abort && this.transform(1);
    this.emit("end");
  };
  function World(items) {
    this.items = items || [];
    this.init();
  }
  World.prototype.init = function init() {
    var self = this, onFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
    onFrame(function update(timestamp) {
      self.update(timestamp);
      onFrame(update);
    });
  };
  World.prototype.add = function add(node) {
    var item = new Item(node);
    this.items.push(item);
    return item;
  };
  World.prototype.update = function update(timestamp) {
    for (var i = 0, len = this.items.length; i < len; i++) {
      this.items[i].update(timestamp);
    }
  };
  World.prototype.on = function on(event, handler) {
    window.addEventListener(event, handler);
  };
  var Matrix = window.Matrix = function() {
    var slice = Array.prototype.slice, radians = Math.PI / 180;
    function id() {
      return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
    }
    function multiply(a, b) {
      var c = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ];
      c[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8];
      c[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9];
      c[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10];
      c[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8];
      c[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9];
      c[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10];
      c[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8];
      c[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9];
      c[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10];
      c[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + b[12];
      c[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + b[13];
      c[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + b[14];
      return 2 >= arguments.length ? c : multiply.apply(null, [ c ].concat(slice.call(arguments, 2)));
    }
    function translate(tx, ty, tz) {
      tx || (tx = 0);
      ty || (ty = 0);
      tz || (tz = 0);
      return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1 ];
    }
    function translateX(t) {
      return translate(t, 0, 0);
    }
    function translateY(t) {
      return translate(0, t, 0);
    }
    function translateZ(t) {
      return translate(0, 0, t);
    }
    function scale(sx, sy, sz) {
      sx || (sx = 0);
      sy || (sy = sx);
      sz || (sz = 1);
      return [ sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1 ];
    }
    function scaleX(s) {
      return scale(s, 0, 0);
    }
    function scaleY(s) {
      return scale(0, s, 0);
    }
    function scaleZ(s) {
      return scale(0, 0, s);
    }
    function rotate(ax, ay, az) {
      ax || (ax = 0);
      ay || (ay = 0);
      az || (az = 0);
      ax *= radians;
      ay *= radians;
      az *= radians;
      var sx = Math.sin(ax), cx = Math.cos(ax), sy = Math.sin(ay), cy = Math.cos(ay), sz = Math.sin(az), cz = Math.cos(az);
      return [ cy * cz, cx * sz + sx * sy * cz, sx * sz - cx * sy * cz, 0, -cy * sz, cx * cz - sx * sy * sz, sx * cz + cx * sy * sz, 0, sy, -sx * cy, cx * cy, 0, 0, 0, 0, 1 ];
    }
    function rotateX(a) {
      a *= radians;
      var s = Math.sin(a), c = Math.cos(a);
      return [ 1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1 ];
    }
    function rotateY(a) {
      a *= radians;
      var s = Math.sin(a), c = Math.cos(a);
      return [ c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1 ];
    }
    function rotateZ(a) {
      a *= radians;
      var s = Math.sin(a), c = Math.cos(a);
      return [ c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
    }
    function rotate3d(x, y, z, a) {
      a *= radians;
      var s = Math.sin(a), c = Math.cos(a), len = Math.sqrt(x * x + y * y + z * z);
      if (len === 0) {
        x = 0;
        y = 0;
        z = 1;
      } else if (len !== 1) {
        x /= len;
        y /= len;
        z /= len;
      }
      var xx = x * x, yy = y * y, zz = z * z, _c = 1 - c;
      return [ xx + (1 - xx) * c, x * y * _c + z * s, x * z * _c - y * s, 0, x * y * _c - z * s, yy + (1 - yy) * c, y * z * _c + x * s, 0, x * z * _c + y * s, y * z * _c - x * s, zz + (1 - zz) * c, 0, 0, 0, 0, 1 ];
    }
    function skew(ax, ay) {
      ax *= radians;
      ay *= radians;
      return [ 1, Math.tan(ay), 0, 0, Math.tan(ax), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
    }
    function skewX(a) {
      return skew(a, 0);
    }
    function skewY(a) {
      return skew(0, a);
    }
    function perspective(p) {
      p = -1 / p;
      return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, p, 0, 0, 0, 1 ];
    }
    function matrix(m) {
      for (var i = 0, l = m.length; i < l; ++i) if (Math.abs(m[i]) < 1e-6) m[i] = 0;
      return "matrix3d(" + m.join() + ")";
    }
    return {
      toString: matrix,
      id: id,
      multiply: multiply,
      rotate: rotate,
      rotate3d: rotate3d,
      rotateX: rotateX,
      rotateY: rotateY,
      rotateZ: rotateZ,
      translate: translate,
      translateX: translateX,
      translateY: translateY,
      translateZ: translateZ,
      perspective: perspective,
      skew: skew,
      skewX: skewX,
      skewY: skewY,
      scale: scale
    };
  }();
  function Item(node) {
    EventEmitter.call(this);
    this.dom = node;
    this.animations = [];
    this._dirty = false;
    this.init();
  }
  Item.prototype = new EventEmitter();
  Item.prototype.constructor = Item;
  Item.prototype.init = function init() {
    this.state = {
      translate: [ 0, 0, 0 ],
      rotate: [ 0, 0, 0 ],
      scale: [ 1, 1, 1 ]
    };
    this.transform = {
      translate: [ 0, 0, 0 ],
      rotate: [ 0, 0, 0 ],
      scale: [ 0, 0, 0 ]
    };
    this.on("transform", function onTransform(translate, rotate, scale) {
      this.transform.translate = translate;
      this.transform.rotate = rotate;
      this.transform.scale = scale;
      this._dirty = true;
    });
  };
  Item.prototype.update = function update(timestamp) {
    var self = this;
    this.animate(timestamp);
    this.dom.style.webkitTransform = Matrix.toString(Matrix.multiply.apply(null, Object.keys(self.state).map(function(t) {
      return Matrix[t].apply(null, self.state[t]);
    })));
  };
  Item.prototype.translate = function translate(t) {
    this.state.translate[0] += t[0];
    this.state.translate[1] += t[1];
    this.state.translate[2] += t[2];
  };
  Item.prototype.rotate = function rotate(r) {
    this.state.rotate[0] += r[0];
    this.state.rotate[1] += r[1];
    this.state.rotate[2] += r[2];
  };
  Item.prototype.scale = function scale(s) {
    this.state.scale[0] += s[0];
    this.state.scale[1] += s[1];
    this.state.scale[2] += s[2];
  };
  Item.prototype.clear = function clear() {
    this.state.translate = [ 0, 0, 0 ];
    this.state.rotate = [ 0, 0, 0 ];
    this.state.scale = [ 0, 0, 0 ];
  };
  Item.prototype.anim = Item.prototype.animation = function animation(transform, duration, easing) {
    var animation = new Animation(this, transform, duration, easing);
    this.animations.push(animation);
    this.transform = {
      translate: [ 0, 0, 0 ],
      rotate: [ 0, 0, 0 ],
      scale: [ 0, 0, 0 ]
    };
    return animation;
  };
  Item.prototype.animate = function animate(timestamp) {
    if (this.animations.length === 0 && this._dirty) {
      this.animation({
        translate: this.transform.translate,
        rotate: this.transform.rotate
      });
      this._dirty = false;
    }
    if (this.animations.length === 0) return;
    while (this.animations.length !== 0) {
      var first = this.animations[0];
      first.init();
      if (first.start + first.duration <= Date.now()) {
        this.animations.shift();
        first.end();
        continue;
      }
      first.run(timestamp);
      break;
    }
  };
  Item.prototype.reset = function reset() {
    if (this.animations.length === 0) return;
    for (var i = 0, len = this.animations.length; i < len; i++) {
      var a = this.animations[i];
      a.end(true);
    }
    this.animations = [];
    this.transform = {
      translate: [ 0, 0, 0 ],
      rotate: [ 0, 0, 0 ],
      scale: [ 0, 0, 0 ]
    };
  };
})();