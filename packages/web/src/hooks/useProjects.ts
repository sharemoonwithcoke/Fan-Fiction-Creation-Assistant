import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from './useApi.js'
import type { CreateProjectInput, UpdateProjectInput } from '@fanfic/shared'

export function useProjects() {
  const api = useApi()
  return useQuery({ queryKey: ['projects'], queryFn: () => api.projects.list() })
}

export function useProject(id: string) {
  const api = useApi()
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.projects.get(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProjectInput) => api.projects.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useUpdateProject(id: string) {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProjectInput) => api.projects.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['projects', id] })
    },
  })
}

export function useDeleteProject() {
  const api = useApi()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}
