import { Role } from './role.entity';
import { User } from './user.entity';
import { AuthToken } from './auth-token.entity';
import { AuditLog } from './audit-log.entity';
import { SourceRepository } from './source-repository.entity';
import { RepositorySettings } from './repository-settings.entity';
import { PullRequest } from './pull-request.entity';
import { AnalysisTask } from './analysis-task.entity';
import { FileAsset } from './file-asset.entity';
import { AnalysisReport } from './analysis-report.entity';
import { CodeMetrics } from './code-metrics.entity';
import { FileMetric } from './file-metric.entity';
import { AiResult } from './ai-result.entity';
import { AnalysisComment } from './analysis-comment.entity';

export { Role } from './role.entity';
export { User } from './user.entity';
export { AuthToken } from './auth-token.entity';
export { AuditLog } from './audit-log.entity';
export { SourceRepository } from './source-repository.entity';
export { RepositorySettings } from './repository-settings.entity';
export { PullRequest } from './pull-request.entity';
export { AnalysisTask } from './analysis-task.entity';
export { FileAsset } from './file-asset.entity';
export { AnalysisReport } from './analysis-report.entity';
export { CodeMetrics } from './code-metrics.entity';
export { FileMetric } from './file-metric.entity';
export { AiResult } from './ai-result.entity';
export { AnalysisComment } from './analysis-comment.entity';

export const typeOrmEntities = [
  Role,
  User,
  AuthToken,
  AuditLog,
  SourceRepository,
  RepositorySettings,
  PullRequest,
  AnalysisTask,
  FileAsset,
  AnalysisReport,
  CodeMetrics,
  FileMetric,
  AiResult,
  AnalysisComment,
];
