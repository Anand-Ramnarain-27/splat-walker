import * as THREE from "three";
import type { Waypoint } from "../data/path";

export interface PathControllerEvents {
  onProgress?: (t: number) => void;
  onPlayStateChange?: (playing: boolean) => void;
}

export class PathController {
  private readonly positionCurve: THREE.CatmullRomCurve3;
  private readonly lookAtCurve: THREE.CatmullRomCurve3;
  private readonly durationSeconds: number;
  private readonly events: PathControllerEvents;
  private progress = 0;
  private playing = false;

  constructor(waypoints: Waypoint[], durationSeconds: number, events: PathControllerEvents = {}) {
    if (waypoints.length < 2) {
      throw new Error("PathController requires at least 2 waypoints");
    }
    this.positionCurve = new THREE.CatmullRomCurve3(waypoints.map((w) => w.position));
    this.lookAtCurve = new THREE.CatmullRomCurve3(waypoints.map((w) => w.lookAt));
    this.durationSeconds = durationSeconds;
    this.events = events;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  get t(): number {
    return this.progress;
  }

  play(): void {
    if (this.progress >= 1) this.progress = 0;
    this.playing = true;
    this.events.onPlayStateChange?.(true);
  }

  pause(): void {
    this.playing = false;
    this.events.onPlayStateChange?.(false);
  }

  toggle(): void {
    if (this.playing) this.pause();
    else this.play();
  }

  seek(t: number): void {
    this.progress = THREE.MathUtils.clamp(t, 0, 1);
    this.events.onProgress?.(this.progress);
  }

  update(deltaSeconds: number): void {
    if (!this.playing) return;
    this.progress += deltaSeconds / this.durationSeconds;
    if (this.progress >= 1) {
      this.progress = 1;
      this.playing = false;
      this.events.onPlayStateChange?.(false);
    }
    this.events.onProgress?.(this.progress);
  }

  sample(camera: THREE.Camera): void {
    const position = this.positionCurve.getPointAt(this.progress);
    const lookAt = this.lookAtCurve.getPointAt(this.progress);
    camera.position.copy(position);
    camera.lookAt(lookAt);
  }
}
