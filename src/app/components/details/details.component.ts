import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BragService, Brag } from '../../services/brag.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bragService = inject(BragService);

  readonly bragId = signal<string | null>(null);

  readonly brag = computed(() => {
    const id = this.bragId();
    if (!id) return null;
    return this.bragService.getBragById(id);
  });

  readonly loading = computed(() => !this.brag() && this.bragId() !== null);
  readonly rawExpanded = signal(false);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.bragId.set(id);
    });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(
      () => {
        // Could add toast notification here
        console.log('Copied to clipboard');
      },
      (err) => {
        console.error('Failed to copy:', err);
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}