import * as core from '@actions/core';
import * as differ from 'diff';
import fs from 'fs';

const getColoredLog = (diffResult: differ.Change): string => {
    let diffContent = diffResult.value;
    if (diffResult.added) {
        return `(+ ${diffContent})`;
    }
    if (diffResult.removed) {
        return `(- ${diffContent})`;
    }
    return diffContent;
}

const main = (): void => {
    const lhs = core.getInput('lhs');
    const rhs = core.getInput('rhs');
    // TODO(tianhaoz95): change this to getBooleanInput once
    // it becomes available.
    const fail = core.getInput('fail') === 'true';
    const debug = core.getInput('debug') === 'true';
    const lhsContent = fs.readFileSync(lhs).toString();
    const rhsContent = fs.readFileSync(rhs).toString();
    if (debug) {
        core.startGroup('The file contents.')
        core.info(`The content of lhs is: ${lhsContent}`);
        core.info(`The content of rhs is: ${rhsContent}`);
        core.endGroup()
    }
    const diffResult = differ.diffChars(lhsContent, rhsContent);
    let diffCnt = 0;
    let loggingContent: string = '';
    if (debug) {
        core.startGroup('Iterate diff results.');
        diffResult.forEach((part: differ.Change): void => {
            core.info(JSON.stringify(part));
        });
        core.endGroup()
    }
    diffResult.forEach((part: differ.Change): void => {
        if (part.added || part.removed) {
            diffCnt += 1;
        }
        loggingContent += getColoredLog(part);
    });
    core.info(loggingContent);
    if (diffCnt > 0 && fail) {
        core.setFailed(
            `There are ${diffResult.length} differences 
            in content of ${lhs} and ${rhs}`);
    }
}

main();