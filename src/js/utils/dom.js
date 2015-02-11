/**
 * Silex, live web creation
 * http://projects.silexlabs.org/?/silex/
 *
 * Copyright (c) 2012 Silex Labs
 * http://www.silexlabs.org/
 *
 * Silex is available under the GPL license
 * http://www.silexlabs.org/silex/silex-licensing/
 */

/**
 * @fileoverview Helper class for common tasks
 *
 */


goog.provide('silex.utils.Dom');



/**
 * @constructor
 * @struct
 */
silex.utils.Dom = function() {
  throw ('this is a static class and it canot be instanciated');
};


/**
 * counts the number of parents
 * used for indentation
 * @param {Element} element
 * @return {number} number of parents of elements
 */
silex.utils.Dom.getNumParents = function(element) {
    // compute indentation
    var indent = 0;
    var tmpElement = element;
    while(tmpElement) {
      tmpElement =  goog.dom.getParentElement(tmpElement);
      indent++;
    }
    return indent;
};


/**
 * refresh an image
 */
silex.utils.Dom.refreshImage = function(img, cbk) {
  var initialUrl = img.src;
  img.onload = function(e) {
    // stop the process
    img.onload = null;
    cbk();
  };
  img.src = silex.utils.Dom.addCacheControl(initialUrl);
};


/**
 * name of the get param used to store the timestamp (cache control)
 * @constant
 */
silex.utils.Dom.CACHE_CONTROL_PARAM_NAME = 'silex-cache-control';


/**
 * add cache control to an URL
 * handle the cases where there is a ? or & or an existing cache control
 * @example silex.utils.Dom.addCacheControl('aaaaaaaa.com') returns 'aaaaaaaa.com?silex-cache-control=09238734099890'
 */
silex.utils.Dom.addCacheControl = function(url) {
  // remove existing cache control if any
  url = silex.utils.Dom.removeCacheControl(url);
  // add an url separator
  if (url.indexOf('?') > 0) {
    url += '&';
  }
  else {
    url += '?';
  }
  // add the timestamp
  url += silex.utils.Dom.CACHE_CONTROL_PARAM_NAME + '=' + Date.now();
  // return the new url
  return url;
};


/**
 * remove cache control from an URL
 * handle the cases where there are other params in get
 * works fine when url contains several URLs with cache control or other text (like a full image tag with src='')
 * @example silex.utils.Dom.addCacheControl('aaaaaaaa.com?silex-cache-control=09238734099890') returns 'aaaaaaaa.com'
 */
silex.utils.Dom.removeCacheControl = function(url) {
  // only when there is an existing cache control
  if (url.indexOf(silex.utils.Dom.CACHE_CONTROL_PARAM_NAME) > 0) {
    var re = new RegExp('([\?|&|&amp;]' + silex.utils.Dom.CACHE_CONTROL_PARAM_NAME + '=[0-9]*[&*]?)', 'gi');
    url = url.replace(re, function(match, group1, group2) {
      // if there is a ? or & then return ?
      // aaaaaaaa.com?silex-cache-control=09238734&ccsqcqsc&
      // aaaaaaaa.com?silex-cache-control=09238734099890
      // aaaaaaaa.com?silex-cache-control=09238734&ccsqcqsc&
      // aaaaaaaa.com?xxx&silex-cache-control=09238734&ccsqcqsc&
      if (group1.charAt(0) === '?' && group1.charAt(group1.length - 1) === '&') {
        return '?';
      }
      else if (group1.charAt(group1.length - 1) === '&' || group1.charAt(0) === '&') {
        return '&';
      }
      else {
        return '';
      }
    });
  }
  // return the new url
  return url;
};


/**
 * render a template by duplicating the itemTemplateString and inserting the data in it
 * @param {string} itemTemplateString   the template containing \{\{markers\}\}
 * @param {Array.<string>}  data                 the array of strings conaining the data
 * @return {string} the template string with the data in it
 */
silex.utils.Dom.renderList = function(itemTemplateString, data) {
  var res = '';
  // for each item in data, e.g. each page in the list
  for (let itemIdx in data) {
    // build an item
    var item = itemTemplateString;
    // replace each key by its value
    for (let key in data[itemIdx]) {
      var value = data[itemIdx][key];
      item = item.replace(new RegExp('{{' + key + '}}', 'g'), value);
    }
    // add the item to the rendered template
    res += item;
  }
  return res;
};


/**
 * compute the bounding box of the given elements
 * use only element.style.* to compute this, not the real positions and sizes
 * so it takes into account only the elements which have top, left, width and height set in px
 * @return the bounding box containing all the elements
 */
