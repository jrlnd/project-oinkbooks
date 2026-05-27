import { Injectable } from '@nestjs/common';
import type { CategoryDetails } from '@oinkbooks/types';

@Injectable()
export class AppService {
  getHealth(): { status: string; sample: CategoryDetails } {
    return {
      status: 'ok',
      sample: { id: 'demo', icon: '🐷', label: 'OinkBooks API' },
    };
  }
}
