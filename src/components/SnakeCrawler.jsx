import React, { useEffect, useRef } from 'react';

const SnakeCrawler = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Handle resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Snake properties
    const numSegments = 30;
    const segmentLength = 8;
    const snakeSpeed = 2;
    
    // Snake segment array
    const segments = [];
    // Start in the center
    let headX = width / 2;
    let headY = height / 2;
    let angle = Math.random() * Math.PI * 2;
    let targetAngle = angle;
    
    // Initialize segments
    for (let i = 0; i < numSegments; i++) {
      segments.push({ x: headX - i * segmentLength, y: headY });
    }

    let slitherTime = 0;
    let changeDirectionTimer = 0;
    let tongueFlickerTimer = 0;
    let isFlickering = false;

    // Draw snake helper
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      slitherTime += 0.25;
      changeDirectionTimer += 1;

      // 1. Slow random steering
      if (changeDirectionTimer > 60 + Math.random() * 120) {
        targetAngle = angle + (Math.random() - 0.5) * Math.PI;
        changeDirectionTimer = 0;
      }
      
      // Interpolate angle
      angle += (targetAngle - angle) * 0.05;

      // 2. Keep snake on screen (gently turn back to center if close to edges)
      const edgeThreshold = 100;
      if (headX < edgeThreshold) targetAngle = 0; // turn right
      if (headX > width - edgeThreshold) targetAngle = Math.PI; // turn left
      if (headY < edgeThreshold) targetAngle = Math.PI / 2; // turn down
      if (headY > height - edgeThreshold) targetAngle = -Math.PI / 2; // turn up

      // 3. Move the head
      // Add slither wave (sine wave side to side)
      const slitherAmplitude = 3;
      const slitherOffset = Math.sin(slitherTime) * slitherAmplitude;
      
      // Calculate move vector
      const moveX = Math.cos(angle) * snakeSpeed;
      const moveY = Math.sin(angle) * snakeSpeed;
      
      // Perpendicular vector for slither wave
      const perpX = -Math.sin(angle) * slitherOffset;
      const perpY = Math.cos(angle) * slitherOffset;

      headX += moveX + perpX * 0.1;
      headY += moveY + perpY * 0.1;

      // Ensure head stays inside screen bounds
      if (headX < 0) headX = width;
      if (headX > width) headX = 0;
      if (headY < 0) headY = height;
      if (headY > height) headY = 0;

      // Update segment positions
      segments[0] = { x: headX, y: headY };
      for (let i = 1; i < numSegments; i++) {
        const prev = segments[i - 1];
        const curr = segments[i];
        const dx = prev.x - curr.x;
        const dy = prev.y - curr.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > segmentLength) {
          const ratio = segmentLength / distance;
          curr.x = prev.x - dx * ratio;
          curr.y = prev.y - dy * ratio;
        }
      }

      // Draw Snake Tongue (Flickering)
      tongueFlickerTimer++;
      if (tongueFlickerTimer > 200) {
        isFlickering = true;
        if (tongueFlickerTimer > 220) {
          isFlickering = false;
          tongueFlickerTimer = 0;
        }
      }

      if (isFlickering) {
        ctx.beginPath();
        ctx.strokeStyle = '#ff3333'; // Red tongue
        ctx.lineWidth = 2;
        const tongueLength = 12;
        const tx = headX + Math.cos(angle) * tongueLength;
        const ty = headY + Math.sin(angle) * tongueLength;
        
        ctx.moveTo(headX, headY);
        ctx.lineTo(tx, ty);
        
        // Forked tips
        const forkAngle = 0.4;
        ctx.lineTo(tx + Math.cos(angle + forkAngle) * 5, ty + Math.sin(angle + forkAngle) * 5);
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + Math.cos(angle - forkAngle) * 5, ty + Math.sin(angle - forkAngle) * 5);
        ctx.stroke();
      }

      // 4. Render snake body segments
      for (let i = numSegments - 1; i >= 0; i--) {
        const seg = segments[i];
        
        // Segments get smaller towards the tail
        const progress = i / numSegments;
        const radius = Math.max(1.5, 6 * (1 - progress * 0.75));

        ctx.beginPath();
        
        // Glowing outline for toxic snake
        ctx.shadowBlur = i === 0 ? 15 : 8;
        ctx.shadowColor = 'rgba(57, 255, 20, 0.8)';
        
        // Body Segment color gradient (bright toxic neon green at head, darker green at tail)
        ctx.fillStyle = `rgba(57, 255, 20, ${1 - progress * 0.6})`;
        
        ctx.arc(seg.x, seg.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Head eyes (glowing red)
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fff';
      ctx.fillStyle = '#ffffff';
      
      const eyeOffset = 3;
      const ex1 = headX + Math.cos(angle + Math.PI/3) * eyeOffset;
      const ey1 = headY + Math.sin(angle + Math.PI/3) * eyeOffset;
      const ex2 = headX + Math.cos(angle - Math.PI/3) * eyeOffset;
      const ey2 = headY + Math.sin(angle - Math.PI/3) * eyeOffset;

      ctx.beginPath();
      ctx.arc(ex1, ey1, 1, 0, Math.PI * 2);
      ctx.arc(ex2, ey2, 1, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadows for next drawings
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Critical: doesn't block clicks!
        zIndex: 9999 // Always crawls on top
      }}
    />
  );
};

export default SnakeCrawler;
