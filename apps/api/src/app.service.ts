import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '欢迎使用 Poetry Club API!';
  }
}
