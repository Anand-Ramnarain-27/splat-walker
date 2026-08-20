import * as THREE from "three";
import type { KeyboardMovement } from "./KeyboardMovement";

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export function applyFlyMovement(
  camera: THREE.Camera,
  target: THREE.Vector3,
  keyboard: KeyboardMovement,
  deltaSeconds: number,
  speed: number,
): void {
  const forwardInput = keyboard.forward;
  const rightInput = keyboard.right;
  const verticalInput = keyboard.vertical;
  if (forwardInput === 0 && rightInput === 0 && verticalInput === 0) return;

  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  forward.y = 0;
  if (forward.lengthSq() > 0) forward.normalize();

  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  right.y = 0;
  if (right.lengthSq() > 0) right.normalize();

  const delta = new THREE.Vector3()
    .addScaledVector(forward, forwardInput)
    .addScaledVector(right, rightInput)
    .addScaledVector(WORLD_UP, verticalInput);
  if (delta.lengthSq() > 0) delta.normalize();
  delta.multiplyScalar(speed * deltaSeconds);

  camera.position.add(delta);
  target.add(delta);
}
