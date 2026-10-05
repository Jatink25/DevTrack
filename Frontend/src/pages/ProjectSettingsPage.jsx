import { useParams } from 'react-router-dom'

export default function ProjectSettingsPage() {
  const { projectId } = useParams()
  return <div>Project Settings (project: {projectId})</div>
}
