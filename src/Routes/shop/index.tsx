import React, { ReactElement } from 'react'
import useStargate from 'Utilities/Hooks/useStargate'
import Loader from 'Components/Rudimentary/Loader'
import { Redirect, useLocation } from 'react-router-dom'
import Instructions from './Instructions'
import FourOhFour from 'Components/Rudimentary/404'
import { Route } from 'Utilities/Route'
import { useTableOfContents } from 'Components/Stargate/TableOfContents'
import { Label, obeliskMode } from 'Utilities/config'
import { useWhiteLabelFromSearchParams } from 'Utilities/Hooks/useWhiteLabel'
import { PowerLevel } from 'Utilities/Hooks/useUser'

const ShopHome: React.FC = () => {
  const { furthestChapter } = useTableOfContents()
  const async = useStargate()
  const location = useLocation()
  let label = useWhiteLabelFromSearchParams()?.url || Label.myhealthily
  if (async.loading) return <Loader />
  const stargate = async.value

  label = stargate?.label || label
  localStorage.label = label
  const isObelisk = obeliskMode(label)
  const slug = stargate?.obelisk.slug || 'myhealthily'
  delete localStorage.slug

  // FUCK ME. COMPLEXITY. (See also above)
  const match = location.pathname.match(/\/shop\/([^/]+)/) || []
  // eslint-disable-next-line camelcase
  const isEmployee = (stargate?.user.power_level || PowerLevel.individual) < PowerLevel.groupManager

  switch (match[1]) {
  case undefined:
    if (isObelisk) {
      if (slug) return <Redirect to={`/shop/${slug}`} />
      return <Redirect to='/' />
    }
    return <Instructions {...async} />
  case 'employee':
    if (stargate?.hasActiveQLE) { return <Redirect to={Route.eeStargate_info} /> }
    // fallthrough intentional here
  case 'employer': // eslint-disable-line no-fallthrough
    return standardRedirect()
  default: // eslint-disable-line no-fallthrough
    if (isObelisk) {
      localStorage.slug = match[1]
      if (!localStorage.token) return <Instructions {...async} />
      return <Redirect to={`/shop/${isEmployee ? 'employee' : 'employer'}`} />
    } else if (match[1] === slug) return standardRedirect()
    return <FourOhFour />
  }

  function standardRedirect(): ReactElement {
    if (!localStorage.token) return <Instructions {...async} />

    if (furthestChapter) return <Redirect to={furthestChapter} />
    if (isObelisk) return <Redirect to={`/shop/${stargate?.obelisk.slug}`} />
    return <Redirect to={'/shop/employer/group-type'} />
  }
}

export default ShopHome
