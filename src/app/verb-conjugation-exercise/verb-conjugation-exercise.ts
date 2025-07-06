import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ExerciseDbService, ExerciseAttempt } from '../services/exercise-db.service';
import { VerbConjugationService, ConjugationResult } from '../services/verb-conjugation.service';

const PRONOUNS = [
  { fi: 'minä', en: 'I' },
  { fi: 'sinä', en: 'you (sing.)' },
  { fi: 'hän', en: 'he/she' },
  { fi: 'me', en: 'we' },
  { fi: 'te', en: 'you (pl.)' },
  { fi: 'he', en: 'they' },
];

@Component({
  selector: 'verb-conjugation-exercise',
  templateUrl: './verb-conjugation-exercise.html',
  styleUrls: ['./verb-conjugation-exercise.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerbConjugationExerciseComponent {
  // The verb to conjugate, e.g. "puhua"
  readonly verb = input<string>('puhua');

  // User answers for each pronoun
  protected readonly answers = signal<string[]>(Array(PRONOUNS.length).fill(''));
  
  // Validation results
  protected readonly validationResults = signal<ConjugationResult[]>([]);
  
  // Exercise state
  protected readonly isSubmitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly score = signal(0);

  protected readonly pronouns = PRONOUNS;

  constructor(
    private exerciseDb: ExerciseDbService,
    private conjugationService: VerbConjugationService
  ) {}

  onAnswerChange(index: number, value: string) {
    this.answers.update(arr => {
      const copy = [...arr];
      copy[index] = value;
      return copy;
    });
  }

  async onSubmit() {
    if (this.isSubmitted()) return;
    
    this.isLoading.set(true);
    
    try {
      const answers = this.answers();
      const verb = this.verb();
      
      // Validate answers
      const results = await this.conjugationService.validateAnswers(verb, answers);
      this.validationResults.set(results);
      
      // Calculate score
      const score = this.conjugationService.calculateScore(results);
      this.score.set(score);
      
      // Save to database
      const correctAnswers = results.map(r => r.expected);
      const attempt: Omit<ExerciseAttempt, 'id'> = {
        verb,
        answers,
        correctAnswers,
        score,
        timestamp: new Date(),
        isComplete: true
      };
      
      await this.exerciseDb.saveAttempt(attempt);
      
      this.isSubmitted.set(true);
    } catch (error) {
      console.error('Error submitting exercise:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onReset() {
    this.answers.set(Array(PRONOUNS.length).fill(''));
    this.validationResults.set([]);
    this.isSubmitted.set(false);
    this.score.set(0);
  }

  // Computed properties for template
  protected readonly isFormValid = computed(() => {
    return this.answers().every(answer => answer.trim().length > 0);
  });

  protected readonly isFormComplete = computed(() => {
    return this.isFormValid() && !this.isLoading();
  });
}
