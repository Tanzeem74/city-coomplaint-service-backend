export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}
