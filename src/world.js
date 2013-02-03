function World(items) {
  this.items = items || []
  this.init()
}

World.prototype.init = function init() {
  var self = this,
      onFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
      
  onFrame(function update(timestamp) {
    self.update(timestamp)
    onFrame(update)
  })
}

World.prototype.add = function add(node) {
  var item = new Item(node)
  this.items.push(item)
  return item
}

World.prototype.update = function update(timestamp) {
  for (var i = 0, len = this.items.length; i < len; i++) {
    this.items[i].update(timestamp)
  }
}

World.prototype.on = function on(event, handler) {
  window.addEventListener(event, handler)
}
