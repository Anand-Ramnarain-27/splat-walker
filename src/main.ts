import * as THREE from "three";
import { createSplatScene } from "./scene/SplatScene";
import { PathController } from "./scene/PathController";
import { CameraRig } from "./scene/CameraRig";
import { Controls } from "./ui/Controls";
import { orbitWaypointsFromSplats } from "./scene/framing";
import { SPLAT_URL } from "./config";

const PATH_DURATION_SECONDS = 20;

const app = document.getElementById("app");
if (!app) throw new Error("#app root element not found");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.05, 1000);
camera.position.set(0, 1.6, 5);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const loadingEl = document.createElement("div");
loadingEl.className = "loading";
loadingEl.textContent = "Loading splat scene…";
app.appendChild(loadingEl);

let pathController: PathController | null = null;
let cameraRig: CameraRig | null = null;
let controls: Controls | null = null;

const { splatMesh } = createSplatScene(scene, renderer, {
  url: SPLAT_URL,
  onProgress: (fraction) => {
    loadingEl.textContent = `Loading splat scene… ${Math.round(fraction * 100)}%`;
  },
  onLoaded: () => {
    loadingEl.remove();

    const waypoints = orbitWaypointsFromSplats(splatMesh);

    pathController = new PathController(waypoints, PATH_DURATION_SECONDS, {
      onProgress: (t) => controls?.setProgress(t),
      onPlayStateChange: (playing) => controls?.setPlaying(playing),
    });
    cameraRig = new CameraRig(camera, renderer.domElement, pathController);
    pathController.sample(camera);

    controls = new Controls(app, {
      onPlayPause: () => pathController?.toggle(),
      onScrub: (t) => {
        pathController?.pause();
        pathController?.seek(t);
      },
      onModeToggle: () => {
        if (!cameraRig) return;
        const next = cameraRig.getMode() === "path" ? "free" : "path";
        cameraRig.setMode(next);
        controls?.setMode(next);
      },
    });
  },
});

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  pathController?.update(delta);
  cameraRig?.update(delta);
  renderer.render(scene, camera);
});
