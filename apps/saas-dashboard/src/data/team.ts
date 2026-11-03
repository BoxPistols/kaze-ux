export type TeamMember = {
  id: string
  name: string
  email: string
  role: string
  department: string
  avatar?: string
  status: 'online' | 'offline' | 'busy' | 'away'
  joinedAt: string
  phone: string
}

export const teamMembers: TeamMember[] = [
  {
    id: 't1',
    name: 'Takeshi Yamada',
    email: 'takeshi@example.com',
    role: 'CEO',
    department: 'Executive',
    status: 'online',
    joinedAt: '2020-01-15',
    phone: '03-1234-5678',
  },
  {
    id: 't2',
    name: 'Yuki Tanaka',
    email: 'yuki@example.com',
    role: 'CTO',
    department: 'Engineering',
    status: 'online',
    joinedAt: '2020-03-01',
    phone: '03-2345-6789',
  },
  {
    id: 't3',
    name: 'Kenji Suzuki',
    email: 'kenji@example.com',
    role: 'Lead Engineer',
    department: 'Engineering',
    status: 'busy',
    joinedAt: '2021-06-12',
    phone: '03-3456-7890',
  },
  {
    id: 't4',
    name: 'Mika Watanabe',
    email: 'mika@example.com',
    role: 'Designer',
    department: 'Design',
    status: 'online',
    joinedAt: '2021-09-01',
    phone: '03-4567-8901',
  },
  {
    id: 't5',
    name: 'Ryo Ito',
    email: 'ryo@example.com',
    role: 'Frontend Developer',
    department: 'Engineering',
    status: 'away',
    joinedAt: '2022-01-10',
    phone: '03-5678-9012',
  },
  {
    id: 't6',
    name: 'Aoi Nakamura',
    email: 'aoi@example.com',
    role: 'Backend Developer',
    department: 'Engineering',
    status: 'online',
    joinedAt: '2022-04-15',
    phone: '03-6789-0123',
  },
  {
    id: 't7',
    name: 'Hana Kobayashi',
    email: 'hana@example.com',
    role: 'Product Manager',
    department: 'Product',
    status: 'online',
    joinedAt: '2021-11-20',
    phone: '03-7890-1234',
  },
  {
    id: 't8',
    name: 'Daichi Saito',
    email: 'daichi@example.com',
    role: 'Sales Manager',
    department: 'Sales',
    status: 'offline',
    joinedAt: '2022-07-01',
    phone: '03-8901-2345',
  },
  {
    id: 't9',
    name: 'Sakura Yoshida',
    email: 'sakura@example.com',
    role: 'Marketing Lead',
    department: 'Marketing',
    status: 'online',
    joinedAt: '2023-02-14',
    phone: '03-9012-3456',
  },
  {
    id: 't10',
    name: 'Haruto Kato',
    email: 'haruto@example.com',
    role: 'DevOps Engineer',
    department: 'Engineering',
    status: 'busy',
    joinedAt: '2023-05-08',
    phone: '03-0123-4567',
  },
]
