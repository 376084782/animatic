function Parallel(item, animations, duration, easing, delay) {
  EventEmitter.call(this)
  
  this.item = item
  
  this.animations = animations.map(function(a){
    return new Animation(item, a.transform, a.duration || duration, a.easing || easing, a.delay || delay)
  })
  
  this.start = null
  
  this.delay = 0
  
  this.duration = Math.max.apply(null, this.animations.map(function(a){
    return a.duration + a.delay
  }))
}

Parallel.prototype = new EventEmitter
Parallel.prototype.constructor = Parallel

Parallel.prototype.init = function init(tick) {
  if (this.start !== null) return
  this.start = tick
  for (var i = 0, len = this.animations.length; i < len; ++i) {
    this.animations[i].init(tick)
  }
}

Parallel.prototype.animation = function animaiton() {
  return this.item.animation.apply(this.item, arguments)
}

Parallel.prototype.run = function run(tick) {
  for (var i = 0; i < this.animations.length; ++i) {
    var a = this.animations[i]
    if (a.start + a.delay + a.duration <= tick) {
      this.animations.splice(i, 1)
      a.end()
      --i
      continue
    }
    a.run(tick)
  }
}

Parallel.prototype.end = function end(abort) {
  for (var i = 0, len = this.animations.length; i < len; ++i) {
    this.animations[i].end(abort)
  }
  this.emit('end')
}
