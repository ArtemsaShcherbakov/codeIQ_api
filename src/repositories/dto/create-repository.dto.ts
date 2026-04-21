import { BadRequestException } from '@nestjs/common';
import type { GitProvider } from '../repository.types';

export interface CreateRepositoryDto {
  provider: GitProvider;
  owner: string;
  name: string;
  webhookSecret?: string;
}

export function parseCreateRepositoryDto(body: unknown): CreateRepositoryDto {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Expected JSON body');
  }
  const o = body as Record<string, unknown>;
  const provider = o.provider;
  const owner = o.owner;
  const name = o.name;
  const webhookSecret = o.webhookSecret;

  if (provider !== 'github' && provider !== 'gitlab') {
    throw new BadRequestException('provider must be "github" or "gitlab"');
  }
  if (typeof owner !== 'string' || !owner.trim()) {
    throw new BadRequestException('owner is required');
  }
  if (typeof name !== 'string' || !name.trim()) {
    throw new BadRequestException('name is required');
  }
  if (webhookSecret !== undefined && typeof webhookSecret !== 'string') {
    throw new BadRequestException('webhookSecret must be a string');
  }
  return {
    provider,
    owner: owner.trim(),
    name: name.trim(),
    webhookSecret:
      typeof webhookSecret === 'string' && webhookSecret.length > 0
        ? webhookSecret
        : undefined,
  };
}
