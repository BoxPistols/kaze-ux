import BarChartIcon from '@mui/icons-material/BarChart'
import DownloadIcon from '@mui/icons-material/Download'
import PieChartIcon from '@mui/icons-material/PieChart'
import PrintIcon from '@mui/icons-material/Print'
import ShareIcon from '@mui/icons-material/Share'
import TableChartIcon from '@mui/icons-material/TableChart'
import TimelineIcon from '@mui/icons-material/Timeline'
import { Box, Grid, Typography } from '@mui/material'

import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { SplitButton } from '@/components/ui/split-button'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import { invoices } from '~/data/invoices'
import { projects } from '~/data/projects'

const chartOptions = [
  { value: 'bar', label: 'Bar', icon: <BarChartIcon fontSize='small' /> },
  { value: 'pie', label: 'Pie', icon: <PieChartIcon fontSize='small' /> },
  { value: 'line', label: 'Line', icon: <TimelineIcon fontSize='small' /> },
  { value: 'table', label: 'Table', icon: <TableChartIcon fontSize='small' /> },
]

const ReportsPage = () => {
  const activeProjects = projects.filter((p) => p.status === 'active').length
  const completedProjects = projects.filter(
    (p) => p.status === 'completed'
  ).length
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0)
  const paidInvoices = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0)
  const pendingInvoices = invoices
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + i.amount, 0)
  const overdueInvoices = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0)

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title='Reports' subtitle='Analytics and business insights.'>
        <SplitButton
          label='Export'
          icon={<DownloadIcon fontSize='small' />}
          onClick={() => toast.success('Report exported as PDF')}
          options={[
            {
              value: 'csv',
              label: 'Export as CSV',
              icon: <TableChartIcon fontSize='small' />,
            },
            {
              value: 'print',
              label: 'Print Report',
              icon: <PrintIcon fontSize='small' />,
            },
            {
              value: 'share',
              label: 'Share Report',
              icon: <ShareIcon fontSize='small' />,
            },
          ]}
          onOptionClick={(opt) => toast.info(`${opt.label}`)}
          variant='outlined'
        />
      </PageHeader>

      <Box sx={{ mb: 3 }}>
        <ButtonGroup
          options={chartOptions}
          value='bar'
          onChange={(v) => toast.info(`Chart type: ${v}`)}
          size='small'
        />
      </Box>

      <Grid container spacing={3}>
        {/* Project Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Active Projects
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {activeProjects}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Completed Projects
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {completedProjects}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Projects
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {projects.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Budget
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    ¥{(totalBudget / 1000000).toFixed(1)}M
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Spent
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    ¥{(totalSpent / 1000000).toFixed(1)}M
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Budget Utilization
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {((totalSpent / totalBudget) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Invoices
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {invoices.length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Paid Amount
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, color: 'success.main' }}>
                    ¥{(paidInvoices / 1000000).toFixed(1)}M
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Pending Amount
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, color: 'warning.main' }}>
                    ¥{(pendingInvoices / 1000000).toFixed(1)}M
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Overdue Amount
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, color: 'error.main' }}>
                    ¥{(overdueInvoices / 1000000).toFixed(1)}M
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart Placeholder */}
        <Grid size={12}>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <Box
                sx={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                }}>
                <Box sx={{ textAlign: 'center' }}>
                  <BarChartIcon
                    sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3 }}
                  />
                  <Typography color='text.secondary' sx={{ mt: 1 }}>
                    Chart visualization placeholder
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Integrate with your preferred charting library
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ReportsPage
