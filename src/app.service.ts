import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo(): { message: string } {
    return {
      message:
        'This is the Auth Service. It handles user authentication and authorization.',
    };
  }
}
