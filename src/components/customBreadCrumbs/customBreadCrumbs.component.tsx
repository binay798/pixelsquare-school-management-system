import { useLocation, Link as RouterLink } from 'react-router-dom'
import { Breadcrumbs, Link, Typography } from '@mui/material'

export const CustomBreadCrumbs = () => {
  const location = useLocation()
  // Split the URL pathname and filter out empty strings.
  const pathnames = location.pathname.split('/').filter((x) => x)

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {/* Always include a link to the home page */}
      {/* <Link component={RouterLink} underline="hover" color="inherit" to="/">
        Home
      </Link> */}
      {pathnames.map((value, index) => {
        // Build the path to this breadcrumb.
        const to = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        // Optionally, format the string (e.g., capitalize the first letter).
        const formattedValue = value.charAt(0).toUpperCase() + value.slice(1)
        return isLast ? (
          <Typography color="text.primary" key={to}>
            {formattedValue}
          </Typography>
        ) : (
          <Link
            component={RouterLink}
            underline="hover"
            color="inherit"
            to={to}
            key={to}
          >
            {formattedValue}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}
