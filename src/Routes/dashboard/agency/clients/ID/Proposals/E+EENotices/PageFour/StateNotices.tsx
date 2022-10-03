interface NoticeEntry {
  state: string
  body: {
    stateTitle: string
    entry?: {
      header?: string
      entries?: string[]
    }[]
  }
}

export const stateNotices: NoticeEntry[] = [
  {
    state: 'AL',
    body: {
      stateTitle: 'ALABAMA - Medicaid',
      entry: [
        {
          entries: ['Website: http://myalhipp.com/', 'Phone: 1-855-692-5447']
        }
      ]
    }
  },
  {
    state: 'AK',
    body: {
      stateTitle: 'ALASKA - Medicaid',
      entry: [
        {
          header: 'The AK Health Insurance Premium Payment Program',
          entries: ['Website: http://myakhipp.com/', 'Phone: 1-866-251-4861']
        },
        {
          header: 'Medicaid Eligibility',
          entries: ['http://dhss.alaska.gov/dpa/Pages/medicaid/default.aspx9']
        }
      ]
    }
  },
  {
    state: 'AR',
    body: {
      stateTitle: 'ARKANSAS - Medicaid',
      entry: [
        {
          entries: ['Website: http://myarhipp.com/', 'Phone: 1-855-MyARHIPP (855-692-7447)']
        }
      ]
    }
  },
  {
    state: 'CO',
    body: {
      stateTitle: 'COLORADO - Health First Colorado (Colorado’s Medicaid Program) & Child Health Plan Plus (CHP+)',
      entry: [
        {
          entries: ['Health First Colorado Website: https://www.healthfirstcolorado.com/', 'Health First Colorado Member Contact Center: 1-800-221-3943 / State Relay 711']
        },
        {
          entries: ['CHP+: Colorado.gov/HCPF/Child-Health-Plan-Plus', 'CHP+ Customer Service: 1-800-359-1991 / State Relay 711']
        }
      ]
    }
  },
  {
    state: 'FL',
    body: {
      stateTitle: 'FLORIDA - Medicaid',
      entry: [
        {
          entries: ['Website: http://flmedicaidtplrecovery.com/hipp/', 'Phone: 1-877-357-3268']
        }
      ]
    }
  },
  {
    state: 'GA',
    body: {
      stateTitle: 'GEORGIA - Medicaid',
      entry: [
        {
          entries: ['Website: http://dch.georgia.gov/medicaid - Click on Health Insurance Premium Payment', 'Phone: 404-656-4507']
        }
      ]
    }
  },
  {
    state: 'IN',
    body: {
      stateTitle: 'INDIANA - Medicaid',
      entry: [
        {
          header: 'Healthy Indiana Plan for low-income adults 19-64 Website',
          entries: ['Website: http://www.hip.in.gov', 'Phone: 1-877-438-4479']
        },
        {
          header: 'All other Medicaid',
          entries: ['http://www.indianamedicaid.com', 'Phone: 1-800-403-0864']
        }
      ]
    }
  },
  {
    state: 'IA',
    body: {
      stateTitle: 'IOWA - Medicaid',
      entry: [
        {
          entries: ['Website: http://dhs.iowa.gov/ime/members/medicaid-a-to-z/hipp', 'Phone: 1-888-346-9562']
        }
      ]
    }
  },
  {
    state: 'KS',
    body: {
      stateTitle: 'KANSAS - Medicaid',
      entry: [
        {
          entries: ['Website: http://www.kdheks.gov/hcf/', 'Phone: 1-785-296-3512']
        }
      ]
    }
  },
  {
    state: 'KY',
    body: {
      stateTitle: 'KENTUCKY - Medicaid',
      entry: [
        {
          entries: ['Website: http://chfs.ky.gov/dms/default.htm', 'Phone: 1-800-635-2570']
        }
      ]
    }
  },
  {
    state: 'ME',
    body: {
      stateTitle: 'MAINE - Medicaid',
      entry: [
        {
          entries: ['Website: http://www.maine.gov/dhhs/ofi/public-assistance/index.html', 'Phone: 1-800-442-6003 TTY: Maine Relay 711']
        }
      ]
    }
  },
  {
    state: 'MA',
    body: {
      stateTitle: 'MASSACHUSETTS - Medicaid and CHIP',
      entry: [
        {
          entries: ['Website: http://www.mass.gov/eohhs/gov/departments/mass-health/', 'Phone: 1-800-862-4840']
        }
      ]
    }
  },
  {
    state: 'MN',
    body: {
      stateTitle: 'MINNESOTA - Medicaid',
      entry: [
        {
          entries: ['Website: http://mn.gov/dhs/people-we-serve/seniors/health-care/health-care-programs/programs-and-services/medical-assistance.jsp', 'Phone: 1-800-657-3739']
        }
      ]
    }
  },
  {
    state: 'MO',
    body: {
      stateTitle: 'MISSOURI - Medicaid ',
      entry: [
        {
          entries: ['Website: http://www.dss.mo.gov/mhd/participants', 'Phone: 573-751-2005']
        }
      ]
    }
  },
  {
    state: 'MT',
    body: {
      stateTitle: 'MONTANA - Medicaid',
      entry: [
        {
          entries: ['Website: http://dphhs.mt.gov/MontanaHealthcarePrograms', 'Phone: 1-800-694-3084']
        }
      ]
    }
  },
  {
    state: 'NE',
    body: {
      stateTitle: 'NEBRASKA - Medicaid',
      entry: [
        {
          entries: ['Website: http://www.ACCESSNebraska.ne.gov', 'Phone: (855) 632-7633', 'Lincoln: (402) 473-7000', 'Omaha: (402) 595-1178']
        }
      ]
    }
  },
  {
    state: 'NV',
    body: {
      stateTitle: 'NEVADA - Medicaid',
      entry: [
        {
          entries: ['Medicaid Website: http://dwss.nv.gov/Medicaid', 'Phone: 1-800-992-0900']
        }
      ]
    }
  },
  {
    state: 'NH',
    body: {
      stateTitle: 'NEW HAMPSHIRE - Medicaid',
      entry: [
        {
          entries: ['Website: http://www.dhhs.nh.gov/oii/documents/hippapp', 'Phone: 603-271-5218']
        }
      ]
    }
  },
  {
    state: 'NJ',
    body: {
      stateTitle: 'NEW JERSEY - Medicaid & CHIP',
      entry: [
        {
          header: 'Medicaid',
          entries: ['Website: http://www.state.nj.us/humanservices/dmahs', 'Phone: 609-631-2392']
        },
        {
          header: 'CHIP',
          entries: ['http://www.njfamilycare.org/index.html', 'Phone: 1-800-701-0710']
        }
      ]
    }
  },
  {
    state: 'NY',
    body: {
      stateTitle: 'NEW YORK - Medicaid',
      entry: [
        {
          entries: ['Website: http://www.nyhealth.gov/health_care/medicaid', 'Phone: 1-800-541-2831']
        }
      ]
    }
  },
  {
    state: 'NC',
    body: {
      stateTitle: 'NORTH CAROLINA - Medicaid',
      entry: [
        {
          entries: ['Website: https://dma.ncdhhs.gov/', 'Phone: 919-855-4100']
        }
      ]
    }
  },
  {
    state: 'ND',
    body: {
      stateTitle: 'NORTH DAKOTA - Medicaid',
      entry: [
        {
          entries: ['Website: http://www.nd.gov/dhs/services/medicalserv', 'Phone: 1-844-854-4825']
        }
      ]
    }
  },
  {
    state: 'OK',
    body: {
      stateTitle: 'OKLAHOMA - Medicaid & CHIP',
      entry: [
        {
          entries: ['Website: http://www.insureoklahoma.org', 'Phone: 1-888-365-3742']
        }
      ]
    }
  },
  {
    state: 'OR',
    body: {
      stateTitle: 'OREGON - Medicaid',
      entry: [
        {
          entries: ['Website: http://healthcare.oregon.gov/Pages/index.aspx http://www.oregonhealthcare.gov/index-es.html', 'Phone: 1-800-699-9075']
        }
      ]
    }
  },
  {
    state: 'PA',
    body: {
      stateTitle: 'PENNSYLVANIA - Medicaid',
      entry: [
        {
          entries: ['http://www.dhs.pa.gov/provider/medicalassistance/ healthinsurancepremiumpaymenthippprogram', 'Phone: 1-800-692-7462']
        }
      ]
    }
  },
  {
    state: 'RI',
    body: {
      stateTitle: 'RHODE ISLAND - Medicaid',
      entry: [
        {
          entries: ['Website: http://www.eohhs.ri.gov/', 'Phone: 855-697-4347']
        }
      ]
    }
  },
  {
    state: 'SC',
    body: {
      stateTitle: 'SOUTH CAROLINA - Medicaid',
      entry: [
        {
          entries: ['Website: http://www.scdhhs.gov', 'Phone: 1-888-549-0820']
        }
      ]
    }
  },
  {
    state: 'SD',
    body: {
      stateTitle: 'SOUTH DAKOTA - Medicaid',
      entry: [
        {
          entries: ['Website: http://dss.sd.gov', 'Phone: 1-888-828-0059']
        }
      ]
    }
  },
  {
    state: 'TX',
    body: {
      stateTitle: 'TEXAS - Medicaid',
      entry: [
        {
          entries: ['Website: http://gethipptexas.com/', 'Phone: 1-800-440-0493']
        }
      ]
    }
  },
  {
    state: 'UT',
    body: {
      stateTitle: 'UTAH - Medicaid & CHIP',
      entry: [
        {
          entries: ['Medicaid Website: https://medicaid.utah.gov/ ', 'CHIP Website: http://health.utah.gov/chip', 'Phone: 1-877-543-7669']
        }
      ]
    }
  },
  {
    state: 'VT',
    body: {
      stateTitle: 'VERMONT - Medicaid',
      entry: [
        {
          entries: ['http://www.greenmountaincare.org/', 'Phone: 1-800-250-8427']
        }
      ]
    }
  },
  {
    state: 'VA',
    body: {
      stateTitle: 'VIRGINIA - Medicaid and CHIP',
      entry: [
        {
          header: 'Medicaid',
          entries: ['http://www.state.nj.us/humanservices/dmahs', 'Phone: 1-800-432-5924']
        },
        {
          header: 'CHIP',
          entries: ['http://www.njfamilycare.org/index.html', 'Phone: 1-855-242-8282']
        }
      ]
    }
  },
  {
    state: 'WA',
    body: {
      stateTitle: 'WASHINGTON - Medicaid',
      entry: [
        {
          entries: ['Website: http://www.hca.wa.gov/free-or-low-cost-health-care/program-administration/premium-payment-program', 'Phone: 1-800-562-3022 ext. 15473']
        }
      ]
    }
  },
  {
    state: 'WV',
    body: {
      stateTitle: 'WEST VIRGINIA - Medicaid',
      entry: [
        {
          entries: ['Website: http://mywvhipp.com/', 'Toll-free phone: 1-855-MyWVHIPP (1-855-699-8447)']
        }
      ]
    }
  },
  {
    state: 'WI',
    body: {
      stateTitle: 'WISCONSIN - Medicaid & CHIP',
      entry: [
        {
          entries: ['Website: https://www.dhs.wisconsin.gov/publications', 'Phone: 1-800-362-3002']
        }
      ]
    }
  },
  {
    state: 'WY',
    body: {
      stateTitle: 'WYOMING - Medicaid',
      entry: [
        {
          entries: ['Website: https://wyequalitycare.acs-inc.com/', 'Phone: 307-777-7531']
        }
      ]
    }
  }
]