silex.utils.Dom.getBoundingBox = function(elements) {
  // compute the positions and sizes, which may end up to be NaN or a number
  var top = NaN,
      left = NaN,
      right = NaN,
      bottom = NaN;
  // browse all elements and compute the containing rect
  goog.array.forEach(elements, function(element) {
    // retrieve the styles strings (with "px")
    var elementStyleTop = goog.style.getStyle(element, 'top');
    var elementStyleLeft = goog.style.getStyle(element, 'left');
    var elementStyleWidth = goog.style.getStyle(element, 'width');
    var elementStyleHeight = goog.style.getStyle(element, 'height');
    var elementStyleMinWidth = goog.style.getStyle(element, 'minWidth');
    var elementStyleMinHeight = goog.style.getStyle(element, 'minHeight');
    // compute the styles numerical values, which may end up to be NaN or a number
    var elementMinWidth = parseFloat(elementStyleMinWidth.substr(0, elementStyleMinWidth.indexOf('px')));
    var elementWidth = Math.max(elementMinWidth || 0, parseFloat(elementStyleWidth.substr(0, elementStyleWidth.indexOf('px'))));
    var elementMinHeight = parseFloat(elementStyleMinHeight.substr(0, elementStyleMinHeight.indexOf('px')));
    var elementHeight = Math.max(elementMinHeight || 0, parseFloat(elementStyleHeight.substr(0, elementStyleHeight.indexOf('px'))));
    var elementTop = parseFloat(elementStyleTop.substr(0, elementStyleTop.indexOf('px')));
    var elementLeft = parseFloat(elementStyleLeft.substr(0, elementStyleLeft.indexOf('px')));
    var elementRight = (elementLeft || 0) + elementWidth;
    var elementBottom = (elementTop || 0) + elementHeight;
    // take the smallest top and left and the bigger bottom and rigth
    top = isNaN(top) ? elementTop : Math.min(top, elementTop);
    left = isNaN(left) ? elementLeft : Math.min(left, elementLeft);
    bottom = isNaN(bottom) ? elementBottom : Math.max(bottom, elementBottom);
    right = isNaN(right) ? elementRight : Math.max(right, elementRight);
  });
  // no value for NaN results
  var res = {};
  if (!isNaN(top)) res.top = top;
  if (!isNaN(left)) res.left = left;
  if (!isNaN(bottom)) res.height = bottom - (top || 0);
  if (!isNaN(right)) res.width = right - (left || 0);
  return res;
};


/**
 * publish the file to a folder
 * get all the files included in the website, and put them into assets/ or js/ or css/
 * the HTML file must be saved somewhere because all URLs are made relative
 * This method uses a temporary iframe to manage the temporary dom
 * @param {string} publicationUrl    the url where to publish to, e.g. /api/1.0/dropbox/exec/put/.../...
 * @param {string} fileUrl    the url of the file being published
 * @param {string} html    the html data of the website
 * @param {function({success: boolean})} statusCallback callback to be notified when operation is done, with the json response
 * @param {function(string)=} opt_errCbk    callback to be notified of server side errors
 */
silex.utils.Dom.publish = function(publicationUrl, fileUrl, html, statusCallback, opt_errCbk) {
  // the file must be saved somewhere because all URLs are made relative
  if (!fileUrl) {
    if (opt_errCbk) {
      opt_errCbk('The file must be saved before I can clean it up for you.');
    }
    return;
  }
  // get the base url for the provided file url
  // @type {string}
  var baseUrl = silex.utils.Url.getBaseUrl() + fileUrl.substring(0, fileUrl.lastIndexOf('/'));
  // create the iframe used to compute temporary dom
  var iframe = goog.dom.iframe.createBlank(goog.dom.getDomHelper(), 'position: absolute; left: -99999px; ');
  goog.dom.appendChild(document.body, iframe);
  // wait untill iframe is ready
  goog.events.listenOnce(iframe, 'load', function(e) {
    // clean up the DOM
    var contentDocument = goog.dom.getFrameContentDocument(iframe);
    var cleanedObj = silex.utils.DomCleaner.cleanup(contentDocument, baseUrl);
    // store the files to download and copy to assets, scripts...
    var htmlString = cleanedObj['htmlString'];
    var cssString = cleanedObj['cssString'];
    var jsString = cleanedObj['jsString'];
    var files = cleanedObj['files'];
    // call the publish service
    silex.service.SilexTasks.getInstance().publish(publicationUrl, htmlString, cssString, jsString, files, statusCallback, opt_errCbk);
  }, false);
  // prevent scripts from executing
  html = html.replace(/type=\"text\/javascript\"/gi, 'type="text/notjavascript"');
  // write the content (leave this after "listen")
  goog.dom.iframe.writeContent(iframe, html);
};
