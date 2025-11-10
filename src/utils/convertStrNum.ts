function parseNumber(str: string): string {
    console.log(str);
    
  // Match the numeric part at the end of the string
  const match = str.match(/(\d+)$/);

  if (!match) {
    // No number found, return empty or handle as needed
    return '';
  }

  let numberPart = match[1];

  // Remove leading zeros if the number is longer than 3 digits
  if (numberPart.length > 3) {
    numberPart = numberPart.replace(/^0+/, '');
  }

  return numberPart;
}

export default parseNumber;
