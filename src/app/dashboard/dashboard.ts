import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'ft-dashboard',
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
    // Example: current module name (could be dynamic in the future)
    protected readonly currentModule = signal('Verb Conjugation');

    private readonly router = inject(Router);

    launchVerbConjugation() {
        this.router.navigate(['/verb-conjugation']);
    }
}
