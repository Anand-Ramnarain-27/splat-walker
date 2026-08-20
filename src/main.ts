import * as THREE from "three";
import { createSplatScene } from "./scene/SplatScene";
import { PathController } from "./scene/PathController";
import { CameraRig } from "./scene/CameraRig";
import { Controls } from "./ui/Controls";
import { demoWaypoints } from "./data/path";
import { SPLAT_URL } from "./config";

const PATH_DURATION_SECONDS = 20;

const app = document.getElementById("app");
if (!app) throw new Error("#app root element not found");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.05, 1000);

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

createSplatScene(scene, renderer, {
  url: SPLAT_URL,
  onProgress: (fraction) => {
    loadingEl.textContent = `Loading splat scene… ${Math.round(fraction * 100)}%`;
  },
  onLoaded: () => {
    loadingEl.remove();
  },
});

const pathController = new PathController(demoWaypoints, PATH_DURATION_SECONDS, {
  onProgress: (t) => controls.setProgress(t),
  onPlayStateChange: (playing) => controls.setPlaying(playing),
});

const cameraRig = new CameraRig(camera, renderer.domElement, pathController);
pathController.sample(camera);

const controls = new Controls(app, {
  onPlayPause: () => pathController.toggle(),
  onScrub: (t) => {
    pathController.pause();
    pathController.seek(t);
  },
  onModeToggle: () => {
    const next = cameraRig.getMode() === "path" ? "free" : "path";
    cameraRig.setMode(next);
    controls.setMode(next);
  },
});

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  pathController.update(delta);
  cameraRig.update();
  renderer.render(scene, camera);
});
