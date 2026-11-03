import { createHashRouter, RouterProvider } from 'react-router-dom'
import { SiteLayout } from './layouts/SiteLayout'
import { Home } from './pages/Home'
import { Design } from './pages/Design'
import { Chapter } from './pages/Chapter'
import { Experiments } from './pages/Experiments'
import { ExperimentDetail } from './pages/ExperimentDetail'
import { Glossary } from './pages/Glossary'
import { Walkthroughs } from './pages/Walkthroughs'
import { WalkthroughDetail } from './pages/WalkthroughDetail'
import { Reference } from './pages/Reference'
import { ReferenceDetail } from './pages/ReferenceDetail'
import { Learning } from './pages/Learning'
import { Placeholder } from './pages/Placeholder'

/* 语言路由：zh 在根，en 镜像在 /en 前缀下（#/en/… 可分享）；组件内经 useLocale() 取语言 */
const router = createHashRouter([
  {
    element: <SiteLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/design', element: <Design /> },
      { path: '/chapter/:slug', element: <Chapter /> },
      { path: '/experiments', element: <Experiments /> },
      { path: '/experiments/:id', element: <ExperimentDetail /> },
      { path: '/walkthroughs', element: <Walkthroughs /> },
      { path: '/walkthroughs/:slug', element: <WalkthroughDetail /> },
      { path: '/reference', element: <Reference /> },
      { path: '/reference/:projectId', element: <ReferenceDetail /> },
      { path: '/learning', element: <Learning /> },
      { path: '/glossary', element: <Glossary /> },
      { path: '/en', element: <Home /> },
      { path: '/en/chapter/:slug', element: <Chapter /> },
      { path: '/en/experiments', element: <Experiments /> },
      { path: '/en/experiments/:id', element: <ExperimentDetail /> },
      { path: '/en/walkthroughs', element: <Walkthroughs /> },
      { path: '/en/walkthroughs/:slug', element: <WalkthroughDetail /> },
      { path: '/en/reference', element: <Reference /> },
      { path: '/en/reference/:projectId', element: <ReferenceDetail /> },
      { path: '/en/learning', element: <Learning /> },
      { path: '/en/glossary', element: <Glossary /> },
      { path: '*', element: <Placeholder /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
