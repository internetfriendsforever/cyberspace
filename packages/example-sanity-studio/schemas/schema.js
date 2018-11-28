import createSchema from 'part:@sanity/base/schema-creator'
import schemaTypes from 'all:part:@sanity/base/schema-type'

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([
    {
      type: 'document',
      name: 'page',
      fields: [
        {
          type: 'string',
          name: 'title'
        },
        {
          type: 'slug',
          name: 'slug',
          options: {
            source: 'title'
          }
        },
        {
          type: 'text',
          name: 'text'
        }
      ]
    }
  ])
})
