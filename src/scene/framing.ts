import * as THREE from "three";
import type { SplatMesh } from "@sparkjsdev/spark";
import type { Waypoint } from "./PathController";

const SAMPLE_STRIDE = 25;
const RADIUS_PERCENTILE = 0.85;

export function orbitWaypointsFromSplats(splatMesh: SplatMesh, count = 6): Waypoint[] {
  const localCenters: THREE.Vector3[] = [];
  splatMesh.forEachSplat((index, center) => {
    if (index % SAMPLE_STRIDE !== 0) return;
    if (!Number.isFinite(center.x) || !Number.isFinite(center.y) || !Number.isFinite(center.z)) return;
    localCenters.push(center.clone());
  });

  splatMesh.updateMatrixWorld(true);
  const worldCenters = localCenters.map((c) => c.applyMatrix4(splatMesh.matrixWorld));

  const centroid = new THREE.Vector3();
  for (const c of worldCenters) centroid.add(c);
  centroid.divideScalar(Math.max(worldCenters.length, 1));

  const distances = worldCenters.map((c) => c.distanceTo(centroid)).sort((a, b) => a - b);
  const percentileIndex = Math.floor(distances.length * RADIUS_PERCENTILE);
  const typicalRadius = distances[percentileIndex] ?? distances[distances.length - 1] ?? 5;

  const radius = Math.max(typicalRadius, 1) * 2.2;
  const height = centroid.y + radius * 0.5;

  const sweep = Math.PI * 1.5;
  const waypoints: Waypoint[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / (count - 1)) * sweep;
    const position = new THREE.Vector3(
      centroid.x + Math.cos(angle) * radius,
      height,
      centroid.z + Math.sin(angle) * radius,
    );
    waypoints.push({ position, lookAt: centroid.clone() });
  }
  return waypoints;
}
