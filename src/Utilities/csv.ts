export function csv(input: (string | undefined)[][]): string {
  let rv = '\uFEFF' // make Excel understand utf8
  for (const row of input) {
    rv += row.map(transform).join(',')
    rv += '\n'
  }
  return rv

  function transform(item?: string): string {
    if (!item) return ''

    if (typeof item !== 'string') {
      item = `${item}`
    }

    if (item.includes('\n')) {
      item = item.replace('\n', '\t')
    }

    if (!item.includes(',')) {
      return item
    } else if (item.includes('"')) {
      return `"${item.replace('"', '""')}"`
    } else {
      return `"${item}"`
    }
  }
}
