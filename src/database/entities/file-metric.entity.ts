import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CodeMetrics } from './code-metrics.entity';

@Entity('file_metrics')
export class FileMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CodeMetrics, (cm) => cm.fileMetrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'code_metrics_id' })
  codeMetrics: CodeMetrics;

  @Column({ name: 'file_path', type: 'varchar', length: 2048 })
  filePath: string;

  @Column({ type: 'int', nullable: true })
  complexity: number | null;

  @Column({ name: 'lines_added', type: 'int', default: 0 })
  linesAdded: number;

  @Column({ name: 'lines_deleted', type: 'int', default: 0 })
  linesDeleted: number;

  @Column({ name: 'issues_count', type: 'int', default: 0 })
  issuesCount: number;
}
