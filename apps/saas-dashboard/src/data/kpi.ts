import { contacts } from './contacts'
import { projects } from './projects'

export type KpiCard = {
  id: string
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: 'projects' | 'contacts' | 'revenue' | 'tasks'
}

const activeProjects = projects.filter((p) => p.status === 'active').length
const activeContacts = contacts.filter((c) => c.status === 'active').length
const totalRevenue = projects.reduce((sum, p) => sum + p.budget, 0)
const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0)

export const kpiCards: KpiCard[] = [
  {
    id: 'kpi-projects',
    title: 'Active Projects',
    value: activeProjects,
    change: 12,
    changeLabel: 'vs last month',
    icon: 'projects',
  },
  {
    id: 'kpi-contacts',
    title: 'Active Contacts',
    value: activeContacts,
    change: 8,
    changeLabel: 'vs last month',
    icon: 'contacts',
  },
  {
    id: 'kpi-revenue',
    title: 'Total Budget',
    value: `¥${(totalRevenue / 1000000).toFixed(1)}M`,
    change: 15,
    changeLabel: 'vs last quarter',
    icon: 'revenue',
  },
  {
    id: 'kpi-tasks',
    title: 'Total Tasks',
    value: totalTasks,
    change: -3,
    changeLabel: 'vs last week',
    icon: 'tasks',
  },
]
