import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Repository } from './repository.entity';

@Entity('repo_stats')
@Index(['repo_name', 'timestamp'])
export class RepoStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  repo_name: string;

  @Column({ type: 'int', default: 0 })
  stars: number;

  @Column({ type: 'int', default: 0 })
  forks: number;

  @Column({ type: 'int', default: 0 })
  issues: number;

  @Column({ type: 'int', default: 0 })
  contributors: number;

  @Column({ type: 'text', nullable: true })
  language: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  html_url: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @ManyToOne(() => Repository, repo => repo.stats)
  @JoinColumn({ name: 'repository_id' })
  repository: Repository;

  @Column({ nullable: true })
  repository_id: number;
}
