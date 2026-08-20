import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createSplatScene } from "./SplatScene";
import { cinematicWaypointsFromSplats } from "./framing";

export interface ComparePane {
  url: string;
  label: string;
}

export interface CompareViewOptions {
  left: ComparePane;
  right: ComparePane;
  onClose: () => void;
}

interface PaneState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  canvasHost: HTMLElement;
}

export class CompareView {
  private readonly root: HTMLDivElement;
  private readonly panes: PaneState[] = [];
  private readonly onWindowResize: () => void;
  private rafId: number | null = null;

  constructor(container: HTMLElement, options: CompareViewOptions) {
    this.root = document.createElement("div");
    this.root.className = "compare";

    const panesEl = document.createElement("div");
    panesEl.className = "compare__panes";
    panesEl.appendChild(this.buildPane(options.left));
    panesEl.appendChild(this.buildPane(options.right));

    const closeButton = document.createElement("button");
    closeButton.className = "compare__close";
    closeButton.textContent = "Close Comparison";
    closeButton.addEventListener("click", options.onClose);

    this.root.append(panesEl, closeButton);
    container.appendChild(this.root);

    this.onWindowResize = () => this.resizeAll();
    window.addEventListener("resize", this.onWindowResize);
    this.resizeAll();

    const clock = new THREE.Clock();
    const animate = () => {
      clock.getDelta();
      for (const pane of this.panes) {
        pane.controls.update();
        pane.renderer.render(pane.scene, pane.camera);
      }
      this.rafId = requestAnimationFrame(animate);
    };
    animate();
  }

  private buildPane(pane: ComparePane): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "compare__pane";

    const canvasHost = document.createElement("div");
    canvasHost.className = "compare__canvas-host";

    const label = document.createElement("div");
    label.className = "compare__label";
    label.textContent = pane.label;

    const loadingEl = document.createElement("div");
    loadingEl.className = "loading compare__loading";
    loadingEl.textContent = "Loading…";

    wrapper.append(canvasHost, label, loadingEl);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 2000);

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasHost.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const { splatMesh } = createSplatScene(scene, renderer, {
      url: pane.url,
      onProgress: (fraction) => {
        loadingEl.textContent = `Loading… ${Math.round(fraction * 100)}%`;
      },
      onLoaded: () => {
        loadingEl.remove();
        const [defaultPose] = cinematicWaypointsFromSplats(splatMesh);
        if (defaultPose) {
          camera.position.copy(defaultPose.position);
          controls.target.copy(defaultPose.lookAt);
          camera.lookAt(defaultPose.lookAt);
          controls.update();
        }
      },
    });

    this.panes.push({ renderer, scene, camera, controls, canvasHost });
    return wrapper;
  }

  private resizeAll(): void {
    for (const pane of this.panes) {
      const width = pane.canvasHost.clientWidth || window.innerWidth / 2;
      const height = pane.canvasHost.clientHeight || window.innerHeight;
      pane.renderer.setSize(width, height);
      pane.camera.aspect = width / height;
      pane.camera.updateProjectionMatrix();
    }
  }

  dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    window.removeEventListener("resize", this.onWindowResize);
    for (const pane of this.panes) {
      pane.controls.dispose();
      pane.renderer.dispose();
    }
    this.root.remove();
  }
}
