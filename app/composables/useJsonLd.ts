export function useJsonLd(script: Record<string, any>) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(script, null, 2)
      }
    ]
  })
}

export function useOrganizationJsonLd() {
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'JOSP-choosePhd',
    url: 'https://choosephd.com',
    logo: 'https://choosephd.com/favicon.svg',
    description: '面向博士申请者的跨榜单选校决策平台',
    foundingDate: '2026',
    sameAs: ['https://github.com/junw/choosephd']
  })
}

export function useWebSiteJsonLd() {
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'JOSP-choosePhd',
    url: 'https://choosephd.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://choosephd.com/universities?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  })
}

export function useItemListJsonLd(items: Array<{ name: string; url: string; position: number }>) {
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url
    }))
  })
}
