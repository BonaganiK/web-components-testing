# entities is the root level items
    # for example Attirubtes, Resdources ..

# entity items (brown circle with || in)
# rules (blue)
# clear out details on collapse of entities
# add fn 

get_details event
args
entityId  - <any>
showId    - <boolean>
sortOrder - <asc, dec>


entityitem_template:
[__value__] __descriptor__


# data structure

## initial data
[
{
"entityid": 123,
"entityname": "Attributes",
"count": 2
}
]

## entity item feteched on expand.
{
"entityid": 123,
"value": "__id or code value__"
"descriptor": "none or value of description",
"rules": {
"value": "__id or code value__"
"descriptor": "none or value of description",
}
}

