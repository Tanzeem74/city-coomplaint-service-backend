export interface ICreateComplaint {
  title: string;
  description: string;
  location: string;
  departmentId: string;
  categoryId: string;
}

export interface IComplaintQuery {
  searchTerm?: string;
  status?: string;
  priority?: string;
  departmentId?: string;
  categoryId?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
export interface IAssignComplaint {
  staffId: string;
  note?: string;
}

export interface IUpdateComplaintStatus {
  status: "IN_PROGRESS" | "RESOLVED";
  message?: string;
}

export interface ICitizenComplaintStatus {
  status: "CANCELLED" | "CLOSED";
  message?: string;
}
