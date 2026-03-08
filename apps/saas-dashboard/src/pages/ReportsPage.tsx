import BarChartIcon from '@mui/icons-material/BarChart'
import DownloadIcon from '@mui/icons-material/Download'
import PieChartIcon from '@mui/icons-material/PieChart'
import PrintIcon from '@mui/icons-material/Print'
import ShareIcon from '@mui/icons-material/Share'
import TableChartIcon from '@mui/icons-material/TableChart'
import TimelineIcon from '@mui/icons-material/Timeline'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, Grid, LinearProgress, Typography } from '@mui/material'

import { ButtonGroup } from '@/components/ui/button-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CustomChip } from '@/components/ui/chip'
import { SplitButton } from '@/components/ui/split-button'
import { PageHeader } from '@/components/ui/text'
import { toast } from '@/components/ui/toast'

import { invoices } from '~/data/invoices'
import { projects } from '~/data/projects'

const chartOptions = [
  {
    value: 'bar',
    label: 'Bar',
    icon: <BarChartIcon fontSize='small' aria-hidden='true' />,
  },
  {
    value: 'pie',
    label: 'Pie',
    icon: <PieChartIcon fontSize='small' aria-hidden='true' />,
  },
  {
    value: 'line',
    label: 'Line',
    icon: <TimelineIcon fontSize='small' aria-hidden='true' />,
  },
  {
    value: 'table',
    label: 'Table',
    icon: <TableChartIcon fontSize='small' aria-hidden='true' />,
  },
]

export const ReportsPage = () => {
  const activeProjects = projects.filter((p) => p.status === 'active').length
  const completedProjects = projects.filter(
    (p) => p.status === 'completed'
  ).length
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0)
  const budgetUtil = (totalSpent / totalBudget) * 100
  const paidInvoices = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0)
  const pendingInvoices = invoices
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + i.amount, 0)
  const overdueInvoices = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0)
  const totalInvoiceAmount = paidInvoices + pendingInvoices + overdueInvoices

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader title='Reports' subtitle='Analytics and business insights.'>
        <SplitButton
          label='Export'
          icon={<DownloadIcon fontSize='small' aria-hidden='true' />}
          onClick={() => toast.success('Report exported as PDF')}
          options={[
            {
              value: 'csv',
              label: 'Export as CSV',
              icon: <TableChartIcon fontSize='small' aria-hidden='true' />,
            },
            {
              value: 'print',
              label: 'Print Report',
              icon: <PrintIcon fontSize='small' aria-hidden='true' />,
            },
            {
              value: 'share',
              label: 'Share Report',
              icon: <ShareIcon fontSize='small' aria-hidden='true' />,
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Active Projects
                  </Typography>
                  <CustomChip
                    label={String(activeProjects)}
                    size='small'
                    color='primary'
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Completed Projects
                  </Typography>
                  <CustomChip
                    label={String(completedProjects)}
                    size='small'
                    color='success'
                  />
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
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}>
                    <Typography variant='body2' color='text.secondary'>
                      Budget Utilization
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {budgetUtil.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={budgetUtil}
                    sx={{ height: 8, borderRadius: 4 }}
                    color={
                      budgetUtil > 90
                        ? 'error'
                        : budgetUtil > 70
                          ? 'warning'
                          : 'primary'
                    }
                  />
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Total Invoices
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {invoices.length}
                  </Typography>
                </Box>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}>
                    <Typography variant='body2' color='text.secondary'>
                      Paid
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ fontWeight: 600, color: 'success.main' }}>
                      ¥{(paidInvoices / 1000000).toFixed(1)}M
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={(paidInvoices / totalInvoiceAmount) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                    color='success'
                  />
                </Box>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}>
                    <Typography variant='body2' color='text.secondary'>
                      Pending
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ fontWeight: 600, color: 'warning.main' }}>
                      ¥{(pendingInvoices / 1000000).toFixed(1)}M
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={(pendingInvoices / totalInvoiceAmount) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                    color='warning'
                  />
                </Box>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}>
                    <Typography variant='body2' color='text.secondary'>
                      Overdue
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ fontWeight: 600, color: 'error.main' }}>
                      ¥{(overdueInvoices / 1000000).toFixed(1)}M
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={(overdueInvoices / totalInvoiceAmount) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                    color='error'
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Trend Chart Placeholder */}
        <Grid size={12}>
          <Card>
            <CardHeader>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <CardTitle>Revenue Trend</CardTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <TrendingUpIcon
                    sx={{ fontSize: 18, color: 'success.main' }}
                    aria-hidden='true'
                  />
                  <Typography
                    variant='caption'
                    sx={{ color: 'success.main', fontWeight: 600 }}>
                    +12.5% vs last quarter
                  </Typography>
                </Box>
              </Box>
            </CardHeader>
            <CardContent>
              {/* Simulated bar chart with progress bars */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { month: 'Jan', value: 75, amount: '¥4.8M' },
                  { month: 'Feb', value: 88, amount: '¥6.6M' },
                  { month: 'Mar', value: 65, amount: '¥5.2M' },
                  { month: 'Apr', value: 92, amount: '¥7.2M' },
                  { month: 'May', value: 78, amount: '¥5.9M' },
                  { month: 'Jun', value: 95, amount: '¥8.1M' },
                ].map((item) => (
                  <Box
                    key={item.month}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 500,
                        minWidth: 32,
                        color: 'text.secondary',
                      }}>
                      {item.month}
                    </Typography>
                    <LinearProgress
                      variant='determinate'
                      value={item.value}
                      sx={{
                        flex: 1,
                        height: 24,
                        borderRadius: 1.5,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.04)',
                      }}
                    />
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 600,
                        minWidth: 56,
                        textAlign: 'right',
                      }}>
                      {item.amount}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                Integrate with your preferred charting library for interactive
                visualizations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
