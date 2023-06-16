export default interface IUser {
  id: number,
  name: string,
  email: string,
  password: string,
  roles?: Array<string> | null,
}