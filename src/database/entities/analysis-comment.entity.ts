import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnalysisReport } from './analysis-report.entity';

@Entity('analysis_comments')
export class AnalysisComment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AnalysisReport, (r) => r.analysisComments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'analysis_report_id' })
  analysisReport: AnalysisReport;

  @Column({ name: 'file_path', type: 'varchar', length: 2048 })
  filePath: string;

  @Column({ name: 'line_start', type: 'int' })
  lineStart: number;

  @Column({ name: 'line_end', type: 'int' })
  lineEnd: number;

  @Column({ type: 'varchar', length: 32 })
  severity: string;

  @Column({ type: 'varchar', length: 64 })
  category: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  suggestion: string | null;
}
