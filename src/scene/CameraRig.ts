import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { PathController } from "./PathController";

export type CameraMode = "path" | "free";

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  readonly orbitControls: OrbitControls;
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

  update(): void {
    if (this.mode === "path") {
      this.pathController.sample(this.camera);
    } else {
      this.orbitControls.update();
    }
  }
}
