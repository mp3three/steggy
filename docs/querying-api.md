# General Querying API

Route query capabilities

## Via HTTP Calls

Route querying capabiltis are implemented on a per-route basis. If certain routes are NOT respecting commands, when the functionality is desirable, open an issue to get it added.

| Filter                       | Query    | Example                                              | Description                                                      |
|------------------------------|----------|------------------------------------------------------|------------------------------------------------------------------|
| **equal**                    | `equals` | `/group?type=light` 			                     | both return all light groups                                       |
| **not equal**                | `ne`     | `/group?type__ne=light`                             | returns all groups who are not light groups            |
| **greater than**             | `gt`     | `/groups?age__gt=18`                                  | returns all groups older than 18                                  |
| **greater than or equal to** | `gte`    | `/groups?age__gte=18`                                 | returns all groups 18 and older (age should be a number property) |
| **less than**                | `lt`     | `/groups?age__lt=30`                                  | returns all groups age 29 and younger                             |
| **less than or equal to**    | `lte`    | `/groups?age__lte=30`                                 | returns all groups age 30 and younger                             |
| **in**                       | `in`     | `/groups?type__in=light,fan`                      | returns all female and male groups                                |
| **not in**                      | `nin`    | `/groups?age__nin=18,21`                              | returns all groups who are not 18 or 21                           |
| **exists**              | `exists` | `/groups?age__exists=true`                            | returns all groups where the age is provided.                     |
| **not exists**             | `exists` | `/groups?age__exists=false`                           | returns all groups where the age is not provided.                 |
| **regex**                    | `regex`  | `/groups?friendlyName__regex=/^Test/i`                  | returns all groups with a friendlyName starting with test           |
| **contains**                     | `elem` | `/groups?entities__elem=light.desk_light`               | item is an element in a list |
| **limit**                    | `limit` | `/groups?limit=5`                                     | limits results to the specified amount |
| **skip**                     | `skip` | `/groups?skip=10`                                     | skip to the specified record in the result set |
| **select**                   | `select` | `/groups?select=first_name,last_name`               | return only the specified fields |

## Automatic Type Coersion

Some filters are re-written to better query mongo taking types into account.

### Number

- `/user?age=25`

This request would be re-phrased like this

```javascript
{
  field: 'age',
  comparison: 'in',
  value: ['25',25]
}
```

### Boolean

- `/room?flags.special=true`

This request would be re-phrased like this

```javascript
{
  field: 'flags.special',
  comparison: 'in',
  value: ['true',true]
}
```

### Conversion table

| Input | Conversions |
| --- | --- |
| misc numbers | `[String(value), Number(value)]` |
| `"0"` | `['0', 0, false]` |
| `"1"` | `['1', 1, true]` |
| `"y" \| "true"` | `[String(value), true]` |
| `"n" \| "false"` | `[String(value), false]` |
| `"null"` | `[String(value), null]` |

## Related Code Definitions

The [ResultControl](https://github.com/mp3three/steggy/tree/master/libs/utilities/src/query.ts) definition describes the standard typescript interface for querying. It can be adapted for transmission via HTTP calls (described above), mongo queries (via [persistence](https://github.com/mp3three/steggy/tree/master//libs/persistence/src/includes/mongo.ts) library), and some direct processing (via [JSONFilterService](https://github.com/mp3three/steggy/tree/master/libs/boilerplate/src/services/json-filter.service.ts))
