export interface PerfConfig {
  dpr: number;
  shadowMapEnabled: boolean;
  particleCount: number;
  postProcessing: boolean;
}

class PerformanceManager {
  private fps: number[] = [];
  private lastTime = performance.now();
  private frameCount = 0;
  private lowPerformanceMode = false;

  public getAdaptiveDPR(): number {
    // Start with device pixel ratio but cap it
    const baseDPR = Math.min(window.devicePixelRatio, 2);
    
    // Reduce if we've detected low performance
    if (this.lowPerformanceMode) {
      return Math.min(baseDPR, 1);
    }
    
    return baseDPR;
  }

  public measureFrame() {
    this.frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= 1000) {
      const currentFPS = Math.round((this.frameCount * 1000) / elapsed);
      this.fps.push(currentFPS);
      
      // Keep only last 5 measurements
      if (this.fps.length > 5) {
        this.fps.shift();
      }

      // Check for consistent low FPS
      const avgFPS = this.fps.reduce((a, b) => a + b, 0) / this.fps.length;
      if (avgFPS < 30 && this.fps.length >= 3) {
        this.lowPerformanceMode = true;
      } else if (avgFPS > 50) {
        this.lowPerformanceMode = false;
      }

      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  public getConfig(): PerfConfig {
    return {
      dpr: this.getAdaptiveDPR(),
      shadowMapEnabled: !this.lowPerformanceMode,
      particleCount: this.lowPerformanceMode ? 500 : 2000,
      postProcessing: !this.lowPerformanceMode,
    };
  }

  public isLowPerformance(): boolean {
    return this.lowPerformanceMode;
  }
}

export const perfManager = new PerformanceManager();
