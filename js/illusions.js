// Dynamic Optical Illusion Renderers and Metadata
const ILLUSIONS_DATA = [
  {
    id: 1,
    key: 'spiral',
    name: 'Espiral Hipnótica',
    subtitle: 'Vórtice Cinético Perceptual',
    description: 'Genera una potente ilusión de movimiento continuo y dilatación hacia el centro. Al observarla fijamente, el cerebro percibe que el fondo se expande o se contrae.',
    badge: 'Rotación Infinita',
    image: 'img/illusion_spiral.jpg',
    colorTheme: '#00f0ff',
    render: (ctx, width, height, time, speed = 1, param = 1) => {
      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.hypot(cx, cy);

      ctx.fillStyle = '#050714';
      ctx.fillRect(0, 0, width, height);

      const arms = 18;
      const rot = (time * 0.0015 * speed) % (Math.PI * 2);
      const pulse = 1 + Math.sin(time * 0.002 * speed) * 0.08 * param;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);

      for (let r = 10; r < maxR; r += 7) {
        const angleOffset = rot + Math.log(r + 1) * 3.5;
        const widthFactor = (r / maxR) * 20;

        for (let a = 0; a < arms; a++) {
          const baseAngle = (a * 2 * Math.PI) / arms + angleOffset;
          ctx.beginPath();
          ctx.arc(0, 0, r, baseAngle, baseAngle + Math.PI / arms);
          ctx.lineWidth = widthFactor + 2;

          const hue = (a * 20 + time * 0.05 * speed) % 360;
          ctx.strokeStyle = (a % 2 === 0) ? '#ffffff' : `hsl(${hue}, 100%, 65%)`;
          ctx.stroke();
        }
      }

      // Center glowing hypnotic core
      const coreR = 15 + Math.sin(time * 0.005) * 5;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR * 2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#00f0ff');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, coreR * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 2,
    key: 'tunnel',
    name: 'Túnel Cuántico',
    subtitle: 'Aceleración Focal Hiperespacial',
    description: 'Estructura de cuadriláteros concéntricos en fuga que induce sensación de velocidad infinita y profundidad dimensional inmersiva.',
    badge: 'Profundidad Warp',
    image: 'img/illusion_tunnel.jpg',
    colorTheme: '#a855f7',
    render: (ctx, width, height, time, speed = 1, param = 1) => {
      const cx = width / 2;
      const cy = height / 2;
      const count = 30;

      ctx.fillStyle = '#02020a';
      ctx.fillRect(0, 0, width, height);

      const offset = (time * 0.001 * speed) % 1;
      const rot = Math.sin(time * 0.0008 * speed) * 0.4;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      for (let i = count; i >= 1; i--) {
        const progress = (i - offset) / count;
        if (progress <= 0.01) continue;

        // Exponential perspective scaling
        const scale = Math.pow(progress, 2.5);
        const w = width * 1.3 * scale;
        const h = height * 1.3 * scale;

        const hue = (progress * 300 + time * 0.08 * speed) % 360;
        ctx.strokeStyle = `hsl(${hue}, 95%, ${Math.min(75, 40 + progress * 50)}%)`;
        ctx.lineWidth = Math.max(1.5, 8 * scale * param);
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 12 * scale;

        ctx.strokeRect(-w / 2, -h / 2, w, h);

        // Corner connector beams
        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.moveTo(-w / 2, -h / 2);
          ctx.lineTo(-w / 2 * 0.8, -h / 2 * 0.8);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  },
  {
    id: 3,
    key: 'cube',
    name: 'Cubo Imposible',
    subtitle: 'Paradoja Geométrica Penrose',
    description: 'Objeto tridimensional imposible inspirado en las paradojas ópticas de M.C. Escher. Las aristas se cruzan en orientaciones que desafían el espacio euclidiano.',
    badge: 'Paradoja 3D',
    image: 'img/illusion_cube.svg',
    colorTheme: '#f59e0b',
    render: (ctx, width, height, time, speed = 1, param = 1) => {
      const cx = width / 2;
      const cy = height / 2;
      const size = Math.min(width, height) * 0.32 * param;

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, width, height);

      // Background geometric particle grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      const angleY = time * 0.0012 * speed;
      const angleX = Math.sin(time * 0.0007 * speed) * 0.35 + 0.3;

      ctx.save();
      ctx.translate(cx, cy);

      // 3D Isometric / Orthographic rotation of Penrose Cube vertices
      const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1]
      ];

      // Project vertices
      const projected = vertices.map(v => {
        // Rotate Y
        let x1 = v[0] * Math.cos(angleY) - v[2] * Math.sin(angleY);
        let z1 = v[0] * Math.sin(angleY) + v[2] * Math.cos(angleY);
        // Rotate X
        let y2 = v[1] * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = v[1] * Math.sin(angleX) + z1 * Math.cos(angleX);

        return {
          x: x1 * size,
          y: y2 * size,
          z: z2
        };
      });

      const edges = [
        [0,1], [1,2], [2,3], [3,0],
        [4,5], [5,6], [6,7], [7,4],
        [0,4], [1,5], [2,6], [3,7],
        // Impossible optical cross-ties
        [0,6], [1,7], [2,4]
      ];

      // Draw glowing illusion beams
      edges.forEach((edge, idx) => {
        const p1 = projected[edge[0]];
        const p2 = projected[edge[1]];
        const isCross = idx >= 12;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (isCross) {
          ctx.strokeStyle = `hsl(${(time * 0.1 * speed) % 360}, 100%, 70%)`;
          ctx.lineWidth = 4;
          ctx.setLineDash([8, 6]);
        } else {
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, '#ff007f');
          grad.addColorStop(0.5, '#00f0ff');
          grad.addColorStop(1, '#ffb703');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 6;
          ctx.setLineDash([]);
        }

        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.stroke();
      });

      // Impossible Penrose Nodes
      projected.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#ff007f';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 14;
        ctx.fill();
      });

      ctx.restore();
    }
  },
  {
    id: 4,
    key: 'waves',
    name: 'Ondas de Moiré',
    subtitle: 'Interferencia Retiniana Vibrante',
    description: 'Superposición de campos sinusoidales continuos. Al recorrer la imagen con los ojos, se produce una vibración óptica flotante de frecuencias luminosas.',
    badge: 'Moiré Dinámico',
    image: 'img/illusion_waves.svg',
    colorTheme: '#10b981',
    render: (ctx, width, height, time, speed = 1, param = 1) => {
      ctx.fillStyle = '#080018';
      ctx.fillRect(0, 0, width, height);

      const lines = 42;
      const t = time * 0.002 * speed;

      for (let i = 0; i < lines; i++) {
        const yBase = (height / lines) * i;
        const phase1 = i * 0.2 + t;
        const phase2 = i * 0.3 - t * 0.8;

        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const y1 = Math.sin(x * 0.015 + phase1) * 30 * param;
          const y2 = Math.cos(x * 0.02 + phase2) * 20 * param;
          const y = yBase + y1 + y2;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const hue = (i * 8 + time * 0.05 * speed) % 360;
        ctx.strokeStyle = (i % 2 === 0) ? `hsl(${hue}, 100%, 60%)` : 'rgba(255,255,255,0.85)';
        ctx.lineWidth = (i % 3 === 0) ? 3.5 : 2;
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = 8;
        ctx.stroke();
      }

      // Optical concentric pulsing lenses
      const cx = width / 2;
      const cy = height / 2;
      for (let r = 40; r < Math.min(width, height) * 0.45; r += 50) {
        ctx.beginPath();
        const pulseR = r + Math.sin(t * 2 + r * 0.05) * 15;
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 8]);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  },
  {
    id: 5,
    key: 'checker',
    name: 'Tablero Curvo',
    subtitle: 'Distorsión Esférica de Akiyoshi',
    description: 'Patrón de damero con micro-elementos de contraste en las intersecciones. Todas las líneas son perfectamente paralelas y rectas, aunque parecen curvarse como un globo.',
    badge: 'Curvatura Ilusoria',
    image: 'img/illusion_checker.svg',
    colorTheme: '#ec4899',
    render: (ctx, width, height, time, speed = 1, param = 1) => {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const cols = 14;
      const rows = 14;
      const cellW = width / cols;
      const cellH = height / rows;
      const t = time * 0.0015 * speed;

      // Moving distortion center
      const bulgeX = cx + Math.sin(t) * (width * 0.15);
      const bulgeY = cy + Math.cos(t * 1.3) * (height * 0.15);
      const bulgeRadius = Math.min(width, height) * 0.38 * param;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x0 = c * cellW;
          const y0 = r * cellH;
          const isBlack = (r + c) % 2 === 0;

          // Bulge warp displacement
          const distToBulge = Math.hypot(x0 + cellW / 2 - bulgeX, y0 + cellH / 2 - bulgeY);
          const warp = Math.max(0, 1 - distToBulge / bulgeRadius);
          const shift = Math.sin(warp * Math.PI) * 12;

          ctx.fillStyle = isBlack ? '#0f172a' : '#f8fafc';
          ctx.fillRect(x0, y0, cellW - 0.5, cellH - 0.5);

          // Optical illusion micro-dots that trigger the line curvature trick
          if (c > 0 && r > 0 && c < cols && r < rows) {
            const dotColor = ((r + c) % 3 === 0) ? '#ffffff' : '#020617';
            ctx.fillStyle = dotColor;

            const dotX = x0 + Math.sin(t * 2 + r) * shift * 0.5;
            const dotY = y0 + Math.cos(t * 2 + c) * shift * 0.5;
            ctx.fillRect(dotX - 3.5, dotY - 3.5, 7, 7);
          }
        }
      }

      // Bulge boundary glow ring
      ctx.beginPath();
      ctx.arc(bulgeX, bulgeY, bulgeRadius * 0.85, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
];

window.ILLUSIONS_DATA = ILLUSIONS_DATA;
