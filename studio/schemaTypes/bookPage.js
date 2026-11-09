import {defineArrayMember, defineField, defineType} from 'sanity'

const BOOK_DOC_ID = 'book-page-singleton'

export {BOOK_DOC_ID}

export default defineType({
  name: 'bookPage',
  title: 'Book',
  type: 'document',
  fieldsets: [
    {name: 'commerce', title: 'Sales'},
    {name: 'copy', title: 'Shipping and refunds'},
    {name: 'seo', title: 'SEO'},
    {name: 'inventory', title: 'Inventory (automatic)'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Book title',
      type: 'string',
      description: 'The heading on the Book page.',
      initialValue: "Let's figure it out",
      validation: (Rule) => Rule.required().error('The book page needs a title.'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{type: 'block'}],
      description:
        'Optional. Shown on the Book page when filled in. Leave empty until Jasiah adds real copy.',
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      description:
        'Optional cover and detail shots for the Book page. Leave empty until real photos are ready.',
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
      description: 'Total copies available for sale (test: 100).',
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
      name: 'unitsSold',
      title: 'Copies sold (paid)',
      type: 'number',
      fieldset: 'inventory',
      readOnly: true,
      description: 'Updated automatically when Stripe marks an order paid.',
      initialValue: 0,
    }),
    defineField({
      name: 'processedCheckoutSessionIds',
      title: 'Processed checkout sessions',
      type: 'array',
      fieldset: 'inventory',
      readOnly: true,
      hidden: true,
      of: [{type: 'string'}],
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
      return {title: 'Book'}
    },
  },
})
