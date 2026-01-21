import * as THREE from "three";
import { gsap } from "gsap";

export interface CameraState {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
}

export class CameraRail {
  private keyframes: {
    progress: number;
    position: THREE.Vector3;
    lookAt: THREE.Vector3;
    fov: number;
  }[] = [
    // Act 1: ORIGIN (0.00 - 0.16)
    { progress: 0, position: new THREE.Vector3(0, 0, 20), lookAt: new THREE.Vector3(0, 0, 0), fov: 60 },
    { progress: 0.08, position: new THREE.Vector3(0, 0.5, 15), lookAt: new THREE.Vector3(0, 0, -5), fov: 65 },
    { progress: 0.16, position: new THREE.Vector3(0, 1, 10), lookAt: new THREE.Vector3(0, 0, -10), fov: 70 },
    
    // Act 2: AWAKENING (0.16 - 0.32)
    { progress: 0.24, position: new THREE.Vector3(-2, 2, 5), lookAt: new THREE.Vector3(0, 0, -15), fov: 75 },
    { progress: 0.32, position: new THREE.Vector3(0, 1, 0), lookAt: new THREE.Vector3(0, 0, -20), fov: 70 },
    
    // Act 3: CREATION - Projects (0.32 - 0.62)
    { progress: 0.40, position: new THREE.Vector3(2, 0, -5), lookAt: new THREE.Vector3(-4, 0, -15), fov: 65 },
    { progress: 0.50, position: new THREE.Vector3(-1, 2, -15), lookAt: new THREE.Vector3(3, 2, -25), fov: 65 },
    { progress: 0.58, position: new THREE.Vector3(1, -1, -25), lookAt: new THREE.Vector3(-2, -1, -35), fov: 65 },
    { progress: 0.62, position: new THREE.Vector3(-2, 0, -35), lookAt: new THREE.Vector3(5, -2, -45), fov: 65 },
    
    // Act 4: INTELLIGENCE (0.62 - 0.80)
    { progress: 0.70, position: new THREE.Vector3(0, 5, -40), lookAt: new THREE.Vector3(0, 0, -55), fov: 80 },
    { progress: 0.80, position: new THREE.Vector3(0, 3, -50), lookAt: new THREE.Vector3(0, 0, -65), fov: 75 },
    
    // Act 5: FUTURE (0.80 - 0.92)
    { progress: 0.86, position: new THREE.Vector3(-3, 2, -55), lookAt: new THREE.Vector3(0, 0, -75), fov: 70 },
    { progress: 0.92, position: new THREE.Vector3(0, 1, -60), lookAt: new THREE.Vector3(0, 0, -80), fov: 65 },
    
    // Act 6: CONTACT (0.92 - 1.00)
    { progress: 0.96, position: new THREE.Vector3(0, 0.5, -65), lookAt: new THREE.Vector3(0, 0, -85), fov: 60 },
    { progress: 1, position: new THREE.Vector3(0, 0, -70), lookAt: new THREE.Vector3(0, 0, -90), fov: 55 },
  ];

  private currentState: CameraState = {
    position: new THREE.Vector3(0, 0, 20),
    lookAt: new THREE.Vector3(0, 0, 0),
    fov: 60,
  };

  private orbitTarget: THREE.Vector3 | null = null;
  private orbitRadius = 8;
  private orbitAngle = 0;

  public getCameraState(progress: number): CameraState {
    // Find the two keyframes to interpolate between
    let startFrame = this.keyframes[0];
    let endFrame = this.keyframes[1];

    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (progress >= this.keyframes[i].progress && progress <= this.keyframes[i + 1].progress) {
        startFrame = this.keyframes[i];
        endFrame = this.keyframes[i + 1];
        break;
      }
    }

    // If at the end, use last frame
    if (progress >= this.keyframes[this.keyframes.length - 1].progress) {
      const lastFrame = this.keyframes[this.keyframes.length - 1];
      return {
        position: lastFrame.position.clone(),
        lookAt: lastFrame.lookAt.clone(),
        fov: lastFrame.fov,
      };
    }

    // Calculate local progress between the two keyframes
    const range = endFrame.progress - startFrame.progress;
    const localProgress = range > 0 ? (progress - startFrame.progress) / range : 0;

    // Apply easing
    const easedProgress = this.easeInOutCubic(localProgress);

    // Interpolate all values
    const position = new THREE.Vector3().lerpVectors(
      startFrame.position,
      endFrame.position,
      easedProgress
    );
    const lookAt = new THREE.Vector3().lerpVectors(
      startFrame.lookAt,
      endFrame.lookAt,
      easedProgress
    );
    const fov = THREE.MathUtils.lerp(startFrame.fov, endFrame.fov, easedProgress);

    this.currentState = { position, lookAt, fov };
    return this.currentState;
  }

  public getOrbitState(target: THREE.Vector3, deltaTime: number): CameraState {
    this.orbitAngle += deltaTime * 0.3;
    
    const x = target.x + Math.cos(this.orbitAngle) * this.orbitRadius;
    const z = target.z + Math.sin(this.orbitAngle) * this.orbitRadius;
    const y = target.y + 2;

    return {
      position: new THREE.Vector3(x, y, z),
      lookAt: target.clone(),
      fov: 50,
    };
  }

  public resetOrbitAngle() {
    this.orbitAngle = 0;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
