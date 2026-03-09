import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { describe, it, expect } from 'vitest'

import { Button } from '../Button'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../Card'
import { CustomButton } from '../CustomButton'
import { CustomChip } from '../chip'
import { StatusTag } from '../tag'
import { CustomAccordion } from '../accordion'
import { UserAvatar } from '../avatar'
import { SaveButton } from '../button/saveButton'
import { LoadingButton } from '../button/loadingButton'
import { IconButton } from '../icon-button'
import { Fab } from '../fab'
import { Pagination } from '../pagination'
import { CustomTooltip } from '../tooltip'
import { PageTitle, PageHeader, SectionTitle } from '../text'
import { ResizableDivider } from '../ResizableDivider'
import { ServiceCard } from '../card/serviceCard'
import SettingsIcon from '@mui/icons-material/Settings'

const theme = createTheme()

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

describe('UI コンポーネント スモークテスト', () => {
  // --- Base Components ---

  describe('Button', () => {
    it('renders without crashing', () => {
      render(
        <Wrapper>
          <Button>Click me</Button>
        </Wrapper>
      )
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('renders all variants', () => {
      const variants = [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ] as const
      for (const variant of variants) {
        const { unmount } = render(
          <Wrapper>
            <Button variant={variant}>{variant}</Button>
          </Wrapper>
        )
        expect(screen.getByText(variant)).toBeInTheDocument()
        unmount()
      }
    })
  })

  describe('Card', () => {
    it('renders with all subcomponents', () => {
      render(
        <Wrapper>
          <Card>
            <CardHeader>
              <CardTitle>Title</CardTitle>
              <CardDescription>Description</CardDescription>
            </CardHeader>
            <CardContent>Content</CardContent>
          </Card>
        </Wrapper>
      )
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('CustomButton', () => {
    it('renders without crashing', () => {
      render(
        <Wrapper>
          <CustomButton>Custom</CustomButton>
        </Wrapper>
      )
      expect(screen.getByText('Custom')).toBeInTheDocument()
    })
  })

  // --- Chip / Tag ---

  describe('CustomChip', () => {
    it('renders with label', () => {
      render(
        <Wrapper>
          <CustomChip label='Active' />
        </Wrapper>
      )
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  describe('StatusTag', () => {
    it('renders all statuses', () => {
      const statuses = [
        'draft',
        'submitted',
        'approved',
        'rejected',
        'pending',
        'active',
        'inactive',
      ] as const
      for (const status of statuses) {
        const { unmount } = render(
          <Wrapper>
            <StatusTag text={status} status={status} />
          </Wrapper>
        )
        expect(screen.getByText(status)).toBeInTheDocument()
        unmount()
      }
    })
  })

  // --- Text ---

  describe('PageTitle', () => {
    it('renders without crashing', () => {
      render(
        <Wrapper>
          <PageTitle>Page Title</PageTitle>
        </Wrapper>
      )
      expect(screen.getByText('Page Title')).toBeInTheDocument()
    })
  })

  describe('PageHeader', () => {
    it('renders title and subtitle', () => {
      render(
        <Wrapper>
          <PageHeader title='Header' subtitle='Sub' />
        </Wrapper>
      )
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Sub')).toBeInTheDocument()
    })
  })

  describe('SectionTitle', () => {
    it('renders without crashing', () => {
      render(
        <Wrapper>
          <SectionTitle>Section</SectionTitle>
        </Wrapper>
      )
      expect(screen.getByText('Section')).toBeInTheDocument()
    })
  })

  // --- Avatar ---

  describe('UserAvatar', () => {
    it('renders with default single initial', () => {
      render(
        <Wrapper>
          <UserAvatar name='Takeshi Yamada' />
        </Wrapper>
      )
      expect(screen.getByText('T')).toBeInTheDocument()
    })

    it('renders with two initials when maxChars=2', () => {
      render(
        <Wrapper>
          <UserAvatar name='Takeshi Yamada' maxChars={2} />
        </Wrapper>
      )
      expect(screen.getByText('TY')).toBeInTheDocument()
    })
  })

  // --- Buttons ---

  describe('SaveButton', () => {
    it('renders without crashing', () => {
      render(
        <Wrapper>
          <SaveButton />
        </Wrapper>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('LoadingButton', () => {
    it('renders without crashing', () => {
      render(
        <Wrapper>
          <LoadingButton>Save</LoadingButton>
        </Wrapper>
      )
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
  })

  describe('IconButton', () => {
    it('renders with icon', () => {
      render(
        <Wrapper>
          <IconButton icon={<SettingsIcon />} tooltip='Settings' />
        </Wrapper>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Fab', () => {
    it('renders without crashing', () => {
      render(
        <Wrapper>
          <Fab icon={<SettingsIcon />} />
        </Wrapper>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  // --- Accordion ---

  describe('CustomAccordion', () => {
    it('renders summary', () => {
      render(
        <Wrapper>
          <CustomAccordion summary='Summary' details='Details' />
        </Wrapper>
      )
      expect(screen.getByText('Summary')).toBeInTheDocument()
    })
  })

  // --- Tooltip ---

  describe('CustomTooltip', () => {
    it('renders children', () => {
      render(
        <Wrapper>
          <CustomTooltip title='Tip'>
            <span>Hover me</span>
          </CustomTooltip>
        </Wrapper>
      )
      expect(screen.getByText('Hover me')).toBeInTheDocument()
    })
  })

  // --- Pagination ---

  describe('Pagination', () => {
    it('renders without crashing', () => {
      const items = Array.from({ length: 50 }, (_, i) => i)
      render(
        <Wrapper>
          <Pagination
            items={items}
            currentPage={1}
            pageSize={10}
            onPageChange={() => {}}
            onPageSizeChange={() => {}}>
            {({ pageItems }) => <div>{pageItems.length} items</div>}
          </Pagination>
        </Wrapper>
      )
      expect(screen.getByText('10 items')).toBeInTheDocument()
    })
  })

  // --- ServiceCard ---

  describe('ServiceCard', () => {
    it('renders title and description', () => {
      render(
        <Wrapper>
          <ServiceCard
            title='Service'
            description='A description'
            icon={<SettingsIcon />}
          />
        </Wrapper>
      )
      expect(screen.getByText('Service')).toBeInTheDocument()
      expect(screen.getByText('A description')).toBeInTheDocument()
    })
  })

  // --- ResizableDivider ---

  describe('ResizableDivider', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <Wrapper>
          <ResizableDivider onResize={() => {}} />
        </Wrapper>
      )
      expect(container.firstChild).toBeTruthy()
    })
  })
})
