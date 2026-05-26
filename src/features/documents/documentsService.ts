import { apiClient } from '../../lib/apiClient'
import type { PageResponse } from '../../lib/apiTypes'
import type { DocumentItem, DocumentStatus } from './documentsTypes'

export const documentsService = {
  list: (status?: DocumentStatus) => apiClient.get<PageResponse<DocumentItem>>(`/admin/documentos?size=50${status ? `&status=${status}` : ''}`),
  setStatus: (id: number, status: DocumentStatus, observacao?: string) =>
    apiClient.patch<DocumentItem>(`/admin/documentos/${id}/status`, { status, observacao }),
  remove: (id: number) => apiClient.delete(`/admin/documentos/${id}`),
  preview: (document: DocumentItem) => apiClient.blob(document.previewUrl.replace('/api', '')),
  download: (document: DocumentItem) => apiClient.blob(document.downloadUrl.replace('/api', '')),
}
