import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: false,
    },
    {
      name: 'driveId',
      label: 'Drive ID',
      type: 'text',
      required: false,
    },
    {
      name: 'mimeType',
      label: 'MIME Type',
      type: 'text',
      required: false,
    },
    {
      name: 'size',
      label: 'Size',
      type: 'number',
      required: false,
    },
    {
      name: 'url',
      label: 'Web View URL',
      type: 'text',
      required: false,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
  ],
  upload: false,
}
