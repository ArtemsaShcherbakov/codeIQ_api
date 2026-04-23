import type { RawBodyRequest } from '@nestjs/common/interfaces';
import {
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { RepositoriesService } from '../repositories/repositories.service';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly repositoriesService: RepositoriesService,

  ) {}

  @Post('github')
  @HttpCode(200)
  github(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-github-event') event: string | undefined,
    @Headers('x-hub-signature-256') signature256: string | undefined,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new UnprocessableEntityException(
        'Raw body missing; enable rawBody in NestFactory.create',
      );
    }
    const body = req.body as unknown;
    const fullName = (body as { repository?: { full_name?: string } })
      .repository?.full_name;
    const registered = fullName
      ? this.repositoriesService.findByFullName(fullName)
      : undefined;
    const effectiveSecret =
      registered?.webhookSecret ?? process.env.GITHUB_WEBHOOK_SECRET;
      console.log(effectiveSecret);

    this.webhooksService.verifyGithubRequest(
      rawBody,
      signature256,
      effectiveSecret,
    );

    return this.webhooksService.queueGithubEvent(rawBody, event, body);
  }

  @Post('gitlab')
  @HttpCode(200)
  gitlab(
    @Req() req: Request,
    @Headers('x-gitlab-event') event: string | undefined,
    @Headers('x-gitlab-token') token: string | undefined,
  ) {
    const body = req.body as unknown;
    const pathWithNamespace = (
      body as { project?: { path_with_namespace?: string } }
    ).project?.path_with_namespace;
    const registered = pathWithNamespace
      ? this.repositoriesService.findByFullName(pathWithNamespace)
      : undefined;
    const effectiveSecret =
      registered?.webhookSecret ?? process.env.GITLAB_WEBHOOK_SECRET;
    if (effectiveSecret) {
      this.webhooksService.verifyGitlabRequest(token, effectiveSecret);
    }
    return this.webhooksService.queueGitlabEvent(event, body);
  }
}
