import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function getGitCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getVersion(): string {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

const buildInfo = {
  version: getVersion(),
  gitCommit: getGitCommit(),
  buildTime: new Date().toISOString(),
};

const outputPath = path.join(process.cwd(), 'build-info.json');
fs.writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2) + '\n');

console.log('Generated build-info.json:', buildInfo);
