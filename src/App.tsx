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
      { path: '*', element: <Placeholder title="Agent 走丢了" note="404 · 这个路径不在上下文里" /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
