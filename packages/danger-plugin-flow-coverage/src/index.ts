// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "../../../node_modules/danger/distribution/dsl/DangerDSL";
declare var danger: DangerDSLType;
export declare function message(message: string): void;
export declare function warn(message: string): void;
export declare function fail(message: string): void;
export declare function markdown(message: string): void;

import { forEach, get, groupBy, includes, keyBy } from "lodash";
import * as path from "path";

const rootDir = process.cwd();

const getFileAbsolutePath = filePath => path.join(rootDir, filePath);

import * as generateMarkdownTable from "markdown-table";
// Dynamic require of a json file, don't want to import
// tslint:disable-next-line
const json = require(getFileAbsolutePath("flow-coverage/flow-coverage.json"));

const coverageByPath = json.files;
const getCoverageForFile = filePath => coverageByPath[filePath];

const getCoverageState = ({ expressions: { covered_count, uncovered_count } }) => {
  return uncovered_count > 0 ? covered_count / (covered_count + uncovered_count) : 1;
};
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

const getFileCoverageStats = filePath => {
  const fileCoverage = getCoverageForFile(filePath);

  if (fileCoverage) {
    return getCoverageState(fileCoverage);
  }

  return 0;
};

const generateMarkdownLineForFileCoverage = (filePath: string) => {
  const fileCoverage = getFileCoverageStats(filePath);
  const filePathWithoutFirstFolder = filePath.slice(filePath.indexOf("/") + 1);

  return [`↦ ${filePathWithoutFirstFolder}`].concat(formatCoverageState(fileCoverage));
};

const generateCoverageTable = files => {
  const filesNeedingCoverage = files.filter(shouldFileHaveCoverage);
  const filesByFolder = groupBy(filesNeedingCoverage, file => file.split("/")[0]);

  const table: string[][] = [];

  forEach(filesByFolder, (folderFiles, folderName) => {
    table.push([`:file_folder: **${folderName}**`, ""]);
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

export default async function flowCoverage() {
  const { git } = danger;

  const coverageTable = [["File", "Coverage"]]
    .concat([[], [":heavy_plus_sign: **NEW FILES**"]])
    .concat(generateCoverageTable(git.created_files))
    .concat([[], [":pencil2: **MODIFIED FILES**"]])
    .concat(generateCoverageTable(git.modified_files));

  markdown(
    `# Flow coverage

${generateMarkdownTable(coverageTable)}`,
  );
}
