import React, { useState } from 'react';
import { Global, styled } from '@storybook/theming';
import { Icons, IconButton, WithTooltip, TooltipLinkList } from '@storybook/components';
import { Filters } from './ColorFilters';
const iframeId = 'storybook-preview-iframe';
const baseList = ['blurred vision', 'deuteranomaly', 'deuteranopia', 'protanomaly', 'protanopia', 'tritanomaly', 'tritanopia', 'achromatomaly', 'achromatopsia', 'grayscale'];

const getFilter = filter => {
  if (!filter) {
    return 'none';
  }

  if (filter === 'blurred vision') {
    return 'blur(2px)';
  }

  if (filter === 'grayscale') {
    return 'grayscale(100%)';
  }

  return `url('#${filter}')`;
};

const Hidden = styled.div(() => ({
  '&, & svg': {
    position: 'absolute',
    width: 0,
    height: 0
  }
}));
const ColorIcon = styled.span({
  background: 'linear-gradient(to right, #F44336, #FF9800, #FFEB3B, #8BC34A, #2196F3, #9C27B0)',
  borderRadius: '1rem',
  display: 'block',
  height: '1rem',
  width: '1rem'
}, ({
  filter
}) => ({
  filter: getFilter(filter)
}), ({
  theme
}) => ({
  boxShadow: `${theme.appBorderColor} 0 0 0 1px inset`
}));

const getColorList = (active, set) => [...(active !== null ? [{
  id: 'reset',
  title: 'Reset color filter',
  onClick: () => {
    set(null);
  },
  right: undefined,
  active: false
}] : []), ...baseList.map(i => ({
  id: i,
  title: i.charAt(0).toUpperCase() + i.slice(1),
  onClick: () => {
    set(i);
  },
  right: /*#__PURE__*/React.createElement(ColorIcon, {
    filter: i
  }),
  active: active === i
}))];

export const VisionSimulator = () => {
  const [filter, setFilter] = useState(null);
  return /*#__PURE__*/React.createElement(React.Fragment, null, filter && /*#__PURE__*/React.createElement(Global, {
    styles: {
      [`#${iframeId}`]: {
        filter: getFilter(filter)
      }
    }
  }), /*#__PURE__*/React.createElement(WithTooltip, {
    placement: "top",
    trigger: "click",
    tooltip: ({
      onHide
    }) => {
      const colorList = getColorList(filter, i => {
        setFilter(i);
        onHide();
      });
      return /*#__PURE__*/React.createElement(TooltipLinkList, {
        links: colorList
      });
    },
    closeOnClick: true,
    onDoubleClick: () => setFilter(null)
  }, /*#__PURE__*/React.createElement(IconButton, {
    key: "filter",
    active: !!filter,
    title: "Vision simulator"
  }, /*#__PURE__*/React.createElement(Icons, {
    icon: "accessibility"
  }))), /*#__PURE__*/React.createElement(Hidden, null, /*#__PURE__*/React.createElement(Filters, null)));
};