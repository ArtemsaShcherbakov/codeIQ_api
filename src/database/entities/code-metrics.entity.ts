import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnalysisReport } from './analysis-report.entity';
import { FileMetric } from './file-metric.entity';

@Entity('code_metrics')
export class CodeMetrics {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => AnalysisReport, (r) => r.codeMetrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'analysis_report_id' })
  analysisReport: AnalysisReport;

  @Column({ name: 'cyclomatic_complexity', type: 'int', nullable: true })
  cyclomaticComplexity: number | null;

  @Column({
    name: 'duplication_rate',
    type: 'numeric',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  duplicationRate: string | null;

  @Column({
    name: 'maintainability_index',
    type: 'numeric',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  maintainabilityIndex: string | null;

  @Column({ name: 'total_lines_added', type: 'int', default: 0 })
  totalLinesAdded: number;

  @Column({ name: 'total_lines_deleted', type: 'int', default: 0 })
  totalLinesDeleted: number;

  @Column({ name: 'language_stats', type: 'jsonb', nullable: true })
  languageStats: Record<string, unknown> | null;

  @OneToMany(() => FileMetric, (fm) => fm.codeMetrics)
  fileMetrics: FileMetric[];
}
