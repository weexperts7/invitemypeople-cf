import { useIsDemoPage } from '../context/DemoPageContext'

// The couple's or family's name at the top of an invitation. A heading on a
// real invitation, plain text on a public demo page, where the sample names
// must not compete with the page's real H1. See DemoPageContext.js.
export default function NameHeading({ as: Tag = 'h1', ...props }) {
  const isDemo = useIsDemoPage()
  const Component = isDemo ? 'p' : Tag
  return <Component {...props} />
}
