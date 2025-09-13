import { Howl, Howler } from 'howler';

type SfxName = 'launch' | 'hit' | 'win' | 'lose' | 'bgm';

const STORAGE_KEY_MUTE = 'sc.mute';

class SfxManager {
  private sounds: Partial<Record<SfxName, Howl>> = {};
  private initialized = false;

  initAfterUserGesture(): void {
    if (this.initialized) return;
    this.sounds.launch = new Howl({ src: ['/audio/launch.mp3'], volume: 0.5 });
    this.sounds.hit = new Howl({ src: ['/audio/hit.mp3'], volume: 0.5 });
    this.sounds.win = new Howl({ src: ['/audio/win.mp3'], volume: 0.5 });
    this.sounds.lose = new Howl({ src: ['/audio/lose.mp3'], volume: 0.5 });
    this.sounds.bgm = new Howl({ src: ['/audio/bgm.mp3'], loop: true, volume: 0.3 });
    if (!this.isMuted()) this.sounds.bgm.play();
    this.initialized = true;
  }

  play(name: SfxName): void {
    const s = this.sounds[name];
    if (s && !this.isMuted()) s.play();
  }

  setMuted(flag: boolean): void {
    localStorage.setItem(STORAGE_KEY_MUTE, flag ? '1' : '0');
    Howler.mute(flag);
  }

  isMuted(): boolean {
    return localStorage.getItem(STORAGE_KEY_MUTE) === '1';
  }
}

export const sfx = new SfxManager();


