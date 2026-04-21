import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { CreateRepositoryDto } from './dto/create-repository.dto';
import type {
  PullRequestChangesSnapshot,
  RegisteredRepository,
} from './repository.types';

function fullNameLower(repo: Pick<RegisteredRepository, 'owner' | 'name'>) {
  return `${repo.owner}/${repo.name}`.toLowerCase();
}

@Injectable()
export class RepositoriesService {
  private readonly repos = new Map<string, RegisteredRepository>();
  private readonly latestChanges = new Map<string, PullRequestChangesSnapshot>();

  create(dto: CreateRepositoryDto): RegisteredRepository {
    const repo: RegisteredRepository = {
      id: randomUUID(),
      provider: dto.provider,
      owner: dto.owner,
      name: dto.name,
      webhookSecret: dto.webhookSecret,
    };
    this.repos.set(repo.id, repo);
    return repo;
  }

  findAll(): RegisteredRepository[] {
    return [...this.repos.values()];
  }

  findById(id: string): RegisteredRepository {
    const repo = this.repos.get(id);
    if (!repo) {
      throw new NotFoundException(`Repository ${id} not found`);
    }
    return repo;
  }

  findByFullName(fullName: string): RegisteredRepository | undefined {
    const key = fullName.toLowerCase();
    for (const repo of this.repos.values()) {
      if (fullNameLower(repo) === key) {
        return repo;
      }
    }
    return undefined;
  }

  setLatestChanges(repoId: string, snapshot: PullRequestChangesSnapshot): void {
    this.latestChanges.set(repoId, snapshot);
  }

  getLatestChanges(
    repoId: string,
  ): PullRequestChangesSnapshot | null {
    this.findById(repoId);
    return this.latestChanges.get(repoId) ?? null;
  }
}
