import * as THREE from "three";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";

export interface SplatSceneOptions {
  url: string;
  onProgress?: (fraction: number) => void;
  onLoaded?: () => void;
}

export interface SplatScene {
  spark: SparkRenderer;
  splatMesh: SplatMesh;
}

export function createSplatScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer, options: SplatSceneOptions): SplatScene {
  const spark = new SparkRenderer({ renderer });
  scene.add(spark);

  const splatMesh = new SplatMesh({
    url: options.url,
    onProgress: (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(event.loaded / event.total);
      }
    },
  });
  splatMesh.quaternion.set(1, 0, 0, 0);
  scene.add(splatMesh);

  splatMesh.initialized.then(() => {
    options.onLoaded?.();
  });

  return { spark, splatMesh };
}
