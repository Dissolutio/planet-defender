class Planet {
  constructor(game) {
    this.game = game;
    this.x = this.game.width * 0.5;
    this.y = this.game.height * 0.5;
    this.radius = 80;
    this.cloudRadius = 100; // the clouds of the planet stick out 20px, but will not count towards sprite collisions
    this.image = document.getElementById("planet");
  }
  draw(context) {
    context.drawImage(
      this.image,
      this.x - this.cloudRadius,
      this.y - this.cloudRadius
    );
    if (this.game.debug) {
      // draw hit circle around planet
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.stroke();
    }
  }
}

class Player {
  constructor(game) {
    this.game = game;
    this.x = this.game.width * 0.5;
    this.y = this.game.height * 0.5;
    this.radius = 40; // player and monsters are 40px radius, rectangular sprites are 80x80, radius of planet is 80
    this.image = document.getElementById("player");
    this.aim;
    this.angle = Math.PI * 2;
  }
  draw(context) {
    context.save(); // before we do the rotation, we do not want to rotate everything drawn after this
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.drawImage(this.image, -this.radius, -this.radius);
    if (this.game.debug) {
      // draw hit circle around player
      context.beginPath();
      context.arc(0, 0, this.radius, 0, Math.PI * 2);
      context.stroke();
    }

    context.restore(); // after we do the rotation, restore canvas state
  }
  update() {
    this.aim = this.game.calcAim(this.game.planet, this.game.mouse);
    this.x =
      this.game.planet.x +
      (this.game.planet.radius + this.radius) * this.aim[0];

    this.y =
      this.game.planet.y +
      (this.game.planet.radius + this.radius) * this.aim[1];
    this.angle = Math.atan2(this.aim[3], this.aim[2]);
  }
}
class Projectile {
  constructor(game) {
    this.game = game;
    this.x;
    this.y;
    this.radius = 20;
    this.free = true;
  }
  start() {
    this.free = false;
  }
  reset() {
    this.free = true;
  }
  draw(context) {
    if (!this.free) {
      context.save();
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.fillStyle = "gold";
      context.fill();
      context.restore();
    }
  }
  update() {
    if (!this.free) {
      // do not update object unless it is being used
    }
  }
}
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.planet = new Planet(this);
    this.player = new Player(this);
    this.debug = false;
    this.projectilePool = [];
    this.numberOfProjectiles = 5; // too few and we might run out, too many and we are wasting memory
    this.createProjectilePool();

    this.mouse = {
      x: 0,
      y: 0,
    };
    this.debug = false;

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "d") {
        this.debug = !this.debug;
      }
    });
  }
  render(context) {
    this.planet.draw(context);
    this.player.draw(context);
    this.player.update();
    this.projectilePool.forEach((projectile) => {
      projectile.draw(context);
      projectile.update();
    });
  }
  calcAim(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.hypot(dx, dy);
    const aimX = (dx / distance) * -1;
    const aimY = (dy / distance) * -1;
    return [aimX, aimY, dx, dy];
  }
  createProjectilePool() {
    for (let i = 0; i < this.numberOfProjectiles; i++) {
      this.projectilePool.push(new Projectile(this));
    }
  }
  getProjectile() {
    for (let i = 0; i < this.projectilePool.length; i++) {
      if (this.projectilePool[i].free) {
        return this.projectilePool[i];
      }
    }
  }
}

window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 800;
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  const game = new Game(canvas);
  game.render(ctx);
  /* 
    kick off the animation loop for every frame
  */
  requestAnimationFrame(animate);
  function animate() {
    ctx.clearRect(0, 0, canvas.height, canvas.width);
    game.render(ctx);
    requestAnimationFrame(animate);
  }
});
