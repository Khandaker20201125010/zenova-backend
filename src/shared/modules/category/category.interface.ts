export interface CreateCategoryInput {
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  image?: string;
  parentId?: string;
}