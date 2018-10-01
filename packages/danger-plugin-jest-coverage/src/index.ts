// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "../../../node_modules/danger/distribution/dsl/DangerDSL";
declare var danger: DangerDSLType;
export declare function message(message: string): void;
export declare function warn(message: string): void;
export declare function fail(message: string): void;
export declare function markdown(message: string): void;

import { forEach, get, groupBy, includes } from "lodash";
import * as generateMarkdownTable from "markdown-table";
import * as path from "path";
import CoverageParser from "./coverageParser";

const coverageParser = new CoverageParser();

const roundPercentage = num => Math.round(num * 100) / 100;
const formatCoverageState = (stat: number) => {
  const percentage = roundPercentage(stat * 100);

  const GREEN = "00ff00";
  const RED = "ff0000";
  const ORANGE = "ffaa00";

  let color = GREEN;

  if (percentage < 80) {
    color = ORANGE;
  }
  if (percentage < 50) {
    color = RED;
  }

  return `![${percentage}](https://placehold.it/15/${color}/000000?text=+) ${percentage}%`;
  // return `${percentage}%`;
};

const generateMarkdownLineForFileCoverage = (filePath: string) => {
  const fileCoverage = coverageParser.getFileCoverageStats(filePath);
  const filePathWithoutFirstFolder = filePath.slice(filePath.indexOf("/") + 1);

  return [`↦ ${filePathWithoutFirstFolder}`].concat(fileCoverage.map(formatCoverageState));
};

const generateCoverageTable = files => {
  const filesNeedingCoverage = files.filter(shouldFileHaveCoverage);
  const filesByFolder = groupBy(filesNeedingCoverage, file => file.split("/")[0]);

  const table: string[][] = [];

  forEach(filesByFolder, (folderFiles, folderName) => {
    table.push([`:file_folder: **${folderName}**`, "", ""]);
    forEach(folderFiles, file => table.push(generateMarkdownLineForFileCoverage(file)));
  });

  return table;
};

const shouldFileHaveCoverage = file =>
  file.endsWith(".js") &&
  !includes(file, "__tests__") &&
  !includes(file, "__mocks__") &&
  !includes(file, "__stories__") &&
  !file.endsWith("flow.js");

export default async function jestCoverage() {
  const { git } = danger;

  if (CoverageParser.coverageFileExists()) {
    coverageParser.parse();
    const coverageTable = [["File", "Branches", "Statements"]]
      .concat([[], [":heavy_plus_sign: **NEW FILES**"], []])
      .concat(generateCoverageTable(git.created_files))
      .concat([[], [":pencil2: **MODIFIED FILES**"], []])
      .concat(generateCoverageTable(git.modified_files));

    markdown(
      `# Coverage

${generateMarkdownTable(coverageTable)}`,
    );
  } else {
    warn("No coverage file available, please run `yarn jest --coverage` before running this plugin.");
  }
}
