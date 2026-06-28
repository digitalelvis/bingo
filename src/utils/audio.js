let audioCtx = null;
let spinningOscillator = null;
let spinningGain = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playSpinningSound = () => {
  initAudio();
  
  // Create a continuous rumbling noise for the globe
  const bufferSize = audioCtx.sampleRate * 2; // 2 seconds of noise
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // Generate some noise
    data[i] = Math.random() * 2 - 1;
  }

  spinningOscillator = audioCtx.createBufferSource();
  spinningOscillator.buffer = buffer;
  spinningOscillator.loop = true;
  
  // Add a lowpass filter to make it sound like a rumble
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400; // Muffled rumbling

  // LFO to modulate the filter for a rhythmic "balls hitting" sound
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 8; // 8 Hz rhythm
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 200;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  spinningGain = audioCtx.createGain();
  spinningGain.gain.value = 0.5; // Start volume

  spinningOscillator.connect(filter);
  filter.connect(spinningGain);
  spinningGain.connect(audioCtx.destination);
  
  spinningOscillator.start();
};

export const stopSound = () => {
  if (spinningGain) {
    spinningGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    setTimeout(() => {
      if (spinningOscillator) {
        try { spinningOscillator.stop(); } catch(e) {}
        spinningOscillator = null;
      }
    }, 500);
  }
};

export const playRevealSound = () => {
  initAudio();
  
  // A triumphant "Ta-da" chord
  const frequencies = [440, 554.37, 659.25]; // A4, C#5, E5 (A Major)
  
  frequencies.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Envelope
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05 + (i * 0.02)); // Slight arpeggio
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
  });
};

export const playBingoVictorySound = () => {
  initAudio();
  
  // Trumpet fanfare simulation
  const time = audioCtx.currentTime;
  
  const playNote = (freq, startTime, duration) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Sawtooth wave sounds more like brass
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Trumpet envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
    gain.gain.setValueAtTime(0.3, startTime + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  // C major fanfare: G4 -> C5 -> E5 -> G5
  playNote(392.00, time, 0.2); // G4
  playNote(523.25, time + 0.2, 0.2); // C5
  playNote(659.25, time + 0.4, 0.2); // E5
  playNote(783.99, time + 0.6, 1.0); // G5 (long)
  
  // Clapping noise simulation (bursts of white noise)
  const bufferSize = audioCtx.sampleRate * 2.0; // 2 seconds of clapping
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = buffer;
  
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 1000;
  
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0, time);
  noiseGain.gain.linearRampToValueAtTime(0.5, time + 0.2);
  noiseGain.gain.linearRampToValueAtTime(0.1, time + 2.0);
  
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  
  noiseSource.start(time);
  noiseSource.stop(time + 2.0);
};
