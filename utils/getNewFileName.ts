export default function getNewFileName(orgName: string) {
  const withoutExt = orgName?.slice(0, orgName.lastIndexOf("."));
  const ext = orgName?.slice(orgName.lastIndexOf("."));
  const genFragment = Math.random().toString(36).slice(2);
  return withoutExt + "_" + genFragment + ext;
}
