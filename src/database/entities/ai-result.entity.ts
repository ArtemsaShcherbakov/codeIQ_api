import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnalysisReport } from './analysis-report.entity';

@Entity('ai_results')
export class AiResult {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => AnalysisReport, (r) => r.aiResult, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'analysis_report_id' })
  analysisReport: AnalysisReport;

  @Column({ name: 'model_name', type: 'varchar', length: 128 })
  modelName: string;

  @Column({ name: 'raw_output', type: 'text', nullable: true })
  rawOutput: string | null;

  @Column({ name: 'processed_at', type: 'timestamptz' })
  processedAt: Date;
}
