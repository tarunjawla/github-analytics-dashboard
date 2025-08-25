import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class AddRepoDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/, {
    message: 'Repository name must be in format: owner/repo',
  })
  name: string;
}

export class AddRepoResponseDto {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  updated_at: string;
}
