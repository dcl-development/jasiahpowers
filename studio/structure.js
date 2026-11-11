import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

const HOME_ID = 'ab6534a3-c34d-4b67-9d6e-105a67d3e813'
const PHOTOS_ID = '9622f84d-05f9-4ef5-a889-764a64ea0558'
const SETTINGS_ID = 'f0e48175-fe73-40f2-bde8-118a64fe4c31'
const BOOK_ID = 'book-page-singleton'

function singleton(S, {title, type, id}) {
  return S.listItem()
    .title(title)
    .id(type)
    .child(S.document().schemaType(type).documentId(id).title(title))
}

export const structure = (S, context) =>
  S.list()
    .title('Content')
    .items([
      singleton(S, {title: 'Homepage', type: 'homePage', id: HOME_ID}),
      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Projects',
        S,
        context,
      }),
      singleton(S, {title: 'Photos', type: 'photoGallery', id: PHOTOS_ID}),
      singleton(S, {title: 'Shop', type: 'bookPage', id: BOOK_ID}),
      singleton(S, {title: 'Site settings', type: 'siteSettings', id: SETTINGS_ID}),
    ])
