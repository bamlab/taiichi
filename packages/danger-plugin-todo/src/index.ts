// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "../node_modules/danger/distribution/dsl/DangerDSL";

declare var danger: DangerDSLType;
export declare function message(message: string): void;
export declare function warn(message: string): void;
export declare function fail(message: string): void;
export declare function markdown(message: string): void;

import * as fs from "fs";
import * as _ from "lodash";
import * as markdownTable from "markdown-table";
import * as path from "path";

function absolute(relPath) {
  return path.resolve(__dirname, relPath);
}

const todoIgnorePaths = [
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

const todoSynonyms = ["todo", "fixme", "wip"];

function checkForTodo(filePath) {
  let i = 0;
  const len = todoIgnorePaths.length;
  while (i < len) {
    const p = todoIgnorePaths[i];
    if (absolute(filePath).includes(p)) {
      // ignore this file because it's in the todo-ignore-paths.
      return false;
    }
    i++;
  }
  const content = fs
    .readFileSync(filePath)
    .toString()
    .toLowerCase();

  return todoSynonyms.some(pattern => content.includes(pattern));
}

/**
 * Ensure adoption of flow-type
 */
export default async function flow(settings = {}) {
  const newJsFiles = danger.git.created_files.filter(p => p.endsWith("js"));
  const modifiedJsFiles = danger.git.created_files.filter(p => p.endsWith("js"));

  const newFilesWithTodo = newJsFiles.filter(checkForTodo);
  const modifiedFilesWithTodo = modifiedJsFiles.filter(checkForTodo);

  const filesWithTodo = [...newFilesWithTodo, ...modifiedJsFiles];

  const inform = newFilesWithTodo.length > 0 ? warn : message;
  const newOrExisting = newFilesWithTodo.length > 0 ? "New" : "Existing";

  if (filesWithTodo.length > 0) {
    inform(`${newOrExisting} files have some todo comment(s)`);
    markdown(`#### Explanations for \`${newOrExisting} files have some todo comment(s)\`

<details>
<summary>Open for detailed explanation</summary>
<p>

Checks if you can address the todo in your PR. So you can improve technical dept of this repository.

If not create a reminder like a ticket to fix it later.

- **Failing**: the following files are concerned

${markdownTable([
      ["Name", "Addition or existing file"],
      ...filesWithTodo.map(file => [
        file,
        _.includes(newFilesWithTodo, file) ? ":heavy_plus_sign: new file" : ":pencil2: existing file",
      ]),
    ])}

- **Contact / owner**: [Tycho Tatitscheff](https://keybase.io/tychot)

</p>
</details>
  `);
  }
}
