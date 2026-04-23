import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SourceRepository } from './source-repository.entity';

@Entity('repository_settings')
export class RepositorySettings {
  @PrimaryColumn({ name: 'repository_id' })
  repositoryId: number;

  @OneToOne(() => SourceRepository, (repo) => repo.settings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'repository_id' })
  repository: SourceRepository;

  @Column({ name: 'metrics_enabled', type: 'boolean', default: true })
  metricsEnabled: boolean;

  @Column({ name: 'ai_enabled', type: 'boolean', default: true })
  aiEnabled: boolean;

  @Column({
    name: 'severity_threshold',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  severityThreshold: string | null;

  @Column({ name: 'custom_prompt', type: 'text', nullable: true })
  customPrompt: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
