export default function effectiveDateFilter(date: Date) {
  switch (date.getDate()) {
  case 1:
  // case 15: //disabled for now
    return true
  default:
    return false
  }
}
