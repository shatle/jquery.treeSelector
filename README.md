## Simple Tree Selector

#### Example

```
var rootNode = [{
  "id": "1",
  "title": "Node 0",
  "value": 1,
  "children": [
    {
      "id": "11",
      "title": "Node 11",
      "value": 11,
      "children": [
        {
          "id": "111",
          "title": "Node 112",
          "value": 111,
          "children": []
        },
        {
          "id": "112",
          "title": "Node 112",
          "value": 112,
          "children": []
        }
      ]
    },
    {
      "id": "12",
      "title": "Node 12",
      "value": 12,
      "children": []
    },
    {
      "id": "13",
      "title": "Node 13",
      "value": 13,
      "children": []
    }
  ]
}]

$('div.treeSelector').treeSelector(rootNode, [11, 12], function(e, values) {
  console.info('onChange', e, values);
}, {})
```

three options: 

```
 // options
var options = $.extend({
  // children checked/unchecked if true
  checkWithParent: false,
  // title with 'title1 - title 2' if true
  titleWithParent: false,
  // when item click, only view leaf title if true
  notViewClickParentTitle: false
}, params)

```
