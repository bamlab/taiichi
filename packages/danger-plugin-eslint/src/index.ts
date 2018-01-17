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

/**
 * Eslint your code with Danger
 */
export default async function eslint(config: any) {
  const filesToLint = danger.git.created_files.concat(danger.git.modified_files).filter(p => p.endsWith("js"));
  const cli = new CLIEngine({ baseConfig: config });
  const lintResults = [...(await Promise.all(filesToLint.map(f => lintFile(cli, config, f))))].filter(Boolean);
  const results = [["Level", "Path", "Line", "Message", "Rule"], ...lintResults];

  if (results.some(row => row[0] === "☠️")) {
    fail("Eslint failed parsing some files");
    markdown(`#### Eslint failed parsing some files

    ${markdownTable(results)}

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
  } else if (results.some(row => row[0] === "⛔️")) {
    fail("Eslint detected some errors");
    markdown(`#### Eslint detected some errors

    ${markdownTable(results)}

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
  } else if (results.some(row => row[0] === "⚠️")) {
    warn("Eslint detected some warnings");
    markdown(`#### Eslint detected some warnings

    ${markdownTable(results)}

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

async function lintFile(linter, config, path) {
  const contents = await danger.github.utils.fileContents(path);
  const report = linter.executeOnText(contents, path);

  const eslintFatals = report.results[0].messages.map(msg => msg.fatal);
  const eslintFails = report.results[0].messages.map(msg => msg.severity === 2);

  if (eslintFatals.length > 0) {
    fail(`Fatal error linting with eslint.`);
    return ["☠️", path, "", "", ""];
  }

  if (report.results[0].messages.length > 0) {
    return report.results[0].messages.map(msg => [
      { 1: "⚠️", 2: "⛔️" }[msg.severity],
      path,
      msg.line,
      msg.message,
      msg.ruleId,
    ]);
  }
}
