import { useParams } from 'react-router-dom'

export default function ProjectIssuesPage() {
  const { projectId } = useParams()
  return <div>Project Issues (project: {projectId})</div>
}
