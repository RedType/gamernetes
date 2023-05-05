import referral from '../src/referral';
import { referralEvent } from './sampleEvents';

test('referral integration test', () => {
  return referral(referralEvent);
}, 60000); // one minute

