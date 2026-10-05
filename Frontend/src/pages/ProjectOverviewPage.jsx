import { useParams } from 'react-router-dom'

export default function ProjectOverviewPage() {
  const { projectId } = useParams()
  return <div>Project Overview (project: {projectId})</div>
}
