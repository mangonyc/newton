function Particle(x, y, m) {
  this.mass = m || 1.0;
  this.elasticity = 0.5;
  this.drag = 0.9999;
  this.velX = this.velY = 0;
  this.accX = this.accY = 0;
  this.minX = 0;
  this.minY = 0;
  this.maxX = 100;
  this.maxY = 100;
  this.setPos(x, y);
}

Particle.prototype.setPos = function(x, y) {
  this.x = this.x1 = x;
  this.y = this.y1 = y;
};

Particle.prototype.integrate = function(time, correction) {
  this.velX = this.getChangeX();
  this.velY = this.getChangeY();
  var tSquared = time * time;

  // Record last location
  this.x1 = this.x;
  this.y1 = this.y;

  // Time-Corrected Verlet integration (TCV)
  this.x = this.x + this.velX * correction + this.accX * tSquared;
  this.y = this.y + this.velY * correction + this.accY * tSquared;

  // Reset acceleration after integration
  this.accX = this.accY = 0;
};

Particle.prototype.getChangeX = function() {
  return this.x - this.x1;
};

Particle.prototype.getChangeY = function() {
  return this.y - this.y1;
};

Particle.prototype.move = function(dx, dy) {
  this.x1 = this.x;
  this.y1 = this.y;
  this.x += dx;
  this.y += dy;
};

Particle.prototype.boundaries = function(minX, minY, maxX, maxY) {
  this.minX = minX;
  this.minY = minY;
  this.maxX = maxX;
  this.maxY = maxY;
};

Particle.prototype.contain = function(time, correction) {
  if (this.x > this.maxX) this.x = this.maxX;
  else if (this.x < this.minX) this.x = this.minX;
  if (this.y > this.maxY) this.y = this.maxY;
  else if (this.y < this.minY) this.y = this.minY;
};

Particle.prototype.collide = function(segments) {
  var nearest, intersect;
  var i = segments.length;
  while (i--) {
    intersect = segments[i].intersection(this.x1, this.y1, this.x, this.y);
    if (intersect) {
      var dx = intersect.x - this.x1;
      var dy = intersect.y - this.y1;
      if (nearest) {
        var oldDistance = Math.sqrt(nearest.dx * nearest.dx + nearest.dy * nearest.dy);
        var newDistance = Math.sqrt(dx * dx + dy * dy);
        if (newDistance < oldDistance) {
          nearest = {
            dx: dx,
            dy: dy,
            x: intersect.x,
            y: intersect.y,
            segment: segments[i]
          };
        }
      }
      else {
        nearest = {
          dx: dx,
          dy: dy,
          x: intersect.x,
          y: intersect.y,
          segment: segments[i]
        };
      }
    }
  }
  if (nearest) {
    var projection = nearest.segment.project(this.x1, this.y1, this.x, this.y);
    var totalDx = this.x - this.x1;
    var totalDy = this.y - this.y1;
    var totalMotion = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
    var spentMotion = Math.sqrt(nearest.dx * nearest.dx + nearest.dy * nearest.dy);
    var remainingMotion = 1 - spentMotion / totalMotion;

    this.x = nearest.x;
    this.y = nearest.y;

    this.x += projection.x * remainingMotion;
    this.y += projection.y * remainingMotion;

    this.x1 = this.x - projection.x;
    this.y1 = this.y - projection.y;

    return nearest;
  }
};

Particle.prototype.force = function(x, y) {
  this.accX += (x / this.mass);
  this.accY += (y / this.mass);
};

Particle.prototype.accelerate = function(x, y) {
  this.accX += x;
  this.accY += y;
};

Particle.prototype.gravitate = function(x, y, m) {
  var dx = x - this.x;
  var dy = y - this.y;
  var r = Math.sqrt(dx * dx + dy * dy);
  var f = (m * this.mass) / (r * r);
  var ratio = m / (m + this.mass);
  this.accX += f * (dx / r) * ratio;
  this.accY += f * (dy / r) * ratio;
};

if (typeof module !== 'undefined') module.exports = Particle;
