export const getFlagUrl = (
  countryId: string,
  size: 'w40' | 'w80' | 'w160' | 'w320' = 'w80'
): string => {
  const codeMap: Record<string, string> = {
    EH: 'eh',
  }
  const code = codeMap[countryId] || countryId.toLowerCase()
  return `https://flagcdn.com/${size}/${code}.png`
}
