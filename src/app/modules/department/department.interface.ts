export interface ICreateDepartment {
  name: string;
  description?: string;
}

export interface IUpdateDepartment {
  name?: string;
  description?: string;
  isActive?: boolean;
}
