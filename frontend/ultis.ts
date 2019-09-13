export function mavenVersionComparator(a: string, b: string) {
  const regex = /(\d+)\.(\d+)\.(\d+)((?:\.|\-)(alpha|beta|rc)(\d+))?/;
  const matchA = a.match(regex);
  const matchB = b.match(regex);
  if (!matchA || !matchB) {
    let errorVersions = matchA ? '' : a + ' ';
    errorVersions += matchB ? '' : b;
    throw new Error('The following version does not match version regex: ' + errorVersions);
  }
  if (matchA[1] !== matchB[1]) {
    return Number(matchA[1]) > Number(matchB[1]) ? 1 : -1;
  }
  if (matchA[2] !== matchB[2]) {
    return Number(matchA[2]) > Number(matchB[2]) ? 1 : -1;
  }
  if (matchA[3] !== matchB[3]) {
    return Number(matchA[3]) > Number(matchB[3]) ? 1 : -1;
  }
  if (matchA[4] && matchB[4]) {
    if (matchA[5] === matchB[5]) {
      return Number(matchA[6]) > Number(matchB[6]) ? 1 : -1;
    } else {
      return matchA[5] > matchB[5] ? 1 : -1;
    }
  }
  if (matchA[4] && !matchB[4]) {
    return -1;
  }
  if (!matchA[4] && matchB[4]) {
    return 1;
  }
  throw new Error('Cannot compare ' + a + ' and ' + b);
}