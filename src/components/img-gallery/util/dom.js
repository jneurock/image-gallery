function parseSubject(subject, context) {
  if (typeof subject === 'string') {
    subject = findAll(subject, context);
  } else if (subject instanceof Node) {
    subject = [subject];
  }

  return subject || [];
}

export function addClass(className, subject, context) {
  let nodes = parseSubject(subject, context);

  if (!nodes.length) { return; }

  forEachNode(nodes, function(node) {
    let classes = classNames(node);

    if (!classes.includes(className)) {
      classes.push(className);
      node.setAttribute('class', classes.join(' '));
    }
  });
}

export function removeClass(className, subject, context) {
  let nodes = parseSubject(subject, context);

  if (!nodes.length) { return; }

  forEachNode(nodes, function(node) {
    let classes = classNames(node);
    let index = classes.findIndex(_className => _className === className);

    if (index !== -1) {
      classes.splice(index, 1);
      node.setAttribute('class', classes.join(' '));
    }
  });
}

export function classNames(node) {
  if (!(node instanceof Node)) { return []; }
  let classes = node.getAttribute('class');
  return classes ? classes.split(' ').map(_class => _class.trim()) : [];
}

export function find(selector, context) {
  context = context || document;
  return context.querySelector(selector);
}

export function findAll(selector, context) {
  context = context || document;
  return context.querySelectorAll(selector);
}

export function findParentByTagName(node, tagName) {
  if (!(node instanceof Node)) { return; }

  let matcher = new RegExp(tagName, 'i');
  let parent;

  while (node.parentNode) {
    if (node.parentNode.tagName == null) { break; }

    if (node.parentNode.tagName.match(matcher)) {
      parent = node.parentNode;
      break;
    }

    node = node.parentNode;
  }

  return parent;
}

export function importHTMLTemplate(templateName) {
  let matcher = new RegExp(`${templateName}\.html$`, 'gi');

  return new Promise(function(resolve) {
    let links = findAll('link[rel="import"]');
    let link = findNode(links, function(_link) {
      return _link.href.match(matcher);
    });

    if (link.import) {
      resolve(link.import);
    } else {
      link.addEventListener('load', _ => {
        resolve(link.import);
      });
    }
  });
}

function abstractFindNode(abstractCb, nodes, cb, context) {
  context = context || this;

  let i = 0;
  let len = nodes.length;
  let result;

  for (; i < len; i++) {
    if (cb.call(context, nodes[i], i)) {
      result = abstractCb(nodes[i], i);
      break;
    }
  }

  return result;
}

export function findNode() {
  return abstractFindNode(node => node, ...arguments);
}

export function findNodeIndex() {
  return abstractFindNode((_, i) => i, ...arguments);
}

export function forEachNode(nodes, cb, context) {
  context = context || this;

  let i = 0;
  let len = nodes.length;

  for (; i < len; i++) {
    cb.call(context, nodes[i], i, nodes);
  }
}
