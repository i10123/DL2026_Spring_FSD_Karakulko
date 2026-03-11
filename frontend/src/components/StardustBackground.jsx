import { useEffect, useRef } from 'react';

export function StardustBackground({ isDarkTheme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let stars = [];
    let width, height;

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      stars = [];
      const numStars = isDarkTheme ? 150 : 80;

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          vx: Math.random() * 0.5 - 0.25, // drift sideways
          vy: Math.random() * 1.5 + 0.5,  // fall downwards
          alpha: Math.random(),
          alphaChange: (Math.random() * 0.02 - 0.01)
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Add a tiny bit of trailing effect
      // ctx.fillStyle = isDarkTheme ? 'rgba(5, 5, 5, 0.2)' : 'rgba(252, 252, 252, 0.2)';
      // ctx.fillRect(0, 0, width, height);

      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

        // Adjust alpha for twinkling
        star.alpha += star.alphaChange;
        if (star.alpha <= 0.1 || star.alpha >= 1) {
          star.alphaChange = -star.alphaChange;
        }

        const colorStr = isDarkTheme ? '255, 255, 255' : '100, 100, 200';
        ctx.fillStyle = `rgba(${colorStr}, ${star.alpha})`;
        ctx.fill();

        // Move star
        star.x += star.vx;
        star.y += star.vy;

        // Reset if star goes off screen
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }
        if (star.x > width) {
          star.x = 0;
        } else if (star.x < 0) {
          star.x = width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    init();
    draw();

    window.addEventListener('resize', init);

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-70"
      style={{ mixBlendMode: isDarkTheme ? 'screen' : 'multiply' }}
    />
  );
}
