import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { PathController } from "./PathController";
import { KeyboardMovement } from "./KeyboardMovement";
import { applyFlyMovement } from "./flyMovement";

export type CameraMode = "path" | "free";

const MOVE_SPEED = 4;

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  readonly orbitControls: OrbitControls;
  private readonly keyboard = new KeyboardMovement();
  private mode: CameraMode = "path";

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement, private readonly pathController: PathController) {
    this.camera = camera;
    this.orbitControls = new OrbitControls(camera, domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.enabled = false;
  }

  getMode(): CameraMode {
    return this.mode;
  }

  setMode(mode: CameraMode): void {
    this.mode = mode;
    this.orbitControls.enabled = mode === "free";
    if (mode === "free") {
      const forward = this.camera.getWorldDirection(new THREE.Vector3());
      this.orbitControls.target.copy(this.camera.position).add(forward);
    }
  }

  update(deltaSeconds: number): void {
    if (this.mode === "path") {
      this.pathController.sample(this.camera);
    } else {
      applyFlyMovement(this.camera, this.orbitControls.target, this.keyboard, deltaSeconds, MOVE_SPEED);
      this.orbitControls.update();
    }
  }

  dispose(): void {
    this.keyboard.dispose();
  }
}
