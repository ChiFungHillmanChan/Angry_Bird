export class HUD {
  constructor(private getState: () => { birds: number; score: number }) {}

  render(ctx: CanvasRenderingContext2D): void {
    const { birds, score } = this.getState();
    ctx.save();
    ctx.resetTransform();
    ctx.fillStyle = '#e6f7ff';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText(`Birds: ${birds}`, 16, 24);
    ctx.fillText(`Score: ${score}`, 16, 44);
    ctx.restore();
  }
}


