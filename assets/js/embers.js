const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let particles = [];
let lastScroll = window.scrollY;

let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

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
    this.speedX = Math.random() * 0.1 - 0.05;
    this.alpha = Math.random() * 0.2 + 0.1;
    this.color = `rgba(255, 255, 255, ${this.alpha})`;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update(scrollDelta) {
    this.x += this.speedX;
    this.y += this.speedY;

    // scroll movement
    this.y -= scrollDelta;

    // mouse repel
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const repelRadius = 100;
    if (dist < repelRadius && dist > 0) {
      const force = (repelRadius - dist) / repelRadius;
      this.x += (dx / dist) * force * 3;
      this.y += (dy / dist) * force * 3;
    }

    // reset if offscreen
    if (this.y < 0 || this.y > canvas.height || this.x < 0 || this.x > canvas.width) this.reset();
  }
}

for (let i = 0; i < 20; i++) particles.push(new Particle());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scrollDelta = window.scrollY - lastScroll;

  for (const p of particles) {
    p.update(scrollDelta);
    p.draw();
  }

  lastScroll = window.scrollY;
  requestAnimationFrame(animate);
}

animate();
