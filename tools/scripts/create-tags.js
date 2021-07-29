const [,,version,...extra] = process.argv;
const versions = [
  'latest',
  version,
  ...extra
];
if( !version.includes('-') ) {
  const [major, minor, patch] = version.split('.')
  if( patch === '0' ) {
    versions.push([major,'x'].join('.'))
    versions.push('stable');
  }
  versions.push([major,minor,'x'].join('.'))
}
console.log(versions.join(`\n`))
