import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface GitlabMrChange {
  old_path: string;
  new_path: string;
  diff: string;
  new_file: boolean;
  renamed_file: boolean;
  deleted_file: boolean;
}

interface GitlabMrChangesResponse {
  changes: GitlabMrChange[];
}

@Injectable()
export class GitlabMergeRequestsService {
  private baseUrl(): string {
    return (process.env.GITLAB_URL ?? 'https://gitlab.com').replace(/\/$/, '');
  }

  async fetchMrChanges(
    projectId: number | string,
    mergeRequestIid: number,
  ): Promise<GitlabMrChange[]> {
    const token = process.env.GITLAB_TOKEN;
    if (!token) {
      throw new ServiceUnavailableException(
        'GITLAB_TOKEN is not set; cannot load MR changes from GitLab API',
      );
    }
    const id = encodeURIComponent(String(projectId));
    const url = `${this.baseUrl()}/api/v4/projects/${id}/merge_requests/${mergeRequestIid}/changes`;
    const res = await fetch(url, {
      headers: { 'PRIVATE-TOKEN': token },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ServiceUnavailableException(
        `GitLab API error ${res.status}: ${text.slice(0, 500)}`,
      );
    }
    const body = (await res.json()) as GitlabMrChangesResponse;
    return body.changes ?? [];
  }
}
