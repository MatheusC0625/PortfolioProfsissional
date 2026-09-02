document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initEmailCopy();
  initProjectPreview();
});

function initProjectPreview() {
  const OFFSET_X = 24;
  const OFFSET_Y = 24;
  const EDGE_MARGIN = 16;

  document.querySelectorAll('.project-row').forEach((row) => {
    const preview = row.querySelector('.project-preview');
    if (!preview) return;

    const move = (event) => {
      const rect = preview.getBoundingClientRect();
      let x = event.clientX + OFFSET_X;
      let y = event.clientY + OFFSET_Y;

      if (x + rect.width > window.innerWidth - EDGE_MARGIN) {
        x = event.clientX - rect.width - OFFSET_X;
      }
      if (y + rect.height > window.innerHeight - EDGE_MARGIN) {
        y = event.clientY - rect.height - OFFSET_Y;
      }

      preview.style.transform = `translate(${x}px, ${y}px)`;
    };

    row.addEventListener('mouseenter', (event) => {
      preview.classList.add('is-visible');
      move(event);
    });
    row.addEventListener('mousemove', move);
    row.addEventListener('mouseleave', () => {
      preview.classList.remove('is-visible');
    });
  });
}

function initEmailCopy() {
  const emailCard = document.querySelector('.contact-card--email');
  if (!emailCard) return;

  const platformLabel = emailCard.querySelector('.contact-platform');
  const originalLabel = platformLabel.textContent;
  const email = emailCard.getAttribute('href').replace('mailto:', '');
  let resetTimer;

  emailCard.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const helper = document.createElement('textarea');
      helper.value = email;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      document.body.removeChild(helper);
    }

    platformLabel.textContent = 'E-mail copiado!';
    emailCard.classList.add('contact-card--copied');

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      platformLabel.textContent = originalLabel;
      emailCard.classList.remove('contact-card--copied');
    }, 1800);
  });
}

function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, particles;
  const mouse = { x: null, y: null, radius: 140 };

  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue('--hero-accent').trim() || '#C2660A';

  function resize() {
    width = canvas.width = hero.clientWidth;
    height = canvas.height = hero.clientHeight;
    createParticles();
  }

  function createParticles() {
    const density = width < 600 ? 12000 : 9000;
    const count = Math.min(90, Math.floor((width * height) / density));

    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 110) * 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = accent;
          ctx.lineWidth = 0.7;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    if (!prefersReducedMotion) {
      requestAnimationFrame(draw);
    }
  }

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resize);

  resize();
  draw();
}