import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Brag {
  id: string;
  title: string;
  context: string;
  impact: string;
  metrics: string[];
  technologies: string[];
  rawInput: string;
  createdAt: Date;
}

/** Shape of a Brag Document returned by the bragGeneratorFlow (server response). */
export interface ApiBrag {
  title: string;
  context: string;
  actionTaken: string;
  businessImpact: string;
  metrics: string[];
  technologiesUsed: string[];
  id: string;
}

export interface GenerateBragResponse {
  brag: { result: ApiBrag };
}

@Injectable({
  providedIn: 'root',
})
export class BragService {
  private readonly http = inject(HttpClient);
  private readonly _brags = signal<Brag[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly brags = this._brags.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly bragsCount = computed(() => this._brags().length);
  readonly hasBrags = computed(() => this._brags().length > 0);
  readonly latestBrag = computed(() => this._brags()[0] || null);

  /**
   * Generates a real Brag Document by calling the server's /api/brag endpoint,
   * which proxies to the Genkit bragGeneratorFlow. The response is mapped into the
   * Angular `Brag` interface and prepended to the brags signal.
   */
  async generateBrag(definition: string): Promise<Brag> {
    const trimmed = definition?.trim() ?? '';
    this._loading.set(true);
    this._error.set(null);

    if (!trimmed) {
      const message = 'Descreva sua conquista antes de destilar.';
      this._error.set(message);
      this._loading.set(false);
      throw new Error(message);
    }

    try {
      const response = await firstValueFrom(
        this.http.post<GenerateBragResponse>('/api/brag', { definition: trimmed }),
      );

      const mapped = this.mapToBrag(response.brag.result, trimmed);
      this._brags.update((brags) => [mapped, ...brags]);
      return mapped;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar conquista';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  private mapToBrag(api: ApiBrag, definition: string): Brag {
    return {
      id: api.id,
      title: api.title,
      context: api.context,
      impact: api.businessImpact,
      metrics: api.metrics ?? [],
      technologies: api.technologiesUsed ?? [],
      rawInput: definition,
      createdAt: new Date(),
    };
  }

  getBragById(id: string): Brag | undefined {
    return this._brags().find((brag) => brag.id === id);
  }

  deleteBrag(id: string): void {
    this._brags.update((brags) => brags.filter((brag) => brag.id !== id));
  }

  clearError(): void {
    this._error.set(null);
  }
}
