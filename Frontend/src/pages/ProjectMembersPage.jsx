import { useParams } from 'react-router-dom'

export default function ProjectMembersPage() {
  const { projectId } = useParams()
  return <div>Project Members (project: {projectId})</div>
}
