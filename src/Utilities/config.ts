export enum Label {
  dohc = 'app.dentalofficehealthcare.com',
  dhc = 'app.designershealthcare.com',
  fbhc = 'app.farmbureauhealthcare.com',
  gmhc = 'app.gamemanufacturershealthcare.com',
  jhc = 'app.jewelershealthcare.com',
  mhc = 'app.manufacturershealthcare.com',
  myhealthily = 'app.myhealthily.com',
  njchc = 'app.chambersofnjhealthcare.com',
  pmhc = 'app.propertymanagershealthcare.com',
  rhc = 'app.realtyhealthcare.com',
  rns = 'app.rightnowsolution.care',
  yahc = 'app.yourassociationhealthcare.com',
  blacksmith = 'blacksmith.candor.insurance',
  brokers = 'brokers.candor.insurance',
  get = 'get.candor.insurance',
  simulacra = 'simulacra.candor.insurance',
  mphc = 'app.meatprocessorshealthcare.com',
  frhc = 'app.firstrespondershealthcare.com',
  nprahc = 'app.nprahealthcare.com',
  naps = 'app.naps360healthcare.com',
  ohrhc = 'app.ohrealtyhealthcare.com',
  giggity = 'app.giggicare.com',
  pda = 'app.pdahealthcare.com',
  facp = 'app.chambersofflhealthcare.com',
  veccs = 'app.veccshealthcare.com',
  biank = 'app.buildersnkyhealthcare.com',
}

export enum Host {
  localhost,
  cd, // ------ cd.myhealthily.com
  develop, // - develop.myhealthily.com
  staging, // - staging.myhealthily.com
  production // app.myhealthily.com
}

export function host(): Host {
  try {
    switch (window.location.hostname) {
    case 'localhost':
    case '0.0.0.0':
    case '127.0.0.1':
      return Host.localhost
    case 'cd.myhealthily.com':
      return Host.cd
    case 'develop.myhealthily.com':
      return Host.develop
    case 'staging.myhealthily.com':
      return Host.staging
    default:
      if (process.env.NODE_ENV === 'development') {
        // for Ayman doing network testing
        return Host.localhost
      } else {
        return Host.production
      }
    }
  } catch {
    // we're a node script
    return Host.production
  }
}

enum Pharaoh {
  production = 'https://pharaoh.candor-usa.com',
  develop = 'https://develop.pharaoh.candor-usa.com',
  staging = 'https://staging.pharaoh.candor-usa.com',
}

export function isProduction() {
  return host() === Host.production
}

export function pharaoh(path?: string): string {
  switch (host()) {
  case Host.localhost:
    return (path?.startsWith('/v4') ? process.env.REACT_APP_NU : process.env.REACT_APP_PHARAOH) || Pharaoh.develop
  case Host.cd:
  case Host.develop:
    return Pharaoh.develop
  case Host.staging:
    return Pharaoh.staging
  case Host.production:
    return Pharaoh.production
  }
}

/** Install Google Analytics Debugger Chrome extension for testing GA code
 * https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna
 */
export function analytics() {
  function trackers() {
    switch (host()) {
    case Host.production:
      return 'UA-139146979-18'
    default:
    // Don't track any non-production hosts
      return 'UA-139146979-36'
    }
  }

  function mangle(trackingId: string, index = 0) {
    return ({
      trackingId,
      gaOptions: { name: `tracker${index}` }
    })
  }

  const ids = trackers()
  return Array.isArray(ids)
    ? ids.map(mangle)
    : [mangle(ids)]
}

export const analyticsTrackers = () => analytics().map(t => t?.gaOptions?.name)

