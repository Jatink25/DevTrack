import { useParams } from 'react-router-dom'

export default function ProjectActivityPage() {
  const { projectId } = useParams()
  return <div>Project Activity (project: {projectId})</div>
}
