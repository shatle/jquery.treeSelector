(function ($) {
  jQuery.fn.treeSelector = function (tree, defaultValues, onChange, params) {
    // use namespace for autoclose
    $(window).off('click.treeSelector').on('click.treeSelector', function (e) {
      var isClickSelector = $(e.target).closest('.treeSelector-container').length > 0
      if (!isClickSelector) {
        $('div.treeSelector-wrapper').removeClass('visible')
      } else {
        // First selector should be close when the second onClick
        var $container = $(e.target).closest('.treeSelector-container')
        if ($container.length > 0) {
          var treeId = $container.attr('data-treeId')
          $('div.treeSelector-container:not([data-treeId=' + treeId + '])').find('div.treeSelector-wrapper').removeClass('visible')
        }
      }
    })

    // options
    var options = $.extend({
      // children checked/unchecked if true
      checkWithParent: false,
      // title with 'title1 - title 2' in view if true
      titleWithParent: false,
      // when item click, only view leaf title if true
      notViewClickParentTitle: false,
      disabled: false,
      emptyOptonPlaceholder: 'no options'
    }, params)

    /**
     * iterate to gen node
     * @param {*} node 
     * @param {*} level 
     * @param Int randId. The selector private id
     */
    var buildTree = function (node, level, randId) {
      var hasChildren = node.children && node.children.length > 0

      var li = $(document.createElement('li'));
      li.addClass('treeSelector-li level-' + level + (hasChildren ? ' has-children' : ''))
      var liBox = $(document.createElement('div'));
      liBox.addClass('treeSelector-li-box')

      var liTitle = $(document.createElement('label'));
      liTitle.addClass('treeSelector-li-title-box')
      var nodeLiId = 'treeSelector-li-' + randId + '-' + node.id
      liTitle.attr({
        for: nodeLiId,
        'data-value': node.value,
        'data-title': node.title
      })
      var liTitleCheckbox = $(document.createElement('input'));
      liTitleCheckbox.attr({
        type: 'checkbox',
        id: nodeLiId,
        'data-value': node.value
      })
      liTitle.append(liTitleCheckbox)

      var liTitleSpan = $(document.createElement('span'));
      liTitleSpan.addClass('treeSelector-li-title')
      liTitleSpan.attr({
        'data-value': node.value
      })
      liTitleSpan.text(node.title)
      liTitle.append(liTitleSpan)

      liBox.append(liTitle)

      if (hasChildren) {
        var liChildUl = $(document.createElement('ul'));
        var childrenLis = $()
        for (var k = 0; k < node.children.length; k++) {
          childrenLis = childrenLis.add(buildTree(node.children[k], level + 1, randId))
        }
        liChildUl.append(childrenLis)
        liBox.append(liChildUl)
      } else {
        liBox.addClass('leaf')
      }

      li.append(liBox)

      return li
    }

    var getParentTitles = function ($seletor, value) {
      if (!value) {
        return []
      }
      var titles = []
      var valueItem = $seletor.find('.treeSelector-li-title-box[data-value=' + value + ']:first')
      if (valueItem && valueItem.closest('.treeSelector-li').length > 0) {
        var closeLiBox = valueItem.closest('.treeSelector-li')
          .closest('.treeSelector-li-box')
        var closeTitle = closeLiBox.find('>.treeSelector-li-title-box').attr('data-title')
        var closeValue = closeLiBox.find('>.treeSelector-li-title-box').attr('data-value')
        var tmpTitles = getParentTitles($seletor, closeValue).slice()
        titles = tmpTitles.concat([closeTitle])
      }
      return titles.filter(function (e) {
        return e
      })
    }

    /**
     * view values(titles)
     * @param {*} $selector 
     * @param {*} values 
     */
    var appendSelectedItems = function ($selector, values) {
      if ($selector && values && Array.isArray(values)) {
        var titleSpans = $()
        for (var k = 0; k < values.length; k++) {
          var value = values[k];
          var item = $selector.find('.treeSelector-li-title[data-value=' + value + ']:first')
          if (item) {
            item.prev('input[type=checkbox]').prop('checked', true)
            // titles.push([item.text(), value])
            var titleItem = $(document.createElement('div'));
            titleItem.addClass('title-item')
            titleItem.attr({
              'data-value': value
            })
            var itemSpan = $(document.createElement('span'));
            itemSpan.addClass('title')
            var title = item.text()
            if (options.titleWithParent) {
              var itemParentTitles = getParentTitles($selector, value)
              title = itemParentTitles.concat([title]).filter(function (e) {
                return e
              }).join(' - ')
            }
            itemSpan.text(title)
            var faClose = $(document.createElement('span'));
            faClose.addClass('fa fa-times')

            titleItem.append(faClose)
            titleItem.append(itemSpan)
            titleSpans = titleSpans.add(titleItem)
          }
        }
        $selector.find('.treeSelector-input-box:first')
          .empty()
          .append(titleSpans)
      }
    }

    /**
     * get current values
     * @param {*} $selector 
     */
    var getCheckedInputValues = function ($selector) {
      return $selector.find('input[type=checkbox]:checked')
        .map(function (_index, elem) {
          return $(elem).attr('data-value')
        })
        .toArray()
    }

    /**
     * set checked = false to parents
     * @param {Element} inputCheckbox 
     */
    var uncheckParent = function (inputCheckbox) {
      var closeUl = $(inputCheckbox).closest('ul')
      if (closeUl && closeUl.length) {
        var checkbox = closeUl.prev('.treeSelector-li-title-box')
          .find('input[type=checkbox]:first')
        checkbox.prop('checked', false)
        uncheckParent(checkbox.get(0))
      }
    }

    /**
     * reset titles when vaule change actions
     * @param {*} $selector 
     */
    var valueChangeEventView = function ($selector, event) {
      var values = getCheckedInputValues($selector)
      // on view leaf titles
      if (options.notViewClickParentTitle) {
        var leafValues = []
        for (var k = 0; k < values.length; k++) {
          var value = values[k];
          var valueLeafInput = $selector
            .find('.treeSelector-li-box.leaf input[data-value=' + value + ']')
          if (valueLeafInput.length > 0) {
            leafValues.push(value)
          } else {
            var liBox = $('label.treeSelector-li-title-box[data-value=' + value + ']:first')
            if (liBox.length > 0 && liBox.next('ul').find('input[type=checkbox]:checked').length > 0) {
              // dont show
            } else {
              leafValues.push(value)
            }
          }
        }
        appendSelectedItems($selector, leafValues)
        onChange && onChange(event, values)
      } else {
        appendSelectedItems($selector, values)
        onChange && onChange(event, values)
      }
    }

    /**
     * events
     * @param {*} $selector 
     */
    var bindEvents = function ($selector) {
      $selector.on('change', 'input[type=checkbox]', function (e) {
        if (options.disabled) {
          return false
        }
        if (options.checkWithParent) {
          var childrenBox = $(e.target)
            .parent('.treeSelector-li-title-box')
            .next('ul')
          if (e.target.checked) {
            if (childrenBox && childrenBox.length > 0) {
              childrenBox.find('input[type=checkbox]')
                .prop('checked', e.target.checked)
            }
          } else {
            uncheckParent(e.target)
            if (childrenBox && childrenBox.length > 0) {
              childrenBox.find('input[type=checkbox]')
                .prop('checked', e.target.checked)
            }
          }
        }

        valueChangeEventView($selector, e)
      })

      /**
       * click [x] icon
       */
      $selector.on('click', 'span.fa.fa-times', function (e) {
        if (options.disabled) {
          return false
        }
        var value = $(e.target).parent('.title-item').attr('data-value')
        var input = $selector.find('input[type=checkbox][data-value=' + value + ']:checked')
        if (input && input.length) {
          input.prop('checked', false)
          if (options.checkWithParent) {
            uncheckParent(input.get(0))
          }
        }

        valueChangeEventView($selector, e)
        return false
      })

      /**
       * click input, show options
       */
      $selector.on('click', '.treeSelector-input-box', function (e) {
        if (options.disabled || !tree || !tree.length) {
          return false
        }
        var $wrapper = $selector.find('.treeSelector-wrapper:first')
        var isOpen = $wrapper.hasClass('visible')
        if (!isOpen) {
          $wrapper.addClass('visible')
        }
      })
    }

    var genRandId = function () {
      return (new Date()).valueOf() + parseInt(Math.random() * 10000000000, 10)
    }

    // construct 
    return $(this).each(function () {
      var selector = $(document.createElement('div'));
      var randId = genRandId()
      selector.addClass('treeSelector-container');
      selector.attr('data-treeId', randId)
      if (options.disabled) {
        selector.addClass('disabled');
      }

      var selectorInputBox = $(document.createElement('div'));
      selectorInputBox.addClass('treeSelector-input-box');

      var selectorWrapper = $(document.createElement('div'));
      selectorWrapper.addClass('treeSelector-wrapper');
      var selectorWrapperUl = $(document.createElement('ul'))

      selector.append(selectorInputBox)
      selector.append(selectorWrapper)
      if (tree && tree.length) {
        for (var j = 0; j < tree.length; j++) {
          var element = buildTree(tree[j], 0, randId)
          selectorWrapperUl.append(element)
        }
      } else {
        selector.addClass('no-options')
        selectorInputBox.text(options.emptyOptonPlaceholder)
      }

      selectorWrapper.append(selectorWrapperUl);
      $(this).empty().append(selector);

      if (defaultValues && defaultValues.length) {
        appendSelectedItems(selector, defaultValues)
      }

      bindEvents(selector)
    })
  }
})(jQuery);