import * as THREE from "three";

export interface Waypoint {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

// Rough path tuned to the snow-street.spz dev placeholder. Re-tune once the
// final scene is in place — waypoint positions are scene-specific.
export const demoWaypoints: Waypoint[] = [
  { position: new THREE.Vector3(0, 1.6, 4), lookAt: new THREE.Vector3(0, 1.4, 0) },
  { position: new THREE.Vector3(2, 1.6, 1), lookAt: new THREE.Vector3(0, 1.4, -1) },
  { position: new THREE.Vector3(1, 1.7, -2), lookAt: new THREE.Vector3(-1, 1.4, -4) },
  { position: new THREE.Vector3(-1, 1.6, -4), lookAt: new THREE.Vector3(-3, 1.4, -6) },
  { position: new THREE.Vector3(-3, 1.6, -6), lookAt: new THREE.Vector3(-5, 1.4, -8) },
];
