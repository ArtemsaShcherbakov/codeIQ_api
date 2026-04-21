import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SourceRepository } from './source-repository.entity';
import { AnalysisTask } from './analysis-task.entity';

@Entity('pull_requests')
export class PullRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SourceRepository, (repo) => repo.pullRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'repository_id' })
  repository: SourceRepository;

  @Column({ name: 'external_id', type: 'varchar', length: 128 })
  externalId: string;

  @Column({ type: 'int' })
  number: number;

  @Column({ type: 'varchar', length: 512 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  author: string;

  @Column({ type: 'varchar', length: 512 })
  branch: string;

  @Column({ name: 'diff_url', type: 'varchar', length: 2048, nullable: true })
  diffUrl: string | null;

  @Column({ type: 'varchar', length: 64 })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'fetched_at', type: 'timestamptz', nullable: true })
  fetchedAt: Date | null;

  @OneToMany(() => AnalysisTask, (task) => task.pullRequest)
  analysisTasks: AnalysisTask[];
}
