import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1735350000000 implements MigrationInterface {
    name = 'InitSchema1735350000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" (
            "id" SERIAL NOT NULL,
            "github_id" integer NOT NULL,
            "username" text NOT NULL,
            "email" text,
            "avatar_url" text,
            "access_token" text,
            "refresh_token" text,
            "token_expires_at" TIMESTAMP,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_users_github_id" UNIQUE ("github_id"),
            CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE TABLE "repositories" (
            "id" SERIAL NOT NULL,
            "github_id" integer NOT NULL,
            "name" text NOT NULL,
            "full_name" text NOT NULL,
            "description" text,
            "html_url" text NOT NULL,
            "stargazers_count" integer NOT NULL DEFAULT 0,
            "forks_count" integer NOT NULL DEFAULT 0,
            "open_issues_count" integer NOT NULL DEFAULT 0,
            "language" text,
            "updated_at" TIMESTAMP NOT NULL,
            "last_synced" TIMESTAMP,
            "user_id" integer NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_repositories_id" PRIMARY KEY ("id"),
            CONSTRAINT "FK_repositories_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`);

        await queryRunner.query(`CREATE TABLE "repo_stats" (
            "id" SERIAL NOT NULL,
            "repo_name" text NOT NULL,
            "stars" integer NOT NULL DEFAULT 0,
            "forks" integer NOT NULL DEFAULT 0,
            "issues" integer NOT NULL DEFAULT 0,
            "contributors" integer NOT NULL DEFAULT 0,
            "language" text,
            "description" text,
            "html_url" text,
            "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP,
            "repository_id" integer,
            CONSTRAINT "PK_repo_stats_id" PRIMARY KEY ("id"),
            CONSTRAINT "FK_repo_stats_repository" FOREIGN KEY ("repository_id") REFERENCES "repositories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        )`);

        await queryRunner.query(`CREATE INDEX "IDX_repo_stats_repo_name_timestamp" ON "repo_stats" ("repo_name", "timestamp")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_repo_stats_repo_name_timestamp"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "repo_stats"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "repositories"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    }
}


