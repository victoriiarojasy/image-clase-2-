// Game State Manager for "Proyecciones Image"
document.addEventListener('DOMContentLoaded', () => {

  // State definitions
  const GAME_STATE = {
    selectedIllusion: ILLUSIONS_DATA[0],
    isDownloaded: false,
    isPlugged: false,
    isProjecting: false,
    projectionSpeed: 1.0,
    projectionIntensity: 1.0,
    animFrameId: null
  };

  // DOM Elements
  const screenStart = document.getElementById('screen-start');
  const screenGame = document.getElementById('screen-game');
  const btnStart = document.getElementById('btn-start');
  const btnRestart = document.getElementById('btn-restart');
  const btnSound = document.getElementById('btn-sound');
  const soundIcon = document.getElementById('sound-icon');

  // Quests
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  const step4 = document.getElementById('step-4');

  // Sidebar Computer Elements
  const optionsGrid = document.getElementById('options-grid');
  const vizLargeImage = document.getElementById('viz-large-image');
  const vizTitle = document.getElementById('viz-title');
  const vizDesc = document.getElementById('viz-desc');
  const vizBadge = document.getElementById('viz-badge');

  // USB Elements
  const usbLedIndicator = document.getElementById('usb-led-indicator');
  const usbStatusText = document.getElementById('usb-status-text');
  const downloadProgressContainer = document.getElementById('download-progress-container');
  const downloadProgressBar = document.getElementById('download-progress-bar');
  const progressText = document.getElementById('progress-text');
  const btnDownloadUsb = document.getElementById('btn-download-usb');
  const btnCarryUsb = document.getElementById('btn-carry-usb');

  // Stage Elements
  const stageViewport = document.getElementById('stage-viewport');
  const characterBubble = document.getElementById('character-bubble');
  const projectorStation = document.getElementById('projector-station');
  const projectorUsbSlot = document.getElementById('projector-usb-slot');
  const insertedPendrive = document.getElementById('inserted-pendrive');
  const btnInsertUsb = document.getElementById('btn-insert-usb');
  const flyingPendrive = document.getElementById('flying-pendrive');

  // Lever Elements
  const leverInteractive = document.getElementById('lever-interactive');
  const leverArmHandle = document.getElementById('lever-arm-handle');
  const leverLed = document.getElementById('lever-led');
  const leverStatusText = document.getElementById('lever-status-text');
  const btnPullLever = document.getElementById('btn-pull-lever');

  // Canvas & Projection HUD Elements
  const canvas = document.getElementById('projection-canvas');
  const ctx = canvas.getContext('2d');
  const canvasStandby = document.getElementById('canvas-standby');
  const screenStatusText = document.getElementById('screen-status-text');
  const projectionLiveHud = document.getElementById('projection-live-hud');
  const hudIllusionTitle = document.getElementById('hud-illusion-title');
  const btnLightsOn = document.getElementById('btn-lights-on');
  const sliderSpeed = document.getElementById('slider-speed');
  const sliderIntensity = document.getElementById('slider-intensity');
  const speedVal = document.getElementById('speed-val');
  const intensityVal = document.getElementById('intensity-val');

  // Resize Canvas internally for crisp retina display
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // 1. Initialize Options Grid (5 Optical Illusion Squares)
  function initOptionsGrid() {
    optionsGrid.innerHTML = '';
    ILLUSIONS_DATA.forEach((ill, idx) => {
      const card = document.createElement('div');
      card.className = `option-square-card ${idx === 0 ? 'selected' : ''}`;
      card.dataset.id = ill.id;
      card.title = `${ill.id}. ${ill.name} (${ill.subtitle})`;

      const img = document.createElement('img');
      img.src = ill.image;
      img.alt = ill.name;
      img.className = 'option-thumb-img';

      card.appendChild(img);
      card.addEventListener('click', () => selectIllusion(ill, card));
      optionsGrid.appendChild(card);
    });
  }

  // 2. Select an Illusion
  function selectIllusion(illusion, cardElement) {
    soundManager.playSelect();
    GAME_STATE.selectedIllusion = illusion;

    // Highlight card
    document.querySelectorAll('.option-square-card').forEach(c => c.classList.remove('selected'));
    if (cardElement) {
      cardElement.classList.add('selected');
    }

    // Update Top Visualizer
    vizLargeImage.src = illusion.image;
    vizTitle.textContent = `${illusion.id}. ${illusion.name}`;
    vizDesc.textContent = illusion.description;
    vizBadge.textContent = illusion.badge;
    vizBadge.style.backgroundColor = `${illusion.colorTheme}22`;
    vizBadge.style.color = illusion.colorTheme;

    // If already downloaded something, reset USB state for the new illusion
    if (GAME_STATE.isDownloaded) {
      resetUsbState('Ilusión cambiada. Vuelve a descargar en el pendrive.');
    }

    characterBubble.textContent = `"${illusion.name}: ${illusion.subtitle}. ¡Descárgala en el pendrive!"`;
    step1.classList.add('completed');
    step2.classList.add('active');
  }

  // 3. Reset USB state when switching or restarting
  function resetUsbState(customMsg) {
    GAME_STATE.isDownloaded = false;
    GAME_STATE.isPlugged = false;
    
    usbLedIndicator.className = 'usb-led off';
    usbStatusText.textContent = customMsg || 'Vacío (Listo para grabar)';
    btnDownloadUsb.classList.remove('hidden');
    btnCarryUsb.classList.add('hidden');
    downloadProgressContainer.classList.add('hidden');
    downloadProgressBar.style.width = '0%';

    projectorUsbSlot.classList.remove('glow-ready', 'plugged');
    insertedPendrive.classList.add('hidden');
    btnInsertUsb.classList.add('hidden');

    lockLever();
  }

  // 4. Download Illusion to Pendrive Flow
  btnDownloadUsb.addEventListener('click', () => {
    soundManager.playClick();
    if (GAME_STATE.isDownloaded) return;

    btnDownloadUsb.disabled = true;
    downloadProgressContainer.classList.remove('hidden');
    usbLedIndicator.className = 'usb-led writing';
    characterBubble.textContent = `"Descargando ${GAME_STATE.selectedIllusion.name} al pendrive..."`;

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 12;
      if (progress > 100) progress = 100;

      downloadProgressBar.style.width = `${progress}%`;
      progressText.textContent = `Descargando... ${progress}%`;
      soundManager.playDownloadBeep(600 + progress * 6);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onDownloadComplete();
        }, 200);
      }
    }, 90);
  });

  function onDownloadComplete() {
    soundManager.playDownloadSuccess();
    GAME_STATE.isDownloaded = true;
    btnDownloadUsb.disabled = false;
    btnDownloadUsb.classList.add('hidden');
    btnCarryUsb.classList.remove('hidden');

    usbLedIndicator.className = 'usb-led ready';
    usbStatusText.textContent = `Guardado: [${GAME_STATE.selectedIllusion.name}]`;
    characterBubble.textContent = `"¡Descarga completada! Ahora lleva el pendrive al proyector."`;

    step2.classList.remove('active');
    step2.classList.add('completed');
    step3.classList.add('active');

    // Make projector USB slot glow
    projectorUsbSlot.classList.add('glow-ready');
    btnInsertUsb.classList.remove('hidden');
  }

  // 5. Carry Pendrive to Projector (Animation & Snap)
  btnCarryUsb.addEventListener('click', carryPendriveToProjector);
  btnInsertUsb.addEventListener('click', carryPendriveToProjector);
  projectorUsbSlot.addEventListener('click', () => {
    if (GAME_STATE.isDownloaded && !GAME_STATE.isPlugged) {
      carryPendriveToProjector();
    }
  });

  function carryPendriveToProjector() {
    if (!GAME_STATE.isDownloaded || GAME_STATE.isPlugged) return;
    soundManager.playClick();

    btnCarryUsb.disabled = true;
    btnInsertUsb.classList.add('hidden');

    // Get positions for flying pendrive animation
    const charRect = document.getElementById('character-station').getBoundingClientRect();
    const projRect = projectorUsbSlot.getBoundingClientRect();
    const stageRect = stageViewport.getBoundingClientRect();

    const startX = charRect.left - stageRect.left + 80;
    const startY = charRect.top - stageRect.top + 60;
    const targetX = projRect.left - stageRect.left - 10;
    const targetY = projRect.top - stageRect.top - 10;

    flyingPendrive.style.transform = `translate(${startX}px, ${startY}px) scale(0.6)`;
    flyingPendrive.classList.remove('hidden');

    // Force reflow
    void flyingPendrive.offsetWidth;

    // Animate to projector
    flyingPendrive.style.transform = `translate(${targetX}px, ${targetY}px) scale(1) rotate(15deg)`;

    setTimeout(() => {
      flyingPendrive.classList.add('hidden');
      plugPendriveIntoProjector();
    }, 1200);
  }

  function plugPendriveIntoProjector() {
    soundManager.playPlugSound();
    GAME_STATE.isPlugged = true;

    insertedPendrive.classList.remove('hidden');
    projectorUsbSlot.classList.remove('glow-ready');
    projectorUsbSlot.classList.add('plugged');

    characterBubble.textContent = `"¡Pendrive conectado con éxito! Ahora tira de la palanca ACTIVAR."`;

    step3.classList.remove('active');
    step3.classList.add('completed');
    step4.classList.add('active');

    unlockLever();
  }

  // 6. Lever Mechanics
  function unlockLever() {
    leverInteractive.classList.remove('disabled');
    leverInteractive.classList.add('ready');
    leverLed.className = 'lever-led-indicator ready';
    leverStatusText.textContent = 'LISTA';
    btnPullLever.disabled = false;
    btnPullLever.classList.remove('disabled');
    btnPullLever.classList.add('ready');
  }

  function lockLever() {
    leverInteractive.classList.remove('ready', 'pulled');
    leverInteractive.classList.add('disabled');
    leverLed.className = 'lever-led-indicator';
    leverStatusText.textContent = 'BLOQUEADA';
    btnPullLever.disabled = true;
    btnPullLever.classList.remove('ready', 'activated');
    btnPullLever.classList.add('disabled');
    btnPullLever.textContent = '⚡ ACTIVAR PROYECTOR';
  }

  leverInteractive.addEventListener('click', triggerLeverAction);
  btnPullLever.addEventListener('click', triggerLeverAction);

  function triggerLeverAction() {
    if (!GAME_STATE.isPlugged) {
      soundManager.playClick();
      characterBubble.textContent = `"¡Primero debes conectar el pendrive en el proyector!"`;
      return;
    }

    if (GAME_STATE.isProjecting) {
      // If already projecting, toggle lights off/on
      turnOffProjection();
      return;
    }

    // Pull lever down!
    soundManager.playLeverPull();
    leverInteractive.classList.add('pulled');
    btnPullLever.classList.remove('ready');
    btnPullLever.classList.add('activated');
    btnPullLever.textContent = '💡 APAGAR / DETENER';
    leverLed.className = 'lever-led-indicator active';
    leverStatusText.textContent = 'ENCENDIDO';

    characterBubble.textContent = `"¡Apagando luces y proyectando ${GAME_STATE.selectedIllusion.name}!"`;

    step4.classList.add('completed');

    // Turn off room lights with delay
    setTimeout(() => {
      soundManager.playLightsOff();
      stageViewport.classList.add('lights-off');

      // Ignite projector beam
      setTimeout(() => {
        startProjectingIllusion();
      }, 500);
    }, 400);
  }

  // 7. Projecting Illusion Loop
  function startProjectingIllusion() {
    GAME_STATE.isProjecting = true;
    stageViewport.classList.add('projecting');
    soundManager.startProjectorBeam();

    canvasStandby.classList.add('hidden');
    screenStatusText.textContent = `PROYECTANDO EN VIVO: [${GAME_STATE.selectedIllusion.name.toUpperCase()}]`;

    hudIllusionTitle.textContent = GAME_STATE.selectedIllusion.name;
    projectionLiveHud.classList.remove('hidden');

    resizeCanvas();

    // Start Animation Render Loop
    let startTime = performance.now();

    function renderLoop(currentTime) {
      const elapsed = currentTime - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (GAME_STATE.selectedIllusion && GAME_STATE.selectedIllusion.render) {
        GAME_STATE.selectedIllusion.render(
          ctx,
          canvas.width,
          canvas.height,
          elapsed,
          GAME_STATE.projectionSpeed,
          GAME_STATE.projectionIntensity
        );
      }

      if (GAME_STATE.isProjecting) {
        GAME_STATE.animFrameId = requestAnimationFrame(renderLoop);
      }
    }

    if (GAME_STATE.animFrameId) {
      cancelAnimationFrame(GAME_STATE.animFrameId);
    }
    GAME_STATE.animFrameId = requestAnimationFrame(renderLoop);
  }

  function turnOffProjection() {
    GAME_STATE.isProjecting = false;
    soundManager.stopProjectorBeam();
    soundManager.playLightsOff();

    if (GAME_STATE.animFrameId) {
      cancelAnimationFrame(GAME_STATE.animFrameId);
      GAME_STATE.animFrameId = null;
    }

    stageViewport.classList.remove('lights-off', 'projecting');
    projectionLiveHud.classList.add('hidden');
    canvasStandby.classList.remove('hidden');
    screenStatusText.textContent = 'PANTALLA DE PROYECCIÓN [EN ESPERA]';

    leverInteractive.classList.remove('pulled');
    btnPullLever.classList.remove('activated');
    btnPullLever.classList.add('ready');
    btnPullLever.textContent = '⚡ ACTIVAR PROYECTOR';
    leverLed.className = 'lever-led-indicator ready';
    leverStatusText.textContent = 'LISTA';

    characterBubble.textContent = `"¡Luces encendidas! Puedes elegir otra ilusión o volver a activar."`;
  }

  btnLightsOn.addEventListener('click', turnOffProjection);

  // Sliders
  sliderSpeed.addEventListener('input', (e) => {
    GAME_STATE.projectionSpeed = parseFloat(e.target.value);
    speedVal.textContent = `${GAME_STATE.projectionSpeed.toFixed(1)}x`;
  });

  sliderIntensity.addEventListener('input', (e) => {
    GAME_STATE.projectionIntensity = parseFloat(e.target.value);
    intensityVal.textContent = `${GAME_STATE.projectionIntensity.toFixed(1)}x`;
  });

  // 8. Navigation & Controls
  btnStart.addEventListener('click', () => {
    soundManager.playClick();
    screenStart.classList.remove('active');
    screenGame.classList.add('active');
    resizeCanvas();
    selectIllusion(ILLUSIONS_DATA[0], optionsGrid.children[0]);
  });

  btnRestart.addEventListener('click', () => {
    soundManager.playClick();
    turnOffProjection();
    resetUsbState();
    selectIllusion(ILLUSIONS_DATA[0], optionsGrid.children[0]);
    step1.classList.add('active');
    step1.classList.remove('completed');
    step2.classList.remove('active', 'completed');
    step3.classList.remove('active', 'completed');
    step4.classList.remove('active', 'completed');
  });

  btnSound.addEventListener('click', () => {
    const isEnabled = soundManager.toggleSound();
    soundIcon.textContent = isEnabled ? '🔊' : '🔇';
  });

  // Keyboard Shortcuts (1-5 to select illusion, Space to Download/Carry/Lever)
  window.addEventListener('keydown', (e) => {
    if (!screenGame.classList.contains('active')) return;

    if (e.key >= '1' && e.key <= '5') {
      const idx = parseInt(e.key) - 1;
      if (ILLUSIONS_DATA[idx]) {
        selectIllusion(ILLUSIONS_DATA[idx], optionsGrid.children[idx]);
      }
    }
  });

  // Init Game
  initOptionsGrid();
});
