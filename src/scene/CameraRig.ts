import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { PathController } from "./PathController";
import { KeyboardMovement } from "./KeyboardMovement";

export type CameraMode = "path" | "free";

const MOVE_SPEED = 4;
const WORLD_UP = new THREE.Vector3(0, 1, 0);

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
      this.applyKeyboardMovement(deltaSeconds);
      this.orbitControls.update();
    }
  }

  dispose(): void {
    this.keyboard.dispose();
  }

  private applyKeyboardMovement(deltaSeconds: number): void {
    const forwardInput = this.keyboard.forward;
    const rightInput = this.keyboard.right;
    const verticalInput = this.keyboard.vertical;
    if (forwardInput === 0 && rightInput === 0 && verticalInput === 0) return;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    if (forward.lengthSq() > 0) forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    right.y = 0;
    if (right.lengthSq() > 0) right.normalize();

    const delta = new THREE.Vector3()
      .addScaledVector(forward, forwardInput)
      .addScaledVector(right, rightInput)
      .addScaledVector(WORLD_UP, verticalInput);
    if (delta.lengthSq() > 0) delta.normalize();
    delta.multiplyScalar(MOVE_SPEED * deltaSeconds);

    this.camera.position.add(delta);
    this.orbitControls.target.add(delta);
  }
}
