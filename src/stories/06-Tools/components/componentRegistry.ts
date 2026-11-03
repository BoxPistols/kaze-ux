// コンポーネント名 → React.ComponentType マッピング

import {
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Switch,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  IconButton,
  Badge,
} from '@mui/material'

import { CustomSelect } from '../../../components/Form/CustomSelect'
import { CustomTextField } from '../../../components/Form/CustomTextField'
import { CustomAccordion } from '../../../components/ui/accordion/customAccordion'
import { UserAvatar } from '../../../components/ui/avatar/userAvatar'
import { Button } from '../../../components/ui/Button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../../../components/ui/Card'
import { StatusTag } from '../../../components/ui/tag/statusTag'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>

// レジストリ: 文字列名 → 実コンポーネント
export const COMPONENT_REGISTRY: Record<string, AnyComponent> = {
  // kaze-ux
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CustomTextField,
  CustomSelect,
  StatusTag,
  UserAvatar,
  CustomAccordion,
  // MUI
  Alert,
  Avatar,
  Badge,
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
}

// パレット表示用: カテゴリ分類
export const PALETTE_CATEGORIES = [
  {
    label: 'Layout',
    components: ['Box', 'Stack', 'Grid', 'Paper', 'Divider'],
  },
  {
    label: 'UI',
    components: [
      'Button',
      'Card',
      'CardHeader',
      'CardTitle',
      'CardDescription',
      'CardContent',
      'CardFooter',
      'Chip',
      'Alert',
      'Badge',
      'Avatar',
      'UserAvatar',
      'StatusTag',
      'LinearProgress',
      'CustomAccordion',
      'IconButton',
    ],
  },
  {
    label: 'Form',
    components: [
      'CustomTextField',
      'CustomSelect',
      'TextField',
      'Checkbox',
      'Switch',
      'Radio',
      'RadioGroup',
      'FormControl',
      'FormControlLabel',
      'FormLabel',
    ],
  },
  {
    label: 'Data',
    components: [
      'Typography',
      'List',
      'ListItem',
      'ListItemText',
      'ListItemAvatar',
    ],
  },
]
