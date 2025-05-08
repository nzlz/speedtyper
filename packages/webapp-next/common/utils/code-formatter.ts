/**
 * Formats code to have a maximum line length by intelligently breaking lines
 * at sensible points (operators, braces, etc).
 */
export function formatCodeWithMaxLineLength(code: string, maxLineLength = 55): string {
  const lines = code.split('\n');
  const formattedLines: string[] = [];

  for (const line of lines) {
    if (line.length <= maxLineLength) {
      formattedLines.push(line);
    } else {
      // Define break points in order of preference
      const breakPoints = [
        // Operators and separators
        ' = ', ' + ', ' - ', ' * ', ' / ', ' && ', ' || ', ' ?? ', ' ? ', ' : ',
        ', ', '; ', ' => ',
        // Opening/closing braces and brackets
        ' { ', '{ ', ' } ', '} ', ' ( ', '( ', ' ) ', ') ',
        ' [ ', '[ ', ' ] ', '] ',
        // Less preferred break points
        ' ', '.', ':', '+', '-', '*', '/', '=', '&', '|', '<', '>'
      ];

      let currentLine = '';
      let remainingLine = line;
      
      // Preserve the original indentation
      const indentation = line.match(/^\s*/)?.[0] || '';
      
      // Process the line until it's empty
      while (remainingLine.length > 0) {
        if (currentLine.length + remainingLine.length <= maxLineLength) {
          // If the rest fits, just add it and break
          currentLine += remainingLine;
          formattedLines.push(currentLine);
          break;
        }
        
        // Find a good break point
        let bestBreakPoint = -1;
        let bestBreakText = '';
        
        for (const breakPoint of breakPoints) {
          // Find the furthest valid break point position that still fits within maxLineLength
          const pos = remainingLine.lastIndexOf(breakPoint, maxLineLength - currentLine.length);
          if (pos > bestBreakPoint) {
            bestBreakPoint = pos;
            bestBreakText = breakPoint;
          }
        }

        if (bestBreakPoint > 0) {
          // Add the content up to the break point
          const breakPos = bestBreakPoint + (bestBreakText.startsWith(' ') ? 0 : bestBreakText.length);
          currentLine += remainingLine.substring(0, breakPos);
          formattedLines.push(currentLine);
          
          // Prepare next line with proper indentation
          remainingLine = `${indentation}  ${remainingLine.substring(breakPos).trimStart()}`;
          currentLine = '';
        } else {
          // If no break point found, force break at maxLineLength
          const forcedBreak = maxLineLength - currentLine.length;
          currentLine += remainingLine.substring(0, forcedBreak);
          formattedLines.push(currentLine);
          
          // Continue with the remaining line
          remainingLine = `${indentation}  ${remainingLine.substring(forcedBreak)}`;
          currentLine = '';
        }
      }
    }
  }

  return formattedLines.join('\n');
} 