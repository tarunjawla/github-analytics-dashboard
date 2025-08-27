import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TreeController } from './tree.controller';
import { TreeService } from './tree.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [TreeController],
  providers: [TreeService],
  exports: [TreeService],
})
export class TreeModule {}


