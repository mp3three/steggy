/* eslint-disable no-loops/no-loops */

export function removeRegions(sourceCode: string): string {
  const newLine = '\n';
  const emptyLine = '';
  const anythingRegex = '.';
  const regionRegex = '#region';
  const endregionRegex = '#endregion';
  const spaceRegex = '\\s';
  const startRegionsRegex = new RegExp(
    `^//${spaceRegex}*${regionRegex}${spaceRegex}+${anythingRegex}+$`,
    'i',
  );
  const endRegionsRegex = new RegExp(
    `^//${spaceRegex}*${endregionRegex}(${spaceRegex}+${anythingRegex}+)?$`,
    'i',
  );
  const input: string[] = sourceCode.split(newLine);
  const output: string[] = [];

  for (let i = 0; i < input.length; i++) {
    if (
      !startRegionsRegex.test(input[i].trim()) &&
      !endRegionsRegex.test(input[i].trim())
    ) {
      output.push(input[i]);
    } else {
      while (input.length > i && input[i] === emptyLine) {
        i++;
      }
      while (output.length > 0 && output[output.length - 1] === emptyLine) {
        output.pop();
      }
    }
  }
  return output.join(newLine);
}

export function formatRegions(sourceCode: string): string {
  const newLine = '\r\n';
  const newLinePlaceholder = '//newline';
  const cleanPlaceholder = '//clean';
  const newLineRegex = new RegExp(`\\s*${newLinePlaceholder}`, 'g');
  const cleanRegex = new RegExp(`\\s*${cleanPlaceholder}`, 'g');

  sourceCode = sourceCode.replace(newLineRegex, newLine);
  sourceCode = sourceCode.replace(cleanRegex, '');

  return sourceCode;
}

export function formatLines(sourceCode: string): string {
  const newLine = '\r\n';
  const emptyLineRegex = new RegExp(`^\\s*$`);
  const newLineRegex = new RegExp(`\r?\n|\r`);
  const openingBraceRegex = new RegExp(`^.*{\\s*$`);
  const closingBraceRegex = new RegExp(`^\\s*}\\s*$`);

  const lines: string[] = sourceCode.split(newLineRegex);
  for (let i = 0; i < lines.length - 1; i++) {
    if (openingBraceRegex.test(lines[i]) && emptyLineRegex.test(lines[i + 1])) {
      // remove empty line after {
      lines.splice(i + 1, 1);
      i--;
      continue;
    }
    if (
      emptyLineRegex.test(lines[i]) &&
      (closingBraceRegex.test(lines[i + 1]) ||
        emptyLineRegex.test(lines[i + 1]))
    ) {
      // remove empty line before }
      lines.splice(i, 1);
      i--;
    }
  }
  return lines.join(newLine);
}
