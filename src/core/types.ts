import type { Renderer } from './render/Renderer';

export interface IScene {
  init?: () => void;
  update?: (dt: number) => void;
  render?: (ctx: CanvasRenderingContext2D, renderer: Renderer) => void;
  dispose?: () => void;
}


