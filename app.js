(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transition = document.createElement('div');
  transition.id = 'page-transition';
  document.body.appendChild(transition);

  document.querySelectorAll('a[href$=".html"]').forEach((link) => link.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const destination = link.href;
    if (destination === window.location.href || reduced) return;
    event.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(() => { window.location.href = destination; }, 390);
  }));

  if (!reduced && window.matchMedia('(pointer:fine)').matches) {
    document.body.classList.add('has-designed-cursor');
    const core = document.createElement('span');
    core.className = 'cursor-core';
    core.innerHTML = '<i></i>';
    document.body.appendChild(core);
    const dots = Array.from({ length: 18 }, (_, index) => {
      const dot = document.createElement('span');
      dot.className = 'trail-dot';
      if (index % 5 === 2) dot.classList.add('trail-dot--ring');
      if (index % 5 === 4) dot.classList.add('trail-dot--bar');
      dot.style.width = `${Math.max(2, 15 - index * .78)}px`;
      dot.style.height = dot.style.width;
      dot.style.opacity = String(Math.max(.12, .9 - index * .045));
      document.body.appendChild(dot);
      return { element: dot, x: innerWidth / 2, y: innerHeight / 2 };
    });
    let mouseX = innerWidth / 2; let mouseY = innerHeight / 2;
    let coreX = mouseX; let coreY = mouseY;
    window.addEventListener('mousemove', (event) => { mouseX = event.clientX; mouseY = event.clientY; });
    document.querySelectorAll('a,button,input,textarea,select,.poster,.note').forEach((element) => {
      element.addEventListener('pointerenter', () => core.classList.add('is-active'));
      element.addEventListener('pointerleave', () => core.classList.remove('is-active'));
    });
    const animateTrail = () => {
      const previousX = coreX; const previousY = coreY;
      coreX += (mouseX - coreX) * .52;
      coreY += (mouseY - coreY) * .52;
      const angle = Math.atan2(coreY - previousY, coreX - previousX) * 180 / Math.PI;
      core.style.left = `${coreX}px`;
      core.style.top = `${coreY}px`;
      core.style.setProperty('--cursor-angle', `${angle}deg`);
      dots.forEach((dot, index) => {
        const targetX = index ? dots[index - 1].x : mouseX;
        const targetY = index ? dots[index - 1].y : mouseY;
        dot.x += (targetX - dot.x) * .18;
        dot.y += (targetY - dot.y) * .18;
        dot.element.style.left = `${dot.x}px`;
        dot.element.style.top = `${dot.y}px`;
      });
      requestAnimationFrame(animateTrail);
    };
    animateTrail();
  }
  document.querySelectorAll('.menu-toggle').forEach((button) => button.addEventListener('click', () => {
    const nav = document.querySelector('.nav');
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
  }));

  document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => {
    document.querySelector('.nav')?.classList.remove('open');
    document.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'false');
  }));

  document.querySelectorAll('.jitter-title').forEach((title) => {
    let timer;
    title.addEventListener('mouseenter', () => {
      if (reduced) return;
      timer = window.setInterval(() => {
        const x = (Math.random() * 28 - 14).toFixed(1);
        const y = (Math.random() * 18 - 9).toFixed(1);
        const rotation = (Math.random() * 1.8 - .9).toFixed(2);
        const skew = (Math.random() * 3 - 1.5).toFixed(2);
        title.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) skewX(${skew}deg)`;
        title.style.filter = Math.random() > .54 ? 'drop-shadow(5px 0 0 rgba(0,47,167,.42))' : 'none';
      }, 62);
    });
    title.addEventListener('mouseleave', () => { window.clearInterval(timer); title.style.transform = 'translate(0,0) rotate(0) skewX(0)'; title.style.filter = 'none'; });
  });

  document.querySelectorAll('.magnetic').forEach((button) => {
    button.addEventListener('mousemove', (event) => {
      if (reduced) return;
      const box = button.getBoundingClientRect();
      button.style.transform = `translate(${((event.clientX - box.left) / box.width - .5) * 8}px, ${((event.clientY - box.top) / box.height - .5) * 8}px)`;
    });
    button.addEventListener('mouseleave', () => { button.style.transform = 'translate(0,0)'; });
  });

  if (!reduced) {
    document.body.classList.add('has-scroll-effects');
    const signal = document.createElement('div');
    signal.className = 'scroll-signal';
    signal.innerHTML = '<span class="scroll-signal__arrow">↓</span><span class="scroll-signal__label">SCROLL 00%</span><span class="scroll-signal__bar"><i></i></span>';
    document.body.appendChild(signal);
    const signalLabel = signal.querySelector('.scroll-signal__label');
    const signalBar = signal.querySelector('.scroll-signal__bar i');
    let previousScroll = window.scrollY;
    const updateScroll = () => {
      const currentScroll = window.scrollY;
      const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.round((currentScroll / total) * 100);
      const isUp = currentScroll < previousScroll;
      signal.classList.toggle('is-up', isUp && currentScroll > 0);
      signalLabel.textContent = `${isUp && currentScroll > 0 ? 'UP' : 'DOWN'} ${String(progress).padStart(2, '0')}%`;
      signalBar.style.transform = `scaleX(${progress / 100})`;
      document.documentElement.style.setProperty('--scroll-y', currentScroll);
      previousScroll = currentScroll;
    };
    window.addEventListener('scroll', updateScroll, { passive:true });
    updateScroll();

    const revealNodes = [...document.querySelectorAll('.page-hero, .section, .home-hero, .footer')];
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold:.12 });
    revealNodes.forEach((node) => { node.classList.add('scroll-reveal'); observer.observe(node); });
  }

  const container = document.getElementById('p5-background');
  const startP5 = () => {
    if (!container || !window.p5 || container.dataset.started) return;
    container.dataset.started = 'true';
    new window.p5((p) => {
      let dots = []; let w = 0; let h = 0;
      const cobaltPage = Boolean(document.querySelector('.home-hero, .contact-grid'));
      const palette = cobaltPage ? [[32,45,142],[43,59,171],[74,87,194],[127,140,221],[211,216,250]] : [[47,94,189],[63,109,204],[96,138,224],[139,177,250],[211,225,255]];
      const reset = () => { dots = []; const count = Math.min(54, Math.max(20, Math.floor((w * h) / 34000))); for (let i = 0; i < count; i += 1) dots.push({ x:p.random(w), y:p.random(h), phase:p.random(100), speed:p.random(.16,.42), size:p.random(1.2,3.8), color:palette[Math.floor(p.random(palette.length))] }); };
      p.setup = () => { w = container.clientWidth; h = container.clientHeight; p.createCanvas(w,h).parent(container); p.pixelDensity(1); p.noiseDetail(3,.55); reset(); };
      p.draw = () => { p.clear(); dots.forEach((d) => { const a = p.noise(d.x*.002,d.y*.002,p.frameCount*.002)*p.TWO_PI*2; d.x += p.cos(a)*d.speed; d.y += p.sin(a)*d.speed; if(d.x<-8)d.x=w+8;if(d.x>w+8)d.x=-8;if(d.y<-8)d.y=h+8;if(d.y>h+8)d.y=-8; p.noStroke(); p.fill(d.color[0],d.color[1],d.color[2],24 + p.sin(p.frameCount*.02+d.phase)*10); p.circle(d.x,d.y,d.size); }); p.stroke(cobaltPage ? 43 : 63,cobaltPage ? 59 : 109,cobaltPage ? 171 : 204,8); p.strokeWeight(.5); for(let i=0;i<dots.length;i+=1) for(let j=i+1;j<dots.length;j+=1) if(p.dist(dots[i].x,dots[i].y,dots[j].x,dots[j].y)<72) p.line(dots[i].x,dots[i].y,dots[j].x,dots[j].y); };
      p.windowResized = () => { w=container.clientWidth;h=container.clientHeight;p.resizeCanvas(w,h);reset(); };
    });
  };
  if (window.p5) startP5(); else { const fallback = document.createElement('script'); fallback.src='https://unpkg.com/p5@1.9.4/lib/p5.min.js'; fallback.onload=startP5; document.head.appendChild(fallback); }
})();
