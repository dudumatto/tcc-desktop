import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ErrorState } from '../../components/ui/ErrorState'
import { LoadingState } from '../../components/ui/LoadingState'
import { exportCsv } from '../../lib/csv'
import { formatDateTime } from '../../lib/date'
import { errorMessage } from '../../lib/errors'
import { reportsService } from './reportsService'
import type { ReportSummary } from './reportsTypes'

export function ReportsPage() {
  const [data, setData] = useState<ReportSummary | null>(null)
  const [error, setError] = useState('')
  const load = async () => {
    try { setError(''); setData(await reportsService.summary()) } catch (caught) { setError(errorMessage(caught)) }
  }
  useEffect(() => { void load() }, [])
  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!data) return <LoadingState label="Gerando relatorio..." />
  const datasets = [
    { title: 'Usuarios por perfil', values: data.usuariosPorTipo },
    { title: 'Projetos por status', values: data.projetosPorStatus },
    { title: 'Inscricoes por status', values: data.inscricoesPorStatus },
    { title: 'Documentos por status', values: data.documentosPorStatus },
  ]
  const download = () => exportCsv('relatorio-collabresearch.csv', datasets.flatMap((set) => Object.entries(set.values).map(([categoria, quantidade]) => ({ grupo: set.title, categoria, quantidade }))))
  return (
    <div className="page">
      <header className="page-header"><div><p className="eyebrow">Governanca</p><h1>Relatorios</h1><p>Gerado em {formatDateTime(data.geradoEm)}</p></div><Button onClick={download}>Exportar CSV</Button></header>
      <div className="report-grid">{datasets.map((dataset) => <Card key={dataset.title} title={dataset.title}><dl className="report-values">{Object.entries(dataset.values).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></Card>)}</div>
    </div>
  )
}
