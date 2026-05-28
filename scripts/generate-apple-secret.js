#!/usr/bin/env node
/**
 * Apple OAuth Client Secret Rotator
 *
 * Generates a new Apple Sign-In client secret JWT and pushes it to Supabase
 * via the Management API so the auth provider stays active.
 *
 * Run this every 6 months — Apple client secrets expire after 180 days.
 * Easiest via: npm run rotate-apple-secret
 *
 * Required environment variables:
 *   APPLE_PRIVATE_KEY      — full contents of the .p8 file (newlines preserved)
 *   APPLE_TEAM_ID          — 10-char Apple Developer Team ID
 *   APPLE_KEY_ID           — 10-char key ID from the .p8 filename
 *   APPLE_SERVICES_ID      — Services ID configured for Sign in with Apple
 *   SUPABASE_PROJECT_REF   — Supabase project reference (e.g. abcdefghijklmnop)
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (starts with eyJ…)
 */

'use strict';

const jwt = require('jsonwebtoken');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const privateKey = requireEnv('APPLE_PRIVATE_KEY').replace(/\\n/g, '\n');
  const teamId = requireEnv('APPLE_TEAM_ID');
  const keyId = requireEnv('APPLE_KEY_ID');
  const servicesId = requireEnv('APPLE_SERVICES_ID');
  const projectRef = requireEnv('SUPABASE_PROJECT_REF');
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  // Generate JWT — Apple requires ES256, 180-day max lifetime
  const clientSecret = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    audience: 'https://appleid.apple.com',
    issuer: teamId,
    subject: servicesId,
    keyid: keyId,
  });

  console.log('Generated Apple client secret JWT (valid 180 days).');

  // Fetch current Apple provider config so we preserve existing fields
  const getUrl = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;
  const headers = {
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
  };

  const getRes = await fetch(getUrl, { headers });
  if (!getRes.ok) {
    const body = await getRes.text();
    console.error(`Failed to fetch current auth config (${getRes.status}): ${body}`);
    process.exit(1);
  }

  const currentConfig = await getRes.json();

  // Patch only the Apple client_secret; leave everything else untouched
  const patch = {
    external_apple_enabled: currentConfig.external_apple_enabled ?? true,
    external_apple_client_id: currentConfig.external_apple_client_id ?? servicesId,
    external_apple_secret: clientSecret,
  };

  const patchRes = await fetch(getUrl, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(patch),
  });

  if (!patchRes.ok) {
    const body = await patchRes.text();
    console.error(`Failed to update Supabase Apple secret (${patchRes.status}): ${body}`);
    process.exit(1);
  }

  console.log('Supabase Apple auth provider secret updated successfully.');
  console.log('Next rotation due in 180 days.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
