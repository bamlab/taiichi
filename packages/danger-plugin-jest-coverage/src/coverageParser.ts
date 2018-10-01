import * as parseCoverage from "byzantine";
import * as fs from "fs";
import { keyBy } from "lodash";
import * as path from "path";

const rootDir = process.cwd();
const getFileAbsolutePath = filePath => path.join(rootDir, filePath);
const coverageFilePath = getFileAbsolutePath("coverage/coverage-final.json");

class CoverageParser {
  static coverageFileExists = () => fs.existsSync(coverageFilePath);
  coverageByPath: {};

  parse() {
    // Dynamic require of a json file, don't want to import
    // tslint:disable-next-line
    const coverageJson = require(coverageFilePath);

    const coverages = parseCoverage(coverageJson);
    this.coverageByPath = keyBy(coverages, coverage => coverage.path);
  }

  getFileCoverageStats = filePath => {
    const fileCoverage = this.getCoverageForFile(filePath);

    if (fileCoverage) {
      const { branches, statements } = fileCoverage;
      return [this.getCoverageState(branches), this.getCoverageState(statements)];
    }

    return [0, 0];
  };

  private getCoverageState = ({ covered, all }) => (all > 0 ? covered / all : 1);
  private getCoverageForFile = filePath => this.coverageByPath[getFileAbsolutePath(filePath)];
}

export default CoverageParser;
