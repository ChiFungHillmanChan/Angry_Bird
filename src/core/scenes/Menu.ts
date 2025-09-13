import type { IScene } from '../types';
import type { SceneManager } from '../SceneManager';

interface Button {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: () => void;
}

export class MenuScene implements IScene {
  private buttons: Button[] = [];
  private clickAttached = false;
  private isMuted = false;

  constructor(private manager: SceneManager) {}

  init(): void {
    // Load mute state from localStorage
    this.isMuted = localStorage.getItem('slingCritter_muted') === 'true';
    
    // Ensure camera is centered for menu
    const renderer = this.manager.getRenderer();
    renderer.camera.lookAt(0, 0);
    
    // Setup buttons
    this.buttons = [
      { text: 'Start Game', x: 0, y: 80, width: 240, height: 60, action: () => this.startLevel('level-001') },
      { text: 'Level Select', x: 0, y: 160, width: 240, height: 60, action: () => this.showLevelSelect() },
      { text: this.isMuted ? 'Unmute' : 'Mute', x: 0, y: 240, width: 240, height: 60, action: () => this.toggleMute() }
    ];
    
    // Attach click handler once during init
    this.attachClickHandler();
  }

  render(ctx: CanvasRenderingContext2D): void {
    const r = this.manager.getRenderer();
    
    // Sky background with gradient
    const gradient = ctx.createLinearGradient(0, -r.camera.viewport.height / 2, 0, r.camera.viewport.height / 2);
    gradient.addColorStop(0, '#1a2847');
    gradient.addColorStop(1, '#0b1021');
    ctx.fillStyle = gradient;
    ctx.fillRect(-r.camera.viewport.width / 2, -r.camera.viewport.height / 2, r.camera.viewport.width, r.camera.viewport.height);

    ctx.save();
    
    // Title circle logo
    ctx.translate(0, -200);
    ctx.fillStyle = '#2bd1ff';
    ctx.beginPath();
    ctx.arc(0, 0, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner circle detail
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();

    // Title text
    ctx.fillStyle = '#e6f7ff';
    ctx.font = 'bold 48px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sling Critter', 0, 120);
    
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Physics Puzzle Game', 0, 150);

    // Draw all buttons
    this.buttons.forEach(button => this.drawButton(ctx, button));
    
    ctx.restore();
  }

  private attachClickHandler(): void {
    if (this.clickAttached) return;
    this.clickAttached = true;
    const canvas = this.manager.getRenderer().getCanvas();
    
    const handler = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      
      // Simple and reliable screen-based coordinate system
      const rect = canvas.getBoundingClientRect();
      
      // Get coordinates from either mouse or touch event
      let clientX: number, clientY: number;
      if (e instanceof TouchEvent) {
        const touch = e.changedTouches[0];
        if (!touch) return; // No touch data
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      // Convert to normalized coordinates (0-1)
      const normalizedX = x / rect.width;
      const normalizedY = y / rect.height;
      
      console.log(`Click at: screen(${x.toFixed(1)}, ${y.toFixed(1)}) normalized(${normalizedX.toFixed(3)}, ${normalizedY.toFixed(3)})`);
      
      // Check if click is in center area (horizontally)
      const inCenterArea = normalizedX > 0.2 && normalizedX < 0.8;
      console.log(`In center area: ${inCenterArea}`);
      console.log(`Button zones - Start: 0.30-0.42, Select: 0.42-0.54, Mute: 0.54-0.66`);
      
      if (inCenterArea) {
        // Start Game button area - adjusted based on actual rendering position
        if (normalizedY > 0.30 && normalizedY < 0.42) {
          console.log('Start Game clicked');
          this.startLevel('level-001');
          return;
        }
        // Level Select button area
        else if (normalizedY > 0.42 && normalizedY < 0.54) {
          console.log('Level Select clicked');
          this.showLevelSelect();
          return;
        }
        // Mute button area
        else if (normalizedY > 0.54 && normalizedY < 0.66) {
          console.log('Mute clicked');
          this.toggleMute();
          return;
        }
      }
      
      // If no button was detected, try a more lenient check
      console.log('No button in primary zones, trying extended detection...');
      
      // Extended detection with larger areas
      if (normalizedX > 0.1 && normalizedX < 0.9) {
        if (normalizedY > 0.25 && normalizedY < 0.47) {
          console.log('Extended: Start Game clicked');
          this.startLevel('level-001');
          return;
        } else if (normalizedY > 0.47 && normalizedY < 0.59) {
          console.log('Extended: Level Select clicked');
          this.showLevelSelect();
          return;
        } else if (normalizedY > 0.59 && normalizedY < 0.71) {
          console.log('Extended: Mute clicked');
          this.toggleMute();
          return;
        }
      }
      
      console.log(`No button clicked - normalizedY ${normalizedY.toFixed(3)} not in any button zone`);
    };
    
    canvas.addEventListener('click', handler);
    canvas.addEventListener('touchend', handler); // Add touch support
    
    // Store handler reference for cleanup
    (this as any).clickHandler = handler;
  }

  private isPointInButton(point: { x: number; y: number }, button: Button): boolean {
    const inButton = (
      point.x >= button.x - button.width / 2 &&
      point.x <= button.x + button.width / 2 &&
      point.y >= button.y - button.height / 2 &&
      point.y <= button.y + button.height / 2
    );
    
    if (inButton) {
      console.log(`Point (${point.x}, ${point.y}) is in button "${button.text}" at (${button.x}, ${button.y})`);
    }
    
    return inButton;
  }

  private drawButton(ctx: CanvasRenderingContext2D, button: Button): void {
    ctx.save();
    ctx.translate(button.x, button.y);
    
    // Button background
    ctx.fillStyle = '#1b2a4b';
    ctx.fillRect(-button.width / 2, -button.height / 2, button.width, button.height);
    
    // Button border
    ctx.strokeStyle = '#2bd1ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-button.width / 2, -button.height / 2, button.width, button.height);
    
    // Button text
    ctx.fillStyle = '#e6f7ff';
    ctx.font = '24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(button.text, 0, 0);
    
    ctx.restore();
  }

  private async startLevel(id: string): Promise<void> {
    try {
      const { LevelScene } = await import('./Level');
      this.manager.setScene('Level', new LevelScene(this.manager, id));
    } catch (error) {
      console.error('Failed to load level:', error);
    }
  }

  private showLevelSelect(): void {
    // For now, just start level 2
    this.startLevel('level-002');
  }

  private toggleMute(): void {
    this.isMuted = !this.isMuted;
    localStorage.setItem('slingCritter_muted', this.isMuted.toString());
    
    // Update button text
    const muteButton = this.buttons.find(b => b.text === 'Mute' || b.text === 'Unmute');
    if (muteButton) {
      muteButton.text = this.isMuted ? 'Unmute' : 'Mute';
    }
  }

  dispose(): void {
    // Clean up event listeners
    if ((this as any).clickHandler) {
      const canvas = this.manager.getRenderer().getCanvas();
      canvas.removeEventListener('click', (this as any).clickHandler);
      canvas.removeEventListener('touchend', (this as any).clickHandler);
      (this as any).clickHandler = null;
    }
    this.clickAttached = false;
  }
}


