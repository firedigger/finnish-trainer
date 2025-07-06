import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { VerbConjugationExerciseComponent } from './verb-conjugation-exercise/verb-conjugation-exercise';

export const routes: Routes = [
    {
        path: '',
        component: DashboardComponent,
    },
    {
        path: 'verb-conjugation',
        component: VerbConjugationExerciseComponent
    }
];
