import { Module } from '@nestjs/common';
import { GithubPullRequestsService } from './github-pull-requests.service';
import { GitlabMergeRequestsService } from './gitlab-merge-requests.service';

@Module({
  providers: [GithubPullRequestsService, GitlabMergeRequestsService],
  exports: [GithubPullRequestsService, GitlabMergeRequestsService],
})
export class IntegrationsModule {}
