export class KeyboardMovement {
  private readonly keys = new Set<string>();

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (this.isTypingTarget(e.target)) return;
    if (e.code === "Space") e.preventDefault();
    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code);
  };

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  get forward(): number {
    let v = 0;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) v += 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) v -= 1;
    return v;
  }

  get right(): number {
    let v = 0;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) v += 1;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) v -= 1;
    return v;
  }

  get vertical(): number {
    let v = 0;
    if (this.keys.has("Space")) v += 1;
    if (this.keys.has("ShiftLeft") || this.keys.has("ShiftRight")) v -= 1;
    return v;
  }
}
