import { gsap } from "gsap";

export interface ScrollState {
  progress: number;
  targetProgress: number;
  velocity: number;
  isScrolling: boolean;
}

export class ScrollDirector {
  private state: ScrollState = {
    progress: 0,
    targetProgress: 0,
    velocity: 0,
    isScrolling: false,
  };

  private scrollSpeed = 0.0008;
  private damping = 0.08;
  private velocityDecay = 0.95;
  private minProgress = 0;
  private maxProgress = 1;
  private scrollTimeout: number | null = null;
  private orbitMode = false;

  constructor() {
    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener("wheel", this.handleWheel, { passive: false });
    window.addEventListener("touchstart", this.handleTouchStart, { passive: true });
    window.addEventListener("touchmove", this.handleTouchMove, { passive: false });
  }

  private lastTouchY = 0;

  private handleTouchStart = (e: TouchEvent) => {
    this.lastTouchY = e.touches[0].clientY;
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (this.orbitMode) return;
    e.preventDefault();
    
    const currentY = e.touches[0].clientY;
    const deltaY = this.lastTouchY - currentY;
    this.lastTouchY = currentY;

    this.updateScroll(deltaY * 2);
  };

  private handleWheel = (e: WheelEvent) => {
    if (this.orbitMode) return;
    e.preventDefault();
    this.updateScroll(e.deltaY);
  };

  private updateScroll(deltaY: number) {
    this.state.velocity += deltaY * this.scrollSpeed;
    this.state.targetProgress += deltaY * this.scrollSpeed;
    this.state.targetProgress = Math.max(
      this.minProgress,
      Math.min(this.maxProgress, this.state.targetProgress)
    );
    this.state.isScrolling = true;

    if (this.scrollTimeout) {
      window.clearTimeout(this.scrollTimeout);
    }
    this.scrollTimeout = window.setTimeout(() => {
      this.state.isScrolling = false;
    }, 150);
  }

  public update() {
    // Apply damping to smoothly interpolate progress
    const diff = this.state.targetProgress - this.state.progress;
    this.state.progress += diff * this.damping;

    // Decay velocity
    this.state.velocity *= this.velocityDecay;

    // Clamp progress
    this.state.progress = Math.max(
      this.minProgress,
      Math.min(this.maxProgress, this.state.progress)
    );

    return this.state;
  }

  public getProgress(): number {
    return this.state.progress;
  }

  public getState(): ScrollState {
    return { ...this.state };
  }

  public setOrbitMode(enabled: boolean) {
    this.orbitMode = enabled;
  }

  public isInOrbitMode(): boolean {
    return this.orbitMode;
  }

  public getActFromProgress(progress: number): number {
    if (progress < 0.16) return 1; // ORIGIN
    if (progress < 0.32) return 2; // AWAKENING
    if (progress < 0.62) return 3; // CREATION
    if (progress < 0.80) return 4; // INTELLIGENCE
    if (progress < 0.92) return 5; // FUTURE
    return 6; // CONTACT
  }

  public destroy() {
    window.removeEventListener("wheel", this.handleWheel);
    window.removeEventListener("touchstart", this.handleTouchStart);
    window.removeEventListener("touchmove", this.handleTouchMove);
    if (this.scrollTimeout) {
      window.clearTimeout(this.scrollTimeout);
    }
  }
}
