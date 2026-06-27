# Safety and Governance

Use this reference when deciding whether automation should be raw execution or
managed script, or when reviewing security-sensitive browser-control changes.

## Governance Boundary

Keep one-off automation and reusable assets separate:

- `scriptCode` is allowed for temporary work. Treat it as direct dynamic code.
- `commandSlug` is required for reusable scripts that need discovery,
  publication, versioning, visibility, URL policy, capability declaration,
  review, audit, or revocation.

Do not create compatibility paths that silently downgrade `commandSlug` to raw
`scriptCode`. If Market resolution fails, the governed script execution should
fail clearly.

## Security Invariants

- Bearer tokens must not be passed in URLs or query strings.
- CLI OAuth callbacks must stay loopback-only.
- Plugin login passes only one-time authorization data through the page bridge;
  plugin bearer tokens must not pass through `postMessage`.
- Extension auth bridge scripts should only run on allowed Market origins.
- `BROWSER_ID_SECRET` signs browser IDs only.
- `INTERNAL_API_SECRET` guards service-to-service calls.
- Market token introspection failures should fail closed in realtime.
- Forgotten browser tombstones should not be revived.
- Passwords must be stored as salted hashes only.

## Review Questions

When reviewing a change, ask:

1. Does the code preserve `loc-*` vs `rem-*` ownership?
2. Does a reusable script go through Market governance?
3. Does a raw script path clearly remain raw and unaudited?
4. Are token scopes and token transport correct?
5. Are internal service calls using the internal secret, not the browser ID
   secret?
6. Are shared types and Rust mirrors still compatible?
7. Are docs updated if a route, field, schema, secret, or behavior changed?

## Script Asset Hygiene

Reusable scripts should have:

- a stable semantic slug
- a clear name and description
- URL policy that is as narrow as practical
- declared capabilities when relevant
- a reasonable timeout budget
- visible owner/review state
- update history through the CLI/Market path

Avoid turning every small task into a governed script. The split is intentional:
raw scripts are good for exploration; governed scripts are good for repeatable
automation that others can discover and trust.
