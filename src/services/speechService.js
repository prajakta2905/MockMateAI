/**
 * Audio & Speech Service: Rock-Solid STT (Speech-to-Text) & TTS (Text-to-Speech)
 * Features:
 * - Chromium GC protection for SpeechSynthesis
 * - Auto-reconnect loop on silence timeouts without InvalidStateError
 * - Human vocal range (80Hz - 3500Hz) responsive volume calculation
 * - AudioContext auto-resume on user gestures
 * - Separate listener state management with onListeningChange notifications
 */

class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    
    // Recognition states
    this.isListening = false;
    this.shouldBeListening = false;
    this.permissionDenied = false;
    this.restartTimeout = null;
    
    // Callbacks
    this.onResultCallback = null;
    this.onListeningChangeCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;

    // TTS states
    this.isSpeaking = false;
    this.activeUtterance = null;
    this.speechWatchdog = null;
    this.speechHeartbeat = null;
    this.selectedVoice = null;
    this.voices = [];

    // Audio Analyser
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.volumeAnimationFrame = null;

    this.initVoices();
    this.bindUserInteractionResume();
  }

  isSupported() {
    const hasSpeechRecognition = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasSpeechSynthesis = typeof window !== 'undefined' && Boolean(window.speechSynthesis);
    const hasAudioContext = typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext);
    const hasGetUserMedia = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

    return {
      speechRecognition: hasSpeechRecognition,
      speechSynthesis: hasSpeechSynthesis,
      audioContext: hasAudioContext,
      getUserMedia: hasGetUserMedia
    };
  }

  warmup() {
    if (typeof window === 'undefined') return;
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    if (this.synthesis && !this.synthesis.pending) {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0;
      this.synthesis.speak(utterance);
    }
  }

  bindUserInteractionResume() {
    if (typeof window === 'undefined') return;
    const resumeAudio = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      if (this.synthesis && this.synthesis.paused) {
        this.synthesis.resume();
      }
    };
    window.addEventListener('click', resumeAudio, { passive: true });
    window.addEventListener('keydown', resumeAudio, { passive: true });
    window.addEventListener('touchstart', resumeAudio, { passive: true });
  }

  initVoices() {
    if (!this.synthesis) return;

    const loadVoices = () => {
      try {
        this.voices = this.synthesis.getVoices() || [];
        // Prioritize natural English voices
        this.selectedVoice =
          this.voices.find(v => v.lang && v.lang.startsWith('en') && (
            v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Premium') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Guy') ||
            v.name.includes('Jenny')
          )) ||
          this.voices.find(v => v.lang && v.lang.startsWith('en')) ||
          this.voices[0] || null;
      } catch (e) {
        console.warn('Could not load speech synthesis voices:', e);
      }
    };

    loadVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Internal factory to create a fresh SpeechRecognition instance.
   * Creating a new instance on auto-reconnect prevents Chromium InvalidStateError.
   */
  _createRecognition() {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (_) {}
      this.recognition = null;
    }

    try {
      const isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.isListening = true;
        this.permissionDenied = false;
        if (this.onListeningChangeCallback) {
          this.onListeningChangeCallback(true);
        }
      };

      recognition.onresult = (event) => {
        // Discard recognized audio if interviewer is speaking
        if (this.isSpeaking) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += (res[0]?.transcript || '') + ' ';
          } else {
            interimTranscript += (res[0]?.transcript || '');
          }
        }

        if (this.onResultCallback && !this.isSpeaking) {
          this.onResultCallback({
            final: finalTranscript.trim(),
            interim: interimTranscript.trim()
          });
        }
      };

      recognition.onerror = (event) => {
        const error = event.error;
        if (error === 'no-speech') {
          // Chrome fires no-speech when user pauses. We treat this as silence, not an error.
          return;
        }
        if (error === 'aborted') {
          return;
        }
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          this.permissionDenied = true;
          this.shouldBeListening = false;
          this.isListening = false;
          if (this.onListeningChangeCallback) {
            this.onListeningChangeCallback(false);
          }
          if (this.onErrorCallback) {
            this.onErrorCallback('Microphone permission was denied. Please allow microphone access in your browser settings.');
          }
          return;
        }

        if (error === 'network') {
          console.warn('Speech recognition network blip; will auto-reconnect...');
          return;
        }

        console.warn('SpeechRecognition event error:', error);
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      };

      recognition.onend = () => {
        this.isListening = false;

        // Auto-restart if we should still be listening and are not currently speaking or blocked
        if (this.shouldBeListening && !this.isSpeaking && !this.permissionDenied) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.shouldBeListening && !this.isSpeaking && !this.permissionDenied) {
              this._restartRecognition();
            }
          }, 800);
        } else {
          if (this.onListeningChangeCallback) {
            this.onListeningChangeCallback(false);
          }
          if (this.onEndCallback) {
            this.onEndCallback();
          }
        }
      };

      this.recognition = recognition;
      return recognition;
    } catch (e) {
      console.error('Error instantiating SpeechRecognition:', e);
      return null;
    }
  }

  _restartRecognition() {
    if (!this.shouldBeListening || this.isSpeaking || this.permissionDenied) return;
    try {
      const rec = this._createRecognition();
      if (rec) {
        rec.start();
        this.isListening = true;
        if (this.onListeningChangeCallback) {
          this.onListeningChangeCallback(true);
        }
      }
    } catch (err) {
      if (err.name !== 'InvalidStateError') {
        console.warn('Recognition start exception:', err);
      }
      // Retry after small delay
      if (this.shouldBeListening && !this.isSpeaking && !this.permissionDenied) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = setTimeout(() => this._restartRecognition(), 1000);
      }
    }
  }

  /**
   * Initialize speech recognition and register callbacks
   */
  initRecognition(onResult, onEnd, onError, onListeningChange) {
    this.onResultCallback = onResult;
    this.onEndCallback = onEnd;
    this.onErrorCallback = onError;
    this.onListeningChangeCallback = onListeningChange;

    return this._createRecognition() !== null;
  }

  /**
   * Start listening to candidate
   */
  startListening() {
    this.shouldBeListening = true;
    this.permissionDenied = false;
    clearTimeout(this.restartTimeout);

    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    this._restartRecognition();
    return true;
  }

  /**
   * Stop listening
   */
  stopListening() {
    this.shouldBeListening = false;
    clearTimeout(this.restartTimeout);

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (_) {}
    }
    this.isListening = false;
    if (this.onListeningChangeCallback) {
      this.onListeningChangeCallback(false);
    }
  }

  /**
   * Toggle listening state
   */
  toggleListening() {
    if (this.isListening || this.shouldBeListening) {
      this.stopListening();
      return false;
    } else {
      this.startListening();
      return true;
    }
  }

  /**
   * Speak interviewer question aloud via TTS with watchdog & GC protection
   */
  speak(text, onStart, onEnd) {
    this.stopListening();
    this.stopSpeaking();

    if (!this.synthesis) {
      if (onStart) onStart();
      if (onEnd) setTimeout(onEnd, 1500);
      return;
    }

    this.isSpeaking = true;

    const cleanText = String(text || '')
      .replace(/[#*_`]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      return;
    }

    const chunks = cleanText.match(/[^.?!]+[.?!]+|\s*[^.?!]+/g).filter(c => c.trim());
    let currentChunkIndex = 0;
    let finished = false;

    if (onStart) onStart();

    const finishSpeech = () => {
      if (finished) return;
      finished = true;
      clearTimeout(this.speechWatchdog);
      clearInterval(this.speechHeartbeat);
      this.speechHeartbeat = null;
      this.activeUtterance = null;
      if (typeof window !== 'undefined') window.__mockmateUtterance = null;

      setTimeout(() => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      }, 250);
    };

    const playNextChunk = () => {
      if (!this.isSpeaking || finished) return;
      
      if (currentChunkIndex >= chunks.length) {
        finishSpeech();
        return;
      }

      if (!this.speechHeartbeat) {
        // Chromium TTS bug workaround: pause/resume every 10 seconds keeps it alive
        this.speechHeartbeat = setInterval(() => {
          if (this.synthesis && this.synthesis.speaking && !this.synthesis.paused) {
            this.synthesis.pause();
            this.synthesis.resume();
          }
        }, 10000);
      }

      const utterance = new SpeechSynthesisUtterance(chunks[currentChunkIndex]);
      utterance.rate = 1.02;
      utterance.pitch = 1.0;

      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      utterance.onend = () => {
        currentChunkIndex++;
        playNextChunk();
      };

      utterance.onerror = (err) => {
        console.warn('Speech synthesis chunk error:', err);
        currentChunkIndex++;
        playNextChunk();
      };

      // Keep active reference to prevent Chromium garbage collection from eating onend
      this.activeUtterance = utterance;
      if (typeof window !== 'undefined') {
        window.__mockmateUtterance = utterance;
      }

      // Safety watchdog: In case onend never triggers in browser for this chunk
      clearTimeout(this.speechWatchdog);
      const words = chunks[currentChunkIndex].split(/\s+/).length;
      const expectedTimeMs = Math.max(3000, (words / 2.2) * 1000 + 2500);
      
      this.speechWatchdog = setTimeout(() => {
        if (this.isSpeaking && !finished) {
          console.warn('Speech watchdog timer expired for chunk; skipping to next.');
          try {
            this.synthesis.cancel();
          } catch (_) {}
          currentChunkIndex++;
          playNextChunk();
        }
      }, expectedTimeMs);

      try {
        this.synthesis.speak(utterance);
      } catch (e) {
        console.error('TTS speak invocation error:', e);
        finishSpeech();
      }
    };

    playNextChunk();
  }

  /**
   * Stop TTS speech immediately
   */
  stopSpeaking() {
    clearTimeout(this.speechWatchdog);
    clearInterval(this.speechHeartbeat);
    this.speechHeartbeat = null;
    if (this.synthesis) {
      try {
        this.synthesis.cancel();
      } catch (_) {}
    }
    this.isSpeaking = false;
    this.activeUtterance = null;
    if (typeof window !== 'undefined') {
      window.__mockmateUtterance = null;
    }
  }

  /**
   * Setup real microphone audio analyser for live visualizer
   * Calculates volume focused on human vocal frequencies (80Hz - 3500Hz)
   */
  async setupAudioAnalyser(onVolumeUpdate) {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        return false;
      }

      // 1. Request microphone to explicitly guarantee permission is granted
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (err) {
        console.warn('Microphone permission denied during setup:', err);
        this.permissionDenied = true;
        return false;
      }

      const isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // On mobile, immediately stop the tracks to release hardware lock.
        // Android cannot share the mic between AudioContext and SpeechRecognition.
        stream.getTracks().forEach(t => t.stop());
        
        if (this.volumeAnimationFrame) {
          cancelAnimationFrame(this.volumeAnimationFrame);
        }
        const simulateVolume = () => {
          if (onVolumeUpdate) {
            onVolumeUpdate(this.isListening ? Math.floor(Math.random() * 25 + 5) : 0);
          }
          this.volumeAnimationFrame = requestAnimationFrame(() => {
            setTimeout(simulateVolume, 100);
          });
        };
        simulateVolume();
        this.permissionDenied = false;
        return true;
      }

      // For Desktop: keep the stream and setup AudioContext
      if (!this.mediaStream || !this.mediaStream.active) {
        this.mediaStream = stream;
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume().catch(() => {});
      }

      // Disconnect old source node if existing
      if (this.sourceNode) {
        try {
          this.sourceNode.disconnect();
        } catch (_) {}
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;
      this.sourceNode.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        // Vocal spectrum analysis: focus on bins 1 to 40 (~80Hz to ~3500Hz)
        let sum = 0;
        const voiceBins = 38;
        for (let i = 1; i <= voiceBins; i++) {
          sum += dataArray[i];
        }
        const vocalAvg = sum / voiceBins;
        
        // Scale to a lively 0 - 100 range with minimum noise threshold
        const scaledVol = vocalAvg < 3 ? 0 : Math.min(100, Math.round(vocalAvg * 1.8));

        if (onVolumeUpdate) {
          onVolumeUpdate(scaledVol);
        }
        this.volumeAnimationFrame = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      this.permissionDenied = false;
      return true;
    } catch (err) {
      console.warn('Microphone access check failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.permissionDenied = true;
      }
      return false;
    }
  }

  /**
   * Stop volume analyser loop without terminating the media tracks
   */
  stopVolumeCheck() {
    if (this.volumeAnimationFrame) {
      cancelAnimationFrame(this.volumeAnimationFrame);
      this.volumeAnimationFrame = null;
    }
  }

  /**
   * Clean up audio tracks and shutdown recognition on session exit
   */
  cleanupAudio() {
    this.stopVolumeCheck();
    this.stopSpeaking();
    this.stopListening();

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch (_) {}
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(track => track.stop());
      } catch (_) {}
      this.mediaStream = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close().catch(() => {});
      } catch (_) {}
      this.audioContext = null;
    }

    this.analyser = null;
  }
}

export const speechService = new SpeechService();
