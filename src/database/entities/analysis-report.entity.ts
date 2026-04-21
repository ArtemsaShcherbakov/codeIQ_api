import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnalysisTask } from './analysis-task.entity';
import { FileAsset } from './file-asset.entity';
import { CodeMetrics } from './code-metrics.entity';
import { AiResult } from './ai-result.entity';
import { AnalysisComment } from './analysis-comment.entity';

@Entity('analysis_reports')
export class AnalysisReport {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => AnalysisTask, (task) => task.report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'analysis_task_id' })
  analysisTask: AnalysisTask;

  @Column({
    name: 'summary_score',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  summaryScore: string | null;

  @Column({ name: 'summary_text', type: 'text', nullable: true })
  summaryText: string | null;

  @ManyToOne(() => FileAsset, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'file_id' })
  file: FileAsset;

  @Column({ name: 'generated_at', type: 'timestamptz' })
  generatedAt: Date;

  @OneToOne(() => CodeMetrics, (m) => m.analysisReport)
  codeMetrics: CodeMetrics;

  @OneToOne(() => AiResult, (r) => r.analysisReport)
  aiResult: AiResult;

  @OneToMany(() => AnalysisComment, (c) => c.analysisReport)
  analysisComments: AnalysisComment[];
}
