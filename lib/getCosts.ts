import Cost from "@/models/Cost";

export default async function getCosts() {
  const costData = JSON.parse(JSON.stringify(await Cost.find({})));
  return costData;
}
