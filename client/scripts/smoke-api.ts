/**
 * Smoke test for the three serverless functions, run with NO ANTHROPIC_API_KEY.
 *
 * This is the primary regression gate for the AI layer. The claim the README
 * makes — "leave the key unset and the site behaves exactly as it did before
 * any of this existed" — is only worth making if something checks it. This is
 * that something.
 *
 *   npm run smoke
 *
 * It calls the handlers directly with mocked req/res rather than booting a
 * server, so it needs no network, no key, and no Vercel CLI.
 */

import enquiryHandler from '../api/enquiry';
import searchHandler from '../api/search';
import assistantHandler from '../api/assistant';
import { enforce } from '../api/_lib/guardrails';

type Handler = (req: never, res: never) => Promise<void> | void;

interface ResState {
  code: number;
  body: Record<string, unknown> | undefined;
  headers: Record<string, string>;
}

function mockRes() {
  const state: ResState = { code: 0, body: undefined, headers: {} };
  const res: Record<string, unknown> = {
    setHeader(key: string, value: string) {
      state.headers[key] = value;
      return res;
    },
    status(code: number) {
      state.code = code;
      return res;
    },
    json(payload: Record<string, unknown>) {
      state.body = payload;
      return res;
    },
    end() {
      return res;
    },
  };
  return { res, state };
}

async function call(handler: Handler, body: unknown, method = 'POST'): Promise<ResState> {
  const { res, state } = mockRes();
  const req = { method, body, headers: {}, socket: { remoteAddress: '203.0.113.9' } };
  await (handler as unknown as (r: unknown, s: unknown) => Promise<void>)(req, res);
  return state;
}

let failures = 0;

function check(label: string, condition: boolean, detail = ''): void {
  if (!condition) failures += 1;
  console.log(`  ${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? `  [${detail}]` : ''}`);
}

async function main(): Promise<void> {
  console.log('\nFloodgate check — AI layer disabled');
  console.log(`  ANTHROPIC_API_KEY : ${process.env.ANTHROPIC_API_KEY ? 'set' : 'not set'}`);
  console.log(`  GMAIL_USER        : ${process.env.GMAIL_USER ? 'set' : 'not set'}`);

  console.log('\n/api/search — falls back to keyword matching');
  const s1 = await call(searchHandler as Handler, { query: 'onion' });
  check('returns 200', s1.code === 200, `got ${s1.code}`);
  check('mode is keyword', s1.body?.mode === 'keyword', `${s1.body?.mode}`);
  check('still finds products', ((s1.body?.count as number) ?? 0) > 0, `count=${s1.body?.count}`);
  console.log(`        matched: ${((s1.body?.products as { name: string }[]) ?? []).map((p) => p.name).join(', ')}`);

  const s2 = await call(searchHandler as Handler, { query: 'zzzznotathing' });
  check('unmatched query is still 200, not an error', s2.code === 200, `got ${s2.code}`);
  check('unmatched returns zero products', s2.body?.count === 0);

  const s3 = await call(searchHandler as Handler, { query: '' });
  check(
    'empty query returns a field-scoped 422',
    s3.code === 422 && (s3.body?.errors as { field: string }[])?.[0]?.field === 'query'
  );

  console.log('\n/api/assistant — reports unavailable so the widget hides');
  const a1 = await call(assistantHandler as Handler, { messages: [{ role: 'user', content: 'hi' }] });
  check('returns 200', a1.code === 200, `got ${a1.code}`);
  check('available is false', a1.body?.available === false, JSON.stringify(a1.body));

  console.log('\n/api/enquiry — the lead survives a missing mail config');
  const e1 = await call(enquiryHandler as Handler, {
    name: 'Ahmed Al Mansouri',
    phone: '+971500000000',
    email: 'ahmed@example.com',
    productInterest: 'fruits',
    message: 'Need 2x40ft Alphonso mango for Jebel Ali, November shipment.',
  });
  check('returns 201, not 500', e1.code === 201, `got ${e1.code}`);
  check('returns an enquiry id', typeof e1.body?.id === 'string', `${e1.body?.id}`);
  check('delivery flagged as logged', e1.body?.delivery === 'logged', `${e1.body?.delivery}`);

  console.log('\n/api/enquiry — validation reports every field, not just the first');
  const e2 = await call(enquiryHandler as Handler, {
    name: '',
    phone: '',
    email: 'not-an-email',
    productInterest: '',
    message: '',
  });
  check('returns 422', e2.code === 422, `got ${e2.code}`);
  const fields = ((e2.body?.errors as { field: string }[]) ?? []).map((x) => x.field);
  check('per-field errors, never "general"', fields.length >= 4 && !fields.includes('general'), fields.join(','));

  console.log('\n/api/enquiry — honeypot');
  const e3 = await call(enquiryHandler as Handler, {
    name: 'Bot',
    phone: '1',
    email: 'b@b.com',
    productInterest: 'fruits',
    message: 'spam',
    company_website: 'http://spam.example',
  });
  check('bot receives a plausible 201 rather than a tell', e3.code === 201, `got ${e3.code}`);

  console.log('\nHTTP method handling');
  check('GET is 405', (await call(searchHandler as Handler, {}, 'GET')).code === 405);
  check('OPTIONS preflight is 204', (await call(searchHandler as Handler, {}, 'OPTIONS')).code === 204);

  console.log('\nCommercial guardrail — what the assistant may not say');
  const cases: [string, boolean][] = [
    ['Our Alphonso is $450/MT FOB Mumbai.', false],
    ['We can do a 25 MT minimum order quantity.', false],
    ['We are GlobalGAP certified and APEDA registered.', false],
    ['Rate is 1200 per kg this season.', false],
    ['We export Alphonso mangoes, grapes and pomegranates.', true],
    ['Pricing depends on volume and destination — please send an enquiry.', true],
  ];
  for (const [text, shouldAllow] of cases) {
    const result = enforce(text);
    check(
      `${shouldAllow ? 'allows ' : 'blocks '} "${text.slice(0, 44)}${text.length > 44 ? '…' : ''}"`,
      result.safe === shouldAllow,
      result.violations.join(',')
    );
  }

  console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) FAILED.`}\n`);
  if (failures > 0) process.exit(1);
}

main().catch((error) => {
  console.error('smoke test crashed:', error);
  process.exit(1);
});
