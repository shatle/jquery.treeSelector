(function($) {
  jQuery.fn.treeSelector = function(tree, defaultValues, onChange, params) {
    // autoclose
    if (!window.treeSelector_autoclose_FN) {
      $(window).on('click', function(e) {
        console.info('window', e.target, $(e.target).closest('.treeSelector-container'));
        var isClickSelector = $(e.target).closest('.treeSelector-container').length > 0
        if (!isClickSelector) {
          $('div.treeSelector-wrapper').removeClass('visible')
        }
      })
    }

    // options
    var options = $.extend({
      checkWithParent: false
    }, params)

    /**
     * iterate to gen node
     * @param {*} node 
     * @param {*} level 
     */
    var buildTree = function(node, level) {
      var hasChildren = node.children && node.children.length > 0

      var li = $(document.createElement('li'));
      li.addClass('treeSelector-li level-'+level + (hasChildren ? ' has-children' : ''))
      var liBox = $(document.createElement('div'));
      liBox.addClass('treeSelector-li-box')

      var liTitle = $(document.createElement('label'));
      liTitle.addClass('treeSelector-li-title-box')
      liTitle.attr({for: 'treeSelector-li-' + node.id})
      var liTitleCheckbox = $(document.createElement('input'));
      liTitleCheckbox.attr({type: 'checkbox', id: 'treeSelector-li-' + node.id, 'data-value': node.value})
      liTitle.append(liTitleCheckbox)

      var liTitleSpan = $(document.createElement('span'));
      liTitleSpan.addClass('treeSelector-li-title')
      liTitleSpan.attr({'data-value': node.id})
      liTitleSpan.text(node.title)
      liTitle.append(liTitleSpan)

      liBox.append(liTitle)

      if (hasChildren) {
        var liChildUl = $(document.createElement('ul'));
        var childrenLis = $()
        for (var k = 0; k < node.children.length; k++) {
          childrenLis = childrenLis.add(buildTree(node.children[k], level + 1))
        }
        liChildUl.append(childrenLis)
        liBox.append(liChildUl)
      }

      li.append(liBox)

      return li
    }

    /**
     * view values(titles)
     * @param {*} $selector 
     * @param {*} values 
     */
    var appendSelectedItems = function($selector, values) {
      console.info('appendSelectedItems', Array.isArray(values), typeof(values));
      if ($selector && values && Array.isArray(values)) {
        var titles = []
        var titleSpans = $()
        for (var k = 0; k < values.length; k++) {
          var value = values[k];
          var item = $selector.find('.treeSelector-li-title[data-value='+value+']:first')
          if (item) {
            item.prev('input[type=checkbox]').prop('checked', true)
            // titles.push([item.text(), value])
            var titleItem = $(document.createElement('div'));
            titleItem.addClass('title-item')
            titleItem.attr({'data-value': value})
            var itemSpan = $(document.createElement('span'));
            itemSpan.addClass('title')
            itemSpan.text(item.text())
            var faClose = $(document.createElement('span'));
            faClose.addClass('fa fa-times')

            titleItem.append(faClose)
            titleItem.append(itemSpan)
            titleSpans = titleSpans.add(titleItem)
          }
        }
        console.info('titles', titles, titleSpans);
        $selector.find('.treeSelector-input-box:first').empty().append(titleSpans)
      }
    }

    /**
     * get current values
     * @param {*} $selector 
     */
    var getCheckedInputValues = function($selector) {
      return $selector.find('input[type=checkbox]:checked')
      .map(function(_index, elem){ return $(elem).attr('data-value') })
      .toArray()
    }

    var bindEvents = function($selector) {
      $selector.on('change', 'input[type=checkbox]', function(e) {
        if (options.checkWithParent) {
          var childrenBox = $(e.target)
            .parent('.treeSelector-li-title-box')
            .next('ul')
          if (childrenBox && childrenBox.length > 0) {
            childrenBox.find('input[type=checkbox]').prop('checked', e.target.checked)
          }
        }

        var values = getCheckedInputValues($selector)
        appendSelectedItems($selector, values)
        onChange && onChange(e, values)
      })

      $selector.on('click', 'span.fa.fa-times', function(e) {
        var value = $(e.target).parent('.title-item').attr('data-value')
        console.info('value', value, $(e.target), $selector.find('input[type=checkbox][data-value=' + value + ']:checked'));
        $selector.find('input[type=checkbox][data-value=' + value + ']:checked').prop('checked', false)
        var values = getCheckedInputValues($selector)
        appendSelectedItems($selector, values)
        onChange && onChange(e, values)
        return false
      })

      $selector.on('click', '.treeSelector-input-box', function(e) {
        console.info('click', e.target);
        var $wrapper = $selector.find('.treeSelector-wrapper:first')
        var isOpen = $wrapper.hasClass('visible')
        if (!isOpen) {
          $wrapper.addClass('visible')
        }
      })
    }

    return $(this).each(function() {
      var selector = $(document.createElement('div'));
      selector.addClass('treeSelector-container');

      var selectorInputBox = $(document.createElement('div'));
      selectorInputBox.addClass('treeSelector-input-box');
      var selectorWrapper = $(document.createElement('div'));
      selectorWrapper.addClass('treeSelector-wrapper');
      var selectorWrapperUl = $(document.createElement('ul'))

      selector.append(selectorInputBox)
      selector.append(selectorWrapper)
      if (tree && tree.length) {
        for (var j = 0; j < tree.length; j++) {
          var element = buildTree(tree[j], 0)
          selectorWrapperUl.append(element)
        }
      }

      selectorWrapper.append(selectorWrapperUl);
      $(this).append(selector);

      console.info('defaultValues', defaultValues);
      if (defaultValues && defaultValues.length) {
        console.info('defaultValues22', defaultValues);
        appendSelectedItems(selector, defaultValues)
      }

      bindEvents(selector)
    })
  }
})(jQuery);