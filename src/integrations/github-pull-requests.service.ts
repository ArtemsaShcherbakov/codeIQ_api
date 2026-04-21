import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface GithubPrFileRow {
  filename: string;
  status: string;
  patch?: string;
  additions: number;
  deletions: number;
  previous_filename?: string;
}

@Injectable()
export class GithubPullRequestsService {
  async fetchChangedFiles(
    owner: string,
    repo: string,
    pullNumber: number,
  ): Promise<GithubPrFileRow[]> {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new ServiceUnavailableException(
        'GITHUB_TOKEN is not set; cannot load PR file list from GitHub API',
      );
    }
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/files`;
    const rows: GithubPrFileRow[] = [];
    let next: string | null = url;

    while (next) {
      const res = await fetch(next, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new ServiceUnavailableException(
          `GitHub API error ${res.status}: ${text.slice(0, 500)}`,
        );
      }
      const page = (await res.json()) as GithubPrFileRow[];
      rows.push(...page);
      const link = res.headers.get('link');
      next = null;
      if (link) {
        const parts = link.split(',').map((p) => p.trim());
        for (const p of parts) {
          const m = p.match(/^<([^>]+)>;\s*rel="next"/);
          if (m) {
            next = m[1];
            break;
          }
        }
      }
    }
    return rows;
  }
}
