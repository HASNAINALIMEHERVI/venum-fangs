import React, { useEffect, useRef } from 'react';

const SpiderOverlay = ({ active = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Load High-Res Photorealistic Black Widow Spider Image
    const spiderImg = new Image();
    spiderImg.src = '/images/spider.png';

    // Resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracking for interaction
    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Spider Physics & State
    const spider = {
      x: width * 0.2,
      y: height * 0.3,
      targetX: width * 0.4,
      targetY: height * 0.35,
      angle: 0,
      speed: 1.8,
      isMoving: true,
      pauseTimer: 0,
      crawlCycle: 0,
      size: Math.min(width, height) < 600 ? 45 : 65, // Responsive spider size
      silkThreads: [
        { x: 0, y: 0 },
        { x: width * 0.2, y: height * 0.3 }
      ]
    };

    // Pick new wandering target
    const pickNewTarget = () => {
      if (Math.random() < 0.35 && mouse.x > 0 && mouse.x < width) {
        spider.targetX = mouse.x + (Math.random() - 0.5) * 160;
        spider.targetY = mouse.y + (Math.random() - 0.5) * 160;
      } else {
        const margin = 60;
        spider.targetX = margin + Math.random() * (width - margin * 2);
        spider.targetY = margin + Math.random() * (height - margin * 2);
      }
      spider.isMoving = true;
    };

    // --- DRAW HYPER-REALISTIC COBWEBS ---
    const drawHyperRealisticWeb = (originX, originY, size, radialsCount = 11, ringCount = 8) => {
      ctx.save();
      const dirX = originX === 0 ? 1 : -1;
      const dirY = originY === 0 ? 1 : -1;

      // 1. Primary Structural Anchor Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 0.9;
      
      const radials = [];
      for (let i = 0; i <= radialsCount; i++) {
        const angle = (Math.PI / 2 / radialsCount) * i;
        const rx = originX + Math.cos(angle) * size * dirX;
        const ry = originY + Math.sin(angle) * size * dirY;
        radials.push({ x: rx, y: ry, angle });

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }

      // 2. Concentric Curved Spiral Web Strands with realistic catenary sag
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 0.7;

      for (let r = 1; r <= ringCount; r++) {
        const ringFactor = Math.pow(r / ringCount, 1.2); // exponential spacing outwards
        ctx.beginPath();
        
        for (let i = 0; i <= radialsCount; i++) {
          const angle = (Math.PI / 2 / radialsCount) * i;
          const px = originX + Math.cos(angle) * size * ringFactor * dirX;
          const py = originY + Math.sin(angle) * size * ringFactor * dirY;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            const prevAngle = (Math.PI / 2 / radialsCount) * (i - 1);
            const midAngle = (angle + prevAngle) / 2;
            const sagFactor = 0.9 + Math.sin(i * 1.5 + r) * 0.04;
            const ctrlRadius = size * ringFactor * sagFactor;
            const cx = originX + Math.cos(midAngle) * ctrlRadius * dirX;
            const cy = originY + Math.sin(midAngle) * ctrlRadius * dirY;
            ctx.quadraticCurveTo(cx, cy, px, py);
          }

          // Subtle glistening dew droplets at node intersections
          if (r % 2 === 0 && i % 2 === 0 && Math.sin(r + i) > 0.2) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.arc(px, py, 0.9, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
        ctx.stroke();
      }

      // 3. Ambient Background Fine Cobweb Mesh
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 0.5;
      for (let j = 0; j < 5; j++) {
        const randomStart = radials[Math.floor(Math.random() * radials.length)];
        const randomEnd = radials[Math.floor(Math.random() * radials.length)];
        if (randomStart && randomEnd) {
          ctx.beginPath();
          ctx.moveTo(randomStart.x * 0.6, randomStart.y * 0.6);
          ctx.lineTo(randomEnd.x * 0.8, randomEnd.y * 0.8);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    // --- DRAW ORGANIC TRAILING SILK THREAD ---
    const drawSilkTrail = () => {
      if (spider.silkThreads.length < 2) return;

      ctx.save();
      // Translucent Silk Thread
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 0.85;

      ctx.beginPath();
      ctx.moveTo(spider.silkThreads[0].x, spider.silkThreads[0].y);

      for (let i = 1; i < spider.silkThreads.length; i++) {
        const p1 = spider.silkThreads[i - 1];
        const p2 = spider.silkThreads[i];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 + 4; // Catenary gravity curve sag
        ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
      }
      ctx.stroke();

      // Active thread attached to spider rear
      const lastPt = spider.silkThreads[spider.silkThreads.length - 1];
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(lastPt.x, lastPt.y);
      ctx.lineTo(spider.x, spider.y);
      ctx.stroke();

      ctx.restore();
    };

    // --- DRAW PHOTOREALISTIC SPIDER WITH 3D SHADOW ---
    const drawPhotorealisticSpider = (x, y, angle, crawlCycle) => {
      ctx.save();
      ctx.translate(x, y);

      // Rotate image towards direction of motion (natural top facing offset)
      ctx.rotate(angle + Math.PI / 2);

      // Micro crawl gait oscillation (realistic wobble when moving)
      const wobble = spider.isMoving ? Math.sin(crawlCycle * 10) * 0.06 : 0;
      ctx.rotate(wobble);

      const renderSize = spider.size;

      // 1. Realistic 3D Soft Drop Shadow underneath spider
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 6;
      ctx.shadowOffsetY = 10;

      if (spiderImg.complete && spiderImg.naturalWidth > 0) {
        ctx.drawImage(spiderImg, -renderSize / 2, -renderSize / 2, renderSize, renderSize);
      } else {
        // Fallback realistic vector spider body while image finishes loading
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.ellipse(0, 8, 10, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(-3, 6); ctx.lineTo(3, 6); ctx.lineTo(0, 10); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.ellipse(0, -3, 7, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();
    };

    // --- MAIN ANIMATION LOOP ---
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Corner Cobwebs (All 4 corners for immersive dark aesthetic)
      const webSize = Math.min(width, height) * 0.32;
      drawHyperRealisticWeb(0, 0, webSize, 12, 9);
      drawHyperRealisticWeb(width, 0, webSize, 12, 9);
      drawHyperRealisticWeb(0, height, webSize * 0.85, 10, 7);
      drawHyperRealisticWeb(width, height, webSize * 0.85, 10, 7);

      // 2. Spider Path Motion Logic
      const dx = spider.targetX - spider.x;
      const dy = spider.targetY - spider.y;
      const dist = Math.hypot(dx, dy);

      if (spider.isMoving) {
        if (dist > 6) {
          const targetAngle = Math.atan2(dy, dx);
          
          // Smooth rotation blending towards heading
          let diff = targetAngle - spider.angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          spider.angle += diff * 0.08;

          spider.x += Math.cos(spider.angle) * spider.speed;
          spider.y += Math.sin(spider.angle) * spider.speed;
          spider.crawlCycle += 0.08;

          // Lay down silk thread node every ~50px
          const lastPt = spider.silkThreads[spider.silkThreads.length - 1];
          if (!lastPt || Math.hypot(spider.x - lastPt.x, spider.y - lastPt.y) > 50) {
            spider.silkThreads.push({ x: spider.x, y: spider.y });
            if (spider.silkThreads.length > 28) {
              spider.silkThreads.shift(); // Keep web thread clean & performing well
            }
          }
        } else {
          // Pause briefly at destination like a real spider
          spider.isMoving = false;
          spider.pauseTimer = Date.now() + 1800 + Math.random() * 3000;
        }
      } else {
        if (Date.now() > spider.pauseTimer) {
          pickNewTarget();
        }
      }

      // 3. Draw Trailing Web Silk Lines
      drawSilkTrail();

      // 4. Draw Photo-Realistic Black Widow Spider
      drawPhotorealisticSpider(spider.x, spider.y, spider.angle, spider.crawlCycle);

      animationFrameId = requestAnimationFrame(render);
    };

    // Start 60 FPS animation loop
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9990
      }}
    />
  );
};

export default SpiderOverlay;
