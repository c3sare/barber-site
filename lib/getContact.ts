import Contact from "@/models/Contact";

export default async function getContact() {
  const contactData = JSON.parse(JSON.stringify(await Contact.findOne({})));
  delete contactData._id;
  return contactData;
}
