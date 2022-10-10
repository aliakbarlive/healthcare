// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Label, longTitle } = require('../src/Utilities/config')

const cmd = process.argv[2]

function label(key: string = process.env.REACT_APP_WHITE_LABEL) {
  for (const key in Label) {
    if (Label[key as keyof typeof Label] === process.env.REACT_APP_WHITE_LABEL) {
      return { key, label: Label[key] }
    }
  }
  process.stderr.write(`error: code not found for: ${process.env.REACT_APP_WHITE_LABEL}`)
  process.exit(1)
}

switch (cmd) {
case 'code':
  process.stdout.write(label().key)
  break
case 'title':
  process.stdout.write(longTitle(label().label))
  break
default:
  process.stderr.write(`error: invalid command: ${cmd}`)
  process.exit(1)
}
