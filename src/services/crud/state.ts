import { EStatusState } from "@/enums";
import type { CurdState } from "./reducer";

export const nameCrud = "crud";
/**
 * Represents the state for CRUD operations with additional properties.
 *
 * @template T - The type of the object being manipulated.
 */
export interface StateCrud<T = object> extends CurdState<T> {
  formData?: T;
  projectMemberFormData?: T;
  defaultSelected?: any;
  refData?: T;
}

/**
 * Initial state for the CRUD service.
 */
export const initialStateCrud: StateCrud = {
  isLoading: false,
  status: EStatusState.idle,
  time: 0,
  keepUnusedDataFor: 60,
  queryParams: undefined,
  result: undefined,
  data: undefined,
  formData: undefined,
  projectMemberFormData: undefined,
  refData: undefined,
  isVisible: false,
  defaultSelected: undefined,
};
