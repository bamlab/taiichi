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
  const filesToLint = danger.git.created_files.concat(danger.git.modified_files);
  const cli = new CLIEngine({ baseConfig: config });
  const lintResults = [...(await Promise.all(filesToLint.map(f => lintFile(cli, config, f))))];
  const results = [["Level", "Path", "Line", "Message", "Rule"], ...lintResults];

  message(markdownTable(results));
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
