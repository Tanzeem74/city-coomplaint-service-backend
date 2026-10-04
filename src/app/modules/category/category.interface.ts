export interface ICreateCategory {
  name: string;
  description?: string;
  departmentId: string;
}

export interface IUpdateCategory {
  name?: string;
  description?: string;
  departmentId?: string;
  isActive?: boolean;
}
