const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let particles = [];
let lastScroll = window.scrollY;

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedY = Math.random() * -0.1 - 0.05;
    this.speedX = Math.random() * 0.1 - 0.05; // drift left/right
    this.alpha = Math.random() * 0.2 + 0.1;
    this.color = `rgba(255, 255, 255, ${this.alpha})`;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

for (let i = 0; i < 20; i++) particles.push(new Particle());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scrollDelta = window.scrollY - lastScroll;

  for (const p of particles) {
    p.x += p.speedX;
    p.y += p.speedY;

    // scroll movement
    p.y -= scrollDelta;

    // reset if offscreen
    if (p.y < 0 || p.y > canvas.height || p.x < 0 || p.x > canvas.width) p.reset();

    p.draw();
  }

  lastScroll = window.scrollY;
  requestAnimationFrame(animate);
}

animate();
