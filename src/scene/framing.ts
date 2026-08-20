import * as THREE from "three";
import type { SplatMesh } from "@sparkjsdev/spark";
import type { Waypoint } from "./PathController";

const SAMPLE_STRIDE = 25;
const RADIUS_PERCENTILE = 0.85;
const GROUND_PERCENTILE = 0.1;
const EYE_HEIGHT = 1.7;

interface SplatDistribution {
  centroid: THREE.Vector3;
  radius: number;
  groundY: number;
  walkDirection: THREE.Vector3;
  walkHalfLength: number;
}

function analyzeSplats(splatMesh: SplatMesh): SplatDistribution {
  const localCenters: THREE.Vector3[] = [];
  splatMesh.forEachSplat((index, center) => {
    if (index % SAMPLE_STRIDE !== 0) return;
    if (!Number.isFinite(center.x) || !Number.isFinite(center.y) || !Number.isFinite(center.z)) return;
    localCenters.push(center.clone());
  });

  splatMesh.updateMatrixWorld(true);
  const centers = localCenters.map((c) => c.applyMatrix4(splatMesh.matrixWorld));

  const centroid = new THREE.Vector3();
  for (const c of centers) centroid.add(c);
  centroid.divideScalar(Math.max(centers.length, 1));

  const distances = centers.map((c) => c.distanceTo(centroid)).sort((a, b) => a - b);
  const radiusIndex = Math.floor(distances.length * RADIUS_PERCENTILE);
  const radius = Math.max(distances[radiusIndex] ?? distances[distances.length - 1] ?? 5, 1);

  const ys = centers.map((c) => c.y).sort((a, b) => a - b);
  const groundIndex = Math.floor(ys.length * GROUND_PERCENTILE);
  const groundY = ys[groundIndex] ?? centroid.y - radius * 0.3;

  let cxx = 0;
  let czz = 0;
  let cxz = 0;
  for (const c of centers) {
    const dx = c.x - centroid.x;
    const dz = c.z - centroid.z;
    cxx += dx * dx;
    czz += dz * dz;
    cxz += dx * dz;
  }
  const n = Math.max(centers.length, 1);
  cxx /= n;
  czz /= n;
  cxz /= n;

  const trace = cxx + czz;
  const det = cxx * czz - cxz * cxz;
  const lambda1 = trace / 2 + Math.sqrt(Math.max(trace * trace / 4 - det, 0));

  let dirX: number;
  let dirZ: number;
  if (Math.abs(cxz) > 1e-9) {
    dirX = lambda1 - czz;
    dirZ = cxz;
  } else if (cxx >= czz) {
    dirX = 1;
    dirZ = 0;
  } else {
    dirX = 0;
    dirZ = 1;
  }
  const dir2 = new THREE.Vector2(dirX, dirZ);
  if (dir2.lengthSq() < 1e-9) dir2.set(1, 0);
  dir2.normalize();

  return {
    centroid,
    radius,
    groundY,
    walkDirection: new THREE.Vector3(dir2.x, 0, dir2.y),
    walkHalfLength: Math.max(Math.sqrt(lambda1) * 1.4, radius * 0.4),
  };
}

export function cinematicWaypointsFromSplats(splatMesh: SplatMesh): Waypoint[] {
  const { centroid, radius, groundY, walkDirection, walkHalfLength } = analyzeSplats(splatMesh);
  const eyeHeight = groundY + EYE_HEIGHT;

  const overviewRadius = radius * 2.2;
  const overviewHeight = centroid.y + overviewRadius * 0.5;
  const overviewCount = 4;
  const overviewSweep = Math.PI * 1.15;

  const overviewWaypoints: Waypoint[] = [];
  for (let i = 0; i < overviewCount; i++) {
    const angle = (i / (overviewCount - 1)) * overviewSweep;
    overviewWaypoints.push({
      position: new THREE.Vector3(
        centroid.x + Math.cos(angle) * overviewRadius,
        overviewHeight,
        centroid.z + Math.sin(angle) * overviewRadius,
      ),
      lookAt: centroid.clone(),
    });
  }

  const walkStart = centroid.clone().addScaledVector(walkDirection, -walkHalfLength);
  const walkEnd = centroid.clone().addScaledVector(walkDirection, walkHalfLength);

  const descentWaypoint: Waypoint = {
    position: new THREE.Vector3(walkStart.x, (overviewHeight + eyeHeight) / 2, walkStart.z),
    lookAt: centroid.clone(),
  };

  const walkCount = 5;
  const lookAheadDistance = walkHalfLength * 0.4;
  const walkWaypoints: Waypoint[] = [];
  for (let i = 0; i < walkCount; i++) {
    const t = i / (walkCount - 1);
    const position = walkStart.clone().lerp(walkEnd, t);
    position.y = eyeHeight;
    const lookAt = position.clone().addScaledVector(walkDirection, lookAheadDistance);
    lookAt.y = eyeHeight;
    walkWaypoints.push({ position, lookAt });
  }

  return [...overviewWaypoints, descentWaypoint, ...walkWaypoints];
}
