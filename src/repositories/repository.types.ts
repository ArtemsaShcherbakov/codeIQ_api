export type GitProvider = 'github' | 'gitlab';

export interface RegisteredRepository {
  id: string;
  provider: GitProvider;
  owner: string;
  name: string;
  webhookSecret?: string;
}

export interface ChangedFileSnapshot {
  path: string;
  status: string;
  patch?: string;
  additions: number;
  deletions: number;
  previousFilename?: string;
}

export interface PullRequestChangesSnapshot {
  number: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  url?: string;
  changedFiles: ChangedFileSnapshot[];
  receivedAt: string;
}
