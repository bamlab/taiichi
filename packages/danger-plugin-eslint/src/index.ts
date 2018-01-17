// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "../../../node_modules/danger/distribution/dsl/DangerDSL";
declare var danger: DangerDSLType;
export declare function message(message: string): void;
export declare function warn(message: string): void;
export declare function fail(message: string): void;
export declare function markdown(message: string): void;

import { CLIEngine } from "eslint";
import * as _ from "lodash";
import * as markdownTable from "markdown-table";
import * as path from "path";

/**
 * Eslint your code with Danger
 */
export default async function eslint() {
  const filesToLint = danger.git.created_files.concat(danger.git.modified_files).filter(p => p.endsWith("js"));
  const cli = new CLIEngine({});
  const lintResultsNested = cli
    .executeOnFiles(["."])
    .results.map(
      file =>
        file.messages.length > 0
          ? file.messages.map(mes => {
              const fatal = mes.fatal;
              return [
                path.relative(process.cwd(), file.filePath),
                fatal ? 3 : mes.severity,
                mes.line,
                mes.message,
                mes.ruleId,
              ];
            })
          : undefined,
    )
    .filter(Boolean);
  const lintResultsModifiedOrCreated = [].concat(...lintResultsNested).filter(mes => filesToLint.indexOf(mes[0]) > -1);
  const results = [["Path", "Level", "Line", "Message", "Rule"], ...lintResultsModifiedOrCreated];

  const severityAsEmoji = s => (s === 3 ? "☠️" : s === 2 ? "⛔" : s === 1 ? "⚠️️" : s === 0 ? "✅" : s);
  const prettifyResults = row => [row[0], severityAsEmoji(row[1]), row[2], row[3], row[4]];

  if (results.some(row => row[1].toString() === "3")) {
    fail("Eslint failed parsing some files");
    markdown(`#### Eslint failed parsing some files

${markdownTable(results.map(prettifyResults))}

<details>
<summary>Open for detailed explanation</summary>
<p>

- **Rules**: Eslint analyse your codebase to detect nasty code
- **Why these is important**: Eslint detects some nasty code that will lead to errors, like undefined usage
- **How to fix**: fix the parsing error
- **Contact / owner**: [Tycho Tatitscheff](https://keybase.io/tychot)

</p>
</details>
      `);
    // tslint:disable-next-line:TS2365
  } else if (results.some(row => row[1].toString() === "2")) {
    fail("Eslint detected some errors");
    markdown(`#### Eslint detected some errors

${markdownTable(results.map(prettifyResults))}

<details>
<summary>Open for detailed explanation</summary>
<p>

- **Rules**: Eslint analyse your codebase to detect nasty code
- **Why these is important**: Eslint detects some nasty code that will lead to errors, like undefined usage
- **How to fix**: read eslint documentation by using the rule name
- **Contact / owner**: [Tycho Tatitscheff](https://keybase.io/tychot)

</p>
</details>
      `);
  } else if (results.some(row => row[1].toString() === "1")) {
    warn("Eslint detected some warnings");
    markdown(`#### Eslint detected some warnings

${markdownTable(results.map(prettifyResults))}

<details>
<summary>Open for detailed explanation</summary>
<p>

- **Rules**: Eslint analyse your codebase to detect nasty code
- **Why these is important**: Eslint detects some nasty code that will lead to errors, like undefined usage
- **How to fix**: read eslint documentation by using the rule name
- **Contact / owner**: [Tycho Tatitscheff](https://keybase.io/tychot)

</p>
</details>
      `);
  }
}
