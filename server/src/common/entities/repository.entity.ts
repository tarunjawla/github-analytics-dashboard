import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { RepoStats } from './repo-stats.entity';

@Entity('repositories')
export class Repository {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  github_id: number;

  @Column()
  name: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  html_url: string;

  @Column({ default: 0 })
  stargazers_count: number;

  @Column({ default: 0 })
  forks_count: number;

  @Column({ default: 0 })
  open_issues_count: number;

  @Column({ nullable: true })
  language: string;

  @Column({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_synced: Date;

  @ManyToOne(() => User, user => user.repositories)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @OneToMany(() => RepoStats, stats => stats.repository)
  stats: RepoStats[];

  @CreateDateColumn()
  created_at: Date;
} 