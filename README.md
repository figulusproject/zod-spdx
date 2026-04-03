# zod-spdx

Zod schemas and TypeScript types for the [SPDX license list](https://spdx.org/licenses/). Validates license IDs at runtime, infers them at compile time, and provides tree-shakeable access to full license metadata.

## Installation

```sh
npm install zod-spdx
```

## Usage

### Validate a license ID

`parseLicenseId` wraps Zod's `safeParse` and returns the same `{ success, data } | { success, error }` shape.

```ts
import { parseLicenseId } from 'zod-spdx';

const result = parseLicenseId('MIT');
if (result.success) {
  console.log(result.data); // 'MIT' (typed as LicenseId)
} else {
  console.error(result.error);
}
```

Case-insensitive matching is opt-in and always returns the canonical casing:

```ts
parseLicenseId('apache-2.0', { caseSensitive: false });
// { success: true, data: 'Apache-2.0' }
```

### Get license metadata

`getLicense` returns the full metadata object for a given ID. It uses a dynamic import under the hood, so bundlers (Vite, Rollup, webpack) will code-split the 700+ licenses into individual chunks and only load what's requested.

```ts
import { getLicense } from 'zod-spdx';

const license = await getLicense('MIT');
// {
//   licenseId: 'MIT',
//   name: 'MIT License',
//   reference: 'https://spdx.org/licenses/MIT.html',
//   detailsUrl: 'https://spdx.org/licenses/MIT.json',
//   isOsiApproved: true,
//   isDeprecatedLicenseId: false,
//   referenceNumber: 516,
//   seeAlso: ['https://opensource.org/license/mit/', ...]
// }
```

### Use the schemas directly

```ts
import { licenseIdSchema, licenseSchema } from 'zod-spdx';

// Validate an unknown license ID
licenseIdSchema.parse('MIT');        // 'MIT'
licenseIdSchema.parse('not-a-real-id'); // throws ZodError

// Validate a full license object (e.g. from an API response)
licenseSchema.parse(someObject);
```

### Types

```ts
import type { LicenseId, License } from 'zod-spdx';

function doSomething(id: LicenseId) { ... }
function doSomethingElse(license: License) { ... }
```

`LicenseId` is a union of all 700+ SPDX license ID strings. `License` is the shape of a full metadata object.

Both are also exported under their `SPDX`-prefixed aliases (`SPDXLicenseId`, `SPDXLicense`, `spdxLicenseIdSchema`, `spdxLicenseSchema`) for codebases that prefer explicit naming.

### Individual license imports

For static imports where the license ID is known at build time, individual license modules are available as subpath exports. These are the most tree-shakeable option — bundlers include only what is explicitly imported.

```ts
import { mit } from 'zod-spdx/license/mit.js';
import { apache_2_0 } from 'zod-spdx/license/apache-2-0.js';
```

Filenames use lowercase kebab-case with `-` in place of `.` and `+`. Identifiers use snake_case, with a leading `_` for IDs that start with a digit (e.g. `0BSD` → `_0bsd`).

## License

MIT
