import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { RepositorySettings } from './repository-settings.entity';
import { PullRequest } from './pull-request.entity';

@Entity('repositories')
export class SourceRepository {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 2048 })
  url: string;

  @Column({ type: 'varchar', length: 32 })
  platform: string;

  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken: string | null;

  @ManyToOne(() => User, (user) => user.sourceRepositories, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @OneToOne(() => RepositorySettings, (s) => s.repository)
  settings: RepositorySettings;

  @OneToMany(() => PullRequest, (pr) => pr.repository)
  pullRequests: PullRequest[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
