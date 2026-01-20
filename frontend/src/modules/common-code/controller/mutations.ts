import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCommonCode,
  updateCommonCode,
  deleteCommonCode,
} from "../model/common-code.service";
import type {
  CommonCodeCreateDto,
  CommonCodeUpdateDto,
} from "../model/common-code.types";
import { commonCodeQueryKeys } from "./queryKeys";

/**
 * Create common code mutation hook
 */
export const useCreateCommonCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CommonCodeCreateDto) => {
      return await createCommonCode(data);
    },
    onSuccess: (_, variables) => {
      // Invalidate all list, roots, and tree queries after creation
      // queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.roots() });
      // queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.tree() })

      // Invalidate children query if parentId exists
      if (variables.parentId !== null && variables.parentId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: commonCodeQueryKeys.list(
            JSON.stringify({
              parentId: variables.parentId,
              sort: "id,desc",
              page: 0,
              size: 0,
            })
          ),
        });
      }
    },
  });
};

/**
 * Update common code mutation hook
 */
export const useUpdateCommonCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CommonCodeUpdateDto;
    }) => {
      return await updateCommonCode(id, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate all list, roots, and tree queries after creation
      // queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.roots() });
      // queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.tree() })

      // Invalidate children query if parentId exists
      if (variables.data.parentId !== null && variables.data.parentId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: commonCodeQueryKeys.list(
            JSON.stringify({
              parentId: variables.data.parentId,
              sort: "id,desc",
              page: 0,
              size: 0,
            })
          ),
        });
      }
    },
  });
};

/**
 * Delete common code mutation hook
 */
export const useDeleteCommonCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteCommonCode(id);
    },
    onSuccess: () => {
      // Invalidate all list, roots, and tree queries after deletion
      // Since we don't have parentId in delete mutation, invalidate all list queries
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.roots() });
      // queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.tree() })
    },
  });
};
