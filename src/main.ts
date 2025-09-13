/*
 Assumptions:
 - Canvas sized to DPR, logical coordinates 1280x720 via Renderer
 - Service worker registered in production
*/

import { SceneManager } from './core/SceneManager';
import { BootScene } from './core/scenes/Boot';

const canvas = document.getElementById('game') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element #game not found');
}

const sceneManager = new SceneManager(canvas);
sceneManager.setScene('Boot', new BootScene(sceneManager));
sceneManager.start();

// Register Service Worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.info('Service worker registered', reg.scope);
      })
      .catch((err) => console.error('SW registration failed', err));
  });
}
