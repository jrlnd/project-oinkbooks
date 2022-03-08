import { CategoryDetails } from "../models"

export const getCategoryIcon = (categories: CategoryDetails[], catId: string) => categories.find(({id}) => id === catId)?.icon || ""

export const getCategoryLabel = (categories: CategoryDetails[], catId: string) => {
  const category = categories.find(({id}) => id === catId)
  return category ? `${category.icon} ${category.label}` : ""
}
