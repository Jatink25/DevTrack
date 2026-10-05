import { useParams } from 'react-router-dom'

export default function IssueDetailsPage() {
  const { projectId, issueId } = useParams()
  return <div>Issue Details (project: {projectId}, issue: {issueId})</div>
}
