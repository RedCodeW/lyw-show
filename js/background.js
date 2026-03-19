(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let particles = [];
  let geometries = [];
  let mouse = { x: -9999, y: -9999 };
  let animationId;

  const CONFIG = {
    particleCount: 80,
    geometryCount: 6,
    maxConnectionDist: 160,
    particleSpeed: 0.3,
    mouseRadius: 200,
    mouseForce: 0.02,
    colors: {
      particle: { r: 100, g: 160, b: 246 },
      geometry: [
        { r: 100, g: 181, b: 246 },
        { r: 171, g: 127, b: 255 },
        { r: 130, g: 200, b: 255 },
      ],
      line: { r: 100, g: 160, b: 246 },
    },
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---- Particle ---- */
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * CONFIG.particleSpeed * 2;
      this.vy = (Math.random() - 0.5) * CONFIG.particleSpeed * 2;
      this.radius = Math.random() * 1.8 + 0.6;
      this.baseAlpha = Math.random() * 0.5 + 0.3;
    }

    update() {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.mouseRadius && dist > 0) {
        const force = (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseForce;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }

      this.vx *= 0.99;
      this.vy *= 0.99;
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0) {
        this.x = 0;
        this.vx *= -1;
      }
      if (this.x > width) {
        this.x = width;
        this.vx *= -1;
      }
      if (this.y < 0) {
        this.y = 0;
        this.vy *= -1;
      }
      if (this.y > height) {
        this.y = height;
        this.vy *= -1;
      }
    }

    draw() {
      const c = CONFIG.colors.particle;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${this.baseAlpha})`;
      ctx.fill();
    }
  }

  /* ---- Geometry (floating shapes) ---- */
  class Geometry {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = (Math.random() - 0.5) * 0.15;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.003;
      this.size = Math.random() * 30 + 20;
      this.alpha = Math.random() * 0.06 + 0.02;

      const sides = [3, 4, 6];
      this.sides = sides[Math.floor(Math.random() * sides.length)];

      const palette = CONFIG.colors.geometry;
      this.color = palette[Math.floor(Math.random() * palette.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;

      if (this.x < -this.size) this.x = width + this.size;
      if (this.x > width + this.size) this.x = -this.size;
      if (this.y < -this.size) this.y = height + this.size;
      if (this.y > height + this.size) this.y = -this.size;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.beginPath();

      for (let i = 0; i <= this.sides; i++) {
        const angle = (i * 2 * Math.PI) / this.sides - Math.PI / 2;
        const px = Math.cos(angle) * this.size;
        const py = Math.sin(angle) * this.size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.closePath();
      const { r, g, b } = this.color;
      ctx.strokeStyle = `rgba(${r},${g},${b},${this.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ---- Connection lines ---- */
  function drawConnections() {
    const c = CONFIG.colors.line;
    const maxDist = CONFIG.maxConnectionDist;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ---- Mouse connection lines ---- */
  function drawMouseConnections() {
    if (mouse.x < 0 || mouse.y < 0) return;
    const c = CONFIG.colors.line;
    const maxDist = CONFIG.mouseRadius;

    for (let i = 0; i < particles.length; i++) {
      const dx = mouse.x - particles[i].x;
      const dy = mouse.y - particles[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.3;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  /* ---- Init & Loop ---- */
  function init() {
    resize();

    const count = width < 768 ? Math.floor(CONFIG.particleCount * 0.5) : CONFIG.particleCount;
    particles = Array.from({ length: count }, () => new Particle());
    geometries = Array.from({ length: CONFIG.geometryCount }, () => new Geometry());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    geometries.forEach((g) => {
      g.update();
      g.draw();
    });

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    drawConnections();
    drawMouseConnections();

    animationId = requestAnimationFrame(animate);
  }

  /* ---- Events ---- */
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      particles.forEach(function (p) {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      });
    }, 150);
  });

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  /* ---- Performance: pause when tab hidden ---- */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });

  init();
  animate();
})();