export function pageSenseID(label: Label | undefined) {
  switch (host()) {
  case Host.production:
    switch (label) {
    case Label.jhc: return '6ed57a82a4e547faad5c59e84cc075b7'
    case Label.naps: return '573fb3e5a5b24547b5a97c3f0bf3f4bd'
    case Label.ohrhc: return '768e8170f18946a58061063af0e2d274'
    case Label.frhc: return '3b85315c7404463c846d3defa8cebdd0'
    case Label.nprahc: return '969ec8cab4da4efca9cf8535e4b58dca'
    case Label.mphc: return '1df1695f81f545b983b2bf7e7d5de587'
    case Label.dhc: return '2b3bb89e1c6f4bb591d777d7597fb4e5'
    case Label.pda: return '24ef5343a16f4cdb924c4d9ffdebcc56'
    case Label.fbhc: return '1ecabc243e444b21993d0dab2d2e57ee'
    case Label.rhc: return 'a5bd2db484724a0fa554e44479fd9f26'
    case Label.gmhc: return 'b4467c615b6b4cf984666b02b74bfd8c'
    case Label.mhc: return '0b0a485be39346f6b1a9e3990368db6d'
    case Label.dohc: return '2a628ff480524ad18306ad03886d28b0'
    case Label.pmhc: return '7da1d4b8b70b49a38c1bb887058d23b3'
    case Label.myhealthily: return '81196dce07094d6b8b244087a4acee79'
    case Label.biank: return '2a7026cbed1b40c7b3ba9679dcad7627'
    case Label.njchc: return 'c85306c782c74a24a12f413e310963ab'
    case Label.rns: return 'fb3f38af03fb4d51911119cf44728ead'
    case Label.yahc: return '36940175d73949d9b44443468eeb68ff'
    case Label.facp: return '7416fabb79d14158a11a51f0f977bef5'
    case Label.veccs: return 'f83da8e6d8964131856e5ae959dd269c'
    case Label.giggity: return 'c7331220a9bd49ecb695fda8bf353b70'
    }
    break
  default:
  }
}

export function cairo(): string {
  switch (host()) {
  case Host.localhost:
  case Host.develop:
    return 'https://develop.myhealthily.com/cairo/'
  case Host.production:
    return 'https://cairo.myheathlily.com'
  case Host.staging:
  case Host.cd:
    return 'https://staging.myhealthily.com/cairo/'
  }
}

export function obeliskMode(label: Label): boolean {
  switch (label) {
  case Label.rns:
  case Label.brokers:
  case Label.myhealthily:
  case Label.naps:
  case Label.ohrhc:
  case Label.facp:
    return true
  case Label.giggity:
  case Label.dhc:
  case Label.dohc:
  case Label.fbhc:
  case Label.gmhc:
  case Label.jhc:
  case Label.mhc:
  case Label.njchc:
  case Label.pmhc:
  case Label.rhc:
  case Label.yahc:
  case Label.mphc:
  case Label.frhc:
  case Label.nprahc:
  case Label.simulacra:
  case Label.get:
  case Label.blacksmith:
  case Label.pda:
  case Label.veccs:
  case Label.biank:
    return false
  }
}

export function longTitle(key: Label): string {
  switch (key) {
  case Label.dohc:
    return 'DentalOfficeHealthCare.com'
  case Label.dhc:
    return 'DesignersHealthCare.com'
  case Label.fbhc:
    return 'FarmBureauHealthCare.com'
  case Label.gmhc:
    return 'GameManufacturersHealthCare.com'
  case Label.jhc:
    return 'JewelersHealthCare.com'
  case Label.mhc:
    return 'ManufacturersHealthCare.com'
  case Label.myhealthily:
    return 'MyHealthily.com'
  case Label.njchc:
    return 'ChambersOfNJHealthCare.com'
  case Label.pmhc:
    return 'PropertyManagersHealthCare.com'
  case Label.rhc:
    return 'RealtyHealthCare.com'
  case Label.rns:
    return 'Right Now Solution'
  case Label.yahc:
    return 'YourAssociationHealthCare.com'
  case Label.blacksmith:
    return 'Blacksmith Automotive Management Benefits Portal'
  case Label.brokers:
  case Label.get:
    return 'Candor USA'
  case Label.simulacra:
    return 'Simulacra'
  case Label.mphc:
    return 'MeatProcessorsHealthCare.com'
  case Label.frhc:
    return 'FirstRespondersHealthCare.com'
  case Label.nprahc:
    return 'NPRAHealthCare.com'
  case Label.naps:
    return 'NAPS360Healthcare.com'
  case Label.ohrhc:
    return 'OHRealtyHealthcare.com'
  case Label.giggity:
    return 'Giggicare'
  case Label.pda:
    return 'PDAHealthcare.com'
  case Label.facp:
    return 'ChambersOfFLHealthcare.com'
  case Label.veccs:
    return 'VECCSHealthcare.com'
  case Label.biank:
    return 'BuildersNKYHealthcare.com'
  }
}
