export type ActivityType =
  | 'project'
  | 'contact'
  | 'task'
  | 'invoice'
  | 'team'
  | 'system'

export type Activity = {
  id: string
  type: ActivityType
  message: string
  user: string
  timestamp: string
}

export const activities: Activity[] = [
  {
    id: 'a1',
    type: 'project',
    message: 'Created project "Website Redesign"',
    user: 'Yuki Tanaka',
    timestamp: '2025-03-24T14:30:00',
  },
  {
    id: 'a2',
    type: 'task',
    message: 'Completed task "Design wireframes"',
    user: 'Mika Watanabe',
    timestamp: '2025-03-24T13:15:00',
  },
  {
    id: 'a3',
    type: 'contact',
    message: 'Added new contact Taro Sato from Acme Corp',
    user: 'Daichi Saito',
    timestamp: '2025-03-24T11:45:00',
  },
  {
    id: 'a4',
    type: 'invoice',
    message: 'Invoice #INV-2025-012 sent to Globex Inc',
    user: 'Takeshi Yamada',
    timestamp: '2025-03-24T10:20:00',
  },
  {
    id: 'a5',
    type: 'team',
    message: 'Haruto Kato joined Engineering team',
    user: 'Yuki Tanaka',
    timestamp: '2025-03-23T16:00:00',
  },
  {
    id: 'a6',
    type: 'project',
    message: 'Updated status of "Mobile App v2" to Active',
    user: 'Kenji Suzuki',
    timestamp: '2025-03-23T14:30:00',
  },
  {
    id: 'a7',
    type: 'task',
    message: 'Assigned "API integration" to Aoi Nakamura',
    user: 'Yuki Tanaka',
    timestamp: '2025-03-23T13:00:00',
  },
  {
    id: 'a8',
    type: 'contact',
    message: 'Updated contact info for Koji Inoue',
    user: 'Daichi Saito',
    timestamp: '2025-03-23T11:30:00',
  },
  {
    id: 'a9',
    type: 'system',
    message: 'System backup completed successfully',
    user: 'System',
    timestamp: '2025-03-23T06:00:00',
  },
  {
    id: 'a10',
    type: 'project',
    message: 'Completed project "Security Audit"',
    user: 'Haruto Kato',
    timestamp: '2025-03-22T17:00:00',
  },
  {
    id: 'a11',
    type: 'invoice',
    message: 'Payment received for Invoice #INV-2025-008',
    user: 'System',
    timestamp: '2025-03-22T15:30:00',
  },
  {
    id: 'a12',
    type: 'task',
    message: 'Started task "Database migration"',
    user: 'Aoi Nakamura',
    timestamp: '2025-03-22T10:00:00',
  },
  {
    id: 'a13',
    type: 'contact',
    message: 'Meeting scheduled with Ichiro Hasegawa',
    user: 'Hana Kobayashi',
    timestamp: '2025-03-21T16:45:00',
  },
  {
    id: 'a14',
    type: 'team',
    message: 'Sakura Yoshida promoted to Marketing Lead',
    user: 'Takeshi Yamada',
    timestamp: '2025-03-21T14:00:00',
  },
  {
    id: 'a15',
    type: 'project',
    message: 'Budget approved for "CRM Integration"',
    user: 'Takeshi Yamada',
    timestamp: '2025-03-21T11:30:00',
  },
  {
    id: 'a16',
    type: 'task',
    message: 'Code review completed for "Auth module"',
    user: 'Kenji Suzuki',
    timestamp: '2025-03-20T15:00:00',
  },
  {
    id: 'a17',
    type: 'contact',
    message: 'Sent proposal to Yumi Matsumoto',
    user: 'Daichi Saito',
    timestamp: '2025-03-20T13:00:00',
  },
  {
    id: 'a18',
    type: 'system',
    message: 'SSL certificates renewed',
    user: 'System',
    timestamp: '2025-03-20T04:00:00',
  },
  {
    id: 'a19',
    type: 'project',
    message: 'Milestone reached: Design System at 80%',
    user: 'Mika Watanabe',
    timestamp: '2025-03-19T16:30:00',
  },
  {
    id: 'a20',
    type: 'invoice',
    message: 'Invoice #INV-2025-011 overdue - Reminder sent',
    user: 'System',
    timestamp: '2025-03-19T09:00:00',
  },
]
