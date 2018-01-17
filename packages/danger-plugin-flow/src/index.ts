// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "../../../node_modules/danger/distribution/dsl/DangerDSL";

declare var danger: DangerDSLType;
export declare function message(message: string): void;
export declare function warn(message: string): void;
export declare function fail(message: string): void;
export declare function markdown(message: string): void;

import * as fs from "fs";
import * as _ from "lodash";
import * as markdownTable from "markdown-table";
import * as path from "path";

const STANDARD_URL = "https://bamtech.gitbooks.io/dev-standards/flowtype/flowtype.s.html";

function absolute(relPath) {
  return path.resolve(__dirname, relPath);
}

// async function filter(arr, callback) {
//   return (await Promise.all(
//     arr.map(async item => {
//       return (await callback(item)) ? item : undefined;
//     }),
//   )).filter(i => i !== undefined);
// }

const flowIgnorePaths = [
  "node_modules",
  "test",
  "build",
  "examples",
  "doc",
  "dist",
  "android",
  "ios",
  "bin",
  "dist",
  "flow-typed",
].map(rel => {
  return absolute(rel);
});

/* async */
function checkForFlow(filePath) {
  let i = 0;
  const len = flowIgnorePaths.length;
  while (i < len) {
    const p = flowIgnorePaths[i];
    if (absolute(filePath).includes(p)) {
      // ignore this file because it's in the flow-ignore-paths.
      return false;
    }
    i++;
  }
  const content = fs.readFileSync(filePath);
  // const content = await danger.github.utils.fileContents(filePath);
  return !content.includes("@flow");
}

/**
 * Ensure adoption of flow-type
 */
export default async function flow(settings = {}) {
  const newJsFiles = danger.git.created_files.filter(p => p.endsWith("js"));
  const modifiedJsFiles = danger.git.created_files.filter(p => p.endsWith("js"));

  // const newUnFlowedFiles = await filter(newJsFiles, checkForFlow);
  // const modifiedUnFlowedFiles = await filter(modifiedJsFiles, checkForFlow);

  const newUnFlowedFiles = newJsFiles.filter(checkForFlow);
  const modifiedUnFlowedFiles = modifiedJsFiles.filter(checkForFlow);

  const unFlowedFiles = [...newUnFlowedFiles, ...modifiedUnFlowedFiles];

  const failOrWarn = newUnFlowedFiles.length > 0 ? fail : warn;
  const newOrExisting = newUnFlowedFiles.length > 0 ? "New" : "Existing";

  if (unFlowedFiles.length > 0) {
    failOrWarn(`${newOrExisting} files have not @flow enabled`);
    markdown(`#### Explanations for \`${newOrExisting} files have not @flow enabled\`

<details>
<summary>Open for detailed explanation</summary>
<p>

- **Rules**: the rule is to have each \`*.js\` files of your codebase having a \`@flow\` or a \`@flow weak\`
comment on first line.
Then [flowtype](https://flow.org/) can parse your file and detect bugs before they happen, like detecting
\`cannot access property "bar" of undefined \` and provide autocompletion in your IDE.

- **Failing**: the following files failed the rules

${markdownTable([
      ["Name", "Addition or existing file"],
      ...unFlowedFiles.map(file => [
        file,
        _.includes(newUnFlowedFiles, file) ? ":heavy_plus_sign: new file" : ":pencil2: existing file",
      ]),
    ])}

- **Why these is important**: If there is no @flow declaration, flow ignore the file. That means that you expect
flow to give your error when it would not do.
- **How to fix**: read the dev-standard [about flow](${STANDARD_URL})
- **Contact / owner**: [Tycho Tatitscheff](https://keybase.io/tychot)

</p>
</details>
  `);
  }
}
