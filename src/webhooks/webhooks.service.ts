import {
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GithubPullRequestsService } from '../integrations/github-pull-requests.service';
import { GitlabMergeRequestsService } from '../integrations/gitlab-merge-requests.service';
import { RepositoriesService } from '../repositories/repositories.service';
import type {
  ChangedFileSnapshot,
  PullRequestChangesSnapshot,
} from '../repositories/repository.types';
import { verifyGithubSignature256 } from './github-signature';

const GITHUB_PR_ACTIONS = new Set([
  'opened',
  'synchronize',
  'reopened',
]);

const GITLAB_MR_ACTIONS = new Set([
  'open',
  'update',
  'reopen',
]);

interface GithubPullRequestPayload {
  action?: string;
  pull_request?: {
    number: number;
    title: string;
    html_url?: string;
    head?: { ref: string };
    base?: { ref: string };
  };
  repository?: { full_name?: string };
}

interface GitlabMergeRequestPayload {
  object_kind?: string;
  object_attributes?: {
    iid: number;
    action?: string;
    title?: string;
    source_branch?: string;
    target_branch?: string;
    url?: string;
  };
  project?: {
    id: number;
    path_with_namespace?: string;
  };
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly repositoriesService: RepositoriesService,
    private readonly githubPullRequests: GithubPullRequestsService,
    private readonly gitlabMergeRequests: GitlabMergeRequestsService,
  ) {}

  verifyGithubRequest(
    rawBody: Buffer,
    signature256: string | undefined,
    secret: string | undefined,
  ): void {
    if (!secret) {
      return;
      
    }
    if (!verifyGithubSignature256(rawBody, signature256, secret)) {
      throw new UnauthorizedException('Invalid GitHub webhook signature');
    }
  }

  verifyGitlabRequest(
    tokenHeader: string | undefined,
    secret: string | undefined,
  ): void {
    if (!secret) {
      return;
    }
    if (tokenHeader !== secret) {
      throw new UnauthorizedException('Invalid GitLab webhook token');
    }
  }

  queueGithubEvent(
    rawBody: Buffer,
    event: string | undefined,
    body: unknown,
  ): { status: string } {
    if (event === 'ping') {
      return { status: 'pong' };
    }
    if (event !== 'pull_request') {
      return { status: 'ignored' };
    }
    const payload = body as GithubPullRequestPayload;
    const action = payload.action;
    if (!action || !GITHUB_PR_ACTIONS.has(action)) {
      return { status: 'ignored' };
    }
    const fullName = payload.repository?.full_name;
    const pr = payload.pull_request;
    if (!fullName || !pr) {
      throw new UnprocessableEntityException('Invalid pull_request payload');
    }
    const registered = this.repositoriesService.findByFullName(fullName);
    this.logger.log(registered);
    if (!registered || registered.provider !== 'github') {
      this.logger.warn(`No registered github repo for ${fullName}`);
      return { status: 'unknown_repository' };
    }
    void this.processGithubPullRequest(
      registered.id,
      fullName,
      pr,
    ).catch((err) =>
      this.logger.error(
        `GitHub PR processing failed: ${err instanceof Error ? err.message : err}`,
      ),
    );
    return { status: 'accepted' };
  }

  private async processGithubPullRequest(
    repoId: string,
    fullName: string,
    pr: NonNullable<GithubPullRequestPayload['pull_request']>,
  ): Promise<void> {
    const [owner, repo] = fullName.split('/');
    const files = await this.githubPullRequests.fetchChangedFiles(
      owner,
      repo,
      pr.number,
    );
    const changedFiles: ChangedFileSnapshot[] = files.map((f) => ({
      path: f.filename,
      status: f.status,
      patch: f.patch,
      additions: f.additions,
      deletions: f.deletions,
      previousFilename: f.previous_filename,
    }));
    const snapshot: PullRequestChangesSnapshot = {
      number: pr.number,
      title: pr.title,
      sourceBranch: pr.head?.ref ?? '',
      targetBranch: pr.base?.ref ?? '',
      url: pr.html_url,
      changedFiles,
      receivedAt: new Date().toISOString(),
    };
    this.repositoriesService.setLatestChanges(repoId, snapshot);
    this.logger.log(
      `Stored GitHub PR #${pr.number} (${changedFiles.length} files) for repo ${repoId}`,
    );
  }

  queueGitlabEvent(
    event: string | undefined,
    body: unknown,
  ): { status: string } {
    if (event !== 'Merge Request Hook') {
      return { status: 'ignored' };
    }
    const payload = body as GitlabMergeRequestPayload;
    if (payload.object_kind !== 'merge_request') {
      return { status: 'ignored' };
    }
    const attrs = payload.object_attributes;
    const pathWithNamespace = payload.project?.path_with_namespace;
    const projectId = payload.project?.id;
    if (!attrs || !pathWithNamespace || projectId == null) {
      throw new UnprocessableEntityException('Invalid merge request payload');
    }
    const action = attrs.action;
    if (!action || !GITLAB_MR_ACTIONS.has(action)) {
      return { status: 'ignored' };
    }
    const registered = this.repositoriesService.findByFullName(
      pathWithNamespace,
    );
    if (!registered || registered.provider !== 'gitlab') {
      this.logger.warn(
        `No registered gitlab repo for ${pathWithNamespace}`,
      );
      return { status: 'unknown_repository' };
    }
    void this.processGitlabMergeRequest(
      registered.id,
      projectId,
      attrs.iid,
      attrs,
    ).catch((err) =>
      this.logger.error(
        `GitLab MR processing failed: ${err instanceof Error ? err.message : err}`,
      ),
    );
    return { status: 'accepted' };
  }

  private async processGitlabMergeRequest(
    repoId: string,
    projectId: number,
    iid: number,
    attrs: NonNullable<GitlabMergeRequestPayload['object_attributes']>,
  ): Promise<void> {
    const changes = await this.gitlabMergeRequests.fetchMrChanges(
      projectId,
      iid,
    );
    const changedFiles: ChangedFileSnapshot[] = changes.map((c) => {
      const path = c.new_path || c.old_path;
      let status = 'modified';
      if (c.new_file) status = 'added';
      else if (c.deleted_file) status = 'removed';
      else if (c.renamed_file) status = 'renamed';
      const patch = c.diff?.length ? c.diff : undefined;
      const adds = patch ? (patch.match(/^\+/gm) ?? []).length : 0;
      const dels = patch ? (patch.match(/^-/gm) ?? []).length : 0;
      return {
        path,
        status,
        patch,
        additions: adds,
        deletions: dels,
        previousFilename: c.renamed_file ? c.old_path : undefined,
      };
    });
    const snapshot: PullRequestChangesSnapshot = {
      number: iid,
      title: attrs.title ?? '',
      sourceBranch: attrs.source_branch ?? '',
      targetBranch: attrs.target_branch ?? '',
      url: attrs.url,
      changedFiles,
      receivedAt: new Date().toISOString(),
    };
    this.repositoriesService.setLatestChanges(repoId, snapshot);
    this.logger.log(
      `Stored GitLab MR !${iid} (${changedFiles.length} files) for repo ${repoId}`,
    );
  }
}
