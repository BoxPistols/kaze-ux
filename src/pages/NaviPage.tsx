// NaviPage.tsx
import { Box } from '@mui/material'

import MainGrid from '@/components/MainGrid'
import { CustomTableExample } from '@/components/Table/mock/ExampleTable'

const NaviPage = () => {
  return (
    <div>
      <MainGrid overview='Navi'>
        <Box>
          <h1>This is Navi Page</h1>
        </Box>
        <CustomTableExample />
      </MainGrid>
    </div>
  )
}

export default NaviPage
