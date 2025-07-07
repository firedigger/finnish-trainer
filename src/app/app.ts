import { Component, inject, computed, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { filter, startWith, map } from 'rxjs';
import { db, Verb } from './services/exercise-db';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'finnish-trainer';
  readonly specialChars = ['ä', 'ö', 'å', 'Ä', 'Ö', 'Å'];
  private readonly router = inject(Router);
  private lastFocusedInput: HTMLInputElement | HTMLTextAreaElement | null = null;

  // Signal of current url, updates on navigation
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  protected readonly showHomeButton = computed(() => this.currentUrl() !== '/');

  ngOnInit(): void {
    this.seed();
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        this.lastFocusedInput = target as HTMLInputElement | HTMLTextAreaElement;
      }
    });
  }

  async seed(): Promise<void> {
    // Seed verbs table if empty
    const verbCount = await db.verbs.count();
    if (verbCount === 0) {
      const defaultVerbs: Verb[] = [
        { verb: 'puhua' },
        { verb: 'syödä' },
        { verb: 'juoda' },
        { verb: 'nukkua' },
        { verb: 'kirjoittaa' },
        { verb: 'lukea' },
        { verb: 'mennä' },
        { verb: 'tulla' },
        { verb: 'antaa' },
        { verb: 'ottaa' }
      ];
      await db.verbs.bulkAdd(defaultVerbs);
    }
    // Add similar checks for other tables if needed
  }

  protected goHome() {
    this.router.navigate(['/']);
  }

  insertChar(char: string) {
    const el = this.lastFocusedInput as HTMLInputElement | HTMLTextAreaElement;
    console.log(el);
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const value = el.value;

      el.value = value.slice(0, start) + char + value.slice(end);
      el.selectionStart = el.selectionEnd = start + 1;

      // Dispatch input event so Angular picks it up
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      navigator.clipboard.writeText(char);
      alert(`Copied "${char}" to clipboard`);
    }
  }
}