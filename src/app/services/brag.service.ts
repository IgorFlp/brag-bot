import { Injectable, signal, computed } from '@angular/core';

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

export interface GenerateBragRequest {
  prompt: string;
}

@Injectable({
  providedIn: 'root',
})
export class BragService {
  private readonly _brags = signal<Brag[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly brags = this._brags.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly bragsCount = computed(() => this._brags().length);
  readonly hasBrags = computed(() => this._brags().length > 0);
  readonly latestBrag = computed(() => this._brags()[0] || null);

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    const mockBrags: Brag[] = [
      {
        id: '1',
        title: 'Automação de Deploy com GitHub Actions',
        context: 'A equipe de desenvolvimento enfrentava deployments manuais propensos a erros, consumindo 2 horas por release e gerando downtime não planejado.',
        impact: 'Redução de 95% no tempo de deploy e eliminação de erros humanos em produção.',
        metrics: ['2h → 6min por deploy', 'Zero downtime em produção', '15 deploys/dia vs 3/semana'],
        technologies: ['GitHub Actions', 'Docker', 'Kubernetes', 'Terraform', 'AWS'],
        rawInput: 'Automatizei o deploy usando GitHub Actions',
        createdAt: new Date('2024-11-15'),
      },
      {
        id: '2',
        title: 'Sistema de Cache Inteligente com Redis',
        context: 'APIs de relatórios lentas (3-5s) causando timeouts no frontend e frustração dos usuários executivos.',
        impact: 'Latência P95 reduzida de 4.2s para 180ms, suportando 10x mais requisições simultâneas.',
        metrics: ['4.2s → 180ms P95 latency', '10x throughput increase', '99.9% cache hit rate'],
        technologies: ['Redis', 'Node.js', 'TypeScript', 'Prometheus', 'Grafana'],
        rawInput: 'Implementei cache com Redis para acelerar APIs',
        createdAt: new Date('2024-10-22'),
      },
      {
        id: '3',
        title: 'Migração Legacy para Arquitetura Micro-frontends',
        context: 'Monólito AngularJS 1.6 com 200k linhas impedindo contratação e deploy independente de features.',
        impact: '3 squads autônomas, deploy diário, onboarding de devs em 2 dias vs 2 semanas.',
        metrics: ['3 squads independentes', 'Deploy diário', 'Onboarding 2 dias', 'Zero breaking changes'],
        technologies: ['Angular 17', 'Module Federation', 'Nx', 'TypeScript', 'Cypress'],
        rawInput: 'Migrei o legado para microfrontends com Angular',
        createdAt: new Date('2024-09-10'),
      },
    ];

    this._brags.set(mockBrags);
  }

  async generateMockBrag(prompt: string): Promise<Brag> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate mock brag based on prompt
      const mockTemplates = [
        {
          title: 'Otimização de Performance com Lazy Loading',
          context: `O ${prompt.toLowerCase()} estava causando carregamento lento da aplicação inicial, impactando a experiência do usuário e métricas de Core Web Vitals.`,
          impact: 'Redução de 65% no bundle inicial e melhoria de 40 pontos no Lighthouse Performance Score.',
          metrics: ['Bundle: 2.1MB → 740KB', 'LCP: 4.2s → 1.8s', 'Lighthouse: 58 → 98'],
          technologies: ['Angular', 'Webpack', 'Vite', 'ESBuild', 'Lighthouse CI'],
        },
        {
          title: 'Implementação de Design System Unificado',
          context: `Inconsistências visuais no ${prompt.toLowerCase()} geravam retrabalho e dificultavam a escalabilidade do time de design.`,
          impact: 'Padronização de 200+ componentes, redução de 70% no tempo de desenvolvimento de novas telas.',
          metrics: ['200+ componentes padronizados', '-70% tempo dev', 'Design tokens centralizados'],
          technologies: ['Storybook', 'Tailwind CSS', 'Figma Tokens', 'TypeScript', 'Chromatic'],
        },
        {
          title: 'Arquitetura Serverless para Processamento Assíncrono',
          context: `O processamento síncrono do ${prompt.toLowerCase()} causava timeouts e falhas silenciosas em picos de carga.`,
          impact: 'Eliminação de timeouts, processamento de 50k jobs/dia com 99.99% de sucesso.',
          metrics: ['50k jobs/dia', '99.99% success rate', 'Custo 60% menor vs EC2'],
          technologies: ['AWS Lambda', 'SQS', 'DynamoDB', 'EventBridge', 'TypeScript'],
        },
        {
          title: 'Testes Automatizados E2E com Cypress',
          context: `Falta de cobertura de testes no ${prompt.toLowerCase()} gerava regressões frequentes em produção.`,
          impact: 'Cobertura de 85% nos fluxos críticos, zero regressões em produção nos últimos 6 meses.',
          metrics: ['85% coverage E2E', '0 regressões/6 meses', '-40% tempo QA manual'],
          technologies: ['Cypress', 'TypeScript', 'GitHub Actions', 'Docker', 'Mochawesome'],
        },
      ];

      const template = mockTemplates[Math.floor(Math.random() * mockTemplates.length)];
      const newBrag: Brag = {
        id: crypto.randomUUID(),
        title: template.title,
        context: template.context,
        impact: template.impact,
        metrics: template.metrics,
        technologies: template.technologies,
        rawInput: prompt,
        createdAt: new Date(),
      };

      this._brags.update((brags) => [newBrag, ...brags]);
      return newBrag;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar conquista';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._loading.set(false);
    }
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