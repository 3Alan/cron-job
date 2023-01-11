import juejin from './juejin.js';
import isDev from './utils/isDev.js';
import * as dotenv from 'dotenv';

if (isDev()) {
  dotenv.config();
}

juejin();
