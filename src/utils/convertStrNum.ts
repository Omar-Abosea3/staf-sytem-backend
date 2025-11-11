
function parseNumber(str: string): string {
  console.log(str);

  // Match the numeric part at the end of the string
  const match = str.match(/(\d+)$/);

  if (!match) {
    // No number found, return empty or handle as needed
    return '';
  }

  let numberPart = match[1];

  // Keep at least 3 digits by removing leading zeros only if length > 3
  // This ensures: 00222->222, 00022->022, 00002->002, 02222->2222, 22222->22222
  if (numberPart.length > 3) {
    // Remove leading zeros but keep at least 3 digits
    const zerosToRemove = numberPart.length - 3;
    let leadingZeros = 0;

    for (let i = 0; i < zerosToRemove; i++) {
      if (numberPart[i] === '0') {
        leadingZeros++;
      } else {
        break;
      }
    }

    numberPart = numberPart.substring(leadingZeros);
  }

  return numberPart;
}

export default parseNumber;
