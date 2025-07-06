import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { filter, startWith, map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'finnish-trainer';

  private readonly router = inject(Router);

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

  protected goHome() {
    this.router.navigate(['/']);
  }
}
