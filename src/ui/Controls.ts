export interface ControlsCallbacks {
  onPlayPause: () => void;
  onScrub: (t: number) => void;
  onModeToggle: () => void;
}

const SCRUB_STEPS = 1000;

export class Controls {
  private readonly root: HTMLDivElement;
  private readonly playButton: HTMLButtonElement;
  private readonly scrubInput: HTMLInputElement;
  private readonly modeButton: HTMLButtonElement;
  private scrubbing = false;

  constructor(container: HTMLElement, callbacks: ControlsCallbacks) {
    this.root = document.createElement("div");
    this.root.className = "controls";

    this.modeButton = document.createElement("button");
    this.modeButton.className = "controls__button controls__mode";
    this.modeButton.addEventListener("click", callbacks.onModeToggle);

    this.playButton = document.createElement("button");
    this.playButton.className = "controls__button controls__play";
    this.playButton.addEventListener("click", callbacks.onPlayPause);

    this.scrubInput = document.createElement("input");
    this.scrubInput.type = "range";
    this.scrubInput.min = "0";
    this.scrubInput.max = String(SCRUB_STEPS);
    this.scrubInput.value = "0";
    this.scrubInput.className = "controls__scrub";
    this.scrubInput.addEventListener("input", () => {
      this.scrubbing = true;
      callbacks.onScrub(Number(this.scrubInput.value) / SCRUB_STEPS);
    });
    this.scrubInput.addEventListener("change", () => {
      this.scrubbing = false;
    });

    this.root.append(this.playButton, this.scrubInput, this.modeButton);
    container.appendChild(this.root);

    this.setPlaying(false);
    this.setMode("path");
  }

  setPlaying(playing: boolean): void {
    this.playButton.textContent = playing ? "Pause" : "Play";
  }

  setProgress(t: number): void {
    if (this.scrubbing) return;
    this.scrubInput.value = String(Math.round(t * SCRUB_STEPS));
  }

  setMode(mode: "path" | "free"): void {
    this.modeButton.textContent = mode === "path" ? "Switch to Free Explore" : "Switch to Follow Path";
    this.playButton.disabled = mode === "free";
    this.scrubInput.disabled = mode === "free";
  }
}
