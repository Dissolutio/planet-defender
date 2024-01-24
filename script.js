const ASTEROID_SPRITE_ROWS = 4;

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
  shoot() {
    const projectile = this.game.getProjectile();
    if (projectile) {
      // we adjust the starting point outwards a little so it launches from the tip of the player's ship
      const startX = this.x + this.radius * this.aim[0];
      const startY = this.y + this.radius * this.aim[1];
      projectile.start(startX, startY, this.aim[0], this.aim[1]);
    }
  }
}
class Projectile {
  constructor(game) {
    this.game = game;
    this.x;
    this.y;
    this.radius = 5;
    this.speedX = 1;
    this.speedY = 1;
    this.speedModifier = 5;
    this.free = true;
  }
  start(x, y, speedX, speedY) {
    this.free = false;
    this.x = x;
    this.y = y;
    this.speedX = speedX * this.speedModifier;
    this.speedY = speedY * this.speedModifier;
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
      this.x += this.speedX;
      this.y += this.speedY;
    }
    // reset if outside visible game area
    if (
      this.x < 0 ||
      this.x > this.game.width ||
      this.y < 0 ||
      this.y > this.game.height
    ) {
      this.reset();
    }
  }
}

class Enemy {
  constructor(game) {
    this.game = game;
    this.x = 100;
    this.y = 100;
    this.radius = 40;
    this.width = this.radius * 2;
    this.height = this.radius * 2;
    this.speedX = 0;
    this.speedY = 0;
    // this.speedModifier = 5;
    this.free = true;
  }
  // start(x, y, speedX, speedY) {
  start() {
    this.free = false;
    this.frameX = 0;
    this.lives = this.maxLives;
    // randomize the sprite on re-use of object
    this.frameY = Math.floor(Math.random() * ASTEROID_SPRITE_ROWS);
    // this spawns enemies either along top & bottom, or left & right sides of screen
    if (Math.random() > 0.5) {
      this.x = Math.random() * this.game.width;
      this.y =
        Math.random() > 0.5 ? -this.radius : this.game.height + this.radius;
    } else {
      this.x = Math.random() > 0.5 ? -this.radius : this.game.width;
      this.y = Math.random() * this.game.height + this.radius;
    }

    const aim = this.game.calcAim(this, this.game.planet);
    this.speedX = aim[0];
    this.speedY = aim[1];
  }
  hit(damage) {
    this.lives -= damage;
  }
  reset() {
    this.free = true;
  }
  draw(context) {
    if (!this.free) {
      // draw image
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x - this.radius,
        this.y - this.radius,
        this.width,
        this.height
      );
      if (this.game.debug) {
        // draw collision circles in debug mode
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.stroke();
      }
    }
  }
  update() {
    if (this.frameX > this.maxFrame) {
      this.reset();
    }
    if (!this.free) {
      this.x += this.speedX;
      this.y += this.speedY;
    }
    // check collision with enemy planet / player
    if (
      this.game.calcCollision(this, this.game.planet) ||
      this.game.calcCollision(this, this.game.player)
    ) {
      this.reset();
    }
    // check collision with enemy / projectiles
    this.game.projectilePool.forEach((projectile) => {
      if (!projectile.free && this.game.calcCollision(this, projectile)) {
        projectile.reset();
        this.hit(1);
      }
    });
    if (this.lives < 1) {
      this.frameX++;
    }
  }
}
class Asteroid extends Enemy {
  constructor(game) {
    super(game);
    this.image = document.getElementById("asteroid");
    this.frameX = 0;
    this.frameY = Math.floor(Math.random() * ASTEROID_SPRITE_ROWS);
    this.maxFrame = 7;
    this.lives = 1;
    this.maxLives = 1;
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
    this.numberOfProjectiles = 20; // too few and we might run out, too many and we are wasting memory
    this.createProjectilePool();

    this.enemyPool = [];
    this.numberOfEnemies = 20; // too few and we might run out, too many and we are wasting memory
    this.createEnemyPool();

    // start 1 enemy
    this.enemyPool[0].start();

    this.enemyTimer = 0;
    this.enemyInterval = 1700;

    this.mouse = {
      x: 0,
      y: 0,
    };

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
    });
    window.addEventListener("mousedown", (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
      this.player.shoot();
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "d") {
        this.debug = !this.debug;
      }
      if (e.key === "1") {
        this.player.shoot();
      }
    });
  }
  render(context, deltaTime) {
    this.planet.draw(context);
    this.player.draw(context);
    this.player.update();
    this.projectilePool.forEach((projectile) => {
      projectile.draw(context);
      projectile.update();
    });
    this.enemyPool.forEach((enemy) => {
      enemy.draw(context);
      enemy.update();
    });
    // periodically spawn an enemy
    if (this.enemyTimer < this.enemyInterval) {
      this.enemyTimer += deltaTime;
    } else {
      this.enemyTimer = 0;
      const enemy = this.getEnemy();
      if (enemy) {
        enemy.start();
      }
    }
  }
  calcAim(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.hypot(dx, dy);
    const aimX = (dx / distance) * -1;
    const aimY = (dy / distance) * -1;
    return [aimX, aimY, dx, dy];
  }
  calcCollision(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.hypot(dx, dy);
    return distance < a.radius + b.radius;
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
  createEnemyPool() {
    for (let i = 0; i < this.numberOfEnemies; i++) {
      this.enemyPool.push(new Asteroid(this));
    }
  }
  getEnemy() {
    for (let i = 0; i < this.enemyPool.length; i++) {
      if (this.enemyPool[i].free) {
        return this.enemyPool[i];
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
  let lastTime = 0;
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.height, canvas.width);
    game.render(ctx, deltaTime);
    requestAnimationFrame(animate);
  }
});
