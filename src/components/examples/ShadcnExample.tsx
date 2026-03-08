/**
 * Example component demonstrating shadcn-like utility-first approach with MUI
 * Shows how to use Tailwind className instead of MUI sx props
 * Note: This is NOT shadcn/ui itself, but inspired by its design philosophy
 */

import { Box } from '@mui/material'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui'

export const ShadcnExample = () => {
  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>
          shadcn-like + MUI Integration
        </h1>
        <p className='text-muted-foreground'>
          Pure Tailwind CSS utility-first approach with MUI components (inspired
          by shadcn/ui design philosophy)
        </p>
      </div>

      {/* Button Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>
            shadcn-like button components built on MUI with pure Tailwind CSS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <Button variant='default'>Default</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='destructive'>Destructive</Button>
            <Button variant='outline'>Outline</Button>
            <Button variant='ghost'>Ghost</Button>
            <Button variant='link'>Link</Button>
          </div>
        </CardContent>
      </Card>

      {/* Layout Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Layout with className</CardTitle>
          <CardDescription>
            MUI Box components using Tailwind classes instead of sx props
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Before: <Box sx={{ display: 'flex', gap: 2, p: 3 }}> */}
          <Box className='flex gap-2 p-6'>
            <div className='bg-primary-main text-white p-4 rounded-lg'>
              Primary Color Box
            </div>
            <div className='bg-secondary-main text-white p-4 rounded-lg'>
              Secondary Color Box
            </div>
            <div className='bg-error-main text-white p-4 rounded-lg'>
              Error Color Box
            </div>
          </Box>
        </CardContent>
      </Card>

      {/* Grid Layout Example */}
      <Card>
        <CardHeader>
          <CardTitle>Grid Layout</CardTitle>
          <CardDescription>
            Responsive grid using Tailwind classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className='p-4'>
                <h3 className='font-semibold mb-2'>Grid Item {item}</h3>
                <p className='text-sm text-muted-foreground'>
                  This is a grid item using Tailwind responsive classes.
                </p>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Utility Class Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Utility Classes</CardTitle>
          <CardDescription>
            Common utility patterns converted from MUI sx props
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Before: sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} */}
            <Box className='flex items-center justify-between p-4 border rounded-lg'>
              <span>Flex with center alignment</span>
              <Button size='sm'>Action</Button>
            </Box>

            {/* Before: sx={{ mt: 2, mb: 4, p: 3 }} */}
            <Box className='mt-4 mb-8 p-6 bg-gray-50 rounded-lg'>
              <p>Spacing utilities: mt-4 mb-8 p-6</p>
            </Box>

            {/* Before: sx={{ width: '100%', height: '200px' }} */}
            <Box className='w-full h-50 bg-gradient-to-r from-primary-main to-secondary-main rounded-lg flex items-center justify-center text-white'>
              <p>Full width with fixed height</p>
            </Box>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ShadcnExample
