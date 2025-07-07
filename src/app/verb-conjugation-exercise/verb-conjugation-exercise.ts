import { ChangeDetectionStrategy, Component, computed, signal, inject } from '@angular/core';
import { db, ExerciseAttempt, VerbConjugation } from '../services/exercise-db';
import { ActivatedRoute } from '@angular/router';
import { ExerciseDatabase } from '../services/exercise-db'
import { openAiClient } from '../services/openai-client';
import { InputResult } from '../interfaces';

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
  // The verb to conjugate, determined by URL or random
  protected readonly verb = signal<string>('');

  // User answers for each pronoun
  protected readonly answers = signal<string[]>(Array(PRONOUNS.length).fill(''));

  // Validation results
  protected readonly validationResults = signal<InputResult[]>([]);

  // Exercise state
  protected readonly isSubmitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly score = signal(0);

  protected readonly pronouns = PRONOUNS;

  private readonly route = inject(ActivatedRoute);

  constructor() {
    // Get verb from query param or generate random
    this.route.queryParamMap.subscribe(async params => {
      const urlVerb = params.get('verb');
      if (urlVerb && urlVerb.trim().length > 0) {
        this.verb.set(urlVerb.trim());
      } else {
        // Assume getRandomVerb() returns a Promise<string>
        const randomVerb = await this.getRandomVerb();
        console.log('Random verb selected:', randomVerb);
        this.verb.set(randomVerb);
      }
      // Reset state when verb changes
      this.onReset();
    });
  }

  async getRandomVerb(): Promise<string> {
    const count = await db.verbs.count();
    if (count === 0) throw new Error('No verbs available in the database');
    const idx = Math.floor(Math.random() * count);
    return (await db.verbs.orderBy('verb').offset(idx).first())!.verb;
  }

  public async getFinnishVerbConjugation(verb: string): Promise<VerbConjugation> {
    const existing = await db.verbConjugations.get(verb);
    if (existing) {
      return existing;
    }
    const instructions = `You are a Finnish language expert.`;
    const input = `Conjugate the verb "${verb}" in present tense for all six Finnish personal pronouns (minä, sinä, hän, me, te, he). Reply in the format: a,b,c, without spaces or explanations.`;
    const response = await openAiClient.chatCompletion(instructions, input);
    //const response = "puhun, puhut, puhuu, puhumme, puhutte, puhuvat";
    console.log(`OpenAI response for verb "${verb}":`, response);
    var row = { verb, forms: response.split(',') };
    await db.verbConjugations.put(row);
    return row;
  }

  onAnswerChange(index: number, value: string) {
    this.answers.update(arr => {
      const copy = [...arr];
      copy[index] = value;
      return copy;
    });
  }

  async validateAnswers(verb: string, answers: string[]): Promise<InputResult[]> {
    const conjugation = await this.getFinnishVerbConjugation(verb);
    const results: InputResult[] = [];
    for (let i = 0; i < answers.length; i++) {
      const expected = conjugation.forms[i] || '';
      const userAnswer = answers[i].trim().toLowerCase();
      const correct = userAnswer === expected.toLowerCase();
      results.push({
        correct,
        expected,
        userAnswer: answers[i]
      });
    }
    return results;
  }

  async onSubmit() {
    if (this.isSubmitted()) return;

    this.isLoading.set(true);

    try {
      const answers = this.answers();
      const verb = this.verb();

      // Validate answers
      const results = await this.validateAnswers(verb, answers);
      this.validationResults.set(results);

      // Calculate score
      const score = results.reduce((acc, result) => acc + (result.correct ? 1 : 0), 0) / results.length * 100;
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

      await db.exerciseAttempts.put(attempt);

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
