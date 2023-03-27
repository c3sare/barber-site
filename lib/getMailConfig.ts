import MailConfig from "@/models/MailConfigs";

export default async function getMailConfig() {
  const mailConfig = JSON.parse(JSON.stringify(await MailConfig.findOne({})));
  delete mailConfig._id;
  return mailConfig;
}
