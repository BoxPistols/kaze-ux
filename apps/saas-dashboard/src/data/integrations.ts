export type IntegrationStatus =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'pending'

export type Integration = {
  id: string
  name: string
  description: string
  icon: string
  status: IntegrationStatus
  lastSync?: string
  category: string
}

export const integrations: Integration[] = [
  {
    id: 'int1',
    name: 'Slack',
    description:
      'Team messaging and notifications. Get project updates directly in your channels.',
    icon: 'slack',
    status: 'connected',
    lastSync: '2025-03-24T10:00:00',
    category: 'Communication',
  },
  {
    id: 'int2',
    name: 'GitHub',
    description:
      'Source code management. Link commits and PRs to projects and tasks.',
    icon: 'github',
    status: 'connected',
    lastSync: '2025-03-24T09:30:00',
    category: 'Development',
  },
  {
    id: 'int3',
    name: 'AWS',
    description:
      'Cloud infrastructure. Monitor and manage cloud resources from dashboard.',
    icon: 'aws',
    status: 'connected',
    lastSync: '2025-03-24T08:00:00',
    category: 'Infrastructure',
  },
  {
    id: 'int4',
    name: 'Jira',
    description:
      'Issue tracking and agile boards. Sync tasks and sprints bidirectionally.',
    icon: 'jira',
    status: 'disconnected',
    category: 'Project Management',
  },
  {
    id: 'int5',
    name: 'Google Drive',
    description:
      'File storage and collaboration. Attach documents to projects and contacts.',
    icon: 'google-drive',
    status: 'error',
    lastSync: '2025-03-20T12:00:00',
    category: 'Storage',
  },
  {
    id: 'int6',
    name: 'Stripe',
    description:
      'Payment processing. Auto-generate invoices and track payments in real-time.',
    icon: 'stripe',
    status: 'connected',
    lastSync: '2025-03-24T10:15:00',
    category: 'Finance',
  },
]
