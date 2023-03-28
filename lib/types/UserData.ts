export default interface UserData {
  _id: string;
  login: string;
  password: string;
  permissions: {
    [key: string]: boolean;
  };
}
