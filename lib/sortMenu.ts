export default function sortMenu(a: any, b: any) {
  if (a.order > b.order) return 1;
  else if (b.order > a.order) return -1;
  else return 0;
}
