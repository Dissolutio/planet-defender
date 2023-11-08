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
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.stroke();
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
  }
  draw(context) {
    context.drawImage(this.image, this.x - this.radius, this.y - this.radius);
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.stroke();
  }
  update() {
    this.aim = this.game.calcAim(this.game.mouse, this.game.planet);
    this.x =
      this.game.planet.x +
      (this.game.planet.radius + this.radius) * this.aim[0];
    this.y =
      this.game.planet.y +
      (this.game.planet.radius + this.radius) * this.aim[1];
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.planet = new Planet(this);
    this.player = new Player(this);
    this.mouse = {
      x: 0,
      y: 0,
    };
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
    });
  }
  render(context) {
    this.planet.draw(context);
    this.player.draw(context);
    this.player.update();
    /* 
        draws a line from the planet to the mouse
    */
    context.beginPath();
    context.moveTo(this.planet.x, this.planet.y);
    context.lineTo(this.mouse.x, this.mouse.y);
    context.stroke();
  }
  calcAim(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const distance = Math.hypot(dx, dy);
    const aimX = dx / distance;
    const aimY = dy / distance;
    return [aimX, aimY, dx, dy];
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
