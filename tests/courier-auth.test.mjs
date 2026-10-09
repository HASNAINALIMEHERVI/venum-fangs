import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyAdmin } from '../server/admin-auth.js';
import handler from '../api/leopards.js';
test('courier access fails closed and only accepts verified allowlisted users', async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { key: process.env.FIREBASE_WEB_API_KEY, emails: process.env.ADMIN_EMAILS };
  let calls = 0;
  try {
    delete process.env.FIREBASE_WEB_API_KEY; delete process.env.ADMIN_EMAILS;
    globalThis.fetch = async () => { calls++; throw new Error('unexpected network'); };
    assert.equal(await verifyAdmin({ headers: {} }), false);
    const res = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await handler({method: 'GET', headers: {}, query: {}}, res);
    assert.equal(res.code, 401); assert.equal(calls, 0);
    process.env.FIREBASE_WEB_API_KEY = 'test'; process.env.ADMIN_EMAILS = 'owner@example.com';
    const request = { headers: { authorization: 'Bearer dummy-token' } };
    for (const [user, expected] of [
      [{email:'owner@example.com',emailVerified:false}, false],
      [{email:'other@example.com',emailVerified:true}, false],
      [{email:'owner@example.com',emailVerified:true,disabled:true}, false],
      [{email:'owner@example.com',emailVerified:true}, true],
    ]) {
      globalThis.fetch = async () => ({ok:true,json:async()=>({users:[user]})});
      assert.equal(await verifyAdmin(request), expected);
    }
    globalThis.fetch = async () => { throw new Error('network failure'); };
    assert.equal(await verifyAdmin(request), false);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [field,value] of [['FIREBASE_WEB_API_KEY',originalEnv.key],['ADMIN_EMAILS',originalEnv.emails]]) {
      if (value === undefined) delete process.env[field]; else process.env[field]=value;
    }
  }
});
