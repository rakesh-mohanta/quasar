(function() {

  var each = [].forEach;
  var main = document.getElementById('main');
  var doc = document.documentElement;
  var body = document.body;
  var header = document.getElementById('header');
  var menu = document.querySelector('.sidebar');
  var content = document.querySelector('.content');
  var mobileBar = document.getElementById('mobile-bar');
  var toTop = document.getElementById('toTop');
  var menuButton = mobileBar.querySelectorAll('.menu-button');

  menuButton.addEventListener('click', function() {
    menu.classList.toggle('open');
  });

  body.addEventListener('click', function(e) {
    if (e.target !== menuButton && !menu.contains(e.target)) {
      menu.classList.remove('open');
    }
  });

  // build sidebar
  var currentPageAnchor = menu.querySelector('.sidebar-link.current');

  if (currentPageAnchor) {
    var allLinks = [];
    var sectionContainer;

    sectionContainer = document.createElement('ul');
    sectionContainer.className = 'menu-sub';
    currentPageAnchor.parentNode.appendChild(sectionContainer);

    var h2s = content.querySelectorAll('h2');

    if (h2s.length) {
      each.call(h2s, function(h) {
        sectionContainer.appendChild(makeLink(h));
        var h3s = collectH3s(h);

        allLinks.push(h);
        allLinks.push.apply(allLinks, h3s);
        if (h3s.length) {
          sectionContainer.appendChild(makeSubLinks(h3s));
        }
      });
    }
    else {
      h2s = content.querySelectorAll('h3');
      each.call(h2s, function(h) {
        sectionContainer.appendChild(makeLink(h));
        allLinks.push(h);
      });
    }

    var animating = false;

    sectionContainer.addEventListener('click', function(e) {
      e.preventDefault();
      if (e.target.classList.contains('section-link')) {
        menu.classList.remove('open');
        setActive(e.target);
        animating = true;
        setTimeout(function() {
          animating = false;
        }, 400);
      }
    }, true);

    // make links clickable
    allLinks.forEach(makeLinkClickable);

    // init smooth scroll
    smoothScroll.init({
      speed: 400,
      offset: window.innerWidth > 720 ? 40 : 58
    });
  }

  function updateSidebar(top) {
    var headerHeight = header.offsetHeight;

    main.className = top > headerHeight ? 'fix-sidebar' : '';

    if (animating || !allLinks) {
      return;
    }

    var last;

    for (var i = 0; i < allLinks.length; i++) {
      var link = allLinks[i];

      if (link.offsetTop > top) {
        if (!last) {
          last = link;
        }
        break;
      }
      else {
        last = link;
      }
    }
    if (last) {
      setActive(last.id);
    }
  }

  function makeLink(h) {
    var link = document.createElement('li');
    var text = h.textContent.replace(/\(.*\)$/, '');

    // make sure the ids are link-able...
    h.id = h.id
      .replace(/\(.*\)$/, '')
      .replace(/\$/, '');

    link.innerHTML =
      '<a class="section-link" data-scroll href="#' + h.id + '">' +
      text +
      '</a>';

    return link;
  }

  function collectH3s(h) {
    var h3s = [];
    var next = h.nextSibling;

    while (next && next.tagName !== 'H2') {
      if (next.tagName === 'H3') {
        h3s.push(next);
      }
      next = next.nextSibling;
    }
    return h3s;
  }

  function makeSubLinks(h3s, small) {
    var container = document.createElement('ul');

    if (small) {
      container.className = 'menu-sub';
    }
    h3s.forEach(function(h) {
      container.appendChild(makeLink(h));
    });
    return container;
  }

  function setActive(id) {
    var previousActive = menu.querySelector('.section-link.active');
    var currentActive = typeof id === 'string' ?
    menu.querySelector('.section-link[href="#' + id + '"]') : id;

    if (currentActive !== previousActive) {
      if (previousActive) {
        previousActive.classList.remove('active');
      }
      currentActive.classList.add('active');
    }
  }

  function makeLinkClickable(link) {
    var wrapper = document.createElement('a');

    wrapper.href = '#' + link.id;
    wrapper.setAttribute('data-scroll', '');
    link.parentNode.insertBefore(wrapper, link);
    wrapper.appendChild(link);
  }


  function scrollTo(element, to, duration) {
    var start = element.scrollTop,
      change = to - start,
      increment = 7;

    var animateScroll = function(elapsedTime) {
      elapsedTime += increment;
      var position = easeInOut(elapsedTime, start, change, duration);

      element.scrollTop = position;
      if (elapsedTime < duration) {
        setTimeout(function() {
          animateScroll(elapsedTime);
        }, increment);
      }
    };

    animateScroll(0);
  }

  function easeInOut(currentTime, start, change, duration) {
    currentTime /= duration / 2;
    if (currentTime < 1) {
      return change / 2 * currentTime * currentTime + start;
    }
    currentTime -= 1;
    return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
  }

  toTop.addEventListener('click', function(e) {
    e.preventDefault();
    scrollTo(document.body, 0, 1250);
  });

  function updateToTop(top) {
    toTop.classList[top > 1000 ? 'add' : 'remove']('visible');
  }


  function redraw() {
    var top = doc && doc.scrollTop || body.scrollTop;

    updateSidebar(top);
    updateToTop(top);
  }

  // listen for scroll event to do positioning & highlights
  window.addEventListener('scroll', redraw);
  window.addEventListener('resize', redraw);

})();
