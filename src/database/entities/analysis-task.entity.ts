import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PullRequest } from './pull-request.entity';
import { AnalysisReport } from './analysis-report.entity';

@Entity('analysis_tasks')
export class AnalysisTask {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PullRequest, (pr) => pr.analysisTasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pull_request_id' })
  pullRequest: PullRequest;

  @Column({ type: 'varchar', length: 64 })
  status: string;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToOne(() => AnalysisReport, (report) => report.analysisTask)
  report: AnalysisReport;
}
