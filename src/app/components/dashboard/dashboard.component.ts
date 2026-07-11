import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BragService, Brag } from '../../services/brag.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly bragService = inject(BragService);
  private readonly router = inject(Router);

  readonly rawInput = signal('');
  readonly isGenerating = this.bragService.loading;
  readonly brags = this.bragService.brags;
  readonly error = this.bragService.error;

  readonly hasInput = computed(() => this.rawInput().trim().length > 0);
  readonly canGenerate = computed(() => this.hasInput() && !this.isGenerating());

  async onGenerate(): Promise<void> {
    if (!this.canGenerate()) return;

    const prompt = this.rawInput().trim();
    try {
      const newBrag = await this.bragService.generateMockBrag(prompt);
      this.rawInput.set('');
      // Navigate to detail view of the new brag
      this.router.navigate(['/detail', newBrag.id]);
    } catch (err) {
      // Error is handled in service
      console.error('Failed to generate brag:', err);
    }
  }

  onViewDetail(brag: Brag): void {
    this.router.navigate(['/detail', brag.id]);
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.rawInput.set(target.value);
  }

  getButtonText(): string {
    if (this.isGenerating()) return 'Destilando...';
    if (!this.hasInput()) return 'Destilar conquista';
    return 'Destilar conquista';
  }
}