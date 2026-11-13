import {defineArrayMember, defineField, defineType} from 'sanity'

const BOOK_DOC_ID = 'book-page-singleton'

export {BOOK_DOC_ID}

export default defineType({
  name: 'bookPage',
  title: 'Shop',
  type: 'document',
  fieldsets: [
    {name: 'announcement', title: 'Homepage announcement'},
    {name: 'commerce', title: 'Sales'},
    {name: 'copy', title: 'Shipping and refunds'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Book title',
      type: 'string',
      description: 'The heading on the Shop page (/shop).',
      initialValue: "Let's figure it out",
      validation: (Rule) => Rule.required().error('The Shop page needs a title.'),
    }),
    defineField({
      name: 'showHomeAnnouncement',
      title: 'Show homepage announcement',
      type: 'boolean',
      fieldset: 'announcement',
      description:
        'Shows a black announcement bar on the homepage that links to the Shop page (/shop). Off by default. Before the store opens it shows the countdown text plus a live timer; after launch it shows Homepage announcement text.',
      initialValue: false,
    }),
    defineField({
      name: 'homeCountdownText',
      title: 'Countdown text',
      type: 'string',
      fieldset: 'announcement',
      initialValue: "Let's Figure It Out drops in",
      description:
        'Prefix in the homepage bar before the store opens, followed by the live countdown (for example 2d 11h 14m).',
      validation: (Rule) =>
        Rule.max(120).warning('Keep this short so it fits in the bar.'),
    }),
    defineField({
      name: 'homeAnnouncementText',
      title: 'Homepage announcement text',
      type: 'string',
      fieldset: 'announcement',
      description:
        'Short line in the homepage bar after the store opens. Leave empty to hide the bar after launch even when the toggle is on.',
      validation: (Rule) =>
        Rule.max(140).warning('Keep this short so it fits in the bar.'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{type: 'block'}],
      description:
        'Optional. Shown on the Shop page (/shop) when filled in. Leave empty until Jasiah adds real copy.',
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      description:
        'Optional cover and detail shots for the Shop page (/shop). Leave empty until real photos are ready.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Photo',
              type: 'image',
              options: {hotspot: true},
              validation: (Rule) => Rule.required().error('Choose a photo.'),
            }),
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'A few plain words describing the photo.',
            }),
          ],
          preview: {
            select: {media: 'image', title: 'alt'},
            prepare({media, title}) {
              return {title: title || 'Book photo', media}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'priceLabel',
      title: 'Price label',
      type: 'string',
      description: 'How the price reads on the page (not the Stripe charge).',
      initialValue: '$85',
      validation: (Rule) => Rule.required().error('Add how the price should read on the page.'),
    }),
    defineField({
      name: 'supportEmail',
      title: 'Orders and support email',
      type: 'string',
      fieldset: 'copy',
      description: 'Shown for receipts, shipping questions, and refunds.',
      initialValue: 'jasiahsteez@gmail.com',
      validation: (Rule) =>
        Rule.required().email().error('Add the email customers should use for book orders.'),
    }),
    defineField({
      name: 'shippingSummary',
      title: 'Shipping summary',
      type: 'text',
      rows: 3,
      fieldset: 'copy',
      initialValue:
        'US shipping addresses only. USPS Media Mail, $6 flat. Copies ship within 7 days.',
    }),
    defineField({
      name: 'refundSummary',
      title: 'Refund policy',
      type: 'text',
      rows: 2,
      fieldset: 'copy',
      initialValue:
        'If a copy arrives damaged, email within 7 days of delivery for a refund or replacement.',
    }),
    defineField({
      name: 'startingInventory',
      title: 'Starting inventory',
      type: 'number',
      fieldset: 'commerce',
      description: 'Total copies for sale. Copies sold are counted from paid Stripe orders (refunded orders are not counted).',
      initialValue: 100,
      validation: (Rule) =>
        Rule.required().min(0).integer().error('Set how many copies are for sale.'),
    }),
    defineField({
      name: 'pauseSales',
      title: 'Pause sales',
      type: 'boolean',
      fieldset: 'commerce',
      description:
        'Turn on to hide checkout even when copies remain. Sold out still applies when inventory hits zero.',
      initialValue: false,
    }),
    defineField({
      name: 'seoDescription',
      title: 'Page description',
      type: 'text',
      rows: 2,
      fieldset: 'seo',
      description: 'Optional. Used for link previews when set.',
      validation: (Rule) =>
        Rule.max(180).warning('Shorter descriptions fit better in a link preview.'),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Shop'}
    },
  },
})
